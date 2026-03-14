#!/usr/bin/env node
/**
 * seed-instances.js
 *
 * Seeds 10 process instances into the Camunda 8 showcase, each representing
 * a different software product stopped at a different phase of the lifecycle.
 *
 * Usage: node seed-instances.js
 * Requires: showcase server running at http://localhost:3847
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const BASE = 'http://localhost:3847';

const INSTANCES = [
  {
    softwareName: 'Acme Analytics Platform',
    vendorName: 'Acme Corp',
    department: 'Global Markets Technology',
    estimatedCost: 250000,
    requesterName: 'Sarah Chen',
    stopAtTask: 'Task_CloseRequest',
    phase: 'SP5',
  },
  {
    softwareName: 'DataVault Enterprise DLP',
    vendorName: 'Varonis Systems',
    department: 'Information Security',
    estimatedCost: 180000,
    requesterName: 'Marcus Johnson',
    stopAtTask: 'Task_NegotiateContract',
    phase: 'SP4',
  },
  {
    softwareName: 'Vendor Affinity Analytics Tool',
    vendorName: 'Strategic Partner Inc',
    department: 'Vendor Management',
    estimatedCost: 95000,
    requesterName: 'Shane Williams',
    stopAtTask: 'Task_DARTFormation',
    phase: 'SP3',
    routingOverrides: { selectedPathway: 'enable', isVendorPartnership: true, requestType: 'defined-need' },
  },
  {
    softwareName: 'Nexus AI Trading Engine',
    vendorName: 'Nexus Technologies',
    department: 'Algorithmic Trading',
    estimatedCost: 750000,
    requesterName: 'David Park',
    stopAtTask: 'Task_Backlog',
    phase: 'SP2',
  },
  {
    softwareName: 'Legacy CRM Migration',
    vendorName: 'Salesforce Inc',
    department: 'Client Relations',
    estimatedCost: 180000,
    requesterName: 'Maria Santos',
    stopAtTask: 'Task_PrelimAnalysis',
    phase: 'SP2',
    routingOverrides: { requestType: 'forced-update' },
  },
  {
    softwareName: 'Snowflake Data Cloud',
    vendorName: 'Snowflake Inc',
    department: 'Data Engineering',
    estimatedCost: 450000,
    requesterName: 'James Morrison',
    stopAtTask: 'Task_FinancialAnalysis',
    phase: 'SP3',
  },
  {
    softwareName: 'CrowdStrike Falcon',
    vendorName: 'CrowdStrike Holdings',
    department: 'Cybersecurity',
    estimatedCost: 280000,
    requesterName: 'Priya Sharma',
    stopAtTask: 'Task_PerformPoC',
    phase: 'SP4',
  },
  {
    softwareName: 'Salesforce Financial Services Cloud',
    vendorName: 'Salesforce Inc',
    department: 'Client Relations',
    estimatedCost: 520000,
    requesterName: 'Thomas Weber',
    stopAtTask: 'Task_FinalApproval',
    phase: 'SP5',
  },
  {
    softwareName: 'Bloomberg Terminal Enterprise',
    vendorName: 'Bloomberg LP',
    department: 'Trading Technology',
    estimatedCost: 890000,
    requesterName: 'Lisa Nakamura',
    stopAtTask: 'Task_PathwayRouting',
    phase: 'SP2',
  },
  {
    softwareName: 'Quantum Computing Platform',
    vendorName: 'IBM Quantum',
    department: 'Research & Innovation',
    estimatedCost: 2000000,
    requesterName: 'Dr. Alex Kim',
    stopAtTask: 'Task_TriageAndRoute',
    phase: 'SP1',
    routingOverrides: { requestType: 'speculative' },
  },
];

// Gateway routing variables that ensure the "buy" happy path through all phases
const ROUTING_VARS = {
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
  requestType: 'defined-need',
  isVendorPartnership: false,
  ndaExecuted: true,
};

// ---------------------------------------------------------------------------
// Load form defaults from the showcase public directory
// ---------------------------------------------------------------------------
let DEFAULTS = {};
try {
  const defaultsPath = path.join(__dirname, 'public', 'defaults.js');
  const code = fs.readFileSync(defaultsPath, 'utf8');
  DEFAULTS = new Function(code + '; return DEFAULTS;')();
  console.log(`Loaded ${Object.keys(DEFAULTS).length} default values from defaults.js`);
} catch (e) {
  console.warn('Warning: Could not load defaults.js, will use fallback values:', e.message);
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function api(method, apiPath, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${apiPath}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${apiPath} returned ${res.status}: ${text}`);
  }
  return res.json();
}

async function waitForTask(instanceKey, maxWait = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const tasks = await api('GET', `/api/tasks?processInstanceKey=${instanceKey}`);
      if (Array.isArray(tasks) && tasks.length > 0) return tasks;
    } catch (e) {
      // Tasklist may not have indexed the task yet
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  return [];
}

// ---------------------------------------------------------------------------
// Form variable builder
// ---------------------------------------------------------------------------
function buildVars(formSchema) {
  const vars = [];
  function walk(components) {
    for (const c of (components || [])) {
      if (c.key) {
        let val = DEFAULTS[c.key];
        if (val === undefined) {
          if (c.type === 'checkbox') val = true;
          else if (c.type === 'radio' && c.values && c.values.length) val = c.values[0].value;
          else if (c.type === 'select' && c.values && c.values.length) val = c.values[0].value;
          else if (c.type === 'number') val = 0;
          else val = '';
        }
        vars.push({ name: c.key, value: JSON.stringify(val) });
      }
      if (c.components) walk(c.components);
    }
  }
  walk(formSchema?.components || []);
  return vars;
}

// ---------------------------------------------------------------------------
// Get form schema for a task
// ---------------------------------------------------------------------------
async function getFormSchema(task) {
  if (!task.formKey && !task.formId) return null;
  try {
    const formId = task.formId || task.formKey;
    const pdk = task.processDefinitionKey || '';
    const formData = await api('GET', `/api/forms/${formId}?processDefinitionKey=${pdk}`);
    if (formData.schema) return JSON.parse(formData.schema);
  } catch (e) {
    // Form fetch may fail for some tasks
  }
  return null;
}

// ---------------------------------------------------------------------------
// Advance a single instance to its target task
// ---------------------------------------------------------------------------
async function advanceInstance(instance, index) {
  const num = index + 1;
  const label = `[${num}/10] ${instance.softwareName}`;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${label}`);
  console.log(`  Target: ${instance.stopAtTask} (${instance.phase})`);
  console.log(`${'='.repeat(70)}`);

  // Build start variables
  const startVars = {
    softwareName: instance.softwareName,
    vendorName: instance.vendorName,
    requesterName: instance.requesterName,
    department: instance.department,
    businessUnit: instance.department,
    estimatedCost: instance.estimatedCost,
    ...ROUTING_VARS,
    ...(instance.routingOverrides || {}),
  };

  // Start the process instance
  let result;
  try {
    result = await api('POST', '/api/process/start', { variables: startVars });
  } catch (e) {
    console.error(`  FAILED to start instance: ${e.message}`);
    return { ...instance, instanceKey: null, error: e.message };
  }

  const instanceKey = result.processInstanceKey || result.key;
  console.log(`  Started instance: ${instanceKey}`);

  let completedCount = 0;
  let currentTaskName = '(starting)';
  const maxIterations = 40; // Safety limit

  for (let iter = 0; iter < maxIterations; iter++) {
    // Wait for available tasks
    const tasks = await waitForTask(instanceKey);

    if (tasks.length === 0) {
      console.log(`  No tasks found after waiting. Process may have completed or errored.`);
      break;
    }

    // In SP3, there are parallel tasks. We need to check if our target is among them.
    // If the target task is in the current batch, stop.
    const targetTask = tasks.find(t => t.taskDefinitionId === instance.stopAtTask);
    if (targetTask) {
      currentTaskName = (targetTask.name || targetTask.taskDefinitionId).replace(/\n/g, ' ');
      console.log(`  >> REACHED TARGET: ${currentTaskName} (${targetTask.taskDefinitionId})`);
      console.log(`     Task ID: ${targetTask.id} — left uncompleted`);
      return {
        ...instance,
        instanceKey,
        currentTask: currentTaskName,
        currentTaskId: targetTask.taskDefinitionId,
        tasksCompleted: completedCount,
      };
    }

    // Complete all available tasks (handles parallel gateway branches)
    for (const task of tasks) {
      const taskName = (task.name || task.taskDefinitionId).replace(/\n/g, ' ');

      // Double-check: don't complete the target task
      if (task.taskDefinitionId === instance.stopAtTask) {
        currentTaskName = taskName;
        console.log(`  >> REACHED TARGET: ${taskName} (${task.taskDefinitionId})`);
        console.log(`     Task ID: ${task.id} — left uncompleted`);
        return {
          ...instance,
          instanceKey,
          currentTask: currentTaskName,
          currentTaskId: task.taskDefinitionId,
          tasksCompleted: completedCount,
        };
      }

      // Get form schema and build variables
      let vars = [];
      try {
        const formSchema = await getFormSchema(task);
        if (formSchema) {
          vars = buildVars(formSchema);
        }
      } catch (e) {
        // Continue without form vars
      }

      // Also inject routing variables on every completion to ensure gateways route correctly
      for (const [key, val] of Object.entries(ROUTING_VARS)) {
        if (!vars.find(v => v.name === key)) {
          vars.push({ name: key, value: JSON.stringify(val) });
        }
      }

      // Assign and complete the task
      try {
        await api('POST', `/api/tasks/${task.id}/assign`);
        await api('POST', `/api/tasks/${task.id}/complete`, { variables: vars });
        completedCount++;
        console.log(`  [${completedCount}] Completed: ${taskName} (${task.taskDefinitionId})`);
      } catch (e) {
        console.warn(`  WARNING: Failed to complete ${taskName}: ${e.message}`);
        // Task may have been completed by parallel branch resolution, continue
      }
    }

    // Brief pause before polling for next task
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`  WARNING: Reached max iterations without finding target task.`);
  return {
    ...instance,
    instanceKey,
    currentTask: currentTaskName,
    currentTaskId: 'unknown',
    tasksCompleted: completedCount,
    warning: 'Max iterations reached',
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('SLA Onboarding Showcase — Instance Seeder');
  console.log('==========================================');
  console.log(`Server: ${BASE}`);
  console.log(`Instances to create: ${INSTANCES.length}`);
  console.log('');

  // Verify server is reachable
  try {
    await fetch(`${BASE}/api/tasks`, { method: 'GET' });
    console.log('Server is reachable.');
  } catch (e) {
    console.error(`ERROR: Cannot connect to ${BASE}. Is the showcase server running?`);
    console.error('  Start it with: cd showcase && node server.js');
    process.exit(1);
  }

  const results = [];

  for (let i = 0; i < INSTANCES.length; i++) {
    try {
      const result = await advanceInstance(INSTANCES[i], i);
      results.push(result);
    } catch (e) {
      console.error(`\n  FATAL ERROR for ${INSTANCES[i].softwareName}: ${e.message}`);
      results.push({
        ...INSTANCES[i],
        instanceKey: null,
        currentTask: 'ERROR',
        error: e.message,
      });
    }

    // Brief pause between instances to avoid overwhelming the API
    if (i < INSTANCES.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Print summary table
  console.log('\n');
  console.log('='.repeat(120));
  console.log('SEED SUMMARY');
  console.log('='.repeat(120));
  console.log(
    'Instance Key'.padEnd(22) +
    'Software Name'.padEnd(38) +
    'Phase'.padEnd(8) +
    'Current Task'.padEnd(32) +
    'Tasks Done'
  );
  console.log('-'.repeat(120));

  for (const r of results) {
    const key = (r.instanceKey || 'FAILED').toString().slice(-18).padEnd(22);
    const name = (r.softwareName || '').slice(0, 36).padEnd(38);
    const phase = (r.phase || '').padEnd(8);
    const task = (r.currentTaskId || r.currentTask || 'N/A').slice(0, 30).padEnd(32);
    const done = String(r.tasksCompleted ?? (r.error ? 'ERR' : '?'));
    console.log(`${key}${name}${phase}${task}${done}`);
  }

  console.log('-'.repeat(120));

  const succeeded = results.filter(r => r.instanceKey && !r.error).length;
  const failed = results.length - succeeded;
  console.log(`\nDone: ${succeeded} succeeded, ${failed} failed.`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
