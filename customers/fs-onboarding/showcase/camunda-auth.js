// Shared Camunda 8 authentication module
// Used by server.js and jira-sync.js to avoid duplicated token management

const fs = require('fs');
const path = require('path');
const os = require('os');

const CRED_PATH = path.join(os.homedir(), '.camunda', 'credentials');

const defaults = {
  clusterId: '425f10fa-c898-4b4b-b303-eac095286716',
  region: 'ric-1',
  authUrl: 'https://login.cloud.camunda.io/oauth/token',
};

function createCamundaAuth(opts = {}) {
  const config = {
    clusterId: opts.clusterId || process.env.CAMUNDA_CLUSTER_ID || defaults.clusterId,
    region: opts.region || process.env.CAMUNDA_REGION || defaults.region,
    clientId: opts.clientId || process.env.CAMUNDA_CLIENT_ID || process.env.ZEEBE_CLIENT_ID,
    clientSecret: opts.clientSecret || process.env.CAMUNDA_CLIENT_SECRET || process.env.ZEEBE_CLIENT_SECRET,
    authUrl: defaults.authUrl,
    useZbctl: false,
  };

  if (!config.clientId || !config.clientSecret) {
    if (fs.existsSync(CRED_PATH)) {
      config.useZbctl = true;
    } else {
      throw new Error('Missing CAMUNDA_CLIENT_ID/SECRET and no ~/.camunda/credentials found');
    }
  }

  config.zeebeUrl = `https://${config.region}.zeebe.camunda.io/${config.clusterId}`;
  config.tasklistUrl = `https://${config.region}.tasklist.camunda.io/${config.clusterId}`;

  const tokenCache = { zeebe: null, tasklist: null };

  function readZbctlToken() {
    const content = fs.readFileSync(CRED_PATH, 'utf8');
    const tokenMatch = content.match(/accesstoken:\s*(\S+)/);
    const expiryMatch = content.match(/expiry:\s*(\S+)/);
    if (!tokenMatch) throw new Error('No access token in ~/.camunda/credentials');
    const expiry = expiryMatch ? new Date(expiryMatch[1]).getTime() : Date.now() + 3600000;
    return { token: tokenMatch[1], expiresAt: expiry };
  }

  function refreshZbctlToken() {
    const { execSync } = require('child_process');
    try {
      execSync(`/opt/homebrew/bin/zbctl status --address ${config.region}.zeebe.camunda.io:443/${config.clusterId}`, {
        timeout: 15000, stdio: 'pipe',
      });
    } catch { /* zbctl refreshes token even on failure */ }
  }

  async function getToken(audience) {
    if (config.useZbctl) {
      const cached = tokenCache.zeebe;
      if (cached && cached.expiresAt > Date.now() + 60000) return cached.token;
      if (!cached || cached.expiresAt <= Date.now() + 60000) refreshZbctlToken();
      const fresh = readZbctlToken();
      tokenCache.zeebe = fresh;
      tokenCache.tasklist = fresh;
      return fresh.token;
    }

    const key = audience === 'zeebe.camunda.io' ? 'zeebe' : 'tasklist';
    const cached = tokenCache[key];
    if (cached && cached.expiresAt > Date.now()) return cached.token;

    const res = await fetch(config.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        audience,
      }),
    });
    const data = await res.json();
    tokenCache[key] = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
    return data.access_token;
  }

  return { config, getToken };
}

module.exports = { createCamundaAuth };
