# Deployment Security (MANDATORY)

## Never Deploy in the Clear

**ALL deployments to Cloudflare Pages MUST be protected by OTP authentication.**

### Rules

1. **NEVER deploy directly** using `wrangler pages deploy` and share the resulting URL — deployment-specific URLs (`*.sla-presentation.pages.dev`) bypass the OTP auth worker
2. **The ONLY public URL** for the presentation is `https://sla.agentic-innovations.com` (OTP-protected)
3. **Direct Pages URLs are blocked** by `_worker.js` that validates a shared proxy secret
4. **One canonical file**: `docs/presentations/index.html` is the SOLE presentation HTML. Never create or maintain a second `.html` file in that directory. Cloudflare Pages serves `index.html` at `/` automatically.
5. **No hardcoded filename redirects in the Worker**: The auth worker must NEVER redirect `/` to a named `.html` file. Let Pages handle the default document.

### Deployment Sequence

```
1. Deploy Pages:
   npx wrangler pages deploy docs/presentations/ --project-name=sla-presentation

2. Verify content matches local file:
   curl -sI https://sla-presentation.pages.dev  → should redirect to sla.agentic-innovations.com
   (Content verification happens through the auth proxy)

3. Purge zone cache:
   curl -s -X POST "https://api.cloudflare.com/client/v4/zones/c8c493cfbb6a3e175c3b135abf4e7e56/purge_cache" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"purge_everything":true}'

4. Verify via auth domain:
   curl -sI https://sla.agentic-innovations.com  → should show login page
```

### Content-Only vs Worker Deploys

- **Pages-only for content changes**: When only presentation HTML/CSS/JS changes, deploy Pages only (step 1). Do NOT redeploy the worker. A worker redeploy resets the Cloudflare isolate, re-initializes the JWKS keyset fetcher, and can fail JWT validation on first request — forcing users to re-authenticate.
- **Worker deploy only when worker code/config changes**: Only redeploy the auth worker when `src/index.ts`, `wrangler.toml`, or secrets actually changed:
  ```
  cd infrastructure/cloudflare-workers/sla-presentation-auth && npx wrangler deploy
  ```

### Verify After Every Deploy

After deploying to Pages, verify:
- Response size matches local `index.html` (via auth proxy or direct check)
- Content contains expected markers (e.g., `grep -c 'governance-phase'` or similar)
- Do NOT skip this step

### Architecture

- Auth Worker (`sla.agentic-innovations.com`) → validates session → proxies to Pages with `X-SLA-Auth-Proxy` header
- Pages Worker (`_worker.js`) → rejects requests without valid proxy header → redirects to auth domain
- Direct `*.sla-presentation.pages.dev` access → blocked by `_worker.js` → redirect to `sla.agentic-innovations.com`

### Session Management (CRITICAL)

The auth worker uses a **two-tier session** strategy:

1. **`SLA_SESSION` cookie (worker-managed, 8h TTL)**: HMAC-signed cookie (`email|expiry|signature`) set after successful Descope OTP verification. Checked FIRST on every request. Survives Descope JWT expiry.
2. **`DS` cookie (Descope session JWT, ~10min TTL)**: Short-lived JWT from Descope. Only validated if `SLA_SESSION` is missing/expired.
3. **`DSR` cookie (Descope refresh token, 30-day TTL)**: Used for server-side refresh if Descope session JWT expires and no worker session exists.

**Why this matters**: Descope session JWTs expire in ~10 minutes by default. Without the worker-managed session, users would be forced to re-authenticate on every browser reload after 10 minutes. The `SLA_SESSION` cookie provides an 8-hour session window.

**Cookie clearing**: Logout clears all three cookies using separate `headers.append('Set-Cookie', ...)` calls. Do NOT join multiple `Set-Cookie` values with commas — the `Set-Cookie` header does not support comma-combined values.

### Architecture Reference

| Component | Value |
|-----------|-------|
| Canonical file | `docs/presentations/index.html` |
| Pages project | `sla-presentation` → `sla-presentation.pages.dev` |
| Auth worker | `infrastructure/cloudflare-workers/sla-presentation-auth/` |
| Custom domain | `sla.agentic-innovations.com` |
| Descope project | `P3AN0dLWf9ZTyBi3vF6xaDbThO8q` |
| Zone | `agentic-innovations.com` (`c8c493cfbb6a3e175c3b135abf4e7e56`) |
| Account ID | `9cf2c4bac542fc51cda0343dc1485db1` |
| Allowed emails | `proth1@gmail.com` |
| Allowed domain | `agentic-innovations.com` |
| Session cookies | `SLA_SESSION` (8h), `DS` (~10min), `DSR` (30d) |

### Failure Mode Checklist

When deployed content doesn't match local:
- [ ] Check worker source for hardcoded redirects (`grep -n '\.html' src/index.ts`)
- [ ] Check Pages preview URL returns correct file size
- [ ] Check service token secrets are valid (CF_ACCESS_CLIENT_ID/SECRET)
- [ ] Purge zone cache for agentic-innovations.com
- [ ] Tell user to hard-refresh browser (Cmd+Shift+R)

When users must re-authenticate on every reload:
- [ ] Check `SLA_SESSION` cookie is being set (inspect Set-Cookie headers after OTP verify)
- [ ] Check HMAC signing key is consistent (falls back to `DESCOPE_PROJECT_ID` if `SESSION_SECRET` not set)
- [ ] Check `SLA_SESSION` TTL hasn't been reduced below a useful duration (default: 8h)
- [ ] Check Descope project hasn't changed (mismatched project ID = signature verification fails)
- [ ] Check logout isn't being triggered inadvertently (cookie clearing on wrong path)

### After Deployment: Clean Up Old Snapshots

Old deployment snapshots (before `_worker.js` was added) lack protection. After deploying, delete them:

```bash
# List deployments
curl -s "https://api.cloudflare.com/client/v4/accounts/9cf2c4bac542fc51cda0343dc1485db1/pages/projects/sla-presentation/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | python3 -m json.tool

# Delete by ID (cannot delete active production deployment)
curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/9cf2c4bac542fc51cda0343dc1485db1/pages/projects/sla-presentation/deployments/DEPLOYMENT_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```
