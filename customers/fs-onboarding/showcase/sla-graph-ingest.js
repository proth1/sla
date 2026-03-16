/**
 * SLA Knowledge Graph Ingestion Service
 *
 * Reads events from jira-sync service and writes to Neo4j + PostgreSQL.
 * Provides a persistent system of record beyond Camunda 8 Cloud.
 *
 * Prerequisites:
 *   - Neo4j running (local or Aura) with NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
 *   - PostgreSQL running with DATABASE_URL
 *   - jira-sync.js running on port 3848
 *
 * Usage:
 *   node sla-graph-ingest.js
 */
const express = require('express');
const crypto = require('crypto');

// --- Configuration ---
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/sla_governance';
const JIRA_SYNC_URL = process.env.JIRA_SYNC_URL || 'http://127.0.0.1:3848';
const PORT = parseInt(process.env.INGEST_PORT || '3849');
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '10000');

// --- In-memory event buffer (when DB not available) ---
const eventBuffer = [];
const MAX_BUFFER = 1000;

// --- Neo4j Client (optional — graceful degradation if not available) ---
let neo4jDriver = null;
let neo4jSession = null;

async function initNeo4j() {
  try {
    const neo4j = require('neo4j-driver');
    neo4jDriver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    await neo4jDriver.verifyConnectivity();
    neo4jSession = neo4jDriver.session();
    console.log(`Neo4j connected: ${NEO4J_URI}`);
    return true;
  } catch (err) {
    console.warn(`Neo4j not available: ${err.message} — events will be buffered`);
    return false;
  }
}

// --- PostgreSQL Client (optional — graceful degradation if not available) ---
let pgPool = null;

async function initPostgres() {
  try {
    const { Pool } = require('pg');
    pgPool = new Pool({ connectionString: DATABASE_URL });
    await pgPool.query('SELECT 1');
    console.log(`PostgreSQL connected: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
    return true;
  } catch (err) {
    console.warn(`PostgreSQL not available: ${err.message} — events will be buffered`);
    return false;
  }
}

// --- Event Emission (called by jira-sync.js webhook or polling) ---
function bufferEvent(event) {
  event.id = event.id || crypto.randomUUID();
  event.timestamp = event.timestamp || new Date().toISOString();
  eventBuffer.unshift(event);
  if (eventBuffer.length > MAX_BUFFER) eventBuffer.length = MAX_BUFFER;
}

async function writeToNeo4j(event) {
  if (!neo4jSession) return;

  try {
    switch (event.type) {
      case 'process_started':
        await neo4jSession.run(
          `MERGE (pi:ProcessInstance {instanceKey: $instanceKey})
           SET pi.processDefinitionKey = $processDefinitionKey,
               pi.vendorName = $vendorName,
               pi.requestName = $requestName,
               pi.pathway = $pathway,
               pi.riskTier = $riskTier,
               pi.status = 'ACTIVE',
               pi.startedAt = datetime($startedAt)`,
          event.data
        );
        break;

      case 'task_created':
        await neo4jSession.run(
          `MERGE (te:TaskExecution {taskKey: $taskKey})
           SET te.taskDefinitionId = $taskDefinitionId,
               te.taskName = $taskName,
               te.candidateGroup = $candidateGroup,
               te.phase = $phase,
               te.slaTarget = $slaTarget,
               te.startTime = datetime($startTime)
           WITH te
           MATCH (pi:ProcessInstance {instanceKey: $processInstanceKey})
           MERGE (te)-[:EXECUTED_IN]->(pi)
           WITH te
           MATCH (l:Lane {name: $candidateGroup})
           MERGE (te)-[:ASSIGNED_TO {raciRole: 'R'}]->(l)`,
          event.data
        );
        break;

      case 'task_completed':
        await neo4jSession.run(
          `MATCH (te:TaskExecution {taskKey: $taskKey})
           SET te.endTime = datetime($endTime),
               te.durationMs = $durationMs,
               te.assignee = $assignee`,
          event.data
        );
        break;

      case 'sla_warning':
      case 'sla_breach':
      case 'chronic_breach':
        await neo4jSession.run(
          `CREATE (se:SLAEvent {
             eventId: $eventId,
             eventType: $eventType,
             threshold: $threshold,
             timestamp: datetime($timestamp),
             elapsedMs: $elapsedMs
           })
           WITH se
           MATCH (te:TaskExecution {taskKey: $taskKey})
           MERGE (se)-[:BREACHED_SLA]->(te)
           SET te.slaBreached = CASE WHEN $eventType IN ['sla_breach', 'chronic_breach'] THEN true ELSE te.slaBreached END`,
          { ...event.data, eventId: event.id, eventType: event.type }
        );
        break;

      case 'process_completed':
        await neo4jSession.run(
          `MATCH (pi:ProcessInstance {instanceKey: $instanceKey})
           SET pi.status = $status,
               pi.completedAt = datetime($completedAt)`,
          event.data
        );
        break;
    }
  } catch (err) {
    console.error(`Neo4j write error (${event.type}): ${err.message}`);
  }
}

async function writeToPostgres(event) {
  if (!pgPool) return;

  try {
    switch (event.type) {
      case 'process_started':
        await pgPool.query(
          `INSERT INTO process_instances (process_instance_key, process_definition_key, vendor_name, request_name, pathway, risk_tier, jira_epic_key)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (process_instance_key) DO UPDATE SET status = 'ACTIVE'`,
          [event.data.instanceKey, event.data.processDefinitionKey, event.data.vendorName,
           event.data.requestName, event.data.pathway, event.data.riskTier, event.data.jiraEpicKey]
        );
        break;

      case 'task_created':
        await pgPool.query(
          `INSERT INTO task_executions (task_key, process_instance_key, task_definition_id, task_name, candidate_group, phase, sla_target, jira_issue_key)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (task_key) DO NOTHING`,
          [event.data.taskKey, event.data.processInstanceKey, event.data.taskDefinitionId,
           event.data.taskName, event.data.candidateGroup, event.data.phase,
           event.data.slaTarget, event.data.jiraIssueKey]
        );
        break;

      case 'task_completed':
        await pgPool.query(
          `UPDATE task_executions SET completed_at = $2, duration_ms = $3, assignee = $4
           WHERE task_key = $1`,
          [event.data.taskKey, event.data.endTime, event.data.durationMs, event.data.assignee]
        );
        break;

      case 'sla_warning':
      case 'sla_breach':
      case 'chronic_breach':
        await pgPool.query(
          `INSERT INTO sla_events (process_instance_key, task_key, event_type, threshold_pct, elapsed_ms, target_ms, jira_issue_key, jira_escalation_key, escalation_target)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [event.data.processInstanceKey, event.data.taskKey, event.type,
           event.data.threshold, event.data.elapsedMs, event.data.targetMs,
           event.data.jiraIssueKey, event.data.jiraEscalationKey, event.data.escalationTarget]
        );
        break;

      case 'process_completed':
        await pgPool.query(
          `UPDATE process_instances SET status = $2, completed_at = $3
           WHERE process_instance_key = $1`,
          [event.data.instanceKey, event.data.status, event.data.completedAt]
        );
        break;
    }
  } catch (err) {
    console.error(`PostgreSQL write error (${event.type}): ${err.message}`);
  }
}

