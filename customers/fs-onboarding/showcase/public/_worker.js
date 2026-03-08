export default {
  async fetch(request, env) {
    const PROXY_SECRET = env.PROXY_SECRET;
    const AUTH_DOMAIN = "https://showcase.agentic-innovations.com";

    const authHeader = request.headers.get("X-SLA-Auth-Proxy");
    if (authHeader !== PROXY_SECRET) {
      const url = new URL(request.url);
      const redirectUrl = new URL(url.pathname + url.search, AUTH_DOMAIN);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    return env.ASSETS.fetch(request);
  }
};
