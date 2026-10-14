// Comprueba que el build de producción no publique borradores ni el token del panel.
// Uso: npm run chequear-publico   (ejecuta antes `npm run build`)
//
// - Sitio público: web/.cloudflare/output/v0/workers/default/assets/
//   Ningún tema que no esté "publicado" puede aparecer ahí (slug, título ni texto).
// - El token del panel (ADMIN_TOKEN de web/.dev.vars, si existe) no puede aparecer en ninguna parte de la salida.
// - Que el slug de un borrador aparezca en bundle/index.js es ESPERADO: es el listado del panel,
//   que el Worker solo devuelve con el token. Se informa, no es un error.
// Sale con código 1 si hay fugas o si la salida es más vieja que algún tema.json.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { RAIZ_WEB, SALIDA, leerTema, rutaTema, slugsPedidos } from './lib-temas.mjs'

const ASSETS = join(SALIDA, 'assets')
const BUNDLE = join(SALIDA, 'bundle')

if (!existsSync(ASSETS)) {
  console.log(`✗ No existe ${relative(RAIZ_WEB, ASSETS)}. Ejecuta primero: npm run build`)
  process.exit(1)
}

function archivos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? archivos(join(dir, d.name)) : [join(dir, d.name)],
  )
}
const leer = (lista) => lista.map((f) => ({ f, texto: readFileSync(f, 'latin1') }))
const publicos = leer(archivos(ASSETS))
const bundle = existsSync(BUNDLE) ? leer(archivos(BUNDLE)) : []
const enLatin1 = (s) => Buffer.from(s, 'utf8').toString('latin1')
const buscar = (lista, aguja) => lista.filter((x) => x.texto.includes(enLatin1(aguja))).map((x) => relative(SALIDA, x.f))

const errores = []
const info = []

// La salida debe ser posterior a todos los tema.json; si no, el chequeo revisaría un build viejo.
// Se usa el archivo más reciente: los de public/ se copian conservando su fecha original.
const fechaSalida = Math.max(...publicos.map((x) => statSync(x.f).mtimeMs))
for (const slug of slugsPedidos()) {
  if (statSync(rutaTema(slug)).mtimeMs > fechaSalida) {
    errores.push(`La salida es anterior a content/temas/${slug}/tema.json. Ejecuta npm run build y repite.`)
  }
}

for (const slug of slugsPedidos()) {
  const tema = leerTema(slug)
  if (tema.estado === 'publicado') continue
  const agujas = [slug, tema.hero?.titulo, tema.secciones?.resumen?.slice(0, 50)].filter((a) => a && a.length >= 6)
  for (const a of agujas) {
    const donde = buscar(publicos, a)
    if (donde.length) errores.push(`Borrador "${slug}" visible en el sitio público ("${a.slice(0, 30)}…" en ${donde.join(', ')})`)
  }
  if (buscar(bundle, slug).length) info.push(`"${slug}" (${tema.estado}) está en bundle/index.js: esperado, es el listado del panel protegido con el token.`)
}

const devVars = join(RAIZ_WEB, '.dev.vars')
if (existsSync(devVars)) {
  const token = readFileSync(devVars, 'utf8').match(/^\s*ADMIN_TOKEN\s*=\s*["']?([^"'\r\n]+)/m)?.[1]
  if (token) {
    const donde = [...buscar(publicos, token), ...buscar(bundle, token)]
    if (donde.length) errores.push(`El token del panel aparece en la salida: ${donde.join(', ')}`)
  }
} else {
  info.push('No hay web/.dev.vars: no hay token local que buscar (el secreto de producción vive en Cloudflare).')
}
const vite = buscar(publicos, 'VITE_ADMIN')
if (vite.length) errores.push(`Variable VITE_ADMIN en el JavaScript público: ${vite.join(', ')}`)

console.log(`${errores.length ? '✗' : '✓'} público: ${publicos.length} archivos revisados en assets/, ${errores.length} problemas`)
for (const e of errores) console.log(`    error: ${e}`)
for (const i of info) console.log(`    info: ${i}`)
process.exit(errores.length ? 1 : 0)
