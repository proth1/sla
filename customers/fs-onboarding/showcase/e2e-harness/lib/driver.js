/**
 * Scenario driver: polls tasks, completes them with fixture data,
 * activates service jobs, publishes messages, resolves incidents.
 */
const api = require('./api-client');

const SERVICE_TYPES = [
  'status-notification', 'ariba-send-nda', 'ariba-update',
  'baseline-security-check', 'dart-formation', 'notify-requester',
  'resolve-committee-authority', 'assemble-committee-brief',
  'distribute-committee-brief', 'tally-committee-votes',
  'apply-default-voting-rule', 'auto-escalate-governance',
  'send-voting-escalation', 'send-voting-reminder',
];

const MESSAGES = [
  { name: 'VendorResponseMessage', keyVar: 'vendorId' },
  { name: 'SignedContractMessage', keyVar: 'contractId' },
  { name: 'MiniRFPResponseMessage', keyVar: 'vendorToken' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class ScenarioDriver {
  constructor(scenario) {
    this.scenario = scenario;
    this.log = [];
    this.instanceKey = null;
    this.childKeys = new Set();
    this.completedTasks = new Set();
    this.iteration = 0;
    this.maxIterations = 80;
    this.staleCount = 0;
  }

  _log(msg) {
    const ts = new Date().toISOString().slice(11, 19);
    const line = `[${ts}] ${msg}`;
    this.log.push(line);
    process.stdout.write(`  ${line}\n`);
  }

  async start() {
    this._log(`Starting: ${this.scenario.name}`);
    const result = await api.startProcess(this.scenario.startVars);
    this.instanceKey = result.processInstanceKey;
    this._log(`Instance: ${this.instanceKey}`);
    return this.instanceKey;
  }

  async driveToCompletion() {
    while (this.iteration < this.maxIterations) {
      this.iteration++;
      let progress = false;

      // 1. Discover child instances (MI, call activities)
      await this._discoverChildren();

      // 2. Activate and complete service jobs
      progress = await this._handleServiceJobs() || progress;

      // 3. Find and complete user tasks
      progress = await this._handleUserTasks() || progress;

      // 4. Publish messages for receive tasks (every 3rd iteration, doesn't count as progress)
      if (this.iteration % 3 === 0) {
        await this._handleMessages();
      }

      // 5. Check for incidents and inject variables at process scope
      const stateCheck = await this._checkState();
      if (stateCheck === 'COMPLETED' || stateCheck === 'TERMINATED') {
        this._log(`Process ${stateCheck} after ${this.iteration} iterations`);
        return { status: stateCheck, log: this.log, iterations: this.iteration };
      }

      // If process has incidents or is stalled, inject all routing vars at process scope
      if (!progress || this.staleCount > 1) {
        try {
          await api.updateVariables(this.instanceKey, this.scenario.baseVars);
          // Also inject into all known children
          for (const ck of this.childKeys) {
            try { await api.updateVariables(ck, this.scenario.baseVars); } catch {}
          }
          if (this.staleCount > 1) this._log('Injected routing variables at process scope');
        } catch (e) {
          if (this.staleCount > 2) this._log(`Variable injection failed: ${e.message}`);
        }
      }

      // Also try Operate-based incident resolution
      progress = await this._handleIncidents() || progress;

      if (!progress) {
        this.staleCount++;
        // On 3rd stale iteration, dump active flow nodes for diagnosis
        if (this.staleCount === 3) {
          try {
            const nodes = await api.searchFlowNodes(this.instanceKey);
            const items = nodes.items || [];
            for (const n of items) {
              this._log(`ACTIVE NODE: ${n.flowNodeId} (${n.type})${n.incident ? ' [INCIDENT]' : ''}`);
            }
          } catch (e) { this._log(`Flow node check failed: ${e.message}`); }
        }
        if (this.staleCount > 12) {
          this._log('STALLED — no progress for 12 iterations, cancelling instance');
          await this._cleanup();
          return { status: 'STALLED', log: this.log, iterations: this.iteration };
        }
      } else {
        this.staleCount = 0;
      }

      await sleep(this.staleCount > 3 ? 3000 : 1500);
    }

    this._log('MAX ITERATIONS reached, cancelling instance');
    await this._cleanup();
    return { status: 'MAX_ITERATIONS', log: this.log, iterations: this.iteration };
  }

  async _cleanup() {
    try {
      const res = await api.getProcess(this.instanceKey);
      if (res.state === 'ACTIVE') {
        const http = require('http');
        await new Promise((resolve) => {
          const req = http.request(`http://127.0.0.1:3847/api/process/${this.instanceKey}`, { method: 'DELETE' }, (r) => {
            let d = ''; r.on('data', c => d += c); r.on('end', () => resolve(d));
          });
          req.end();
        });
        this._log(`Instance ${this.instanceKey} cancelled`);
      }
    } catch {}
  }

  async _discoverChildren() {
    const allKeys = [this.instanceKey, ...this.childKeys];
    for (const pk of allKeys) {
      try {
        const res = await api.getChildInstances(pk);
        const items = res.items || res || [];
        for (const child of items) {
          const ck = child.processInstanceKey || child.key;
          if (ck && !this.childKeys.has(String(ck))) {
            this.childKeys.add(String(ck));
            this._log(`Discovered child instance: ${ck} (parent: ${pk})`);
          }
        }
      } catch (e) {
        // Try Operate API as fallback for child discovery
        try {
          const nodes = await api.searchFlowNodes(pk);
          // No action needed here — just using the Operate API to verify connectivity
        } catch {}
      }
    }
  }

  async _handleServiceJobs() {
    let progress = false;
    // Activate all service types in parallel with short timeout
    const promises = SERVICE_TYPES.map(async (jobType) => {
      try {
        const res = await api.activateJobs(jobType, 10);
        const jobs = res.jobs || [];
        for (const job of jobs) {
          const jk = job.jobKey || job.key;
          if (!jk) continue;
          try {
            await api.completeJob(jk, this.scenario.baseVars);
            this._log(`Job completed: ${jobType} (${jk})`);
            progress = true;
          } catch {}
        }
      } catch {}
    });
    await Promise.allSettled(promises);
    return progress;
  }

  async _handleUserTasks() {
    let progress = false;
    const allKeys = [this.instanceKey, ...this.childKeys];

    for (const pik of allKeys) {
      try {
        // Use showcase server (handles auth reliably)
        const tasks = await api.getTasks(pik);
        const taskList = Array.isArray(tasks) ? tasks : (tasks.items || []);

        for (const task of taskList) {
          const tid = task.id;
          if (this.completedTasks.has(tid)) continue;

          const taskDefId = task.taskDefinitionId || task.formKey || 'unknown';
          const taskName = task.name || taskDefId;

          // Build variables: base vars + scenario overrides for this task
          const vars = { ...this.scenario.baseVars };
          if (this.scenario.taskOverrides && this.scenario.taskOverrides[taskDefId]) {
            Object.assign(vars, this.scenario.taskOverrides[taskDefId]);
          }

          // Convert to Tasklist format: [{name, value}] — value must be JSON-serialized
          const varsList = Object.entries(vars).map(([name, value]) => ({
            name, value: JSON.stringify(value),
          }));

          // Complete via BOTH APIs — Tasklist for job-based, Zeebe for zeebe:userTask
          let completed = false;
          try {
            await api.assignTask(tid);
            await api.completeTask(tid, varsList);
            completed = true;
          } catch {}
          try {
            await api.completeZeebeUserTask(tid, vars);
            completed = true;
          } catch {}
          if (completed) {
            this.completedTasks.add(tid);
            this._log(`Task completed: "${taskName}" (${taskDefId})`);
            progress = true;
          }
        }
      } catch (e) {
        // Silently continue — task search may fail for child instances
      }
    }
    return progress;
  }

  async _handleMessages() {
    let progress = false;
    const vars = this.scenario.baseVars;
    for (const msg of MESSAGES) {
      const corrKey = vars[msg.keyVar];
      if (!corrKey) continue;
      try {
        await api.publishMessage(msg.name, corrKey, vars);
        this._log(`Message published: ${msg.name} (${corrKey})`);
        progress = true;
      } catch {}
    }
    return progress;
  }

  async _handleIncidents() {
    let progress = false;
    const allKeys = [this.instanceKey, ...this.childKeys];
    for (const pik of allKeys) {
      try {
        const res = await api.searchIncidents(pik);
        const incidents = res.items || res || [];
        for (const inc of incidents) {
          const ik = inc.key;
          if (!ik) continue;
          // Inject all routing variables at the element scope
          if (inc.flowNodeInstanceKey) {
            try {
              await api.updateVariables(inc.flowNodeInstanceKey, this.scenario.baseVars);
              this._log(`Variables injected for incident on ${inc.flowNodeId || 'unknown'}`);
            } catch {}
          }
          try {
            await api.resolveIncident(ik);
            this._log(`Incident resolved: ${ik}`);
            progress = true;
          } catch {}
        }
      } catch {}
    }
    return progress;
  }

  async _checkState() {
    try {
      const res = await api.getProcess(this.instanceKey);
      return res.state || res.status || 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }
}

module.exports = { ScenarioDriver };
