// Proxies chat requests to the Claude API so the API key stays on the server.
// Set ANTHROPIC_API_KEY in Netlify: Site configuration > Environment variables.
const MAX_CHARS = 300000;

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY is not set" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: "Bad JSON" }, { status: 400 }); }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : null;
  const valid = messages && messages.length &&
    messages.every(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
  if (!valid) return Response.json({ error: "Bad messages" }, { status: 400 });
  if (messages.reduce((n, m) => n + m.content.length, 0) > MAX_CHARS)
    return Response.json({ error: "Too long" }, { status: 413 });

  const max_tokens = Math.min(Math.max(Number(body.max_tokens) || 1500, 256), 6000);

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: Netlify.env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
      max_tokens,
      stream: true,
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(await upstream.text(), {
      status: upstream.status === 429 ? 429 : 502,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(upstream.body, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
  });
};

export const config = { path: "/api/ai" };
