# Optimize Dashboard Setup Guide — Software Onboarding

## Overview

This guide documents all dashboards, reports, and KPIs to create in Camunda Optimize for
monitoring the `Process_Onboarding_v8` (Product Management -- Software Onboarding) process.

**Optimize URL**: https://ric-1.optimize.camunda.io/425f10fa-c898-4b4b-b303-eac095286716

**Process**: Process_Onboarding_v8 on cluster sla-onboarding-dev

---

## Dashboard Architecture

Create **4 dashboards** organized by operational concern:

| # | Dashboard Name | Purpose | Audience |
|---|----------------|---------|----------|
| 1 | Onboarding Executive Summary | High-level funnel, volumes, SLA health | Leadership |
| 2 | Phase Performance & Bottlenecks | Per-phase duration, completion rates, bottlenecks | Process owners |
| 3 | SLA Compliance & Task Analytics | SLA breach rates, task times by assignee group | Operations |
| 4 | Decision Point Analysis | Gateway outcomes, rejection rates, pathway distribution | Governance |

---

## Dashboard 1: Onboarding Executive Summary

### Report 1.1 — Active Instance Funnel

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **Process** | Process_Onboarding_v8 |
| **View** | Count of process instances |
| **Group by** | Flow node (running instances only) |
| **Visualization** | Bar chart (horizontal) |
| **Filter** | Running instances only |
| **Purpose** | Shows how many instances are currently in each sub-process (SP1-SP5) |

**How to create**:
1. New Report > Process Report
2. Select Process_Onboarding_v8
3. View: Process instance > Count
4. Group by: Flow nodes (select SP_RequestTriage, SP_PlanningRouting, SP_EvalDD, SP_ContractBuild, SP_UATGoLive)
5. Filter: Running instances
6. Visualization: Bar chart

### Report 1.2 — Completed vs In-Progress vs Rejected (Monthly)

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Count of process instances |
| **Group by** | Start date (month) |
| **Visualization** | Stacked bar chart |
| **Distributed by** | End event (End_Onboarded, End_RequestDenied, End_EvalFailed, End_VendorNotSelected, Running) |

**How to create**:
1. New Report > Process Report
2. View: Process instance > Count
3. Group by: Start date > Month
4. Distributed by: End event
5. Visualization: Bar chart (stacked)

### Report 1.3 — Average End-to-End Duration

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Process instance duration > Average |
| **Group by** | Start date (month) |
| **Visualization** | Line chart |
| **Filter** | Completed instances only |

### Report 1.4 — Instance Duration Distribution (P50 / P95 / P99)

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Process instance duration |
| **Group by** | None |
| **Visualization** | Number (create 3 separate reports) |
| **Aggregation** | Percentile 50, Percentile 95, Percentile 99 |
| **Filter** | Completed instances only |

Create three number widgets:
- **P50 Duration**: Aggregation = Median
- **P95 Duration**: Aggregation = Percentile 95
- **P99 Duration**: Aggregation = Percentile 99

### Report 1.5 — Volume Trend

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Count of process instances |
| **Group by** | Start date (week) |
| **Visualization** | Line chart |
| **Time range** | Last 90 days |

---

## Dashboard 2: Phase Performance & Bottlenecks

### Report 2.1 — Duration per Sub-Process (Heatmap)

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node duration > Average |
| **Group by** | Flow node |
| **Visualization** | Heatmap on process diagram |
| **Filter** | Completed instances |
| **Purpose** | Visual heatmap overlay showing time spent in each phase |

**How to create**:
1. New Report > Process Report
2. View: Flow node > Duration > Average
3. Visualization: Heatmap
4. The BPMN diagram will show duration overlaid on each element

### Report 2.2 — Phase Duration Comparison

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node duration > Average |
| **Group by** | Flow node (select only SP1-SP5) |
| **Visualization** | Bar chart |
| **Show also** | Min, Max, Median |

Target SLAs for reference:
- SP1 (Request & Triage): 2 days
- SP2 (Planning & Routing): 3 days
- SP3 (Evaluation & DD): 10 days
- SP4 (Contracting & Build): 15 days
- SP5 (UAT & Go-Live): 5 days

### Report 2.3 — Phase Duration Trend Over Time

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node duration > Average |
| **Group by** | Start date (week) |
| **Distributed by** | Flow node (SP1-SP5) |
| **Visualization** | Line chart |

### Report 2.4 — Phase Completion Rate

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node count |
| **Group by** | Flow node (select phase start + end events) |
| **Visualization** | Table |
| **Purpose** | Compare entries vs exits per phase to identify drop-off |

### Report 2.5 — Bottleneck Identification (Idle vs Work Time)

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node duration > Idle time vs Work time |
| **Group by** | Flow node |
| **Visualization** | Bar chart (stacked) |
| **Filter** | Completed instances |
| **Purpose** | Distinguish waiting time from active processing time |

