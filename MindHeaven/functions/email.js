// functions/email.js
// Cloudflare Pages Function: POST /api/email
// 依赖：npm i resend
import { Resend } from 'resend'

export const onRequestPost = async (ctx) => {
  try {
    const { RESEND_API_KEY, FROM_EMAIL } = ctx.env || {}
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing RESEND_API_KEY or FROM_EMAIL' }), { status: 500 })
    }

    const { to, subject, html, attachments } = await ctx.request.json()

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing to/subject/html' }), { status: 400 })
    }

    const resend = new Resend(RESEND_API_KEY)
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments: (attachments || []).map(a => ({
        filename: a.filename,
        content: a.content // base64
      }))
    })

    return new Response(JSON.stringify({ ok: true, id: result?.data?.id ?? null }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Unknown error' }), { status: 500 })
  }
}
