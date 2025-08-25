// functions/api/email.js
// Cloudflare Pages Function: POST /api/email
// 纯 fetch 调用 Resend，避免打包 @react-email/render

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

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,                       // e.g. "MindHaven <onboarding@resend.dev>"
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments: (attachments || []).map(a => ({
          filename: a.filename,
          content: a.content                    // base64
        }))
      })
    })

    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return json({ ok: false, error: data?.message || `Resend ${resp.status}` }, resp.status)
    }
    return json({ ok: true, id: data?.id || null })
  } catch (e) {
    return json({ ok: false, error: e?.message || 'Unknown error' }, 500)
  }
}

// helpers
async function safeJson(req) { try { return await req.json() } catch { return {} } }
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } })
}