// --- Polling: fetch events from jira-sync service ---
let lastEventTimestamp = null;

async function pollJiraSyncEvents() {
  try {
    const res = await fetch(`${JIRA_SYNC_URL}/api/sync-status`);
    if (!res.ok) return;
    const data = await res.json();

    // Process new events
    for (const evt of (data.events || [])) {
      if (lastEventTimestamp && evt.timestamp <= lastEventTimestamp) continue;

      // Map jira-sync event directions to graph events
      let graphEvent = null;
      if (evt.direction === 'outbound' && evt.status.startsWith('Created for')) {
        graphEvent = {
          type: 'task_created',
          data: {
            taskKey: evt.camundaTaskKey,
            processInstanceKey: 'unknown', // Will be enriched
            taskDefinitionId: 'unknown',
            taskName: evt.status.replace('Created for "', '').replace(/".*/, ''),
            candidateGroup: 'unknown',
            phase: 'unknown',
            slaTarget: 'P1D',
            startTime: evt.timestamp,
            jiraIssueKey: evt.jiraIssueKey,
          },
        };
      } else if (evt.direction === 'webhook' && evt.status.includes('Completed')) {
        graphEvent = {
          type: 'task_completed',
          data: {
            taskKey: evt.camundaTaskKey,
            endTime: evt.timestamp,
            durationMs: 0,
            assignee: 'jira-sync',
          },
        };
      } else if (evt.direction === 'sla-warning') {
        graphEvent = {
          type: 'sla_warning',
          data: {
            taskKey: evt.camundaTaskKey,
            processInstanceKey: 'unknown',
            threshold: 80,
            timestamp: evt.timestamp,
            elapsedMs: 0,
            targetMs: 0,
            jiraIssueKey: evt.jiraIssueKey,
          },
        };
      } else if (evt.direction === 'sla-breach' || evt.direction === 'chronic-breach') {
        graphEvent = {
          type: evt.direction === 'chronic-breach' ? 'chronic_breach' : 'sla_breach',
          data: {
            taskKey: evt.camundaTaskKey,
            processInstanceKey: 'unknown',
            threshold: 100,
            timestamp: evt.timestamp,
            elapsedMs: 0,
            targetMs: 0,
            jiraIssueKey: evt.jiraIssueKey,
            jiraEscalationKey: evt.jiraIssueKey,
          },
        };
      }

      if (graphEvent) {
        bufferEvent(graphEvent);
        await writeToNeo4j(graphEvent);
        await writeToPostgres(graphEvent);
      }
    }

    if (data.events?.length) {
      lastEventTimestamp = data.events[0].timestamp;
    }
  } catch {
    // jira-sync not running — silent
  }
}

// --- Express API ---
const app = express();
app.use(express.json());

// Receive events directly (webhook from jira-sync.js)
app.post('/api/events', async (req, res) => {
  const event = req.body;
  bufferEvent(event);
  await writeToNeo4j(event);
  await writeToPostgres(event);
  res.json({ status: 'ok', eventId: event.id });
});

// Query buffered events
app.get('/api/events', (req, res) => {
  const limit = parseInt(req.query.limit || '50');
  const type = req.query.type;
  let events = eventBuffer;
  if (type) events = events.filter(e => e.type === type);
  res.json({ count: events.length, events: events.slice(0, limit) });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    neo4j: !!neo4jDriver,
    postgres: !!pgPool,
    bufferedEvents: eventBuffer.length,
    lastPoll: lastEventTimestamp,
  });
});

// --- Main ---
async function main() {
  console.log('=== SLA Knowledge Graph Ingestion Service ===');
  console.log(`Jira Sync: ${JIRA_SYNC_URL}`);
  console.log(`Neo4j: ${NEO4J_URI}`);
  console.log(`PostgreSQL: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log();

  await initNeo4j();
  await initPostgres();

  // Start polling jira-sync for events
  setInterval(pollJiraSyncEvents, POLL_INTERVAL_MS);
  await pollJiraSyncEvents();

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Graph ingestion service: http://127.0.0.1:${PORT}`);
    console.log(`Event webhook: POST http://127.0.0.1:${PORT}/api/events`);
    console.log(`Health check: GET http://127.0.0.1:${PORT}/api/health`);
  });
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
