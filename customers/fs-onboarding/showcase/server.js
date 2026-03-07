const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const fs = require('fs');

const CONFIG = {
  clusterId: process.env.CAMUNDA_CLUSTER_ID || '425f10fa-c898-4b4b-b303-eac095286716',
  region: process.env.CAMUNDA_REGION || 'ric-1',
  clientId: process.env.CAMUNDA_CLIENT_ID || process.env.ZEEBE_CLIENT_ID,
  clientSecret: process.env.CAMUNDA_CLIENT_SECRET || process.env.ZEEBE_CLIENT_SECRET,
  authUrl: 'https://login.cloud.camunda.io/oauth/token',
  processId: 'Process_Onboarding_v8',
  useZbctl: false,
};

// If no client credentials, fall back to zbctl-managed token from ~/.camunda/credentials
if (!CONFIG.clientId || !CONFIG.clientSecret) {
  const credPath = path.join(require('os').homedir(), '.camunda', 'credentials');
  if (fs.existsSync(credPath)) {
    CONFIG.useZbctl = true;
    console.log('No CAMUNDA_CLIENT_ID/SECRET — using zbctl-managed token from ~/.camunda/credentials');
  } else {
    console.error('Missing CAMUNDA_CLIENT_ID/SECRET and no ~/.camunda/credentials found');
    process.exit(1);
  }
}

CONFIG.zeebeUrl = `https://${CONFIG.region}.zeebe.camunda.io/${CONFIG.clusterId}`;
CONFIG.tasklistUrl = `https://${CONFIG.region}.tasklist.camunda.io/${CONFIG.clusterId}`;

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
    execSync('/opt/homebrew/bin/zbctl status --address ric-1.zeebe.camunda.io:443/425f10fa-c898-4b4b-b303-eac095286716', {
      timeout: 15000, stdio: 'pipe',
    });
  } catch {
    // zbctl refreshes the token even if the status command fails
  }
}

async function getToken(audience) {
  if (CONFIG.useZbctl) {
    // zbctl tokens work for both zeebe and tasklist (same OAuth audience scope)
    const cached = tokenCache.zeebe;
    if (cached && cached.expiresAt > Date.now() + 60000) return cached.token;
    // Token expired or about to — refresh via zbctl
    if (!cached || cached.expiresAt <= Date.now() + 60000) {
      refreshZbctlToken();
    }
    const fresh = readZbctlToken();
    tokenCache.zeebe = fresh;
    tokenCache.tasklist = fresh;
    return fresh.token;
  }

  const cached = tokenCache[audience === 'zeebe.camunda.io' ? 'zeebe' : 'tasklist'];
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await fetch(CONFIG.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CONFIG.clientId,
      client_secret: CONFIG.clientSecret,
      audience,
    }),
  });
  const data = await res.json();
  const key = audience === 'zeebe.camunda.io' ? 'zeebe' : 'tasklist';
  tokenCache[key] = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

