const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { createCamundaAuth } = require('./camunda-auth');

// --- Config ---
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'jira-sync-config.json'), 'utf8'));
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_AUTH = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Missing JIRA_EMAIL or JIRA_API_TOKEN environment variables');
  process.exit(1);
}

// --- Shared Camunda Auth ---
const auth = createCamundaAuth();
const CAMUNDA = auth.config;

// --- API Helpers ---
async function tasklistApi(method, apiPath, body) {
  const token = await auth.getToken('tasklist.camunda.io');
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
  const token = await auth.getToken('zeebe.camunda.io');
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
  if (typeof iso !== 'string' || !iso) {
    throw new Error(`Invalid SLA duration: expected ISO 8601 string, got ${typeof iso}`);
  }
  const m = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) {
    throw new Error(`Invalid SLA duration: "${iso}" does not match ISO 8601 pattern`);
  }
  const days = parseInt(m[1] || 0);
  const hours = parseInt(m[2] || 0);
  const mins = parseInt(m[3] || 0);
  const secs = parseInt(m[4] || 0);
  if (days === 0 && hours === 0 && mins === 0 && secs === 0) {
    throw new Error(`Invalid SLA duration: "${iso}" resolves to zero`);
  }
  return ((days * 24 + hours) * 3600 + mins * 60 + secs) * 1000;
}

// --- Phase Map (derived from task definition IDs — v18 expanded) ---
const PHASE_MAP = {
  // SP1: Refine Request
  Task_DescribeAndScreen: 'sp1', Task_LeverageExisting: 'sp1', Task_TriageAndRoute: 'sp1',
  Task_DealKillerCheck: 'sp1', Activity_06e21v6: 'sp1', Activity_0netfvm: 'sp1',
  Activity_1l8ugqb: 'sp1', Activity_1jd4o1m: 'sp1', Activity_0uolphp: 'sp1',
  Activity_0h9zvjd: 'sp1', Activity_15rnp82: 'sp1', Activity_07qg27e: 'sp1',
  Activity_1h2vsx3: 'sp1', Activity_16hgh8o: 'sp1', Activity_0w7eitv: 'sp1',
  Activity_1ma36oc: 'sp1', Activity_0urxkj1: 'sp1', Activity_0q0vqxd: 'sp1',
  // SP2: Planning & Routing
  Task_PrelimAnalysis: 'sp2', Task_Backlog: 'sp2', Task_BacklogPrioritization: 'sp2',
  Task_PathwayRouting: 'sp2', Task_PrioritizationScoring: 'sp2', Activity_0r9imfk: 'sp2',
  // SP3: Evaluation & Due Diligence
  Task_TechArchReview: 'sp3', Task_SecurityAssessment: 'sp3', Task_SecurityAssessmentRouting: 'sp3',
  Task_BaselineSecurityCheck: 'sp3', Task_RiskCompliance: 'sp3', Task_FinancialAnalysis: 'sp3',
  Task_AssessVendorLandscape: 'sp3', Task_VendorDD: 'sp3', Task_EvaluateResponse: 'sp3',
  Task_AIGovernanceReview: 'sp3', Receive_VendorResponse: 'sp3', Task_DARTFormation: 'sp3',
  Task_CreateOneTrustAssessment: 'sp3', Task_SecurityTierRouting: 'sp3', Task_BaselineScan: 'sp3',
  Task_RetrieveOneTrustResults: 'sp3', Activity_0kq8o8j: 'sp3', Activity_0ksoea5: 'sp3',
  Activity_0mr2gdy: 'sp3', Activity_0i5wmr2: 'sp3',
  // SP4: Deep Dive Risk & Contracting
  Task_RefineRequirements: 'sp4', Task_PerformPoC: 'sp4', Task_TechRiskEval: 'sp4',
  Task_NegotiateContract: 'sp4', Task_FinalizeContract: 'sp4', Task_DefineBuildReqs: 'sp4',
  Receive_SignedContract: 'sp4', Task_ComplianceReview: 'sp4', Task_EnableContractExec: 'sp4',
  Task_ContractDeviation: 'sp4', Task_CodingCorrection: 'sp4', Activity_1f5ug9e: 'sp4',
  Activity_1b9jfde: 'sp4', Activity_0anscph: 'sp4', Activity_0brpj26: 'sp4',
  Activity_0ssggoi: 'sp4', Activity_0xpqph2: 'sp4', Activity_0ohlk7l: 'sp4',
  Activity_0ccg5hj: 'sp4', Activity_1tswsdw: 'sp4', Activity_1wmq03k: 'sp4',
  Activity_06ceaql: 'sp4', Activity_11hwl66: 'sp4', Activity_0yw9qai: 'sp4',
  Activity_0dv1m1z: 'sp4',
  // SP5: UAT & Go-Live
  Task_PerformUAT: 'sp5', Task_FinalApproval: 'sp5', Task_OnboardSoftware: 'sp5',
  Activity_0zf4l0g: 'sp5', Task_CloseRequest: 'sp5', Task_AssignOwnership: 'sp5',
  Task_ConditionVerification: 'sp5', Task_SP5_OversightAudit: 'sp5',
};

