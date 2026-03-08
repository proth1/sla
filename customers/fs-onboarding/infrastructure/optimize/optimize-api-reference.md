# Camunda Optimize API Reference — Onboarding Dashboards

## API Capabilities (Camunda 8 SaaS)

The Optimize public REST API provides **export/import** operations for dashboards and reports,
but does **not** support creating reports or dashboards from scratch programmatically. Reports
and dashboards must be created via the Optimize UI, then exported for version control and
re-import into other environments.

### Available Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/public/dashboard?collectionId={id}` | List dashboard IDs in a collection |
| DELETE | `/api/public/dashboard/{id}` | Delete a dashboard |
| POST | `/api/public/export/dashboard/definition/json` | Export dashboard definitions (with contained reports) |
| POST | `/api/public/import?collectionId={id}` | Import entity definitions (reports + dashboards) |
| GET | `/api/public/report?collectionId={id}` | List report IDs in a collection |
| POST | `/api/public/export/report/definition/json` | Export report definitions |
| GET | `/api/public/export/report/{id}/result/json` | Export report result data (paginated) |
| POST | `/api/public/share/enable` | Enable sharing for all reports/dashboards |
| POST | `/api/public/share/disable` | Disable sharing |

### Authentication (SaaS)

Obtain a Bearer token using client credentials with `audience=optimize.camunda.io`:

```bash
curl --request POST https://login.cloud.camunda.io/oauth/token \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'grant_type=client_credentials' \
    --data-urlencode 'audience=optimize.camunda.io' \
    --data-urlencode "client_id=${ZEEBE_CLIENT_ID}" \
    --data-urlencode "client_secret=${ZEEBE_CLIENT_SECRET}"
```

Token expires after 300 seconds (5 minutes).

### Base URL

```
https://ric-1.optimize.camunda.io/425f10fa-c898-4b4b-b303-eac095286716
```

### Import Prerequisites

Before importing entities:
1. The target collection must exist in Optimize
2. All process definitions referenced by reports must be available
3. The process `Process_Onboarding_v8` must be deployed and indexed by Optimize
4. Entity data structures must match the Optimize version

---

## Dashboard Setup Strategy

Since the API does not support creating reports from scratch, the workflow is:

1. **Create reports and dashboards in the Optimize UI** (documented below)
2. **Export definitions** using `export-dashboards.sh`
3. **Commit exported JSON** to `definitions/` directory for version control
4. **Import into other environments** using `import-dashboards.sh`

This is the standard Camunda-recommended approach for dashboard-as-code.

---

## Process Details

- **Process Definition Key**: `Process_Onboarding_v8`
- **Process Name**: Product Management -- Software Onboarding (Hierarchical)
- **Cluster**: sla-onboarding-dev
- **Cluster ID**: 425f10fa-c898-4b4b-b303-eac095286716
- **Region**: ric-1

### Sub-Processes

| ID | Name | Phase |
|----|------|-------|
| SP_RequestTriage | Request and Triage | Phase 1 |
| SP_PlanningRouting | Planning and Routing | Phase 2 |
| SP_EvalDD | Evaluation and Due Diligence | Phase 3 |
| SP_ContractBuild | Contracting and Build | Phase 4 |
| SP_UATGoLive | UAT and Go-Live | Phase 5 |

### Key Decision Gateways

| Gateway | Question | Outcomes |
|---------|----------|----------|
| GW_BuyVsBuild | Do we Build? | Yes (Build path) / No (Buy path) |
| GW_TriageApproved | Approved? | Yes (continue) / No (Request Denied) |
| GW_EvalApproved | Approved? | Yes (continue) / No (Evaluation Failed) |
| GW_UATApproved | Approved? | Yes (continue) / No (loop back) |
