// /functions/claude-chat.ts
// POST { text, system?, model?, temperature?, max_tokens? } -> streams SSE back

export const onRequestPost: PagesFunction<{ ANTHROPIC_API_KEY: string }> = async (ctx) => {
  const { request, env } = ctx;
  const { text, system, model, temperature, max_tokens } = await request.json();

  if (!text || typeof text !== "string") {
    return new Response("Bad request: { text } required", { status: 400 });
  }

  const sys = (system ?? "Be concise, accurate, and actionable. No smalltalk.").trim();

  const payload = {
    model: model ?? "claude-3-5-sonnet-20240620",
    system: sys,
    temperature: typeof temperature === "number" ? temperature : 0.2,
    max_tokens: typeof max_tokens === "number" ? max_tokens : 600,
    messages: [{ role: "user", content: text }],
    stream: true
  };

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(payload),
    keepalive: true
  });

  if (!upstream.ok || !upstream.body) {
    const msg = await upstream.text().catch(() => "");
    return new Response(`Claude upstream error: ${upstream.status}\n${msg}`, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("retry: 0\n")); // flush ASAP
      const reader = upstream.body!.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Normalize upstream NDJSON into text/event-stream frames
          for (const line of chunk.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            controller.enqueue(encoder.encode(`data: ${trimmed}\n\n`));
          }
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${e?.message || "stream error"}\n\n`));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive"
    }
  });
};