// --- Sync State ---
const syncMap = new Map();
const epicMap = new Map(); // processInstanceKey → { epicKey, vendorName, requestName }
const eventLog = [];
let numericProcessDefinitionKey = null;
const instanceBreachCount = new Map();

// --- Hot-reloadable config ---
function reloadConfig() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'jira-sync-config.json'), 'utf8');
    const newConfig = JSON.parse(raw);
    Object.assign(config, newConfig);
    console.log('Config reloaded from disk');
  } catch (err) {
    console.error(`Config reload failed: ${err.message}`);
  }
}

// --- SLA Duration Override ---
function getSLAForTask(candidateGroup, taskDefinitionId) {
  // Task-level override takes precedence
  if (config.taskOverrides?.[taskDefinitionId]?.sla) {
    return config.taskOverrides[taskDefinitionId].sla;
  }
  // Fall back to lane-level RACI SLA
  return getRaci(candidateGroup).sla;
}

// --- Epic Lifecycle ---
async function ensureEpic(processInstanceKey) {
  if (!config.epic?.enabled) return null;
  if (epicMap.has(processInstanceKey)) return epicMap.get(processInstanceKey).epicKey;

  // Get process instance variables to extract vendorName and requestName
  let vendorName = 'Unknown Vendor';
  let requestName = 'Software Onboarding';
  try {
    const piData = await zeebeApi('GET', `/v2/process-instances/${processInstanceKey}`);
    // Try to get variables from search (Zeebe v2 API)
    const varsResult = await zeebeApi('POST', '/v2/variables/search', {
      filter: { processInstanceKey: Number(processInstanceKey) },
    });
    if (varsResult.items) {
      for (const v of varsResult.items) {
        if (v.name === 'vendorName' && v.value) vendorName = JSON.parse(v.value);
        if (v.name === 'requestName' && v.value) requestName = JSON.parse(v.value);
        if (v.name === 'requestDescription' && v.value && requestName === 'Software Onboarding') {
          requestName = JSON.parse(v.value).slice(0, 80);
        }
      }
    }
  } catch (err) {
    // Non-fatal: use defaults
    console.warn(`Epic variable lookup failed for PI ${processInstanceKey}: ${err.message}`);
  }

  const summary = (config.epic.summaryTemplate || '[Onboarding] {vendorName} — {requestName}')
    .replace('{vendorName}', vendorName)
    .replace('{requestName}', requestName);

  try {
    const epic = await jiraApi('POST', '/rest/api/3/issue', {
      fields: {
        project: { key: config.jira.projectKey },
        issuetype: { name: config.epic.issueType || 'Epic' },
        summary,
        labels: [...(config.epic.labels || []), `pi-${processInstanceKey}`],
      },
    });

    epicMap.set(processInstanceKey, { epicKey: epic.key, vendorName, requestName });
    logEvent('outbound', null, epic.key, `Epic created for PI ${processInstanceKey}`);
    return epic.key;
  } catch (err) {
    logEvent('error', null, null, `Epic creation failed: ${err.message}`);
    return null;
  }
}

