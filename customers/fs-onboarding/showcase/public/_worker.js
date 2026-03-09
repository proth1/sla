export default {
  async fetch(request, env) {
    const PROXY_SECRET = env.PROXY_SECRET;
    const AUTH_DOMAIN = "https://showcase.agentic-innovations.com";

    // Timing-safe proxy secret comparison via SHA-256 digest
    const authHeader = request.headers.get("X-SLA-Auth-Proxy") || "";
    const enc = new TextEncoder();
    const [ha, hb] = await Promise.all([
      crypto.subtle.digest("SHA-256", enc.encode(authHeader)),
      crypto.subtle.digest("SHA-256", enc.encode(PROXY_SECRET)),
    ]);
    const ba = new Uint8Array(ha), bb = new Uint8Array(hb);
    let diff = ba.length ^ bb.length;
    for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ (bb[i] || 0);

    if (diff !== 0) {
      const url = new URL(request.url);
      const redirectUrl = new URL(url.pathname + url.search, AUTH_DOMAIN);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    const response = await env.ASSETS.fetch(request);

    // Add security headers including CSP
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    headers.set("Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://showcase.agentic-innovations.com; " +
      "img-src 'self' data:; " +
      "frame-ancestors 'none';"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
};
