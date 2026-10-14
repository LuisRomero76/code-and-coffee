// Verifica que ninguna página se desborde en horizontal, en varios anchos y en modo claro y oscuro.
// Uso: npm run verificar-responsive [-- <slug>]   (sin slug: todos los temas de content/temas)
//
// Levanta su propio servidor Vite en el puerto 5199 (sin el Worker, con CC_SIN_WORKER=1) y lo cierra
// al terminar. No toca el `npm run dev` de Luis. Usa el Chrome instalado (playwright-core, channel chrome).
// Guarda capturas de cada tema en trabajo/temas/<slug>/capturas/ (carpeta ignorada por Git).
// Sale con código 1 si alguna página tiene scrollWidth > clientWidth o elementos que salen del borde.

import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

process.env.CC_SIN_WORKER = '1'
const { createServer } = await import('vite')
const { chromium } = await import('playwright-core')

const RAIZ_WEB = resolve(import.meta.dirname, '..')
const RAIZ = resolve(RAIZ_WEB, '..')
const PUERTO = 5199
const ANCHOS = [320, 360, 390, 430, 590, 768, 900, 1024, 1280]
const TEMAS_UI = ['light', 'dark']

const dirTemas = join(RAIZ_WEB, 'content/temas')
const slugs = process.argv[2]
  ? [process.argv[2]]
  : readdirSync(dirTemas, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)

const rutas = [
  ...slugs.map((s) => ({ ruta: `/temas/${s}`, capturas: s })),
  { ruta: '/' },
  { ruta: '/no-existe' },
  { ruta: '/admin/token-de-prueba' },
]

const servidor = await createServer({
  root: RAIZ_WEB,
  logLevel: 'error',
  server: { port: PUERTO, strictPort: true, host: '127.0.0.1' },
})
await servidor.listen()
const navegador = await chromium.launch({ channel: 'chrome' })

// Se ejecuta dentro de la página: mide el desborde y lista los elementos que salen del borde derecho.
function medir() {
  const doc = document.documentElement
  const ancho = doc.clientWidth
  const recorta = (el) => {
    const s = getComputedStyle(el)
    return ['hidden', 'clip', 'auto', 'scroll'].includes(s.overflowX)
  }
  // Un elemento cuenta solo si ningún ancestro (hasta body) lo recorta.
  const visibleFuera = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (recorta(p)) return false
    }
    return true
  }
  const fuera = []
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.right <= ancho + 0.5) continue
    if (!visibleFuera(el)) continue
    // Solo el elemento más externo: si el padre también sale, se omite el hijo.
    const p = el.parentElement
    if (p && p !== document.body && p.getBoundingClientRect().right > ancho + 0.5 && visibleFuera(p)) continue
    const id = el.id ? `#${el.id}` : ''
    const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : ''
    fuera.push(`${el.tagName.toLowerCase()}${id}${cls} (borde derecho ${Math.round(r.right)}px)`)
  }
  // Texto recortado: un elemento con texto propio que sale de un ancestro con overflow hidden/clip.
  // Ese caso no ensancha la página, pero corta el texto (así se escondía el desborde del hero).
  const cortados = []
  for (const el of document.body.querySelectorAll('*')) {
    const tieneTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!tieneTexto) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0) continue
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX
      if (ox === 'auto' || ox === 'scroll') break // se desplaza por dentro: correcto (bloques de código)
      if (ox !== 'hidden' && ox !== 'clip') continue
      const rp = p.getBoundingClientRect()
      if (r.right > rp.right + 1 || r.left < rp.left - 1) {
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : ''
        cortados.push(`${el.tagName.toLowerCase()}${cls} "${el.textContent.trim().slice(0, 30)}"`)
      }
      break
    }
  }
  const nav = document.querySelector('header, nav')
  const navAncho = nav ? Math.round(nav.getBoundingClientRect().width) : null
  return { scrollWidth: doc.scrollWidth, clientWidth: ancho, fuera: fuera.slice(0, 10), cortados: cortados.slice(0, 10), navAncho }
}

let fallos = 0
let revisiones = 0
try {
  for (const tema of TEMAS_UI) {
    for (const ancho of ANCHOS) {
      const pagina = await navegador.newPage({ viewport: { width: ancho, height: 900 } })
      await pagina.addInitScript((t) => {
        try { localStorage.setItem('cc-theme', t) } catch {}
      }, tema)
      for (const { ruta, capturas } of rutas) {
        await pagina.goto(`http://127.0.0.1:${PUERTO}${ruta}`, { waitUntil: 'networkidle' })
        await pagina.waitForTimeout(250)
        const m = await pagina.evaluate(medir)
        revisiones++
        const navOk = m.navAncho === null || m.navAncho === m.clientWidth
        const ok = m.scrollWidth <= m.clientWidth && m.fuera.length === 0 && m.cortados.length === 0 && navOk
        if (!ok) {
          fallos++
          console.log(`✗ ${ruta} ${ancho}px ${tema}: scrollWidth ${m.scrollWidth}, clientWidth ${m.clientWidth}, barra ${m.navAncho}px`)
          for (const f of m.fuera) console.log(`    fuera del borde: ${f}`)
          for (const c of m.cortados) console.log(`    texto cortado: ${c}`)
        }
        if (capturas) {
          const dir = join(RAIZ, 'trabajo/temas', capturas, 'capturas')
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
          await pagina.screenshot({ path: join(dir, `${ancho}-${tema}.png`), fullPage: true })
        }
      }
      await pagina.close()
    }
  }
} finally {
  await navegador.close()
  await servidor.close()
}

console.log(
  fallos === 0
    ? `✓ responsive: ${revisiones} combinaciones sin desborde (${rutas.length} rutas × ${ANCHOS.length} anchos × claro/oscuro)`
    : `✗ responsive: ${fallos} de ${revisiones} combinaciones con desborde`,
)
process.exit(fallos === 0 ? 0 : 1)
