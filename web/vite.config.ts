import vue from '@vitejs/plugin-vue'
import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig, type Plugin } from 'vite'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const RAIZ = import.meta.dirname
const DIR_TEMAS = resolve(RAIZ, 'content/temas')
const ARCHIVO_WORKER = resolve(RAIZ, 'worker/temas.generated.ts')

interface TemaCrudo {
  slug: string
  estado: string
  fecha: string
  hero?: { titulo?: string }
  [clave: string]: unknown
}

/** Lee todos los content/temas/<slug>/tema.json. */
function leerTemas(): TemaCrudo[] {
  if (!existsSync(DIR_TEMAS)) return []
  return readdirSync(DIR_TEMAS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(DIR_TEMAS, d.name, 'tema.json')))
    .map((d) => {
      const archivo = join(DIR_TEMAS, d.name, 'tema.json')
      const tema = JSON.parse(readFileSync(archivo, 'utf8')) as TemaCrudo
      if (tema.slug !== d.name) {
        throw new Error(`[temas] ${archivo}: el slug "${tema.slug}" no coincide con la carpeta "${d.name}"`)
      }
      return tema
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
}

/** Resumen para el panel de administración (slug, título, estado y fecha). */
function resumenAdmin(temas: TemaCrudo[]) {
  return temas.map((t) => ({ slug: t.slug, titulo: t.hero?.titulo ?? t.slug, estado: t.estado, fecha: t.fecha }))
}

/** Lee ADMIN_TOKEN de .dev.vars (archivo local ignorado por Git). */
function tokenLocal(): string | null {
  const archivo = resolve(RAIZ, '.dev.vars')
  if (!existsSync(archivo)) return null
  const linea = readFileSync(archivo, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith('ADMIN_TOKEN='))
  const valor = linea?.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '')
  return valor || null
}

/**
 * Módulo virtual `virtual:temas`.
 * - `vite` (serve): todos los temas, incluidos borradores.
 * - build (`cf build` delega en `vite build`): solo los temas con estado "publicado".
 *   Los borradores no llegan a .cloudflare/output/v0/workers/default/assets/.
 * En dev y en build genera worker/temas.generated.ts con el listado completo para el panel
 * (el plugin de Cloudflare ejecuta el Worker también en dev, así que el archivo debe existir).
 */
function temasPlugin(): Plugin {
  const ID = 'virtual:temas'
  const ID_RESUELTO = '\0' + ID
  let comando: 'serve' | 'build' = 'serve'

  return {
    name: 'code-and-coffee-temas',
    configResolved(config) {
      comando = config.command
    },
    buildStart() {
      for (const t of leerTemas()) this.addWatchFile(join(DIR_TEMAS, t.slug, 'tema.json'))
      const contenido =
        '// Generado por vite.config.ts en dev y en cada build. No editar a mano.\n' +
        '// Listado de TODOS los temas para el panel de administración (no es un archivo público).\n' +
        `export const TEMAS_ADMIN = ${JSON.stringify(resumenAdmin(leerTemas()), null, 2)} as const\n`
      // Solo se escribe si cambia, para no disparar recargas del Worker en dev.
      if (!existsSync(ARCHIVO_WORKER) || readFileSync(ARCHIVO_WORKER, 'utf8') !== contenido) {
        writeFileSync(ARCHIVO_WORKER, contenido)
      }
    },
    resolveId(id) {
      if (id === ID) return ID_RESUELTO
    },
    load(id) {
      if (id !== ID_RESUELTO) return
      const todos = leerTemas()
      const temas = comando === 'build' ? todos.filter((t) => t.estado === 'publicado') : todos
      return `export const temas = ${JSON.stringify(temas)}\nexport const modoDev = ${comando === 'serve'}\n`
    },
    configureServer(server) {
      server.watcher.add(DIR_TEMAS)
      const recargar = (archivo: string) => {
        if (!archivo.replace(/\\/g, '/').includes('/content/temas/')) return
        const mod = server.moduleGraph.getModuleById(ID_RESUELTO)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('change', recargar)
      server.watcher.on('add', recargar)
      server.watcher.on('unlink', recargar)

      // Imita GET /api/admin del Worker en local, con el token de .dev.vars.
      server.middlewares.use('/api/admin', (req, res) => {
        const token = tokenLocal()
        const auth = req.headers.authorization ?? ''
        if (req.method !== 'GET' || !token || auth !== `Bearer ${token}`) {
          res.statusCode = 404
          res.end('Not found')
          return
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ temas: resumenAdmin(leerTemas()) }))
      })
    },
  }
}

export default defineConfig({
  // cloudflare() lee cloudflare.config.ts y genera el Build Output que usan `cf build` y `cf deploy`.
  // CC_SIN_WORKER=1 lo omite: lo usan los scripts de verificación para levantar un servidor propio
  // sin el Worker, así no compiten con el `npm run dev` de Luis por .cloudflare/state.
  plugins: [vue(), temasPlugin(), ...(process.env.CC_SIN_WORKER ? [] : [cloudflare()])],
})
