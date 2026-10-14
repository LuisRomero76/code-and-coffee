/** Escapa HTML para usar texto del tema dentro de v-html. */
export function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Rutas y archivos: .claude/skills, ~/.claude/skills, SKILL.md, reference.md...
const RUTA = /(`[^`]+`|~?\.?[\w-]*(?:\/[\w.-]+)+\/?|\.?\b[\w-]+\.(?:md|json|ts|vue|yaml|yml|toml|sh|py)\b)/g

/**
 * Convierte texto plano del tema en HTML seguro, marcando como `code.i`
 * lo que aparece entre comillas invertidas y las rutas o nombres de archivo.
 * No cambia el texto, solo su presentación.
 */
export function enLinea(texto: string): string {
  return escapar(texto).replace(RUTA, (m) => {
    const limpio = m.startsWith('`') ? m.slice(1, -1) : m
    return `<code class="i">${limpio}</code>`
  })
}

/** Resaltado mínimo con las clases de la plantilla (k, s, c, p). Devuelve HTML seguro. */
export function resaltar(contenido: string, lenguaje: string): string {
  const lineas = contenido.split('\n')
  if (lenguaje === 'bash' || lenguaje === 'sh' || lenguaje === 'shell') {
    return lineas
      .map((l) => {
        if (/^\s*#/.test(l)) return `<span class="c">${escapar(l)}</span>`
        const m = /^(\s*\$)(\s.*)?$/.exec(l)
        if (m) return `<span class="p">${escapar(m[1]!)}</span>${escapar(m[2] ?? '')}`
        return escapar(l)
      })
      .join('\n')
  }
  if (lenguaje === 'markdown' || lenguaje === 'md' || lenguaje === 'yaml' || lenguaje === 'yml') {
    const esYaml = lenguaje === 'yaml' || lenguaje === 'yml'
    // En markdown, el frontmatter va entre el primer --- (línea 1) y el siguiente.
    let enFrontmatter = esYaml
    return lineas
      .map((l, i) => {
        if (l.trim() === '---' && (esYaml || i === 0 || enFrontmatter)) {
          if (!esYaml) enFrontmatter = i === 0
          return `<span class="k">${escapar(l)}</span>`
        }
        if (enFrontmatter) {
          const m = /^(\s*[\w-]+:)(.*)$/.exec(l)
          if (m) return `<span class="k">${escapar(m[1]!)}</span><span class="s">${escapar(m[2]!)}</span>`
          if (/^\s*#/.test(l)) return `<span class="c">${escapar(l)}</span>`
          return `<span class="s">${escapar(l)}</span>`
        }
        if (/^#{1,6}\s/.test(l)) return `<span class="k">${escapar(l)}</span>`
        return escapar(l)
      })
      .join('\n')
  }
  return escapar(contenido)
}
