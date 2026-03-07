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

// --- ISO 8601 Duration Parser ---
function parseDuration(iso) {
  const m = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return 4 * 3600 * 1000; // default 4h
  const days = parseInt(m[1] || 0);
  const hours = parseInt(m[2] || 0);
  const mins = parseInt(m[3] || 0);
  const secs = parseInt(m[4] || 0);
  return ((days * 24 + hours) * 3600 + mins * 60 + secs) * 1000;
}

// --- Sync State ---
// syncMap: camundaTaskKey -> {
//   jiraIssueKey, status: 'synced'|'completed',
//   createdAt (ms), slaDeadlineMs (ms),
//   candidateGroup, processInstanceKey,
//   warned (bool), escalated (bool)
// }
const syncMap = new Map();
const eventLog = [];
let numericProcessDefinitionKey = null;

// Track breach count per process instance for chronic escalation
const instanceBreachCount = new Map();

function logEvent(direction, camundaTaskKey, jiraIssueKey, status) {
  const entry = { timestamp: new Date().toISOString(), direction, camundaTaskKey, jiraIssueKey, status };
  eventLog.unshift(entry);
  if (eventLog.length > 200) eventLog.length = 200;
  const arrows = { outbound: '>>>', inbound: '<<<', 'sla-warning': '!! ', 'sla-breach': '!!!', 'chronic-breach': 'XXX', error: 'ERR' };
  console.log(`[${entry.timestamp}] ${arrows[direction] || '---'} ${direction.toUpperCase()}: ${status} | Camunda: ${camundaTaskKey || '-'} | Jira: ${jiraIssueKey || '-'}`);
}

// --- RACI Helpers ---
function getRaci(candidateGroup) {
  return config.raci[candidateGroup] || {
    accountable: 'governance-lane',
    consulted: [],
    informed: [],
    sla: 'P1D',
    escalationChain: ['governance-lane', 'oversight-lane'],
  };
}

function getLabelForGroup(group) {
  return config.candidateGroupLabels[group] || group;
}

function buildRaciDescription(candidateGroup, task) {
  const raci = getRaci(candidateGroup);
  const rLabel = getLabelForGroup(candidateGroup);
  const aLabel = getLabelForGroup(raci.accountable);
  const cLabels = raci.consulted.map(getLabelForGroup).join(', ') || 'none';
  const iLabels = raci.informed.map(getLabelForGroup).join(', ') || 'none';

  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Camunda user task synced for governance review.\n\n' },
          { type: 'text', text: `[camunda:taskKey:${task.id}]\n` },
          { type: 'text', text: `[camunda:processInstanceKey:${task.processInstanceKey}]\n` },
          { type: 'text', text: `[camunda:candidateGroup:${candidateGroup}]\n\n` },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'RACI Assignment\n', marks: [{ type: 'strong' }] },
          { type: 'text', text: `R (Responsible): ${rLabel}\n` },
          { type: 'text', text: `A (Accountable): ${aLabel}\n` },
          { type: 'text', text: `C (Consulted): ${cLabels}\n` },
          { type: 'text', text: `I (Informed): ${iLabels}\n` },
          { type: 'text', text: `SLA: ${raci.sla}\n` },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '\nComplete this issue (move to Done) to advance the Camunda process. Failure to complete within the SLA window will trigger escalation.' },
        ],
      },
    ],
  };
}

// --- Outbound: Camunda -> Jira (RACI-aware) ---
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
      const raci = getRaci(candidateGroup);
      const label = getLabelForGroup(candidateGroup);
      const slaDurationMs = parseDuration(raci.sla);
      const now = Date.now();

      const issue = await jiraApi('POST', '/rest/api/3/issue', {
        fields: {
          project: { key: config.jira.projectKey },
          issuetype: { name: config.jira.issueType },
          summary: `[Camunda] ${(task.name || task.taskDefinitionId).replace(/\n/g, ' ')}`,
          description: buildRaciDescription(candidateGroup, task),
          labels: [label, 'camunda-synced'],
        },
      });

      syncMap.set(task.id, {
        jiraIssueKey: issue.key,
        status: 'synced',
        createdAt: now,
        slaDeadlineMs: now + slaDurationMs,
        candidateGroup,
        processInstanceKey: task.processInstanceKey,
        warned: false,
        escalated: false,
      });
      logEvent('outbound', task.id, issue.key, `Created for "${(task.name || '').replace(/\n/g, ' ')}" [SLA: ${raci.sla}]`);
    }
  } catch (err) {
    logEvent('error', null, null, `Outbound error: ${err.message}`);
  }
}

