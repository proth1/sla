const express = require('express');
const path = require('path');
const fs = require('fs');
const { createCamundaAuth } = require('./camunda-auth');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Shared Camunda Auth ---
const auth = createCamundaAuth();
const CONFIG = auth.config;
CONFIG.processId = 'Process_Onboarding_v17';

// --- Personas (parsed from personas.js — single source of truth) ---
const PERSONAS = (function() {
  const src = fs.readFileSync(path.join(__dirname, 'public', 'personas.js'), 'utf8');
  const match = src.match(/const PERSONAS\s*=\s*(\[[\s\S]*?\n\];)/);
  if (!match) throw new Error('Could not parse PERSONAS from personas.js');
  return (new Function('return ' + match[1]))();
})();

function getPersonaFromReq(req) {
  const id = req.headers['x-sla-persona'];
  if (!id) return null;
  return PERSONAS.find(p => p.id === id) || null;
}

function getPersonaGroups(persona) {
  if (!persona) return null;
  return persona.groups || [];
}

function filterTasksByPersona(tasks, persona) {
  if (!persona) return tasks;
  const groups = getPersonaGroups(persona);
  if (!groups || groups.length === 0) return tasks;
  return tasks.filter(t => {
    const tGroups = t.candidateGroups || [];
    return tGroups.some(g => groups.includes(g));
  });
}

// --- API Helpers ---
async function zeebeApi(method, apiPath, body) {
  const token = await auth.getToken('zeebe.camunda.io');
  const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const url = `${CONFIG.zeebeUrl}${apiPath}`;
  const t0 = Date.now();
  console.log(`\x1b[36m→ ZEEBE ${method} ${apiPath}\x1b[0m${body ? ' ' + JSON.stringify(body).slice(0, 200) : ''}`);
  const res = await fetch(url, opts);
  const ms = Date.now() - t0;
  if (!res.ok) {
    const text = await res.text();
    console.log(`\x1b[31m← ZEEBE ${res.status} ${ms}ms\x1b[0m ${text.slice(0, 200)}`);
    throw new Error(`Zeebe ${res.status}: ${text}`);
  }
  const text = await res.text();
  console.log(`\x1b[32m← ZEEBE ${res.status} ${ms}ms\x1b[0m ${text.slice(0, 150)}${text.length > 150 ? '...' : ''}`);
  return text ? JSON.parse(text) : {};
}

