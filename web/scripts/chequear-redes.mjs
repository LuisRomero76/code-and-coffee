// Chequea el short vertical, el carrusel y los textos de publicación de un tema.
// Uso: npm run chequear-redes [-- <slug>]
//
// - Short (video/temas/<slug>/short/guion.json): vertical, empieza con "gancho" y termina con "cierre",
//   110-230 palabras narradas (≈45-90 s), no dice ningún dominio ni URL en la narración, invita al
//   video completo (YouTube o Facebook) y a la página, y su duración medida con los audios (si existen).
// - Carrusel (video/temas/<slug>/carrusel.json): 6-10 slides, portada primero y cierre al final, textos cortos,
//   y los PNG exportados en video/salida/<slug>-carrusel/ miden 1080x1350.
// - Publicación (video/temas/<slug>/publicacion.json): campos de YouTube, Facebook, TikTok e Instagram con sus límites.
//   {URL} (página del tema) y {URL_VIDEO} (video completo en YouTube) se reemplazan al publicar con
//   node video/plantilla/textos.mjs <slug>. El video completo lleva {URL}; los shorts, {URL} y {URL_VIDEO}.
// Sale con código 1 si hay errores; los avisos no hacen fallar.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { RAIZ, slugsPedidos } from './lib-temas.mjs'