// --- Inbound: Jira -> Camunda (with I-role notification) ---
async function inboundSync() {
  try {
    const jql = `project = ${config.jira.projectKey} AND labels = camunda-synced AND status = Done AND updated >= -2m`;
    const result = await jiraApi('POST', '/rest/api/3/search/jql', {
      jql,
      fields: ['description', 'summary', 'status'],
    });

    if (!result.issues) return;

    for (const issue of result.issues) {
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

      // Notify I (Informed) roles via comment
      const raci = getRaci(entry.candidateGroup);
      const informedLabels = raci.informed.map(getLabelForGroup).join(', ');
      const completionNote = informedLabels
        ? `Task completed in Camunda via jira-sync. Informed: ${informedLabels}.`
        : 'Task completed in Camunda via jira-sync.';

      await jiraApi('POST', `/rest/api/3/issue/${issue.key}/comment`, {
        body: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: completionNote }],
          }],
        },
      });

      logEvent('inbound', camundaTaskKey, issue.key, 'Completed Camunda task from Jira Done');
    }
  } catch (err) {
    logEvent('error', null, null, `Inbound error: ${err.message}`);
  }
}

// --- SLA Monitor: Warning + Breach + Chronic Escalation ---
async function slaMonitor() {
  const now = Date.now();

  for (const [taskKey, entry] of syncMap) {
    if (entry.status !== 'synced') continue;

    const elapsed = now - entry.createdAt;
    const total = entry.slaDeadlineMs - entry.createdAt;
    const pct = elapsed / total;

    // 80% warning
    if (pct >= 0.8 && !entry.warned) {
      entry.warned = true;
      const raci = getRaci(entry.candidateGroup);
      const aLabel = getLabelForGroup(raci.accountable);
      const remaining = Math.max(0, Math.round((entry.slaDeadlineMs - now) / 60000));

      try {
        // Add warning comment to the existing Jira issue
        await jiraApi('POST', `/rest/api/3/issue/${entry.jiraIssueKey}/comment`, {
          body: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [
                { type: 'text', text: 'SLA WARNING (80% elapsed)', marks: [{ type: 'strong' }] },
                { type: 'text', text: ` — ${remaining} minutes remaining. Accountable: ${aLabel}. Please complete or escalate.` },
              ],
            }],
          },
        });

        // Add sla-at-risk label
        await jiraApi('PUT', `/rest/api/3/issue/${entry.jiraIssueKey}`, {
          update: { labels: [{ add: 'sla-at-risk' }] },
        });

        logEvent('sla-warning', taskKey, entry.jiraIssueKey, `80% elapsed — ${remaining}min left, notified ${aLabel}`);
      } catch (err) {
        logEvent('error', taskKey, entry.jiraIssueKey, `SLA warning failed: ${err.message}`);
      }
    }

    // 100% breach
    if (pct >= 1.0 && !entry.escalated) {
      entry.escalated = true;
      const raci = getRaci(entry.candidateGroup);

      // Track breach count per process instance
      const piKey = entry.processInstanceKey;
      const breachCount = (instanceBreachCount.get(piKey) || 0) + 1;
      instanceBreachCount.set(piKey, breachCount);

      // Determine escalation target: chronic (3+) goes to end of chain
      const isChronic = breachCount >= 3;
      const escalationTarget = isChronic
        ? raci.escalationChain[raci.escalationChain.length - 1] || raci.accountable
        : raci.escalationChain[0] || raci.accountable;
      const targetLabel = getLabelForGroup(escalationTarget);

      const taskName = entry.jiraIssueKey; // use Jira key as reference

      try {
        const summaryPrefix = isChronic ? 'CHRONIC SLA BREACH' : 'ESCALATION: SLA Breach';
        const escalationIssue = await jiraApi('POST', '/rest/api/3/issue', {
          fields: {
            project: { key: config.jira.projectKey },
            issuetype: { name: config.jira.issueType },
            summary: `[${summaryPrefix}] ${taskName} — overdue task`,
            priority: { name: 'High' },
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: `SLA breach on Camunda task.\n\n`, marks: [{ type: 'strong' }] },
                    { type: 'text', text: `Original issue: ${entry.jiraIssueKey}\n` },
                    { type: 'text', text: `[camunda:taskKey:${taskKey}]\n` },
                    { type: 'text', text: `[camunda:processInstanceKey:${piKey}]\n` },
                    { type: 'text', text: `Responsible: ${getLabelForGroup(entry.candidateGroup)}\n` },
                    { type: 'text', text: `Escalated to: ${targetLabel}\n` },
                    { type: 'text', text: `Breach count (this instance): ${breachCount}\n` },
                    { type: 'text', text: `\nPer REQ-NFR-006: Escalation to next governance level required.` },
                  ],
                },
              ],
            },
            labels: [targetLabel, 'sla-escalation', 'camunda-synced'],
          },
        });

        // Add sla-breached label to original issue
        await jiraApi('PUT', `/rest/api/3/issue/${entry.jiraIssueKey}`, {
          update: { labels: [{ add: 'sla-breached' }] },
        });

        // Comment on original issue linking to escalation
        await jiraApi('POST', `/rest/api/3/issue/${entry.jiraIssueKey}/comment`, {
          body: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [
                { type: 'text', text: 'SLA BREACHED (100% elapsed)', marks: [{ type: 'strong' }] },
                { type: 'text', text: ` — Escalation issue created: ${escalationIssue.key}. Assigned to ${targetLabel}.` },
              ],
            }],
          },
        });

        const direction = isChronic ? 'chronic-breach' : 'sla-breach';
        logEvent(direction, taskKey, escalationIssue.key, `${summaryPrefix} — escalated to ${targetLabel} (breach #${breachCount})`);
      } catch (err) {
        logEvent('error', taskKey, entry.jiraIssueKey, `SLA escalation failed: ${err.message}`);
      }
    }
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