function logEvent(direction, camundaTaskKey, jiraIssueKey, status, meta) {
  const entry = { timestamp: new Date().toISOString(), direction, camundaTaskKey, jiraIssueKey, status, ...meta };
  eventLog.unshift(entry);
  if (eventLog.length > 200) eventLog.length = 200;
  const arrows = { outbound: '>>>', webhook: '<<<', 'sla-warning': '!! ', 'sla-breach': '!!!', 'chronic-breach': 'XXX', error: 'ERR' };
  console.log(`[${entry.timestamp}] ${arrows[direction] || '---'} ${direction.toUpperCase()}: ${status} | Camunda: ${camundaTaskKey || '-'} | Jira: ${jiraIssueKey || '-'}`);
}

// --- Routing Filter ---
function shouldSyncGroup(candidateGroup) {
  if (!config.routing) return true;
  if (config.routing.excludeGroups && config.routing.excludeGroups.includes(candidateGroup)) return false;
  if (config.routing.jiraGroups) return config.routing.jiraGroups.includes(candidateGroup);
  return true;
}

function getComponentForGroup(candidateGroup) {
  return config.components?.[candidateGroup] || null;
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

// --- Outbound: Camunda -> Jira (RACI-aware with routing + components) ---
async function outboundSync() {
  if (!numericProcessDefinitionKey) {
    console.log('Outbound skipped: waiting for processDefinitionKey...');
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
      if (!shouldSyncGroup(candidateGroup)) continue;

      const raci = getRaci(candidateGroup);
      const label = getLabelForGroup(candidateGroup);
      const slaIso = getSLAForTask(candidateGroup, task.taskDefinitionId);
      const slaDurationMs = parseDuration(slaIso);
      const now = Date.now();

      // Ensure Epic exists for this process instance
      const epicKey = await ensureEpic(task.processInstanceKey);

      const taskName = (task.name || task.taskDefinitionId).replace(/\n/g, ' ');
      const fields = {
        project: { key: config.jira.projectKey },
        issuetype: { name: config.jira.issueType },
        summary: `[Camunda] ${taskName}`,
        description: buildRaciDescription(candidateGroup, task),
        labels: [
          label,
          'camunda-synced',
          `pi-${task.processInstanceKey}`,
          PHASE_MAP[task.taskDefinitionId] || 'unknown-phase',
          'onboarding-v18',
          ...(/approval/i.test(taskName) || /approval/i.test(task.taskDefinitionId) ? ['Approval'] : []),
        ],
      };

      // Link to Epic if available
      if (epicKey) {
        fields.parent = { key: epicKey };
      }

      const component = getComponentForGroup(candidateGroup);
      if (component) {
        fields.components = [{ name: component }];
      }

      const issue = await jiraApi('POST', '/rest/api/3/issue', { fields });

      syncMap.set(task.id, {
        jiraIssueKey: issue.key,
        status: 'synced',
        createdAt: now,
        slaDeadlineMs: now + slaDurationMs,
        candidateGroup,
        processInstanceKey: task.processInstanceKey,
        taskDefinitionId: task.taskDefinitionId,
        phase: PHASE_MAP[task.taskDefinitionId] || 'unknown',
        warned: false,
        escalated: false,
      });
      logEvent('outbound', task.id, issue.key, `Created for "${(task.name || '').replace(/\n/g, ' ')}" [SLA: ${slaIso}]`, {
        processInstanceKey: task.processInstanceKey,
        taskDefinitionId: task.taskDefinitionId,
        candidateGroup,
        phase: PHASE_MAP[task.taskDefinitionId] || 'unknown',
      });
    }
  } catch (err) {
    logEvent('error', null, null, `Outbound error: ${err.message}`);
  }
}