### Report 2.6 — Duration by Pathway (Buy vs Build)

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Process instance duration > Average |
| **Group by** | Variable: selectedPathway |
| **Visualization** | Bar chart |
| **Filter** | Completed instances |
| **Purpose** | Compare total duration for Buy vs Build pathways |

To create this, ensure the `selectedPathway` variable is captured during the process.
If using gateway-based routing, create a variable filter:
- Filter 1: Variable `selectedPathway` = "Buy"
- Filter 2: Variable `selectedPathway` = "Build"

Alternatively, use flow node filters to identify instances that passed through
SP_PDLC (Build path) vs those that did not.

---

## Dashboard 3: SLA Compliance & Task Analytics

### Report 3.1 — SLA Compliance by Phase

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node duration |
| **Group by** | Flow node (SP1-SP5) |
| **Visualization** | Table |
| **Columns** | Flow node, Count, Avg Duration, Max Duration |
| **Purpose** | Compare actual durations against SLA targets |

Add **goal lines** or **target duration** annotations:

| Phase | SLA Target |
|-------|-----------|
| SP1 | P2D (2 days) |
| SP2 | P3D (3 days) |
| SP3 | P10D (10 days) |
| SP4 | P15D (15 days) |
| SP5 | P5D (5 days) |

### Report 3.2 — SLA Breach Count

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node count |
| **Group by** | Flow node |
| **Filter** | Select SLA timer boundary events (Timer_TriageSLA, Timer_VendorResponseSLA, Timer_ContractSLA, etc.) |
| **Visualization** | Number (count of SLA timer triggers) |
| **Purpose** | Count how many times each SLA timer fired |

### Report 3.3 — SLA Breach Rate Over Time

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node count |
| **Group by** | Start date (week) |
| **Filter** | SLA escalation end events only |
| **Visualization** | Line chart |

### Report 3.4 — User Task Duration by Assignee Group

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | User task duration > Average |
| **Group by** | User task |
| **Distributed by** | Candidate group |
| **Visualization** | Table |
| **Purpose** | Identify which teams are fastest/slowest at their tasks |

Candidate groups in this process:
- `requester-lane`
- `product-management-lane`
- `vendor-management-lane`
- `it-architecture-lane`
- `info-security-lane`

### Report 3.5 — User Task Completion Time Distribution

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | User task duration |
| **Group by** | User task |
| **Visualization** | Bar chart |
| **Aggregation** | Median + P95 |
| **Purpose** | Show typical vs worst-case task completion |

### Report 3.6 — Open Tasks Aging

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | User task count |
| **Group by** | User task |
| **Filter** | Running (uncompleted) user tasks |
| **Distributed by** | Duration bucket (0-1d, 1-3d, 3-7d, 7d+) |
| **Visualization** | Stacked bar chart |

---

## Dashboard 4: Decision Point Analysis

### Report 4.1 — Gateway Decision Distribution

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node count |
| **Group by** | Flow node |
| **Filter** | Select gateway outgoing sequence flows |
| **Visualization** | Pie chart |
| **Purpose** | Show Buy vs Build split, approval vs rejection ratios |

Create separate reports for each key gateway:

**4.1a — Triage Outcome**
- Flow nodes: sequence flows from GW_TriageApproved
- Shows: Approved % vs Denied %

**4.1b — Buy vs Build Split**
- Flow nodes: sequence flows from GW_BuyVsBuild
- Shows: Buy % vs Build %

**4.1c — Evaluation Outcome**
- Flow nodes: sequence flows from GW_EvalApproved
- Shows: Approved % vs Failed %

**4.1d — UAT Outcome**
- Flow nodes: sequence flows from GW_UATApproved
- Shows: Approved % vs Rework %

### Report 4.2 — Rejection Rate Over Time

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Count of process instances |
| **Group by** | End date (month) |
| **Filter** | Ended at: End_RequestDenied, End_EvalFailed, End_VendorNotSelected |
| **Visualization** | Line chart |
| **Purpose** | Track rejection trends over time |

### Report 4.3 — End Event Distribution

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Count of process instances |
| **Group by** | End event |
| **Visualization** | Pie chart |
| **Purpose** | Overall outcome distribution |

End events:
- `End_Onboarded` — Success
- `End_RequestDenied` — Rejected at triage
- `End_EvalFailed` — Failed evaluation
- `End_VendorNotSelected` — Vendor not selected (SP3)

### Report 4.4 — Pathway Duration Comparison

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Process instance duration |
| **Group by** | Variable: selectedPathway |
| **Visualization** | Bar chart |
| **Aggregation** | Average, Median, P95 |

### Report 4.5 — Rework Loop Count

| Setting | Value |
|---------|-------|
| **Type** | Process report |
| **View** | Flow node count |
| **Group by** | Flow node (select merge gateways that receive loop-back flows) |
| **Visualization** | Number |
| **Purpose** | Track how often UAT/PDLC loops trigger rework |

