function buildCorsHeaders(request) {
    const origin = request.headers.get('Origin') || '*';
    return {
      'Access-Control-Allow-Origin': origin, 
      'Vary': 'Origin',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400',
    };
  }
  
  const json = (obj, status = 200, headers = {}) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  
  export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const cors = buildCorsHeaders(request);

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
      }

      if (url.pathname === '/api/health' && request.method === 'GET') {
        return json({ ok: true, where: 'workers.dev', ts: new Date().toISOString() }, 200, cors);
      }

      if (url.pathname === '/api/debug-env' && request.method === 'GET') {
        const key = env?.RESEND_API_KEY || '';
        const from = env?.FROM_EMAIL || '';
        return json(
          {
            hasKey: Boolean(key),
            keyPrefix: key ? key.slice(0, 3) : null, 
            from,
          },
          200,
          cors
        );
      }

      if (url.pathname === '/api/email' && request.method === 'POST') {
        try {
          const { RESEND_API_KEY, FROM_EMAIL } = env || {};
          if (!RESEND_API_KEY || !FROM_EMAIL) {
            return json({ ok: false, error: 'Missing RESEND_API_KEY or FROM_EMAIL' }, 500, cors);
          }
  
          const body = await request.json().catch(() => ({}));
          const { to, subject, html, attachments = [] } = body;
          if (!to || !subject || !html) {
            return json({ ok: false, error: 'Missing to/subject/html' }, 400, cors);
          }
 
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: FROM_EMAIL,                                 
              to: Array.isArray(to) ? to : [to],
              subject,
              html,
              attachments: attachments.map(a => ({
                filename: a.filename,
                content: a.content,                             
              })),
            }),
          });

          const raw = await resp.text();
          let data;
          try { data = JSON.parse(raw) } catch { data = null }
  
          if (!resp.ok) {
            return json({
              ok: false,
              status: resp.status,
              error: data?.message || `Resend ${resp.status}`,
              raw,
            }, resp.status, cors);
          }
  
          return json({ ok: true, id: data?.id ?? null }, 200, cors);
        } catch (e) {
          return json({ ok: false, error: e?.message || 'Unknown error' }, 500, cors);
        }
      }

      return new Response('Not Found', { status: 404, headers: cors });
    },
  };
  