// --- Crash Recovery (with SLA state rebuild) ---
async function recoverSyncMap() {
  try {
    const jql = `project = ${config.jira.projectKey} AND labels = camunda-synced AND labels != sla-escalation AND status != Done`;
    const result = await jiraApi('POST', '/rest/api/3/search/jql', {
      jql,
      fields: ['description', 'summary', 'created', 'labels'],
    });
    if (!result.issues) return;

    for (const issue of result.issues) {
      const descText = extractDescriptionText(issue.fields.description);
      const taskKeyMatch = descText.match(/\[camunda:taskKey:([^\]]+)\]/);
      if (!taskKeyMatch) continue;

      const piMatch = descText.match(/\[camunda:processInstanceKey:([^\]]+)\]/);
      const cgMatch = descText.match(/\[camunda:candidateGroup:([^\]]+)\]/);
      const candidateGroup = cgMatch ? cgMatch[1] : 'unassigned';
      const raci = getRaci(candidateGroup);
      const slaDurationMs = parseDuration(raci.sla);
      const createdAt = new Date(issue.fields.created).getTime();

      const labels = issue.fields.labels || [];
      const warned = labels.includes('sla-at-risk');
      const escalated = labels.includes('sla-breached');

      syncMap.set(taskKeyMatch[1], {
        jiraIssueKey: issue.key,
        status: 'synced',
        createdAt,
        slaDeadlineMs: createdAt + slaDurationMs,
        candidateGroup,
        processInstanceKey: piMatch ? piMatch[1] : 'unknown',
        warned,
        escalated,
      });
      logEvent('outbound', taskKeyMatch[1], issue.key, `Recovered (pending, SLA deadline: ${new Date(createdAt + slaDurationMs).toISOString()})`);
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

// --- Express Server ---
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sync-status', (req, res) => {
  const stats = { outbound: 0, inbound: 0, pending: 0, errors: 0, warnings: 0, breaches: 0 };
  for (const e of eventLog) {
    if (e.direction === 'error') stats.errors++;
    else if (e.direction === 'outbound') stats.outbound++;
    else if (e.direction === 'inbound') stats.inbound++;
    else if (e.direction === 'sla-warning') stats.warnings++;
    else if (e.direction === 'sla-breach' || e.direction === 'chronic-breach') stats.breaches++;
  }
  for (const [, v] of syncMap) {
    if (v.status === 'synced') stats.pending++;
  }

  // Build SLA status for pending items
  const now = Date.now();
  const slaStatus = [];
  for (const [taskKey, entry] of syncMap) {
    if (entry.status !== 'synced') continue;
    const elapsed = now - entry.createdAt;
    const total = entry.slaDeadlineMs - entry.createdAt;
    const pct = Math.min(Math.round((elapsed / total) * 100), 999);
    slaStatus.push({
      taskKey,
      jiraIssueKey: entry.jiraIssueKey,
      candidateGroup: entry.candidateGroup,
      pct,
      warned: entry.warned,
      escalated: entry.escalated,
      remainingMin: Math.max(0, Math.round((entry.slaDeadlineMs - now) / 60000)),
    });
  }

  res.json({ stats, events: eventLog.slice(0, 50), slaStatus });
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
  console.log('=== Jira Sync Service (RACI + SLA Escalation) ===');
  console.log(`Process: ${config.processDefinitionKey}`);
  console.log(`Jira: ${config.jira.baseUrl} / ${config.jira.projectKey}`);
  console.log(`Polling: outbound=${config.polling.outboundIntervalMs}ms, inbound=${config.polling.inboundIntervalMs}ms, sla=${config.polling.slaCheckIntervalMs}ms`);
  console.log(`RACI groups: ${Object.keys(config.raci).join(', ')}`);

  await deployTestProcess();
  await recoverSyncMap();

  // Start polling loops
  setInterval(outboundSync, config.polling.outboundIntervalMs);
  setInterval(inboundSync, config.polling.inboundIntervalMs);
  setInterval(slaMonitor, config.polling.slaCheckIntervalMs);

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