// --- Webhook: Jira -> Camunda (replaces inbound polling) ---
async function handleJiraWebhook(payload) {
  try {
    if (payload.webhookEvent !== 'jira:issue_updated') return;

    const changelog = payload.changelog;
    if (!changelog || !changelog.items) return;

    // Handle In Progress transition: assign Camunda task to Jira assignee
    const inProgressChange = changelog.items.find(
      item => item.field === 'status' && item.toString && item.toString.toLowerCase() === 'in progress'
    );
    if (inProgressChange) {
      await handleInProgressTransition(payload);
    }

    const statusChange = changelog.items.find(
      item => item.field === 'status' && item.toString && item.toString.toLowerCase() === 'done'
    );
    if (!statusChange) return;

    const issue = payload.issue;
    if (!issue) return;

    const labels = issue.fields?.labels || [];
    if (!labels.includes('camunda-synced')) return;
    if (labels.includes('sla-escalation')) return;

    const descText = extractDescriptionText(issue.fields?.description);
    const taskKeyMatch = descText.match(/\[camunda:taskKey:([^\]]+)\]/);
    if (!taskKeyMatch) {
      logEvent('webhook', null, issue.key, 'No camunda:taskKey found in description');
      return;
    }

    const camundaTaskKey = taskKeyMatch[1];
    const entry = syncMap.get(camundaTaskKey);
    if (entry && entry.status === 'completed') {
      logEvent('webhook', camundaTaskKey, issue.key, 'Already completed — skipping');
      return;
    }

    await tasklistApi('PATCH', `/v1/tasks/${camundaTaskKey}/assign`, {
      assignee: 'jira-sync',
      allowOverrideAssignment: true,
    });

    await tasklistApi('PATCH', `/v1/tasks/${camundaTaskKey}/complete`, {
      variables: [],
    });

    if (entry) entry.status = 'completed';

    const candidateGroup = entry?.candidateGroup || 'unknown';
    const raci = getRaci(candidateGroup);
    const informedLabels = raci.informed.map(getLabelForGroup).join(', ');
    const completionNote = informedLabels
      ? `Task completed in Camunda via webhook. Informed: ${informedLabels}.`
      : 'Task completed in Camunda via webhook.';

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

    logEvent('webhook', camundaTaskKey, issue.key, 'Completed Camunda task from Jira webhook');
  } catch (err) {
    logEvent('error', null, null, `Webhook handler error: ${err.message}`);
  }
}

// --- In Progress Handler ---
async function handleInProgressTransition(payload) {
  try {
    const issue = payload.issue;
    if (!issue) return;

    const labels = issue.fields?.labels || [];
    if (!labels.includes('camunda-synced')) return;
    if (labels.includes('sla-escalation')) return;

    const descText = extractDescriptionText(issue.fields?.description);
    const taskKeyMatch = descText.match(/\[camunda:taskKey:([^\]]+)\]/);
    if (!taskKeyMatch) return;

    const camundaTaskKey = taskKeyMatch[1];
    const jiraAssignee = issue.fields?.assignee?.displayName || 'jira-user';

    // Assign the Camunda task to match Jira assignee
    await tasklistApi('PATCH', `/v1/tasks/${camundaTaskKey}/assign`, {
      assignee: jiraAssignee,
      allowOverrideAssignment: true,
    });

    logEvent('webhook', camundaTaskKey, issue.key, `In Progress — assigned to ${jiraAssignee}`);
  } catch (err) {
    logEvent('error', null, null, `In Progress handler error: ${err.message}`);
  }
}