---

## Dashboard Layout Recommendations

### Dashboard 1 (Executive Summary) — 2x3 Grid

```
+---------------------------+---------------------------+
|  1.5 Volume Trend         |  1.2 Status Distribution  |
|  (line chart, full width) |  (stacked bar)            |
+---------------------------+---------------------------+
|  1.1 Active Funnel        |  1.3 Avg Duration         |
|  (horizontal bar)         |  (line chart)             |
+-------------+-------------+---------------------------+
| 1.4a P50    | 1.4b P95    | 1.4c P99                  |
| (number)    | (number)    | (number)                  |
+-------------+-------------+---------------------------+
```

### Dashboard 2 (Phase Performance) — 2x3 Grid

```
+---------------------------+---------------------------+
|  2.1 Duration Heatmap     |  2.2 Phase Duration Bars  |
|  (BPMN overlay)           |  (bar chart)              |
+---------------------------+---------------------------+
|  2.3 Duration Trend       |  2.6 Buy vs Build         |
|  (multi-line)             |  Duration (bar chart)     |
+---------------------------+---------------------------+
|  2.4 Completion Rate      |  2.5 Idle vs Work Time    |
|  (table)                  |  (stacked bar)            |
+---------------------------+---------------------------+
```

### Dashboard 3 (SLA & Tasks) — 2x3 Grid

```
+---------------------------+---------------------------+
|  3.1 SLA Compliance Table |  3.2 SLA Breach Count     |
|  (table)                  |  (number widgets)         |
+---------------------------+---------------------------+
|  3.3 Breach Rate Trend    |  3.4 Task Time by Group   |
|  (line chart)             |  (table)                  |
+---------------------------+---------------------------+
|  3.5 Task Duration Dist   |  3.6 Open Tasks Aging     |
|  (bar chart)              |  (stacked bar)            |
+---------------------------+---------------------------+
```

### Dashboard 4 (Decisions) — 2x3 Grid

```
+---------------------------+---------------------------+
| 4.1a Triage  | 4.1b Build | 4.3 End Event Pie         |
| (pie)        | (pie)      | (pie chart)               |
+---------------------------+---------------------------+
| 4.1c Eval    | 4.1d UAT   | 4.2 Rejection Trend       |
| (pie)        | (pie)      | (line chart)              |
+---------------------------+---------------------------+
|  4.4 Pathway Duration     |  4.5 Rework Count         |
|  (bar chart)              |  (number)                 |
+---------------------------+---------------------------+
```

---

## Alerts Configuration

Configure Optimize alerts for critical SLA breaches:

| Alert | Condition | Threshold | Notification |
|-------|-----------|-----------|-------------|
| SP3 SLA Breach | SP_EvalDD avg duration | > 10 days | Email to process owner |
| SP4 SLA Breach | SP_ContractBuild avg duration | > 15 days | Email to process owner |
| High Rejection Rate | Monthly rejection count | > 20% of started | Email to governance |
| Stalled Instances | Running instances with no activity | > 7 days | Email to operations |

---

## Collection Setup

### Step 1: Create Collection

1. Open Optimize UI
2. Click "Collections" > "Create New Collection"
3. Name: "Software Onboarding Analytics"
4. Add data source: Process_Onboarding_v8 from sla-onboarding-dev cluster

### Step 2: Create Reports

Follow the report specifications above. Create reports within the collection.

### Step 3: Create Dashboards

1. In the collection, click "Create New" > "Dashboard"
2. Name the dashboard per the table above
3. Add reports using the "Add Report" button
4. Arrange in the grid layout shown above

### Step 4: Export for Version Control

```bash
export ZEEBE_CLIENT_ID="your-client-id"
export ZEEBE_CLIENT_SECRET="your-client-secret"
bash export-dashboards.sh <COLLECTION_ID>
```

### Step 5: Import to Another Environment

```bash
bash import-dashboards.sh <TARGET_COLLECTION_ID>
```

---

## Variable Requirements

For full dashboard functionality, ensure these process variables are set during execution:

| Variable | Type | Set By | Used In |
|----------|------|--------|---------|
| `selectedPathway` | String | SP2 (Planning) | Reports 2.6, 4.4 |
| `riskTier` | String | SP1 (Triage) | Report 4.1a |
| `vendorName` | String | SP1 (Triage) | Raw data exports |
| `requestType` | String | Start form | Filtering |
| `submitterEmail` | String | Start form | Task analytics |

---

## Maintenance

- **Weekly**: Review SLA breach alerts, check for stalled instances
- **Monthly**: Review dashboard accuracy, update SLA targets if needed
- **Quarterly**: Export latest definitions to version control, review KPI targets
- **After process changes**: Re-deploy, verify Optimize indexes the new version, update reports if flow nodes changed
