// functions/api/email.js
// Cloudflare Pages Function: POST /api/email
// 不用 Resend SDK，直接 HTTP 调用，避免 @react-email/render 打包报错

export const onRequestPost = async ({ request, env }) => {
  try {
    const { RESEND_API_KEY, FROM_EMAIL } = env || {}
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      return json({ ok: false, error: 'Missing RESEND_API_KEY or FROM_EMAIL' }, 500)
    }

    const { to, subject, html, attachments } = await safeJson(request)
    if (!to || !subject || !html) {
      return json({ ok: false, error: 'Missing to/subject/html' }, 400)
    }

    // Resend HTTP API
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,                         // e.g. 'MindHaven <noreply@your-domain.com>'
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        // 附件：[{ filename, content (base64) }]
        attachments: (attachments || []).map(a => ({
          filename: a.filename,
          content: a.content
        }))
      })
    })

    // Resend API 返回 JSON（含 id/错误等）
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return json({ ok: false, error: data?.message || `Resend ${resp.status}` }, resp.status)
    }
    return json({ ok: true, id: data?.id || null }, 200)
  } catch (e) {
    return json({ ok: false, error: e?.message || 'Unknown error' }, 500)
  }
}

// ---------- helpers ----------
async function safeJson(req) {
  try { return await req.json() } catch { return {} }
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
