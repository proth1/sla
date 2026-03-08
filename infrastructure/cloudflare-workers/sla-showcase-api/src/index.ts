/**
 * SLA Showcase API Worker
 *
 * Cloudflare Worker that proxies API requests to Camunda 8 Cloud (Zeebe + Tasklist).
 * Ported from customers/fs-onboarding/showcase/server.js.
 *
 * All requests must include X-SLA-API-Proxy header matching PROXY_SECRET.
 */

interface Env {
  CAMUNDA_CLIENT_ID: string;
  CAMUNDA_CLIENT_SECRET: string;
  PROXY_SECRET: string;
  CAMUNDA_CLUSTER_ID: string;
  CAMUNDA_REGION: string;
  CAMUNDA_AUTH_URL: string;
  PROCESS_ID: string;
  MINI_RFP_PROCESS_ID: string;
}

interface TokenEntry {
  token: string;
  expiresAt: number;
}

// Personas data (embedded — same as public/personas-data.json)
const PERSONAS = [
  { id: "sarah.chen", name: "Sarah Chen", title: "VP, Global Markets Technology", initials: "SC", color: "#3b82f6", groups: ["business-lane"] },
  { id: "jennifer.martinez", name: "Jennifer Martinez", title: "Sr. Technology Governance Analyst", initials: "JM", color: "#8b5cf6", groups: ["governance-lane", "oversight-lane"] },
  { id: "marcus.johnson", name: "Marcus Johnson", title: "Chief Security Architect", initials: "MJ", color: "#22c55e", groups: ["technical-assessment", "ai-review"] },
  { id: "lisa.park", name: "Lisa Park", title: "Compliance Officer", initials: "LP", color: "#f59e0b", groups: ["compliance-lane"] },
  { id: "david.kim", name: "David Kim", title: "Sr. Procurement Manager", initials: "DK", color: "#ef4444", groups: ["contracting-lane", "procurement-lane", "finance-lane"] },
  { id: "ahmed.saleh", name: "Ahmed Saleh", title: "Process Automation Lead", initials: "AS", color: "#6366f1", groups: ["automation-lane"] },
  { id: "vendor.demo", name: "Vendor Demo", title: "External Vendor Representative", initials: "VD", color: "#ec4899", groups: ["vendor-response"] },
];

// Module-scope token cache (persists across requests in same isolate)
const tokenCache: Record<string, TokenEntry> = {};

function zeebeUrl(env: Env): string {
  return `https://${env.CAMUNDA_REGION}.zeebe.camunda.io/${env.CAMUNDA_CLUSTER_ID}`;
}

function tasklistUrl(env: Env): string {
  return `https://${env.CAMUNDA_REGION}.tasklist.camunda.io/${env.CAMUNDA_CLUSTER_ID}`;
}