// --- SLA Monitor ---
async function slaMonitor() {
  const now = Date.now();

  for (const [taskKey, entry] of syncMap) {
    if (entry.status !== 'synced') continue;

    const elapsed = now - entry.createdAt;
    const total = entry.slaDeadlineMs - entry.createdAt;
    const pct = elapsed / total;

    if (pct >= 0.8 && !entry.warned) {
      entry.warned = true;
      const raci = getRaci(entry.candidateGroup);
      const aLabel = getLabelForGroup(raci.accountable);
      const remaining = Math.max(0, Math.round((entry.slaDeadlineMs - now) / 60000));

      try {
        await jiraApi('POST', `/rest/api/3/issue/${entry.jiraIssueKey}/comment`, {
          body: {
            type: 'doc', version: 1,
            content: [{ type: 'paragraph', content: [
              { type: 'text', text: 'SLA WARNING (80% elapsed)', marks: [{ type: 'strong' }] },
              { type: 'text', text: ` — ${remaining} minutes remaining. Accountable: ${aLabel}. Please complete or escalate.` },
            ]}],
          },
        });
        await jiraApi('PUT', `/rest/api/3/issue/${entry.jiraIssueKey}`, {
          update: { labels: [{ add: 'sla-at-risk' }] },
        });
        logEvent('sla-warning', taskKey, entry.jiraIssueKey, `80% elapsed — ${remaining}min left, notified ${aLabel}`);
      } catch (err) {
        logEvent('error', taskKey, entry.jiraIssueKey, `SLA warning failed: ${err.message}`);
      }
    }

    if (pct >= 1.0 && !entry.escalated) {
      entry.escalated = true;
      const raci = getRaci(entry.candidateGroup);
      const piKey = entry.processInstanceKey;
      const breachCount = (instanceBreachCount.get(piKey) || 0) + 1;
      instanceBreachCount.set(piKey, breachCount);

      const isChronic = breachCount >= 3;
      const escalationTarget = isChronic
        ? raci.escalationChain[raci.escalationChain.length - 1] || raci.accountable
        : raci.escalationChain[0] || raci.accountable;
      const targetLabel = getLabelForGroup(escalationTarget);

      try {
        const summaryPrefix = isChronic ? 'CHRONIC SLA BREACH' : 'ESCALATION: SLA Breach';
        const escalationIssue = await jiraApi('POST', '/rest/api/3/issue', {
          fields: {
            project: { key: config.jira.projectKey },
            issuetype: { name: config.jira.issueType },
            summary: `[${summaryPrefix}] ${entry.jiraIssueKey} — overdue task`,
            priority: { name: 'High' },
            description: {
              type: 'doc', version: 1,
              content: [{ type: 'paragraph', content: [
                { type: 'text', text: `SLA breach on Camunda task.\n\n`, marks: [{ type: 'strong' }] },
                { type: 'text', text: `Original issue: ${entry.jiraIssueKey}\n` },
                { type: 'text', text: `[camunda:taskKey:${taskKey}]\n` },
                { type: 'text', text: `[camunda:processInstanceKey:${piKey}]\n` },
                { type: 'text', text: `Responsible: ${getLabelForGroup(entry.candidateGroup)}\n` },
                { type: 'text', text: `Escalated to: ${targetLabel}\n` },
                { type: 'text', text: `Breach count (this instance): ${breachCount}\n` },
                { type: 'text', text: `\nPer REQ-NFR-006: Escalation to next governance level required.` },
              ]}],
            },
            labels: [targetLabel, 'sla-escalation', 'camunda-synced', `pi-${piKey}`, 'onboarding-v18'],
          },
        });

        await jiraApi('PUT', `/rest/api/3/issue/${entry.jiraIssueKey}`, {
          update: { labels: [{ add: 'sla-breached' }] },
        });
        await jiraApi('POST', `/rest/api/3/issue/${entry.jiraIssueKey}/comment`, {
          body: {
            type: 'doc', version: 1,
            content: [{ type: 'paragraph', content: [
              { type: 'text', text: 'SLA BREACHED (100% elapsed)', marks: [{ type: 'strong' }] },
              { type: 'text', text: ` — Escalation issue created: ${escalationIssue.key}. Assigned to ${targetLabel}.` },
            ]}],
          },
        });

        logEvent(isChronic ? 'chronic-breach' : 'sla-breach', taskKey, escalationIssue.key, `${summaryPrefix} — escalated to ${targetLabel} (breach #${breachCount})`);
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

// --- Crash Recovery ---
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
      const phaseLabel = labels.find(l => /^sp[1-5]$/.test(l)) || 'unknown';
      syncMap.set(taskKeyMatch[1], {
        jiraIssueKey: issue.key,
        status: 'synced',
        createdAt,
        slaDeadlineMs: createdAt + slaDurationMs,
        candidateGroup,
        processInstanceKey: piMatch ? piMatch[1] : 'unknown',
        phase: phaseLabel,
        warned: labels.includes('sla-at-risk'),
        escalated: labels.includes('sla-breached'),
      });
      logEvent('outbound', taskKeyMatch[1], issue.key, `Recovered (pending)`);
    }
    console.log(`Crash recovery: rebuilt ${syncMap.size} entries from Jira`);

    // Recover breach counts
    const escJql = `project = ${config.jira.projectKey} AND labels = sla-escalation`;
    const escResult = await jiraApi('POST', '/rest/api/3/search/jql', { jql: escJql, fields: ['description'] });
    if (escResult.issues) {
      for (const issue of escResult.issues) {
        const descText = extractDescriptionText(issue.fields.description);
        const piMatch = descText.match(/\[camunda:processInstanceKey:([^\]]+)\]/);
        if (piMatch) instanceBreachCount.set(piMatch[1], (instanceBreachCount.get(piMatch[1]) || 0) + 1);
      }
    }
  } catch (err) {
    console.error(`Crash recovery failed: ${err.message}`);
  }
}

