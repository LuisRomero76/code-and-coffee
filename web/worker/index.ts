// Worker de Cloudflare para Code & Coffee.
// - Sirve los archivos estáticos de dist/ (binding ASSETS).
// - GET /api/admin: listado de TODOS los temas (incluidos borradores) para el panel.
//   Requiere "Authorization: Bearer <ADMIN_TOKEN>". Si no coincide, responde 404.
// El token es un secreto del Worker (ADMIN_TOKEN). En local va en web/.dev.vars (ignorado por Git).
// Nunca usar una variable VITE_... para el token.
import { TEMAS_ADMIN } from './temas.generated'

interface Env {
  ADMIN_TOKEN?: string
  ASSETS: { fetch(request: Request): Promise<Response> }
}

const noEncontrado = () => new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } })

/** Comparación en tiempo constante para no filtrar el token por tiempos de respuesta. */
function iguales(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a)
  const eb = new TextEncoder().encode(b)
  let diff = ea.length ^ eb.length
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0)
  return diff === 0
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/admin') {
      if (request.method !== 'GET' || !env.ADMIN_TOKEN) return noEncontrado()
      const auth = request.headers.get('Authorization') ?? ''
      if (!iguales(auth, `Bearer ${env.ADMIN_TOKEN}`)) return noEncontrado()
      return Response.json(
        { temas: TEMAS_ADMIN },
        { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
      )
    }
    if (url.pathname.startsWith('/api/')) return noEncontrado()

    const respuesta = await env.ASSETS.fetch(request)
    if (url.pathname.startsWith('/admin/')) {
      const r = new Response(respuesta.body, respuesta)
      r.headers.set('X-Robots-Tag', 'noindex, nofollow')
      r.headers.set('Cache-Control', 'no-store')
      return r
    }
    return respuesta
  },
}
