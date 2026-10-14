// Chequea cada tema.json antes de mostrarlo a Luis.
// Uso: npm run chequear-tema [-- <slug>]
//
// - JSON válido y conforme a src/types.ts (mismos campos, tipos y valores permitidos; sin campos inventados).
// - Sin valores copiados del ejemplo de references/tema-json.md (llevan la marca EJEMPLO).
// - Campos opcionales que Luis debe confirmar (serie): se avisa.
// - mokaDice.paso apunta a un paso que existe.
// - Los ids de las secciones de TemaView.vue coinciden con los del índice lateral.
// - Cada paso con probado:true tiene evidencia en trabajo/temas/<slug>/investigacion.md,
//   sección "Pruebas locales", con una línea que mencione "Paso N".
// Sale con código 1 si hay errores; los avisos no hacen fallar.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { RAIZ, RAIZ_WEB, rutaTema, slugsPedidos } from './lib-temas.mjs'

// Esquema de src/types.ts (interface Tema). Si cambia types.ts, cambia esto en el mismo commit.
const str = { tipo: 'string' }
const num = { tipo: 'number' }
const bool = { tipo: 'boolean' }
const lista = (de) => ({ tipo: 'array', de })
const enumera = (...valores) => ({ tipo: 'string', valores })
const obj = (campos, opcionales = []) => ({ tipo: 'object', campos, opcionales })

const ESQUEMA = obj(
  {
    slug: str,
    estado: enumera('borrador', 'pagina-aprobada', 'video-listo', 'publicado'),
    fecha: str,
    serie: obj({ nombre: str, parte: num, total: num }),
    hero: obj({ migas: str, titulo: str, subtitulo: str, intro: str, duracion: str, tueste: num, tarjetas: lista(str) }),
    secciones: obj(
      {
        queEs: lista(str),
        requisitos: lista(str),
        pasos: lista(
          obj(
            {
              titulo: str,
              texto: str,
              codigo: obj({ archivo: str, lenguaje: str, contenido: str }),
              probado: bool,
            },
            ['codigo', 'probado'],
          ),
        ),
        mokaDice: obj({ paso: num, texto: str }),
        errores: lista(obj({ problema: str, solucion: str })),
        resumen: str,
      },
      ['mokaDice'],
    ),
    miniatura: obj({
      titulo: str,
      resaltado: str,
      etiqueta: str,
      variante: enumera('t1', 't2', 't3'),
      moka: obj({ expresion: enumera('happy', 'wow'), pose: enumera('wave', 'point', 'rest') }),
      tarjeta: str,
    }),
    fuentes: lista(str),
  },
  ['serie'],
)

function validar(valor, esquema, ruta, errores) {
  if (esquema.tipo === 'array') {
    if (!Array.isArray(valor)) return errores.push(`${ruta}: debe ser una lista`)
    valor.forEach((v, i) => validar(v, esquema.de, `${ruta}[${i}]`, errores))
    return
  }
  if (esquema.tipo === 'object') {
    if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return errores.push(`${ruta}: debe ser un objeto`)
    for (const k of Object.keys(valor)) {
      if (!(k in esquema.campos)) errores.push(`${ruta}.${k}: campo que no existe en types.ts (no inventes campos)`)
    }
    for (const [k, sub] of Object.entries(esquema.campos)) {
      if (!(k in valor)) {
        if (!esquema.opcionales.includes(k)) errores.push(`${ruta}.${k}: falta (es obligatorio)`)
        continue
      }
      validar(valor[k], sub, `${ruta}.${k}`, errores)
    }
    return
  }
  if (typeof valor !== esquema.tipo) return errores.push(`${ruta}: debe ser ${esquema.tipo}`)
  if (esquema.valores && !esquema.valores.includes(valor)) errores.push(`${ruta}: "${valor}" no es válido (${esquema.valores.join(', ')})`)
  if (esquema.tipo === 'string' && !valor.trim()) errores.push(`${ruta}: está vacío`)
  if (esquema.tipo === 'string' && /EJEMPLO/.test(valor)) errores.push(`${ruta}: copiado del ejemplo del formato ("${valor.slice(0, 40)}")`)
}

/** Ids de <section id> de TemaView.vue frente a los ids del índice lateral. */
function chequearIndice(errores) {
  const vista = readFileSync(join(RAIZ_WEB, 'src/views/TemaView.vue'), 'utf8')
  const indice = [...vista.matchAll(/\{\s*id:\s*'([^']+)'/g)].map((m) => m[1])
  const secciones = [...vista.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1])
  if (indice.join() !== secciones.join()) {
    errores.push(`TemaView.vue: índice [${indice.join(', ')}] ≠ secciones [${secciones.join(', ')}]`)
  }
}

/** Texto de la sección "Pruebas locales" (y sus subsecciones) de investigacion.md. */
function pruebasLocales(slug) {
  const archivo = join(RAIZ, 'trabajo/temas', slug, 'investigacion.md')
  if (!existsSync(archivo)) return null
  const md = readFileSync(archivo, 'utf8')
  const inicio = md.search(/^## Pruebas locales/m)
  if (inicio < 0) return ''
  const resto = md.slice(inicio + 3)
  const fin = resto.search(/^## /m)
  return fin < 0 ? resto : resto.slice(0, fin)
}

let fallos = 0
const erroresIndice = []
chequearIndice(erroresIndice)

for (const slug of slugsPedidos()) {
  const errores = [...erroresIndice]
  const avisos = []
  let tema
  try {
    tema = JSON.parse(readFileSync(rutaTema(slug), 'utf8'))
  } catch (e) {
    console.log(`✗ ${slug}: tema.json no es JSON válido: ${e.message}`)
    fallos++
    continue
  }
  validar(tema, ESQUEMA, 'tema', errores)

  if (tema.slug !== slug) errores.push(`tema.slug "${tema.slug}" no coincide con la carpeta "${slug}"`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tema.fecha ?? '')) errores.push('tema.fecha: usa el formato AAAA-MM-DD')
  if (tema.serie) avisos.push('tema.serie está presente: es opcional y solo va si Luis la definió. Confírmalo.')
  for (const f of tema.fuentes ?? []) if (!/^https:\/\//.test(f)) errores.push(`tema.fuentes: "${f}" no es una URL https`)

  const pasos = tema.secciones?.pasos ?? []
  const md = tema.secciones?.mokaDice
  if (md && (md.paso < 1 || md.paso > pasos.length)) errores.push(`mokaDice.paso ${md.paso} no existe (hay ${pasos.length} pasos)`)

  const pruebas = pruebasLocales(slug)
  pasos.forEach((p, i) => {
    if (p.probado !== true) {
      avisos.push(`Paso ${i + 1} ("${p.titulo}") sin probar: va a la lista "Pruebas que debe hacer Luis".`)
      return
    }
    if (pruebas === null) return errores.push(`Paso ${i + 1}: probado:true pero no existe trabajo/temas/${slug}/investigacion.md`)
    if (!new RegExp(`Paso ${i + 1}\\b`).test(pruebas)) {
      errores.push(`Paso ${i + 1}: probado:true sin evidencia en investigacion.md ("## Pruebas locales" debe mencionar "Paso ${i + 1}" con fecha, versión y resultado)`)
    }
  })

  if (errores.length) fallos++
  console.log(`${errores.length ? '✗' : '✓'} ${slug}: ${errores.length} errores, ${avisos.length} avisos`)
  for (const e of errores) console.log(`    error: ${e}`)
  for (const a of avisos) console.log(`    aviso: ${a}`)
}
process.exit(fallos ? 1 : 0)