const palabras = (t) => String(t ?? '').split(/\s+/).filter(Boolean).length
const BYTES_POR_SEG = 6000 // Edge TTS entrega MP3 a 48 kbps constantes
const hashtags = (t) => (String(t).match(/#\p{L}[\p{L}\p{N}_]*/gu) ?? []).length

function chequearShort(slug, errores, avisos) {
  const dir = join(RAIZ, 'video/temas', slug, 'short')
  const archivo = join(dir, 'guion.json')
  if (!existsSync(archivo)) return errores.push('short: falta video/temas/' + slug + '/short/guion.json')
  const g = JSON.parse(readFileSync(archivo, 'utf8'))
  if (g.formato !== 'vertical') errores.push(`short: formato "${g.formato}" (debe ser vertical)`)
  const esc = g.escenas ?? []
  if (esc.length < 4 || esc.length > 8) errores.push(`short: ${esc.length} escenas (entre 4 y 8)`)
  if (esc[0]?.tipo !== 'gancho') errores.push('short: la primera escena debe ser "gancho"')
  if (esc.at(-1)?.tipo !== 'cierre') errores.push('short: la última escena debe ser "cierre"')
  const total = esc.reduce((a, e) => a + palabras(e.narracion), 0)
  if (total < 110 || total > 230) errores.push(`short: ${total} palabras narradas (110-230, unos 45-90 s)`)
  const narr = esc.map((e) => e.narracion ?? '').join(' ')
  if (/https?:|www\.|\.(com|dev|app|io|net|org)\b/i.test(narr)) errores.push('short: la narración dice un dominio o URL (el dominio no está definido)')
  const cierre = esc.at(-1)?.narracion ?? ''
  if (!/youtube|facebook/i.test(cierre)) errores.push('short: el cierre debe invitar al video completo en YouTube o Facebook')
  if (!/p[aá]gina/i.test(cierre)) errores.push('short: el cierre debe invitar a visitar la página del tema')
  if (g.subtitulos === false) avisos.push('short: sin subtítulos (en shorts conviene tenerlos: muchos ven sin sonido)')

  const audio = join(dir, 'audio')
  const mp3 = existsSync(audio) ? readdirSync(audio).filter((f) => f.endsWith('.mp3')) : []
  if (mp3.length !== esc.length) return avisos.push(`short: ${mp3.length} audios para ${esc.length} escenas; genera con node video/plantilla/audio.mjs ${slug} short`)
  const seg = mp3.reduce((a, f) => a + statSync(join(audio, f)).size / BYTES_POR_SEG, 0) + esc.length * 0.8
  if (seg < 40 || seg > 100) errores.push(`short: dura ≈${Math.round(seg)} s (entre 40 y 100)`)
  if (!existsSync(join(dir, 'index.html'))) errores.push(`short: falta index.html; ejecuta node video/plantilla/generar.mjs ${slug} short`)
  return Math.round(seg)
}

function chequearCarrusel(slug, errores, avisos) {
  const archivo = join(RAIZ, 'video/temas', slug, 'carrusel.json')
  if (!existsSync(archivo)) return errores.push('carrusel: falta video/temas/' + slug + '/carrusel.json')
  const c = JSON.parse(readFileSync(archivo, 'utf8'))
  const s = c.slides ?? []
  if (s.length < 6 || s.length > 10) errores.push(`carrusel: ${s.length} slides (entre 6 y 10)`)
  if (s[0]?.tipo !== 'portada') errores.push('carrusel: el primer slide debe ser "portada"')
  if (s.at(-1)?.tipo !== 'cierre') errores.push('carrusel: el último slide debe ser "cierre"')
  s.forEach((sl, i) => {
    const t = sl.titulo ?? sl.problema
    if (t && palabras(t) > 8) errores.push(`carrusel: slide ${i + 1}, el título tiene ${palabras(t)} palabras (máximo 8)`)
    const cuerpo = sl.texto ?? sl.solucion
    if (cuerpo && palabras(cuerpo) > 45) errores.push(`carrusel: slide ${i + 1}, el texto tiene ${palabras(cuerpo)} palabras (máximo 45)`)
  })
  const dir = join(RAIZ, 'video/salida', slug + '-carrusel')
  const png = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.png')).sort() : []
  if (png.length !== s.length) return errores.push(`carrusel: ${png.length} imágenes para ${s.length} slides; ejecuta node video/plantilla/carrusel.mjs ${slug}`)
  for (const f of png) {
    const b = readFileSync(join(dir, f))
    const [w, h] = [b.readUInt32BE(16), b.readUInt32BE(20)]
    if (w !== 1080 || h !== 1350) errores.push(`carrusel: ${f} mide ${w}x${h} (debe ser 1080x1350)`)
  }
}

function chequearPublicacion(slug, errores, avisos) {
  const archivo = join(RAIZ, 'video/temas', slug, 'publicacion.json')
  if (!existsSync(archivo)) return errores.push('publicación: falta video/temas/' + slug + '/publicacion.json')
  const p = JSON.parse(readFileSync(archivo, 'utf8'))
  // Largo real del texto ya con las URLs puestas (la del sitio sale de video/plantilla/sitio.json).
  const archivoSitio = join(RAIZ, 'video/plantilla/sitio.json')
  const sitio = existsSync(archivoSitio) ? JSON.parse(readFileSync(archivoSitio, 'utf8')).sitio : 'https://ejemplo.workers.dev'
  const largo = (t) => t.replaceAll('{URL}', `${sitio}/temas/${slug}`).replaceAll('{URL_VIDEO}', 'https://youtu.be/XXXXXXXXXXX').length
  const pide = (ruta, texto, ...marcas) => { for (const m of marcas) if (!texto.includes(m)) errores.push(`publicación: ${ruta} debe incluir ${m}`) }
  if (!p.urlVideo) avisos.push('publicación: "urlVideo" está vacío; llénalo cuando subas el video completo a YouTube y ejecuta node video/plantilla/textos.mjs ' + slug)
  const ex = (ruta, v) => (v === undefined || v === '' ? (errores.push(`publicación: falta ${ruta}`), false) : true)
  const yt = p.youtube ?? {}
  if (ex('youtube.titulo', yt.titulo) && yt.titulo.length > 100) errores.push(`publicación: youtube.titulo mide ${yt.titulo.length} caracteres (máximo 100)`)
  if (ex('youtube.descripcion', yt.descripcion) && !yt.descripcion.includes('{URL}')) errores.push('publicación: youtube.descripcion debe incluir {URL}')
  if (!Array.isArray(yt.etiquetas) || yt.etiquetas.length < 3 || yt.etiquetas.length > 12) errores.push('publicación: youtube.etiquetas debe tener entre 3 y 12')
  // Reglas de Luis: el video completo (YouTube y Facebook) lleva la página del tema ({URL});
  // los shorts (Facebook, TikTok, Reel) llevan la página ({URL}) y el video completo ({URL_VIDEO}).
  if (ex('facebook.video', p.facebook?.video)) pide('facebook.video', p.facebook.video, '{URL}')
  if (ex('facebook.short', p.facebook?.short)) pide('facebook.short', p.facebook.short, '{URL}', '{URL_VIDEO}')
  const tt = p.tiktok?.texto
  if (ex('tiktok.texto', tt)) {
    if (largo(tt) > 400) errores.push(`publicación: tiktok.texto mide ${largo(tt)} caracteres con las URLs puestas (máximo 400)`)
    if (hashtags(tt) > 5) errores.push('publicación: tiktok.texto tiene más de 5 hashtags')
    pide('tiktok.texto', tt, '{URL}', '{URL_VIDEO}')
  }
  const ig = p.instagram ?? {}
  if (ex('instagram.reel', ig.reel)) {
    if (largo(ig.reel) > 2200) errores.push(`publicación: instagram.reel mide ${largo(ig.reel)} caracteres con las URLs puestas (máximo 2200)`)
    if (hashtags(ig.reel) > 10) errores.push('publicación: instagram.reel tiene más de 10 hashtags')
    pide('instagram.reel', ig.reel, '{URL}', '{URL_VIDEO}')
  }
  if (ex('instagram.carrusel', ig.carrusel)) {
    if (largo(ig.carrusel) > 2200) errores.push(`publicación: instagram.carrusel mide ${largo(ig.carrusel)} caracteres con las URLs puestas (máximo 2200)`)
    if (hashtags(ig.carrusel) > 10) errores.push('publicación: instagram.carrusel tiene más de 10 hashtags')
    pide('instagram.carrusel', ig.carrusel, '{URL}')
  }
  // Las URLs reales no se escriben a mano en los textos: se usan {URL} y {URL_VIDEO} (urlVideo sí es una URL).
  const { urlVideo, ...textos } = p
  if (/https?:\/\//i.test(JSON.stringify(textos))) errores.push('publicación: hay una URL escrita a mano; usa {URL} y {URL_VIDEO}')
  if (urlVideo && !/^https:\/\//.test(urlVideo)) errores.push('publicación: urlVideo debe ser una URL https')
}

let fallos = 0
for (const slug of slugsPedidos()) {
  const errores = []
  const avisos = []
  let seg
  for (const f of [() => (seg = chequearShort(slug, errores, avisos)), () => chequearCarrusel(slug, errores, avisos), () => chequearPublicacion(slug, errores, avisos)]) {
    try { f() } catch (e) { errores.push(`no se pudo leer un archivo: ${e.message}`) }
  }
  if (errores.length) fallos++
  console.log(`${errores.length ? '✗' : '✓'} ${slug}: redes${typeof seg === 'number' ? ` (short ≈${seg} s)` : ''}, ${errores.length} errores, ${avisos.length} avisos`)
  for (const e of errores) console.log(`    error: ${e}`)
  for (const a of avisos) console.log(`    aviso: ${a}`)
}
process.exit(fallos ? 1 : 0)
