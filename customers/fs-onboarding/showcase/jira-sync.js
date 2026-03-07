const express = require('express');
const path = require('path');
const fs = require('fs');

// --- Config ---
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'jira-sync-config.json'), 'utf8'));
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_AUTH = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Missing JIRA_EMAIL or JIRA_API_TOKEN environment variables');
  process.exit(1);
}

// --- Camunda Config (same pattern as server.js) ---
const CAMUNDA = {
  clusterId: process.env.CAMUNDA_CLUSTER_ID || '425f10fa-c898-4b4b-b303-eac095286716',
  region: process.env.CAMUNDA_REGION || 'ric-1',
  clientId: process.env.CAMUNDA_CLIENT_ID || process.env.ZEEBE_CLIENT_ID,
  clientSecret: process.env.CAMUNDA_CLIENT_SECRET || process.env.ZEEBE_CLIENT_SECRET,
  authUrl: 'https://login.cloud.camunda.io/oauth/token',
  useZbctl: false,
};

if (!CAMUNDA.clientId || !CAMUNDA.clientSecret) {
  const credPath = path.join(require('os').homedir(), '.camunda', 'credentials');
  if (fs.existsSync(credPath)) {
    CAMUNDA.useZbctl = true;
    console.log('Using zbctl-managed token from ~/.camunda/credentials');
  } else {
    console.error('Missing CAMUNDA_CLIENT_ID/SECRET and no ~/.camunda/credentials found');
    process.exit(1);
  }
}

CAMUNDA.zeebeUrl = `https://${CAMUNDA.region}.zeebe.camunda.io/${CAMUNDA.clusterId}`;
CAMUNDA.tasklistUrl = `https://${CAMUNDA.region}.tasklist.camunda.io/${CAMUNDA.clusterId}`;

// --- Token Management ---
let tokenCache = { zeebe: null, tasklist: null };

function readZbctlToken() {
  const credPath = path.join(require('os').homedir(), '.camunda', 'credentials');
  const content = fs.readFileSync(credPath, 'utf8');
  const tokenMatch = content.match(/accesstoken:\s*(\S+)/);
  const expiryMatch = content.match(/expiry:\s*(\S+)/);
  if (!tokenMatch) throw new Error('No access token in ~/.camunda/credentials');
  const expiry = expiryMatch ? new Date(expiryMatch[1]).getTime() : Date.now() + 3600000;
  return { token: tokenMatch[1], expiresAt: expiry };
}

function refreshZbctlToken() {
  const { execSync } = require('child_process');
  try {
    execSync(`/opt/homebrew/bin/zbctl status --address ${CAMUNDA.region}.zeebe.camunda.io:443/${CAMUNDA.clusterId}`, {
      timeout: 15000, stdio: 'pipe',
    });
  } catch { /* zbctl refreshes token even on failure */ }
}

async function getToken(audience) {
  if (CAMUNDA.useZbctl) {
    const cached = tokenCache.zeebe;
    if (cached && cached.expiresAt > Date.now() + 60000) return cached.token;
    if (!cached || cached.expiresAt <= Date.now() + 60000) refreshZbctlToken();
    const fresh = readZbctlToken();
    tokenCache.zeebe = fresh;
    tokenCache.tasklist = fresh;
    return fresh.token;
  }

  const key = audience === 'zeebe.camunda.io' ? 'zeebe' : 'tasklist';
  const cached = tokenCache[key];
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await fetch(CAMUNDA.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CAMUNDA.clientId,
      client_secret: CAMUNDA.clientSecret,
      audience,
    }),
  });
  const data = await res.json();
  tokenCache[key] = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

