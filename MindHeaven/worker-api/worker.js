// worker.js —— 原生 fetch 调用 Resend（无需第三方依赖）
// 需要在 Worker Secrets 中配置：RESEND_API_KEY, FROM_EMAIL

function buildCorsHeaders(request) {
    const origin = request.headers.get('Origin') || '*';
    return {
      'Access-Control-Allow-Origin': origin, // 回显来源更稳
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
  
      // 1) CORS 预检
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors });
      }
  
      // 2) 健康检查
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return json({ ok: true, where: 'workers.dev', ts: new Date().toISOString() }, 200, cors);
      }
  
      // 3) 调试：查看 env 是否可读（部署调通后可以删除该路由）
      if (url.pathname === '/api/debug-env' && request.method === 'GET') {
        const key = env?.RESEND_API_KEY || '';
        const from = env?.FROM_EMAIL || '';
        return json(
          {
            hasKey: Boolean(key),
            keyPrefix: key ? key.slice(0, 3) : null, // 期望是 "re_"
            from,
          },
          200,
          cors
        );
      }
  
      // 4) 发送邮件：POST /api/email
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
  
          // 调 Resend
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: FROM_EMAIL,                                 // 建议先用: "MindHaven <onboarding@resend.dev>"
              to: Array.isArray(to) ? to : [to],
              subject,
              html,
              attachments: attachments.map(a => ({
                filename: a.filename,
                content: a.content,                             // base64 内容
              })),
            }),
          });
  
          // 读取 Resend 的原始返回方便排错
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
  
      // 5) 兜底
      return new Response('Not Found', { status: 404, headers: cors });
    },
  };
  