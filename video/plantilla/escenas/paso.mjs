import { esc } from './util.mjs';

// El código nunca se corta: las líneas largas se parten (pre-wrap) y la letra se reduce
// hasta que todo el bloque cabe en el panel. Estimación conservadora del ancho de JetBrains Mono.
const ANCHO = 1640 - 60;     // ancho interior del panel (px)
const ALTO = 480;            // alto interior disponible para el código (px)
export function tamano(codigo, ancho = ANCHO, alto = ALTO, max = 46) {
  const lineas = codigo.split('\n');
  for (let fs = max; fs >= 20; fs--) {
    const cpl = Math.floor(ancho / (fs * 0.62));
    const total = lineas.reduce((a, l) => a + Math.max(1, Math.ceil((l.length * 1.08) / cpl)), 0);
    if (total * fs * 1.42 <= alto) return fs;
  }
  return 20;
}

export function resaltar(linea, lenguaje) {
  const t = esc(linea);
  if (lenguaje === 'bash' && /^\s*#/.test(linea)) return `<span class="cm">${t}</span>`;
  const m = /^([A-Za-z_-]+):(.*)$/.exec(linea);
  if (lenguaje === 'markdown' && m) return `<span class="k">${esc(m[1])}:</span>${esc(m[2])}`;
  return t;
}

export default (e) => {
  const c = e.codigo;
  const fs = tamano(c.contenido);
  const html = c.contenido.split('\n').map((l) => resaltar(l, e.lenguaje || (c.archivo === 'SKILL.md' ? 'markdown' : 'bash'))).join('\n');
  return `<div class="cuerpo">
  <div class="cabecera" data-anim="in"><div class="num">${e.numero}</div><h2>${esc(e.titulo)}</h2></div>
  <p class="nota" data-anim="in">${esc(e.nota)}</p>
  <div class="panel" data-anim="in"><div class="barra">${esc(c.archivo)}</div><pre style="font-size:${fs}px">${html}</pre></div>
</div>`;
};