async function zeebeApi(method, path, body) {
  const token = await getToken('zeebe.camunda.io');
  const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CONFIG.zeebeUrl}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zeebe ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function tasklistApi(method, path, body) {
  const token = await getToken('tasklist.camunda.io');
  const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CONFIG.tasklistUrl}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tasklist ${res.status}: ${text}`);
  }
  return res.json();
}

// Start a new process instance
app.post('/api/process/start', async (req, res) => {
  try {
    const variables = req.body.variables || {};
    const result = await zeebeApi('POST', '/v2/process-instances', {
      processDefinitionId: CONFIG.processId,
      variables,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get process instance
app.get('/api/process/:key', async (req, res) => {
  try {
    const result = await zeebeApi('GET', `/v2/process-instances/${req.params.key}`);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cancel a process instance
app.delete('/api/process/:key', async (req, res) => {
  try {
    const result = await zeebeApi('POST', `/v2/process-instances/${req.params.key}/cancellation`);
    res.json({ cancelled: true, key: req.params.key });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List active tasks (optionally filter by processInstanceKey)
app.get('/api/tasks', async (req, res) => {
  try {
    const query = { state: 'CREATED' };
    if (req.query.processInstanceKey) query.processInstanceKey = req.query.processInstanceKey;
    const tasks = await tasklistApi('POST', '/v1/tasks/search', query);
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List completed tasks (must be BEFORE :id routes)
app.get('/api/tasks/completed', async (req, res) => {
  try {
    const query = { state: 'COMPLETED' };
    if (req.query.processInstanceKey) query.processInstanceKey = req.query.processInstanceKey;
    const tasks = await tasklistApi('POST', '/v1/tasks/search', query);
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get task details
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await tasklistApi('GET', `/v1/tasks/${req.params.id}`);
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get task form
app.get('/api/tasks/:id/form', async (req, res) => {
  try {
    const form = await tasklistApi('GET', `/v1/forms/${req.params.id}?processDefinitionKey=${req.query.processDefinitionKey || ''}`);
    res.json(form);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get form by formId and processDefinitionKey
app.get('/api/forms/:formId', async (req, res) => {
  try {
    const form = await tasklistApi('GET', `/v1/forms/${req.params.formId}?processDefinitionKey=${req.query.processDefinitionKey || ''}`);
    res.json(form);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get task variables
app.get('/api/tasks/:id/variables', async (req, res) => {
  try {
    const vars = await tasklistApi('POST', `/v1/tasks/${req.params.id}/variables/search`, {});
    res.json(vars);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Assign task to current user (claim)
app.post('/api/tasks/:id/assign', async (req, res) => {
  try {
    const result = await tasklistApi('PATCH', `/v1/tasks/${req.params.id}/assign`, {
      assignee: 'showcase-user',
      allowOverrideAssignment: true,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Complete a task
app.post('/api/tasks/:id/complete', async (req, res) => {
  try {
    const result = await tasklistApi('PATCH', `/v1/tasks/${req.params.id}/complete`, {
      variables: req.body.variables || [],
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search process instances (for dashboard)
app.post('/api/instances/search', async (req, res) => {
  try {
    const result = await zeebeApi('POST', '/v2/process-instances/search', req.body || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Search all tasks (any state, for dashboard)
app.post('/api/tasks/search', async (req, res) => {
  try {
    const result = await tasklistApi('POST', '/v1/tasks/search', req.body || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get variables for a process instance (via Zeebe search)
app.get('/api/process/:key/variables', async (req, res) => {
  try {
    // Get variables via tasklist - search tasks for this instance to find variables
    const tasks = await tasklistApi('POST', '/v1/tasks/search', {
      processInstanceKey: req.params.key,
    });
    if (tasks.length > 0) {
      const vars = await tasklistApi('POST', `/v1/tasks/${tasks[0].id}/variables/search`, {});
      res.json(vars);
    } else {
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Deploy BPMN + forms to cluster
app.post('/api/deploy', async (req, res) => {
  try {
    const token = await getToken('zeebe.camunda.io');
    const syncDir = path.join(__dirname, '..', 'processes', 'camunda-sync');
    const files = fs.readdirSync(syncDir).filter(f => f.endsWith('.bpmn') || f.endsWith('.form'));

    const boundary = '----ZeebeDeploy' + Date.now();
    const parts = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(syncDir, file));
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="resources"; filename="${file}"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`
      );
      parts.push(content);
      parts.push('\r\n');
    }
    parts.push(`--${boundary}--\r\n`);

    const buffers = parts.map(p => typeof p === 'string' ? Buffer.from(p) : p);
    const body = Buffer.concat(buffers);

    const deployRes = await fetch(`${CONFIG.zeebeUrl}/v2/deployments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });
    const text = await deployRes.text();
    if (!deployRes.ok) throw new Error(`Deploy ${deployRes.status}: ${text}`);
    res.json(JSON.parse(text));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3847, '127.0.0.1', () => {
  console.log('SLA Onboarding Showcase running at http://127.0.0.1:3847');
});