async function resolveProcessDefinitionKey() {
  try {
    const search = await zeebeApi('POST', '/v2/process-definitions/search', {
      filter: { processDefinitionId: config.processDefinitionKey },
    });
    if (search.items?.length) {
      numericProcessDefinitionKey = String(search.items[0].processDefinitionKey);
      console.log(`Resolved processDefinitionKey: ${numericProcessDefinitionKey}`);
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

// CORS for dashboard cross-port requests (dashboard on :3847, jira-sync on :3848)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('127.0.0.1:3847') || origin.includes('localhost:3847'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Webhook endpoint: Jira -> Camunda (HMAC-SHA256 verified)
app.post('/webhook/jira', (req, res) => {
  const secret = config.webhook?.secret || process.env.JIRA_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers['x-hub-signature'];
    if (!sig) {
      logEvent('error', null, null, 'Webhook rejected: missing x-hub-signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }
    const raw = JSON.stringify(req.body);
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      logEvent('error', null, null, 'Webhook rejected: invalid HMAC signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }
  res.status(200).json({ received: true });
  handleJiraWebhook(req.body).catch(err => {
    logEvent('error', null, null, `Webhook processing error: ${err.message}`);
  });
});

app.get('/api/sync-status', (req, res) => {
  const stats = { outbound: 0, webhooks: 0, pending: 0, errors: 0, warnings: 0, breaches: 0 };
  for (const e of eventLog) {
    if (e.direction === 'error') stats.errors++;
    else if (e.direction === 'outbound') stats.outbound++;
    else if (e.direction === 'webhook') stats.webhooks++;
    else if (e.direction === 'sla-warning') stats.warnings++;
    else if (e.direction === 'sla-breach' || e.direction === 'chronic-breach') stats.breaches++;
  }
  for (const [, v] of syncMap) {
    if (v.status === 'synced') stats.pending++;
  }

  const now = Date.now();
  const slaStatus = [];
  for (const [taskKey, entry] of syncMap) {
    if (entry.status !== 'synced') continue;
    const elapsed = now - entry.createdAt;
    const total = entry.slaDeadlineMs - entry.createdAt;
    const pct = Math.min(Math.round((elapsed / total) * 100), 999);
    slaStatus.push({
      taskKey, jiraIssueKey: entry.jiraIssueKey, candidateGroup: entry.candidateGroup,
      pct, warned: entry.warned, escalated: entry.escalated,
      remainingMin: Math.max(0, Math.round((entry.slaDeadlineMs - now) / 60000)),
    });
  }

  res.json({ stats, events: eventLog.slice(0, 50), slaStatus });
});

// --- Config API ---
app.get('/api/config', (req, res) => {
  res.json(config);
});

app.put('/api/config', (req, res) => {
  try {
    const newConfig = req.body;
    fs.writeFileSync(path.join(__dirname, 'jira-sync-config.json'), JSON.stringify(newConfig, null, 2));
    Object.assign(config, newConfig);
    logEvent('outbound', null, null, 'Config updated via API');
    res.json({ status: 'ok', message: 'Config saved and hot-reloaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config/raci/:lane', (req, res) => {
  const lane = req.params.lane;
  if (!config.raci[lane]) return res.status(404).json({ error: `Lane ${lane} not found` });
  res.json({ lane, ...config.raci[lane] });
});

app.put('/api/config/raci/:lane', (req, res) => {
  const lane = req.params.lane;
  config.raci[lane] = { ...config.raci[lane], ...req.body };
  try {
    fs.writeFileSync(path.join(__dirname, 'jira-sync-config.json'), JSON.stringify(config, null, 2));
    res.json({ status: 'ok', lane, config: config.raci[lane] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sla-status', (req, res) => {
  const now = Date.now();
  const statuses = [];
  for (const [taskKey, entry] of syncMap) {
    if (entry.status !== 'synced') continue;
    const elapsed = now - entry.createdAt;
    const total = entry.slaDeadlineMs - entry.createdAt;
    const pct = Math.min(Math.round((elapsed / total) * 100), 999);
    statuses.push({
      taskKey,
      jiraIssueKey: entry.jiraIssueKey,
      candidateGroup: entry.candidateGroup,
      taskDefinitionId: entry.taskDefinitionId,
      phase: entry.phase,
      processInstanceKey: entry.processInstanceKey,
      pct,
      warned: entry.warned,
      escalated: entry.escalated,
      remainingMin: Math.max(0, Math.round((entry.slaDeadlineMs - now) / 60000)),
      createdAt: new Date(entry.createdAt).toISOString(),
      deadline: new Date(entry.slaDeadlineMs).toISOString(),
    });
  }
  res.json({ count: statuses.length, statuses });
});

app.get('/api/epics', (req, res) => {
  const epics = [];
  for (const [piKey, epic] of epicMap) {
    epics.push({ processInstanceKey: piKey, ...epic });
  }
  res.json({ count: epics.length, epics });
});

app.post('/start', async (req, res) => {
  if (!numericProcessDefinitionKey) {
    return res.status(503).json({ error: 'Process not yet deployed' });
  }
  try {
    const result = await zeebeApi('POST', '/v2/process-instances', {
      processDefinitionKey: numericProcessDefinitionKey,
      variables: { requestName: 'Jira Sync Test', startedAt: new Date().toISOString() },
    });
    res.json({ processInstanceKey: result.processInstanceKey });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Main ---
async function main() {
  console.log('=== Jira Sync Service (RACI + Webhook + SLA Escalation) ===');
  console.log(`Process: ${config.processDefinitionKey}`);
  console.log(`Jira: ${config.jira.baseUrl} / ${config.jira.projectKey}`);
  console.log(`Polling: outbound=${config.polling.outboundIntervalMs}ms, sla=${config.polling.slaCheckIntervalMs}ms`);
  console.log(`Webhook: ${config.webhook?.enabled ? 'ENABLED at /webhook/jira' : 'disabled'}`);
  console.log(`Routing: sync=${(config.routing?.jiraGroups || []).length} groups, exclude=${(config.routing?.excludeGroups || []).length} groups`);
  console.log(`RACI groups: ${Object.keys(config.raci).join(', ')}`);

  await resolveProcessDefinitionKey();
  await recoverSyncMap();

  setInterval(outboundSync, config.polling.outboundIntervalMs);
  setInterval(slaMonitor, config.polling.slaCheckIntervalMs);

  await outboundSync();

  app.listen(3848, '127.0.0.1', () => {
    console.log('Jira sync service: http://127.0.0.1:3848');
    console.log('Webhook endpoint:  POST http://127.0.0.1:3848/webhook/jira');
  });
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
