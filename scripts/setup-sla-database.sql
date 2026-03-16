-- SLA Governance Database Schema (PostgreSQL)
-- Structured data store for SLA events, process instances, and compliance evidence.
-- Complements Neo4j knowledge graph with queryable tabular data.

-- ══════════════════════════════════════════════════════════
-- SLA Configuration (per-lane + per-task overrides)
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sla_config (
    id              SERIAL PRIMARY KEY,
    lane            VARCHAR(50) NOT NULL,
    task_definition_id VARCHAR(100),  -- NULL = lane-level default
    sla_duration    VARCHAR(20) NOT NULL,  -- ISO 8601 (e.g., P3D, PT4H)
    warning_threshold NUMERIC(3,2) DEFAULT 0.80,
    escalation_chain JSONB DEFAULT '[]',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (lane, task_definition_id)
);

COMMENT ON TABLE sla_config IS 'Lane and task-level SLA configuration. task_definition_id NULL = lane default.';

-- ══════════════════════════════════════════════════════════
-- Process Instances
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS process_instances (
    process_instance_key VARCHAR(50) PRIMARY KEY,
    process_definition_key VARCHAR(50) NOT NULL,
    vendor_name     VARCHAR(200),
    request_name    VARCHAR(200),
    pathway         VARCHAR(20),  -- Buy, Build, Enable, FastTrack
    risk_tier       VARCHAR(20),  -- High, Medium, Low, Minimal
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    jira_epic_key   VARCHAR(20),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    variables       JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_pi_status ON process_instances(status);
CREATE INDEX IF NOT EXISTS idx_pi_vendor ON process_instances(vendor_name);

-- ══════════════════════════════════════════════════════════
-- Task Executions
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS task_executions (
    task_key        VARCHAR(50) PRIMARY KEY,
    process_instance_key VARCHAR(50) REFERENCES process_instances(process_instance_key),
    task_definition_id VARCHAR(100) NOT NULL,
    task_name       VARCHAR(200),
    candidate_group VARCHAR(50),
    assignee        VARCHAR(100),
    phase           VARCHAR(10),
    sla_target      VARCHAR(20),  -- ISO 8601
    sla_breached    BOOLEAN DEFAULT FALSE,
    jira_issue_key  VARCHAR(20),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    duration_ms     BIGINT
);

CREATE INDEX IF NOT EXISTS idx_te_pi ON task_executions(process_instance_key);
CREATE INDEX IF NOT EXISTS idx_te_phase ON task_executions(phase);
CREATE INDEX IF NOT EXISTS idx_te_candidate ON task_executions(candidate_group);
CREATE INDEX IF NOT EXISTS idx_te_breached ON task_executions(sla_breached) WHERE sla_breached = TRUE;

-- ══════════════════════════════════════════════════════════
-- SLA Events
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sla_events (
    id              SERIAL PRIMARY KEY,
    process_instance_key VARCHAR(50) REFERENCES process_instances(process_instance_key),
    task_key        VARCHAR(50) REFERENCES task_executions(task_key),
    event_type      VARCHAR(20) NOT NULL,  -- warning, breach, chronic_breach, escalation
    threshold_pct   INTEGER,
    elapsed_ms      BIGINT,
    target_ms       BIGINT,
    jira_issue_key  VARCHAR(20),
    jira_escalation_key VARCHAR(20),
    escalation_target VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    metadata        JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_sla_pi ON sla_events(process_instance_key);
CREATE INDEX IF NOT EXISTS idx_sla_type ON sla_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sla_created ON sla_events(created_at);

-- ══════════════════════════════════════════════════════════
-- Compliance Evidence
-- ══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS compliance_evidence (
    id              SERIAL PRIMARY KEY,
    process_instance_key VARCHAR(50) REFERENCES process_instances(process_instance_key),
    task_key        VARCHAR(50) REFERENCES task_executions(task_key),
    artifact_type   VARCHAR(30) NOT NULL,  -- assessment, approval, review, contract, test_result
    regulation      VARCHAR(30),
    artifact_hash   VARCHAR(64),  -- SHA-256
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    metadata        JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ce_pi ON compliance_evidence(process_instance_key);
CREATE INDEX IF NOT EXISTS idx_ce_reg ON compliance_evidence(regulation);

-- ══════════════════════════════════════════════════════════
-- Seed SLA Config from jira-sync-config.json defaults
-- ══════════════════════════════════════════════════════════

INSERT INTO sla_config (lane, sla_duration, escalation_chain) VALUES
    ('technical-assessment', 'PT4H', '["governance-lane", "oversight-lane"]'),
    ('compliance-lane', 'P1D', '["governance-lane", "oversight-lane"]'),
    ('business-lane', 'P2D', '["governance-lane", "oversight-lane"]'),
    ('governance-lane', 'P2D', '["oversight-lane"]'),
    ('oversight-lane', 'P5D', '[]'),
    ('ai-review', 'P1D', '["governance-lane", "oversight-lane"]'),
    ('contracting-lane', 'P3D', '["governance-lane", "oversight-lane"]')
ON CONFLICT (lane, task_definition_id) DO NOTHING;

-- ══════════════════════════════════════════════════════════
-- Useful Views
-- ══════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_active_sla_status AS
SELECT
    te.task_key,
    te.task_definition_id,
    te.candidate_group,
    te.phase,
    te.jira_issue_key,
    te.started_at,
    sc.sla_duration,
    EXTRACT(EPOCH FROM (NOW() - te.started_at)) * 1000 AS elapsed_ms,
    te.sla_breached
FROM task_executions te
LEFT JOIN sla_config sc ON (
    sc.lane = te.candidate_group
    AND (sc.task_definition_id = te.task_definition_id OR sc.task_definition_id IS NULL)
)
WHERE te.completed_at IS NULL
ORDER BY te.started_at ASC;

CREATE OR REPLACE VIEW v_breach_summary AS
SELECT
    pi.vendor_name,
    pi.pathway,
    pi.risk_tier,
    COUNT(DISTINCT se.task_key) AS breached_tasks,
    COUNT(*) FILTER (WHERE se.event_type = 'chronic_breach') AS chronic_breaches,
    pi.jira_epic_key
FROM sla_events se
JOIN process_instances pi ON pi.process_instance_key = se.process_instance_key
WHERE se.event_type IN ('sla_breach', 'chronic_breach')
GROUP BY pi.process_instance_key, pi.vendor_name, pi.pathway, pi.risk_tier, pi.jira_epic_key
ORDER BY chronic_breaches DESC, breached_tasks DESC;
