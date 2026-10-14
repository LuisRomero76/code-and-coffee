import { esc } from '../escenas/util.mjs';
import { resaltar, tamano } from '../escenas/paso.mjs';

// El código nunca se corta: las líneas largas se parten (pre-wrap) y la letra se reduce hasta que
// todo el bloque cabe en el panel. Con subtítulos el cuerpo es más bajo, así que el panel también.
const ANCHO = 1080 - 72 - 120 - 60 - 4;   // ancho interior del panel (px)
export default (e, ctx) => {
  const c = e.codigo;
  const alto = ctx.conSubtitulos ? 640 : 900;
  const fs = tamano(c.contenido, ANCHO, alto, 44);
  const html = c.contenido.split('\n').map((l) => resaltar(l, e.lenguaje || (c.archivo === 'SKILL.md' ? 'markdown' : 'bash'))).join('\n');
  return `<div class="cuerpo">
  <div class="cabecera" data-anim="in"><div class="num">${e.numero}</div><h2>${esc(e.titulo)}</h2></div>
  <p class="nota" data-anim="in">${esc(e.nota)}</p>
  <div class="panel" data-anim="in"><div class="barra">${esc(c.archivo)}</div><pre style="font-size:${fs}px">${html}</pre></div>
</div>`;
};
