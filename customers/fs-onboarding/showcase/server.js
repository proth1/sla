const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CONFIG = {
  clusterId: process.env.CAMUNDA_CLUSTER_ID || '425f10fa-c898-4b4b-b303-eac095286716',
  region: process.env.CAMUNDA_REGION || 'ric-1',
  clientId: process.env.CAMUNDA_CLIENT_ID,
  clientSecret: process.env.CAMUNDA_CLIENT_SECRET,
  authUrl: 'https://login.cloud.camunda.io/oauth/token',
  processId: 'Process_Onboarding_v5',
};

if (!CONFIG.clientId || !CONFIG.clientSecret) {
  console.error('Missing CAMUNDA_CLIENT_ID or CAMUNDA_CLIENT_SECRET environment variables');
  process.exit(1);
}

CONFIG.zeebeUrl = `https://${CONFIG.region}.zeebe.camunda.io/${CONFIG.clusterId}`;
CONFIG.tasklistUrl = `https://${CONFIG.region}.tasklist.camunda.io/${CONFIG.clusterId}`;

let tokenCache = { zeebe: null, tasklist: null };

async function getToken(audience) {
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

app.listen(3847, '127.0.0.1', () => {
  console.log('SLA Onboarding Showcase running at http://127.0.0.1:3847');
});