async function tasklistApi(method, apiPath, body) {
  const token = await auth.getToken('tasklist.camunda.io');
  const opts = { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const url = `${CONFIG.tasklistUrl}${apiPath}`;
  const t0 = Date.now();
  console.log(`\x1b[33m→ TASKLIST ${method} ${apiPath}\x1b[0m${body ? ' ' + JSON.stringify(body).slice(0, 200) : ''}`);
  const res = await fetch(url, opts);
  const ms = Date.now() - t0;
  if (!res.ok) {
    const text = await res.text();
    console.log(`\x1b[31m← TASKLIST ${res.status} ${ms}ms\x1b[0m ${text.slice(0, 200)}`);
    throw new Error(`Tasklist ${res.status}: ${text}`);
  }
  const data = await res.json();
  const preview = JSON.stringify(data).slice(0, 150);
  console.log(`\x1b[32m← TASKLIST ${res.status} ${ms}ms\x1b[0m ${preview}${preview.length >= 150 ? '...' : ''}`);
  return data;
}

// --- Personas endpoint ---
app.get('/api/personas', (req, res) => {
  res.json(PERSONAS);
});

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

// List active tasks (filtered by persona)
app.get('/api/tasks', async (req, res) => {
  try {
    const query = { state: 'CREATED' };
    if (req.query.processInstanceKey) query.processInstanceKey = req.query.processInstanceKey;
    const tasks = await tasklistApi('POST', '/v1/tasks/search', query);
    const persona = getPersonaFromReq(req);
    const filtered = Array.isArray(tasks) ? filterTasksByPersona(tasks, persona) : tasks;
    res.json(filtered);
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

// Assign task (uses persona ID as assignee if available)
app.post('/api/tasks/:id/assign', async (req, res) => {
  try {
    const persona = getPersonaFromReq(req);
    const assignee = persona ? persona.id : 'showcase-user';
    const result = await tasklistApi('PATCH', `/v1/tasks/${req.params.id}/assign`, {
      assignee,
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

// Reassign a task to a specific user
app.post('/api/tasks/:id/reassign', async (req, res) => {
  try {
    const assignee = typeof req.body.assignee === 'string' ? req.body.assignee.trim().slice(0, 200) : '';
    if (!assignee) return res.status(400).json({ error: 'assignee is required' });
    const result = await tasklistApi('PATCH', `/v1/tasks/${req.params.id}/assign`, {
      assignee,
      allowOverrideAssignment: true,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Unassign a task (return to group pool)
app.post('/api/tasks/:id/unassign', async (req, res) => {
  try {
    const result = await tasklistApi('PATCH', `/v1/tasks/${req.params.id}/unassign`);
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

// Get variables for a process instance
app.get('/api/process/:key/variables', async (req, res) => {
  try {
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

// ========================
// Mini RFP API Routes
// ========================

const MINI_RFP_PROCESS_ID = 'Process_MiniRFP';

function isValidKey(key) {
  return /^\d{1,19}$/.test(key);
}

app.post('/api/mini-rfp/start', async (req, res) => {
  try {
    const variables = req.body.variables || {};
    const result = await zeebeApi('POST', '/v2/process-instances', {
      processDefinitionId: MINI_RFP_PROCESS_ID,
      variables,
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/mini-rfp/:key/status', async (req, res) => {
  if (!isValidKey(req.params.key)) return res.status(400).json({ error: 'Invalid process key' });
  try {
    const [instance, tasks] = await Promise.all([
      zeebeApi('GET', `/v2/process-instances/${req.params.key}`),
      tasklistApi('POST', '/v1/tasks/search', {
        processInstanceKey: req.params.key,
        state: 'CREATED',
      }),
    ]);
    const currentTask = Array.isArray(tasks) && tasks.length > 0 ? tasks[0] : null;
    res.json({
      ...instance,
      currentTask: currentTask ? {
        id: currentTask.id,
        name: currentTask.name,
        taskDefinitionId: currentTask.taskDefinitionId,
        candidateGroups: currentTask.candidateGroups,
      } : null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/mini-rfp/active', async (req, res) => {
  try {
    const result = await zeebeApi('POST', '/v2/process-instances/search', {
      filter: { processDefinitionId: MINI_RFP_PROCESS_ID, state: 'ACTIVE' },
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/mini-rfp/:key/vendor-token', async (req, res) => {
  if (!isValidKey(req.params.key)) return res.status(400).json({ error: 'Invalid process key' });
  try {
    const { randomBytes } = require('crypto');
    const vendorToken = `vrfp-${req.params.key}-${randomBytes(12).toString('hex')}`;
    res.json({ vendorToken, portalUrl: `/vendor-portal.html?token=${vendorToken}&instance=${req.params.key}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/mini-rfp/:key/vendor-response', async (req, res) => {
  if (!isValidKey(req.params.key)) return res.status(400).json({ error: 'Invalid process key' });
  try {
    const { vendorToken, responseData } = req.body;
    const correlationKey = vendorToken || req.params.key;
    const result = await zeebeApi('POST', '/v2/messages/publication', {
      messageName: 'MiniRFPResponseMessage',
      correlationKey: correlationKey,
      variables: responseData || {},
    });
    res.json({ correlated: true, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/mini-rfp/:key/transfer', async (req, res) => {
  if (!isValidKey(req.params.key)) return res.status(400).json({ error: 'Invalid process key' });
  try {
    let vars = [];
    try {
      const tasks = await tasklistApi('POST', '/v1/tasks/search', {
        processInstanceKey: req.params.key,
      });
      if (Array.isArray(tasks) && tasks.length > 0) {
        vars = await tasklistApi('POST', `/v1/tasks/${tasks[0].id}/variables/search`, {});
      }
    } catch (e) { /* may have no tasks if completed */ }

    const varMap = {};
    vars.forEach(v => {
      try { varMap[v.name] = JSON.parse(v.value); } catch { varMap[v.name] = v.value; }
    });

    const onboardingVars = {
      softwareName: varMap.vendorName ? `${varMap.vendorName} - ${varMap.technologyType || 'Software'}` : 'Mini RFP Transfer',
      vendorName: varMap.vendorName || '',
      requesterName: varMap.requesterName || '',
      department: varMap.department || '',
      requesterEmail: varMap.requesterEmail || '',
      estimatedCost: varMap.budgetRange === 'over_500k' ? 500000 : varMap.budgetRange === '100k_500k' ? 250000 : varMap.budgetRange === '25k_100k' ? 50000 : 25000,
      requestType: 'defined-need',
      riskCategory: varMap.dataClassification === 'restricted' ? 'Critical' : varMap.dataClassification === 'confidential' ? 'High' : 'Standard',
      miniRfpInstanceKey: req.params.key,
      miniRfpTransferred: true,
      miniRfpTransferDate: new Date().toISOString(),
      hasAI: varMap.hasAI === 'yes',
      dataClassification: varMap.dataClassification || '',
      regulatoryScope: varMap.regulatoryScope || '',
      technologyType: varMap.technologyType || '',
      businessCriticality: varMap.businessCriticality || '',
      approved: true,
      buildPathway: false,
      needsAssessment: true,
      bypassProcess: false,
      vendorSelected: true,
      evalApproved: true,
      vendorQualified: true,
      selectedPathway: 'buy',
      testsPassed: true,
      finalApproved: true,
      isVendorPartnership: false,
    };

    if (req.body.startOnboarding) {
      const result = await zeebeApi('POST', '/v2/process-instances', {
        processDefinitionId: CONFIG.processId,
        variables: onboardingVars,
      });
      res.json({ transferred: true, onboardingInstanceKey: result.processInstanceKey, mappedVariables: onboardingVars });
    } else {
      res.json({ transferred: false, mappedVariables: onboardingVars });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========================
// Task Comments (in-memory)
// ========================
const taskComments = new Map();

app.get('/api/tasks/:id/comments', (req, res) => {
  res.json(taskComments.get(req.params.id) || []);
});

app.post('/api/tasks/:id/comments', (req, res) => {
  const { author, persona, text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }
  const comment = {
    author: typeof author === 'string' ? author.slice(0, 200) : 'Anonymous',
    persona: typeof persona === 'string' ? persona.slice(0, 100) : '',
    text: text.trim().slice(0, 2000),
    timestamp: new Date().toISOString(),
  };
  if (!taskComments.has(req.params.id)) taskComments.set(req.params.id, []);
  taskComments.get(req.params.id).push(comment);
  res.json(taskComments.get(req.params.id));
});

// Deploy BPMN + forms to cluster
app.post('/api/deploy', async (req, res) => {
  try {
    const token = await auth.getToken('zeebe.camunda.io');
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