// --- API Helpers ---
async function tasklistApi(method, apiPath, body) {
  const token = await getToken('tasklist.camunda.io');
  const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMUNDA.tasklistUrl}${apiPath}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tasklist ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function zeebeApi(method, apiPath, body) {
  const token = await getToken('zeebe.camunda.io');
  const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMUNDA.zeebeUrl}${apiPath}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zeebe ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function jiraApi(method, apiPath, body) {
  const opts = {
    method,
    headers: {
      Authorization: `Basic ${JIRA_AUTH}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${config.jira.baseUrl}${apiPath}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// --- Sync State ---
// syncMap: camundaTaskKey -> { jiraIssueKey, status: 'synced' | 'completed' }
const syncMap = new Map();
const eventLog = [];
let numericProcessDefinitionKey = null; // Tasklist v1 requires numeric key, not BPMN string ID

function logEvent(direction, camundaTaskKey, jiraIssueKey, status) {
  const entry = { timestamp: new Date().toISOString(), direction, camundaTaskKey, jiraIssueKey, status };
  eventLog.unshift(entry); // newest first
  if (eventLog.length > 200) eventLog.length = 200;
  const arrow = direction === 'outbound' ? '>>>' : '<<<';
  console.log(`[${entry.timestamp}] ${arrow} ${direction.toUpperCase()}: ${status} | Camunda: ${camundaTaskKey || '-'} | Jira: ${jiraIssueKey || '-'}`);
}

// --- Outbound: Camunda -> Jira ---
async function outboundSync() {
  if (!numericProcessDefinitionKey) {
    console.log('Outbound skipped: waiting for processDefinitionKey from deployment...');
    return;
  }
  try {
    const tasks = await tasklistApi('POST', '/v1/tasks/search', {
      state: 'CREATED',
      processDefinitionKey: numericProcessDefinitionKey,
    });

    if (!Array.isArray(tasks)) return;

    for (const task of tasks) {
      if (syncMap.has(task.id)) continue;

      const candidateGroup = task.candidateGroups?.[0] || 'unassigned';
      const label = config.candidateGroupLabels[candidateGroup] || candidateGroup;

      const issue = await jiraApi('POST', '/rest/api/3/issue', {
        fields: {
          project: { key: config.jira.projectKey },
          issuetype: { name: config.jira.issueType },
          summary: `[Camunda] ${(task.name || task.taskDefinitionId).replace(/\n/g, ' ')}`,
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [
                { type: 'text', text: `Camunda user task synced for governance review.\n\n` },
                { type: 'text', text: `[camunda:taskKey:${task.id}]\n` },
                { type: 'text', text: `[camunda:processInstanceKey:${task.processInstanceKey}]\n` },
                { type: 'text', text: `[camunda:candidateGroup:${candidateGroup}]\n` },
                { type: 'text', text: `\nComplete this issue (move to Done) to advance the Camunda process.` },
              ],
            }],
          },
          labels: [label, 'camunda-synced'],
        },
      });

      syncMap.set(task.id, { jiraIssueKey: issue.key, status: 'synced' });
      logEvent('outbound', task.id, issue.key, `Created Jira issue for "${task.name}"`);
    }
  } catch (err) {
    logEvent('error', null, null, `Outbound error: ${err.message}`);
  }
}

// --- Inbound: Jira -> Camunda ---
async function inboundSync() {
  try {
    const jql = `project = ${config.jira.projectKey} AND labels = camunda-synced AND status = Done AND updated >= -2m`;
    const result = await jiraApi('POST', '/rest/api/3/search/jql', {
      jql,
      fields: ['description', 'summary', 'status'],
    });

    if (!result.issues) return;

    for (const issue of result.issues) {
      // Extract camunda task key from description
      const descText = extractDescriptionText(issue.fields.description);
      const taskKeyMatch = descText.match(/\[camunda:taskKey:([^\]]+)\]/);
      if (!taskKeyMatch) continue;

      const camundaTaskKey = taskKeyMatch[1];
      const entry = syncMap.get(camundaTaskKey);
      if (!entry || entry.status === 'completed') continue;

      // Assign then complete (Tasklist requires assignment before completion)
      await tasklistApi('PATCH', `/v1/tasks/${camundaTaskKey}/assign`, {
        assignee: 'jira-sync',
        allowOverrideAssignment: true,
      });

      await tasklistApi('PATCH', `/v1/tasks/${camundaTaskKey}/complete`, {
        variables: [],
      });

      entry.status = 'completed';

      // Add completion comment to Jira
      await jiraApi('POST', `/rest/api/3/issue/${issue.key}/comment`, {
        body: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: 'Task completed in Camunda via jira-sync.' }],
          }],
        },
      });

      logEvent('inbound', camundaTaskKey, issue.key, `Completed Camunda task from Jira Done`);
    }
  } catch (err) {
    logEvent('error', null, null, `Inbound error: ${err.message}`);
  }
}

function extractDescriptionText(description) {
  if (!description || !description.content) return '';
  let text = '';
  for (const block of description.content) {
    if (block.content) {
      for (const inline of block.content) {
        if (inline.text) text += inline.text;
      }
    }
  }
  return text;
}

// --- Crash Recovery ---
async function recoverSyncMap() {
  try {
    const jql = `project = ${config.jira.projectKey} AND labels = camunda-synced AND status != Done`;
    const result = await jiraApi('POST', '/rest/api/3/search/jql', {
      jql,
      fields: ['description', 'summary'],
    });
    if (!result.issues) return;

    for (const issue of result.issues) {
      const descText = extractDescriptionText(issue.fields.description);
      const taskKeyMatch = descText.match(/\[camunda:taskKey:([^\]]+)\]/);
      if (!taskKeyMatch) continue;
      syncMap.set(taskKeyMatch[1], { jiraIssueKey: issue.key, status: 'synced' });
      logEvent('outbound', taskKeyMatch[1], issue.key, `Recovered from Jira (pending)`);
    }
    console.log(`Crash recovery: rebuilt ${syncMap.size} entries from Jira`);
  } catch (err) {
    console.error(`Crash recovery failed: ${err.message}`);
  }
}

// --- Deploy Test BPMN ---
async function deployTestProcess() {
  try {
    const bpmnPath = path.join(__dirname, '..', 'processes', 'jira-sync-test.bpmn');
    const bpmnContent = fs.readFileSync(bpmnPath);
    const token = await getToken('zeebe.camunda.io');

    const boundary = '----JiraSyncDeploy' + Date.now();
    const parts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="resources"; filename="jira-sync-test.bpmn"\r\nContent-Type: application/octet-stream\r\n\r\n`,
      bpmnContent,
      `\r\n--${boundary}--\r\n`,
    ];
    const body = Buffer.concat(parts.map(p => typeof p === 'string' ? Buffer.from(p) : p));

    const res = await fetch(`${CAMUNDA.zeebeUrl}/v2/deployments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Deploy ${res.status}: ${text}`);
    const result = JSON.parse(text);
    console.log('Test BPMN deployed:', JSON.stringify(result.deploymentKey || result));

    // Extract numeric processDefinitionKey from deployment response
    const procDef = result.deployments?.find(d => d.processDefinition)?.processDefinition;
    if (procDef?.processDefinitionKey) {
      numericProcessDefinitionKey = String(procDef.processDefinitionKey);
      console.log(`Resolved processDefinitionKey: ${numericProcessDefinitionKey}`);
    }
    return result;
  } catch (err) {
    console.error(`Deploy failed: ${err.message}`);
    console.log('Attempting to look up existing process definition...');
  }

  // Fallback: look up by BPMN process ID if deploy failed (already exists)
  await resolveProcessDefinitionKey();
}