async function getToken(audience: string, env: Env): Promise<string> {
  const cached = tokenCache[audience];
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await fetch(env.CAMUNDA_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.CAMUNDA_CLIENT_ID,
      client_secret: env.CAMUNDA_CLIENT_SECRET,
      audience,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  tokenCache[audience] = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

async function zeebeApi(method: string, apiPath: string, env: Env, body?: unknown): Promise<unknown> {
  const token = await getToken('zeebe.camunda.io', env);
  const opts: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${zeebeUrl(env)}${apiPath}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zeebe ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function tasklistApi(method: string, apiPath: string, env: Env, body?: unknown): Promise<unknown> {
  const token = await getToken('tasklist.camunda.io', env);
  const opts: RequestInit = {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${tasklistUrl(env)}${apiPath}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tasklist ${res.status}: ${text}`);
  }
  return res.json();
}

// --- Persona helpers ---

interface Persona {
  id: string;
  groups: string[];
}

interface Task {
  candidateGroups?: string[];
  [key: string]: unknown;
}

function getPersonaFromHeaders(headers: Headers): Persona | null {
  const id = headers.get('x-sla-persona');
  if (!id) return null;
  return (PERSONAS.find(p => p.id === id) as Persona) || null;
}

function filterTasksByPersona(tasks: Task[], persona: Persona | null): Task[] {
  if (!persona) return tasks;
  const groups = persona.groups || [];
  if (groups.length === 0) return tasks;
  return tasks.filter(t => {
    const tGroups = t.candidateGroups || [];
    return tGroups.some((g: string) => groups.includes(g));
  });
}

function isValidKey(key: string): boolean {
  return /^\d{1,19}$/.test(key);
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store',
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

// --- Route handler ---

async function handleApiRequest(request: Request, url: URL, env: Env): Promise<Response> {
  const method = request.method;
  const path = url.pathname;

  // Parse path segments: /api/...
  const segments = path.split('/').filter(Boolean); // ['api', ...]

  try {
    // GET /api/personas
    if (method === 'GET' && path === '/api/personas') {
      return jsonResponse(PERSONAS);
    }

    // POST /api/process/start
    if (method === 'POST' && path === '/api/process/start') {
      const body = await request.json() as { variables?: Record<string, unknown> };
      const result = await zeebeApi('POST', '/v2/process-instances', env, {
        processDefinitionId: env.PROCESS_ID,
        variables: body.variables || {},
      });
      return jsonResponse(result);
    }

    // GET /api/process/:key
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'process' && segments.length === 3 && segments[2] !== 'undefined') {
      const key = segments[2];
      const result = await zeebeApi('GET', `/v2/process-instances/${key}`, env);
      return jsonResponse(result);
    }

    // GET /api/process/:key/variables
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'process' && segments.length === 4 && segments[3] === 'variables') {
      const key = segments[2];
      const tasks = await tasklistApi('POST', '/v1/tasks/search', env, {
        processInstanceKey: key,
      }) as Task[];
      if (Array.isArray(tasks) && tasks.length > 0) {
        const vars = await tasklistApi('POST', `/v1/tasks/${tasks[0].id}/variables/search`, env, {});
        return jsonResponse(vars);
      }
      return jsonResponse([]);
    }

    // DELETE /api/process/:key
    if (method === 'DELETE' && segments[0] === 'api' && segments[1] === 'process' && segments.length === 3) {
      const key = segments[2];
      await zeebeApi('POST', `/v2/process-instances/${key}/cancellation`, env);
      return jsonResponse({ cancelled: true, key });
    }

    // POST /api/instances/search
    if (method === 'POST' && path === '/api/instances/search') {
      const body = await request.json().catch(() => ({}));
      const result = await zeebeApi('POST', '/v2/process-instances/search', env, body);
      return jsonResponse(result);
    }

    // GET /api/tasks (filtered by persona)
    if (method === 'GET' && path === '/api/tasks') {
      const query: Record<string, unknown> = { state: 'CREATED' };
      const processInstanceKey = url.searchParams.get('processInstanceKey');
      if (processInstanceKey) query.processInstanceKey = processInstanceKey;
      const tasks = await tasklistApi('POST', '/v1/tasks/search', env, query);
      const persona = getPersonaFromHeaders(request.headers);
      const filtered = Array.isArray(tasks) ? filterTasksByPersona(tasks as Task[], persona) : tasks;
      return jsonResponse(filtered);
    }

    // GET /api/tasks/completed
    if (method === 'GET' && path === '/api/tasks/completed') {
      const query: Record<string, unknown> = { state: 'COMPLETED' };
      const processInstanceKey = url.searchParams.get('processInstanceKey');
      if (processInstanceKey) query.processInstanceKey = processInstanceKey;
      const tasks = await tasklistApi('POST', '/v1/tasks/search', env, query);
      return jsonResponse(tasks);
    }

    // POST /api/tasks/search
    if (method === 'POST' && path === '/api/tasks/search') {
      const body = await request.json().catch(() => ({}));
      const result = await tasklistApi('POST', '/v1/tasks/search', env, body);
      return jsonResponse(result);
    }

    // GET /api/tasks/:id (must be after /completed and /search)
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 3 && segments[2] !== 'completed') {
      const id = segments[2];
      const task = await tasklistApi('GET', `/v1/tasks/${id}`, env);
      return jsonResponse(task);
    }

    // GET /api/tasks/:id/form
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 4 && segments[3] === 'form') {
      const id = segments[2];
      const processDefinitionKey = url.searchParams.get('processDefinitionKey') || '';
      const form = await tasklistApi('GET', `/v1/forms/${id}?processDefinitionKey=${processDefinitionKey}`, env);
      return jsonResponse(form);
    }

    // GET /api/tasks/:id/variables
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 4 && segments[3] === 'variables') {
      const id = segments[2];
      const vars = await tasklistApi('POST', `/v1/tasks/${id}/variables/search`, env, {});
      return jsonResponse(vars);
    }

    // POST /api/tasks/:id/assign
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 4 && segments[3] === 'assign') {
      const id = segments[2];
      const persona = getPersonaFromHeaders(request.headers);
      const assignee = persona ? persona.id : 'showcase-user';
      const result = await tasklistApi('PATCH', `/v1/tasks/${id}/assign`, env, {
        assignee,
        allowOverrideAssignment: true,
      });
      return jsonResponse(result);
    }

    // POST /api/tasks/:id/complete
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 4 && segments[3] === 'complete') {
      const id = segments[2];
      const body = await request.json() as { variables?: unknown[] };
      const result = await tasklistApi('PATCH', `/v1/tasks/${id}/complete`, env, {
        variables: body.variables || [],
      });
      return jsonResponse(result);
    }

    // POST /api/tasks/:id/reassign
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 4 && segments[3] === 'reassign') {
      const id = segments[2];
      const body = await request.json() as { assignee?: string };
      const assignee = typeof body.assignee === 'string' ? body.assignee.trim().slice(0, 200) : '';
      if (!assignee) return errorResponse('assignee is required', 400);
      const result = await tasklistApi('PATCH', `/v1/tasks/${id}/assign`, env, {
        assignee,
        allowOverrideAssignment: true,
      });
      return jsonResponse(result);
    }

    // POST /api/tasks/:id/unassign
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'tasks' && segments.length === 4 && segments[3] === 'unassign') {
      const id = segments[2];
      const result = await tasklistApi('PATCH', `/v1/tasks/${id}/unassign`, env);
      return jsonResponse(result);
    }

    // GET /api/forms/:formId
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'forms' && segments.length === 3) {
      const formId = segments[2];
      const processDefinitionKey = url.searchParams.get('processDefinitionKey') || '';
      const form = await tasklistApi('GET', `/v1/forms/${formId}?processDefinitionKey=${processDefinitionKey}`, env);
      return jsonResponse(form);
    }

    // --- Mini RFP routes ---

    // POST /api/mini-rfp/start
    if (method === 'POST' && path === '/api/mini-rfp/start') {
      const body = await request.json() as { variables?: Record<string, unknown> };
      const result = await zeebeApi('POST', '/v2/process-instances', env, {
        processDefinitionId: env.MINI_RFP_PROCESS_ID,
        variables: body.variables || {},
      });
      return jsonResponse(result);
    }

    // GET /api/mini-rfp/active
    if (method === 'GET' && path === '/api/mini-rfp/active') {
      const result = await zeebeApi('POST', '/v2/process-instances/search', env, {
        filter: { processDefinitionId: env.MINI_RFP_PROCESS_ID, state: 'ACTIVE' },
      });
      return jsonResponse(result);
    }

    // GET /api/mini-rfp/:key/status
    if (method === 'GET' && segments[0] === 'api' && segments[1] === 'mini-rfp' && segments.length === 4 && segments[3] === 'status') {
      const key = segments[2];
      if (!isValidKey(key)) return errorResponse('Invalid process key', 400);
      const [instance, tasks] = await Promise.all([
        zeebeApi('GET', `/v2/process-instances/${key}`, env),
        tasklistApi('POST', '/v1/tasks/search', env, {
          processInstanceKey: key,
          state: 'CREATED',
        }),
      ]) as [Record<string, unknown>, Task[]];
      const currentTask = Array.isArray(tasks) && tasks.length > 0 ? tasks[0] : null;
      return jsonResponse({
        ...instance,
        currentTask: currentTask ? {
          id: currentTask.id,
          name: (currentTask as Record<string, unknown>).name,
          taskDefinitionId: (currentTask as Record<string, unknown>).taskDefinitionId,
          candidateGroups: currentTask.candidateGroups,
        } : null,
      });
    }

    // POST /api/mini-rfp/:key/vendor-token
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'mini-rfp' && segments.length === 4 && segments[3] === 'vendor-token') {
      const key = segments[2];
      if (!isValidKey(key)) return errorResponse('Invalid process key', 400);
      const bytes = new Uint8Array(12);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const vendorToken = `vrfp-${key}-${hex}`;
      return jsonResponse({
        vendorToken,
        portalUrl: `/vendor-portal.html?token=${vendorToken}&instance=${key}`,
      });
    }

    // POST /api/mini-rfp/:key/vendor-response
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'mini-rfp' && segments.length === 4 && segments[3] === 'vendor-response') {
      const key = segments[2];
      if (!isValidKey(key)) return errorResponse('Invalid process key', 400);
      const body = await request.json() as { vendorToken?: string; responseData?: Record<string, unknown> };
      const correlationKey = body.vendorToken || key;
      const result = await zeebeApi('POST', '/v2/messages/publication', env, {
        messageName: 'MiniRFPResponseMessage',
        correlationKey,
        variables: body.responseData || {},
      });
      return jsonResponse({ correlated: true, ...(result as Record<string, unknown>) });
    }

    // POST /api/mini-rfp/:key/transfer
    if (method === 'POST' && segments[0] === 'api' && segments[1] === 'mini-rfp' && segments.length === 4 && segments[3] === 'transfer') {
      const key = segments[2];
      if (!isValidKey(key)) return errorResponse('Invalid process key', 400);
      const reqBody = await request.json() as { startOnboarding?: boolean };

      let vars: Array<{ name: string; value: string }> = [];
      try {
        const tasks = await tasklistApi('POST', '/v1/tasks/search', env, {
          processInstanceKey: key,
        }) as Task[];
        if (Array.isArray(tasks) && tasks.length > 0) {
          vars = await tasklistApi('POST', `/v1/tasks/${tasks[0].id}/variables/search`, env, {}) as Array<{ name: string; value: string }>;
        }
      } catch { /* may have no tasks if completed */ }

      const varMap: Record<string, unknown> = {};
      vars.forEach(v => {
        try { varMap[v.name] = JSON.parse(v.value); } catch { varMap[v.name] = v.value; }
      });

      const onboardingVars: Record<string, unknown> = {
        softwareName: varMap.vendorName ? `${varMap.vendorName} - ${varMap.technologyType || 'Software'}` : 'Mini RFP Transfer',
        vendorName: varMap.vendorName || '',
        requesterName: varMap.requesterName || '',
        department: varMap.department || '',
        requesterEmail: varMap.requesterEmail || '',
        estimatedCost: varMap.budgetRange === 'over_500k' ? 500000 : varMap.budgetRange === '100k_500k' ? 250000 : varMap.budgetRange === '25k_100k' ? 50000 : 25000,
        requestType: 'defined-need',
        riskCategory: varMap.dataClassification === 'restricted' ? 'Critical' : varMap.dataClassification === 'confidential' ? 'High' : 'Standard',
        miniRfpInstanceKey: key,
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

      if (reqBody.startOnboarding) {
        const result = await zeebeApi('POST', '/v2/process-instances', env, {
          processDefinitionId: env.PROCESS_ID,
          variables: onboardingVars,
        }) as Record<string, unknown>;
        return jsonResponse({
          transferred: true,
          onboardingInstanceKey: result.processInstanceKey,
          mappedVariables: onboardingVars,
        });
      }
      return jsonResponse({ transferred: false, mappedVariables: onboardingVars });
    }

    // POST /api/deploy — disabled in cloud worker
    if (path === '/api/deploy') {
      return errorResponse('Deploy endpoint is not available in cloud mode. Use scripts/deploy-and-migrate.sh locally.', 501);
    }

    return errorResponse('Not found', 404);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return errorResponse(message);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Validate proxy secret on every request
    const proxyHeader = request.headers.get('X-SLA-API-Proxy');
    if (proxyHeader !== env.PROXY_SECRET) {
      return errorResponse('Unauthorized', 401);
    }

    const url = new URL(request.url);

    // Handle CORS preflight (shouldn't happen since same-origin, but defensive)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    return handleApiRequest(request, url, env);
  },
};
