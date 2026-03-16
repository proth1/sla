#!/usr/bin/env node
/**
 * E2E Test Harness — runs all 10 scenarios against Camunda 8 Cloud.
 *
 * Usage:
 *   node harness.js                    # Run all scenarios
 *   node harness.js --scenario S01     # Run specific scenario
 *   node harness.js --deploy           # Deploy before running
 *   node harness.js --dry-run          # List scenarios without running
 */
const { ScenarioDriver } = require('./lib/driver');
const api = require('./lib/api-client');
const scenarios = require('./scenarios');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, 'results');

// ── CLI args ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const shouldDeploy = args.includes('--deploy');
const dryRun = args.includes('--dry-run');
const scenarioFilter = args.find(a => a.startsWith('--scenario='))?.split('=')[1]
  || (args.indexOf('--scenario') >= 0 ? args[args.indexOf('--scenario') + 1] : null);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     SLA Governance E2E Test Harness (25 Scenarios)      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const selectedScenarios = scenarioFilter
    ? scenarios.filter(s => s.id === scenarioFilter || s.name.includes(scenarioFilter))
    : scenarios;

  if (dryRun) {
    console.log('Scenarios to run:\n');
    for (const s of selectedScenarios) {
      console.log(`  ${s.id}: ${s.name}`);
      console.log(`      Expected: ${s.expectedOutcome}`);
      console.log(`      Vendors: ${s.vendors.join(', ')}\n`);
    }
    return;
  }

  // Deploy if requested
  if (shouldDeploy) {
    console.log('Deploying BPMN + DMN + forms to Camunda 8 Cloud...');
    try {
      const res = await api.deploy();
      console.log(`  Deploy result: ${JSON.stringify(res).slice(0, 200)}\n`);
    } catch (e) {
      console.log(`  Deploy via server failed, continuing anyway...\n`);
    }
  }

  // Run scenarios
  const results = [];
  for (const scenario of selectedScenarios) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`SCENARIO ${scenario.id}: ${scenario.name}`);
    console.log(`Expected: ${scenario.expectedOutcome}`);
    console.log(`Vendors: ${scenario.vendors.join(', ')}`);
    console.log('═'.repeat(60));

    const driver = new ScenarioDriver(scenario);
    const startTime = Date.now();

    try {
      await driver.start();
      await sleep(2000); // Let engine create first tasks
      const result = await driver.driveToCompletion();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      const passed = result.status === 'COMPLETED' || result.status === 'TERMINATED';
      results.push({
        id: scenario.id,
        name: scenario.name,
        expected: scenario.expectedOutcome,
        status: result.status,
        passed,
        instanceKey: driver.instanceKey,
        childInstances: driver.childKeys.size,
        tasksCompleted: driver.completedTasks.size,
        iterations: result.iterations,
        elapsed: `${elapsed}s`,
        log: result.log,
      });

      console.log(`\n  Result: ${passed ? '✓ PASSED' : '✗ FAILED'} (${result.status}) — ${elapsed}s, ${driver.completedTasks.size} tasks`);
    } catch (e) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      results.push({
        id: scenario.id, name: scenario.name, expected: scenario.expectedOutcome,
        status: 'ERROR', passed: false, error: e.message, elapsed: `${elapsed}s`, log: driver.log,
      });
      console.log(`\n  Result: ✗ ERROR — ${e.message}`);
    }

    // Brief pause between scenarios
    await sleep(3000);
  }

  // ── Summary table ───────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESULTS SUMMARY                       ║');
  console.log('╠═══════╦══════════════════════════════════╦════════╦══════╣');

  for (const r of results) {
    const icon = r.passed ? '✓' : '✗';
    const name = r.name.slice(0, 32).padEnd(32);
    const status = r.status.padEnd(6);
    const time = r.elapsed.padStart(5);
    console.log(`║ ${icon} ${r.id} ║ ${name} ║ ${status} ║ ${time} ║`);
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log('╠═══════╩══════════════════════════════════╩════════╩══════╣');
  console.log(`║  ${passed}/${total} scenarios passed                                     ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  // ── Save results JSON ───────────────────────────────────────
  if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const resultsPath = path.join(RESULTS_DIR, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  // ── Generate HTML report ────────────────────────────────────
  generateReport(results);

  process.exit(passed === total ? 0 : 1);
}

function generateReport(results) {
  const reportPath = path.join(RESULTS_DIR, 'report.html');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const scenarioRows = results.map(r => `
      <tr class="${r.passed ? 'pass' : 'fail'}">
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.expected}</td>
        <td><span class="badge ${r.passed ? 'badge-pass' : 'badge-fail'}">${r.status}</span></td>
        <td>${r.tasksCompleted || '-'}</td>
        <td>${r.childInstances || 0}</td>
        <td>${r.elapsed}</td>
        <td>${r.instanceKey || '-'}</td>
      </tr>`).join('\n');

  const scenarioDetails = results.map(r => `
    <div class="scenario-detail">
      <h3>${r.id}: ${r.name}</h3>
      <p class="expected">Expected: ${r.expected} | Actual: ${r.status}</p>
      <details>
        <summary>Execution Log (${(r.log || []).length} entries)</summary>
        <pre class="log">${(r.log || []).join('\n')}</pre>
      </details>
    </div>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SLA Governance E2E Test Report</title>
  <style>
    :root { --pass: #22c55e; --fail: #ef4444; --bg: #0f172a; --card: #1e293b; --text: #e2e8f0; --muted: #94a3b8; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; }
    h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.3rem; margin: 2rem 0 1rem; color: var(--muted); }
    h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }
    .header { text-align: center; margin-bottom: 2rem; }
    .header p { color: var(--muted); }
    .stats { display: flex; gap: 1rem; justify-content: center; margin: 1.5rem 0; }
    .stat { background: var(--card); padding: 1rem 2rem; border-radius: 8px; text-align: center; }
    .stat .value { font-size: 2rem; font-weight: bold; }
    .stat .label { color: var(--muted); font-size: 0.85rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th { background: var(--card); padding: 0.75rem; text-align: left; font-size: 0.85rem; color: var(--muted); }
    td { padding: 0.75rem; border-bottom: 1px solid #334155; font-size: 0.9rem; }
    tr.pass { border-left: 3px solid var(--pass); }
    tr.fail { border-left: 3px solid var(--fail); }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .badge-pass { background: #166534; color: #bbf7d0; }
    .badge-fail { background: #991b1b; color: #fecaca; }
    .scenario-detail { background: var(--card); border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
    .expected { color: var(--muted); margin-bottom: 0.5rem; }
    details { margin-top: 0.5rem; }
    summary { cursor: pointer; color: #60a5fa; }
    pre.log { background: #0f172a; padding: 1rem; border-radius: 4px; font-size: 0.8rem; max-height: 300px; overflow-y: auto; margin-top: 0.5rem; white-space: pre-wrap; }
    .footer { text-align: center; color: var(--muted); margin-top: 3rem; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SLA Governance E2E Test Report</h1>
    <p>Generated: ${timestamp} | Process: Process_Onboarding_v18</p>
  </div>

  <div class="stats">
    <div class="stat"><div class="value">${passed}/${total}</div><div class="label">Scenarios Passed</div></div>
    <div class="stat"><div class="value">${results.reduce((s,r) => s + (r.tasksCompleted||0), 0)}</div><div class="label">Tasks Completed</div></div>
    <div class="stat"><div class="value">${results.reduce((s,r) => s + (r.childInstances||0), 0)}</div><div class="label">Child Instances</div></div>
    <div class="stat"><div class="value" style="color:${passed===total?'var(--pass)':'var(--fail)'}">${passed===total?'ALL PASS':'FAILURES'}</div><div class="label">Overall</div></div>
  </div>

  <h2>Scenario Results</h2>
  <table>
    <thead><tr><th>ID</th><th>Scenario</th><th>Expected</th><th>Status</th><th>Tasks</th><th>Children</th><th>Time</th><th>Instance</th></tr></thead>
    <tbody>${scenarioRows}</tbody>
  </table>

  <h2>Scenario Details</h2>
  ${scenarioDetails}

  <div class="footer">
    SLA Governance Platform | Enterprise Software Governance Framework | Camunda 8 Cloud
  </div>
</body>
</html>`;

  fs.writeFileSync(reportPath, html);
  console.log(`HTML report saved to: ${reportPath}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(2);
});