async function resolveProcessDefinitionKey() {
  try {
    const search = await zeebeApi('POST', '/v2/process-definitions/search', {
      filter: { processDefinitionId: config.processDefinitionKey },
    });
    if (search.items?.length) {
      numericProcessDefinitionKey = String(search.items[0].processDefinitionKey);
      console.log(`Resolved processDefinitionKey via search: ${numericProcessDefinitionKey}`);
    } else {
      console.error('Could not resolve processDefinitionKey — deploy the BPMN first');
    }
  } catch (err) {
    console.error(`Process definition lookup failed: ${err.message}`);
  }
}

// --- Express Server (Status Dashboard + Start Endpoint) ---
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sync-status', (req, res) => {
  const stats = { outbound: 0, inbound: 0, pending: 0, errors: 0 };
  for (const e of eventLog) {
    if (e.direction === 'error') stats.errors++;
    else if (e.direction === 'outbound') stats.outbound++;
    else if (e.direction === 'inbound') stats.inbound++;
  }
  for (const [, v] of syncMap) {
    if (v.status === 'synced') stats.pending++;
  }
  res.json({ stats, events: eventLog.slice(0, 50) });
});

app.post('/start', async (req, res) => {
  if (!numericProcessDefinitionKey) {
    return res.status(503).json({ error: 'Process not yet deployed — no processDefinitionKey available' });
  }
  try {
    const result = await zeebeApi('POST', '/v2/process-instances', {
      processDefinitionKey: numericProcessDefinitionKey,
      variables: {
        requestName: 'Jira Sync Test',
        startedAt: new Date().toISOString(),
      },
    });
    console.log(`Started process instance: ${result.processInstanceKey}`);
    res.json({ processInstanceKey: result.processInstanceKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Main ---
async function main() {
  console.log('=== Jira Sync Service ===');
  console.log(`Process: ${config.processDefinitionKey}`);
  console.log(`Jira: ${config.jira.baseUrl} / ${config.jira.projectKey}`);
  console.log(`Polling: outbound=${config.polling.outboundIntervalMs}ms, inbound=${config.polling.inboundIntervalMs}ms`);

  await deployTestProcess();
  await recoverSyncMap();

  // Start polling loops
  setInterval(outboundSync, config.polling.outboundIntervalMs);
  setInterval(inboundSync, config.polling.inboundIntervalMs);

  // Run once immediately
  await outboundSync();

  app.listen(3848, '127.0.0.1', () => {
    console.log('Status dashboard: http://127.0.0.1:3848/jira-sync-status.html');
    console.log('Start instance:   curl -X POST http://127.0.0.1:3848/start');
  });
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
