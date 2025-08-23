import { Resend } from 'resend'

export const onRequestPost: PagesFunction = async (ctx) => {
  try {
    const { RESEND_API_KEY, FROM_EMAIL } = ctx.env as any
    if (!RESEND_API_KEY || !FROM_EMAIL) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing RESEND_API_KEY or FROM_EMAIL' }), { status: 500 })
    }

    const payload = await ctx.request.json()
    const { to, subject, html, attachments } = payload || {}

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing to/subject/html' }), { status: 400 })
    }

    const resend = new Resend(RESEND_API_KEY)

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments: (attachments || []).map((a: any) => ({
        filename: a.filename,
        content: a.content // base64
      }))
    })

    return new Response(JSON.stringify({ ok: true, id: result?.data?.id ?? null }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Unknown error' }), { status: 500 })
  }
}
