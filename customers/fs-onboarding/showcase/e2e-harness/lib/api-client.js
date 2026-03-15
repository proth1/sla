/**
 * API client wrapping showcase server.js routes + direct Camunda APIs.
 */
const http = require('http');
const { createCamundaAuth } = require('../../camunda-auth');

const SERVER = 'http://127.0.0.1:3847';
const auth = createCamundaAuth();
const CONFIG = auth.config;

// ── HTTP helpers ──────────────────────────────────────────────

function request(url, method, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search, method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (u.protocol === 'https:') {
      const https = require('https');
      const req = https.request(opts, handler(resolve, reject));
      if (body) req.write(JSON.stringify(body));
      req.end();
    } else {
      const req = http.request(opts, handler(resolve, reject));
      if (body) req.write(JSON.stringify(body));
      req.end();
    }
  });
}

function handler(resolve, reject) {
  return (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve(data); }
    });
    res.on('error', reject);
  };
}

async function camundaApi(method, path, body, audience = 'zeebe.camunda.io') {
  const token = await auth.getToken(audience);
  const baseUrl = audience === 'tasklist.camunda.io' ? CONFIG.tasklistUrl : CONFIG.zeebeUrl;
  return new Promise((resolve, reject) => {
    const u = new URL(baseUrl + path);
    const https = require('https');
    const opts = {
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    };
    const req = https.request(opts, handler(resolve, reject));
    req.on('error', (e) => reject(new Error(`API ${method} ${path}: ${e.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`API ${method} ${path}: timeout`)); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ── Server-proxied routes ─────────────────────────────────────

async function deploy() {
  return request(`${SERVER}/api/deploy`, 'POST');
}

async function startProcess(variables) {
  return request(`${SERVER}/api/process/start`, 'POST', { variables });
}

async function getProcess(key) {
  return request(`${SERVER}/api/process/${key}`, 'GET');
}

async function getTasks(processInstanceKey) {
  const qs = processInstanceKey ? `?processInstanceKey=${processInstanceKey}` : '';
  return request(`${SERVER}/api/tasks${qs}`, 'GET');
}

async function assignTask(taskId) {
  return request(`${SERVER}/api/tasks/${taskId}/assign`, 'POST', {});
}

async function completeTask(taskId, variables) {
  return request(`${SERVER}/api/tasks/${taskId}/complete`, 'POST', { variables });
}

async function getTaskVariables(taskId) {
  return request(`${SERVER}/api/tasks/${taskId}/variables`, 'GET');
}

// ── Direct Camunda APIs (for jobs, messages, incidents) ───────

async function activateJobs(jobType, maxJobs = 10) {
  return camundaApi('POST', '/v2/jobs/activation', {
    type: jobType, maxJobsToActivate: maxJobs,
    worker: 'e2e-harness', timeout: 60000,
    requestTimeout: 5000,
  });
}

async function completeJob(jobKey, variables = {}) {
  return camundaApi('POST', `/v2/jobs/${jobKey}/completion`, { variables });
}

async function publishMessage(name, correlationKey, variables = {}) {
  return camundaApi('POST', '/v2/messages/publication', {
    name, correlationKey: String(correlationKey),
    timeToLive: 3600000, variables,
  });
}

async function searchInstances(filter) {
  return camundaApi('POST', '/v2/process-instances/search', { filter });
}

async function getChildInstances(parentKey) {
  return camundaApi('POST', '/v2/process-instances/search', {
    filter: { parentProcessInstanceKey: Number(parentKey) },
  });
}

async function searchTasks(filter) {
  return camundaApi('POST', '/v1/tasks/search', filter, 'tasklist.camunda.io');
}

async function assignTaskDirect(taskId) {
  return camundaApi('PATCH', `/v1/tasks/${taskId}/assign`,
    { assignee: 'e2e-harness', allowOverrideAssignment: true }, 'tasklist.camunda.io');
}

async function completeTaskDirect(taskId, variables = []) {
  return camundaApi('PATCH', `/v1/tasks/${taskId}/complete`,
    { variables }, 'tasklist.camunda.io');
}

async function updateVariables(elementInstanceKey, variables) {
  return camundaApi('PUT', `/v2/element-instances/${elementInstanceKey}/variables`,
    { variables });
}

async function resolveIncident(incidentKey) {
  return camundaApi('POST', `/v2/incidents/${incidentKey}/resolution`);
}

async function searchFlowNodes(processInstanceKey) {
  const operate = `https://ric-1.operate.camunda.io/${CONFIG.clusterId}`;
  const token = await auth.getToken('zeebe.camunda.io');
  return new Promise((resolve, reject) => {
    const u = new URL(`${operate}/v1/flownode-instances/search`);
    const https = require('https');
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname, method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    }, handler(resolve, reject));
    req.write(JSON.stringify({ filter: { processInstanceKey, state: 'ACTIVE' }, size: 100 }));
    req.end();
  });
}

async function searchIncidents(processInstanceKey) {
  const operate = `https://ric-1.operate.camunda.io/${CONFIG.clusterId}`;
  const token = await auth.getToken('zeebe.camunda.io');
  return new Promise((resolve, reject) => {
    const u = new URL(`${operate}/v1/incidents/search`);
    const https = require('https');
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname, method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    }, handler(resolve, reject));
    req.write(JSON.stringify({ filter: { processInstanceKey, state: 'ACTIVE' }, size: 50 }));
    req.end();
  });
}

module.exports = {
  deploy, startProcess, getProcess, getTasks, assignTask, completeTask, getTaskVariables,
  activateJobs, completeJob, publishMessage, searchInstances, getChildInstances,
  searchTasks, assignTaskDirect, completeTaskDirect, updateVariables, resolveIncident,
  searchFlowNodes, searchIncidents,
};
