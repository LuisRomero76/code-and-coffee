// Utilidades compartidas por los scripts de verificación de Code & Coffee.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const RAIZ_WEB = resolve(import.meta.dirname, '..')
export const RAIZ = resolve(RAIZ_WEB, '..')
export const DIR_TEMAS = join(RAIZ_WEB, 'content/temas')
export const SALIDA = join(RAIZ_WEB, '.cloudflare/output/v0/workers/default')

/** Slugs a revisar: el argumento de la línea de comandos o todos los de content/temas. */
export function slugsPedidos() {
  const arg = process.argv.slice(2).find((a) => !a.startsWith('-'))
  if (arg) return [arg]
  if (!existsSync(DIR_TEMAS)) return []
  return readdirSync(DIR_TEMAS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

export function rutaTema(slug) {
  return join(DIR_TEMAS, slug, 'tema.json')
}

export function leerTema(slug) {
  return JSON.parse(readFileSync(rutaTema(slug), 'utf8'))
}

/**
 * Texto narrable por sección: lo que el video lee en voz alta.
 * No cuenta el código, la miniatura, las fuentes ni los metadatos (migas, duración, tarjetas).
 */
export function textoNarrable(tema) {
  const s = tema.secciones ?? {}
  return {
    hero: [tema.hero?.titulo, tema.hero?.subtitulo, tema.hero?.intro],
    queEs: s.queEs ?? [],
    requisitos: s.requisitos ?? [],
    pasos: (s.pasos ?? []).flatMap((p) => [p.titulo, p.texto]),
    mokaDice: [s.mokaDice?.texto],
    errores: (s.errores ?? []).flatMap((e) => [e.problema, e.solucion]),
    resumen: [s.resumen],
  }
}

export function contarPalabras(textos) {
  return textos
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export const MIN_PALABRAS = 700
export const MAX_PALABRAS = 800
