# Lessons Learned

## 2026-03-02: Descope JWT TTL Causes Re-Auth on Every Reload (SLM-5)

**Problem**: After successful OTP login, users were forced to re-authenticate on every browser reload. The Descope session JWT (`DS` cookie) expires in approximately 10 minutes by default. The refresh token (`DSR`) has a 30-day TTL but the server-side refresh flow requires a round-trip to Descope's API — and a failed JWT validation with no valid refresh still redirected to login.

**Root Cause**: The auth worker only checked Descope JWTs. A ~10-minute JWT expiry means any reload after 10 minutes triggers re-auth, even though the user just logged in.

**Fix**: Added a worker-managed `SLA_SESSION` cookie (HMAC-signed, 8-hour TTL). The cookie stores `email|expiry|hmac_signature` and is verified locally without any Descope API call. The worker checks `SLA_SESSION` first on every request; only if missing or expired does it fall back to Descope JWT validation.

**Pattern**: For any auth proxy with short-lived upstream JWTs, add a worker-managed session layer with a longer TTL. The worker controls the HMAC key (falls back to `DESCOPE_PROJECT_ID` if `SESSION_SECRET` not set).

---

## 2026-03-02: Multiple Set-Cookie Headers Cannot Be Comma-Joined (SLM-5)

**Problem**: The `handleLogout` function was building the response using the `headers` object literal form with a single `Set-Cookie` key containing both cookies joined by comma:
```typescript
'Set-Cookie': [`${SESSION_COOKIE}=; ...`, `${REFRESH_COOKIE}=; ...`].join(', ')
```

**Root Cause**: The `Set-Cookie` header is special — it cannot have multiple values comma-joined. Per RFC 6265, each `Set-Cookie` header must be a separate HTTP header field. Joining them with comma causes browsers to treat the entire string as one malformed cookie value.

**Fix**: Use `headers.append('Set-Cookie', ...)` separately for each cookie to be cleared. Also updated to use `new Headers()` + `headers.set/append` pattern consistently.

---

## 2026-03-02: wrangler.toml Requires account_id for API Token Auth (SLM-5)

**Problem**: `npx wrangler deploy` failed with an API token permission error even though `CLOUDFLARE_API_TOKEN` was set correctly.

**Root Cause**: Wrangler requires either an `account_id` in `wrangler.toml` or the `CLOUDFLARE_ACCOUNT_ID` environment variable when authenticating with an API token (as opposed to OAuth login). Without it, Wrangler cannot determine which account to deploy to and falls back to an OAuth flow that fails in non-interactive environments.

**Fix**: Add `account_id = "9cf2c4bac542fc51cda0343dc1485db1"` to `wrangler.toml` directly after `compatibility_date`.

**Rule**: Always include `account_id` in `wrangler.toml` for projects deployed via API token.
