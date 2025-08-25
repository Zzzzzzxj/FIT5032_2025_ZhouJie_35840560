// functions/api/health.js
export function onRequestGet() {
    return new Response(JSON.stringify({
      ok: true,
      route: '/api/health',
      ts: new Date().toISOString()
    }), { headers: { 'Content-Type': 'application/json' } })
  }
  