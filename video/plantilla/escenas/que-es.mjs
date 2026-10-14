import { esc } from './util.mjs';
// Lista de tarjetas que aparecen cuando la narración llega a su ancla. Sirve también para requisitos.
export default (e) => `<div class="cuerpo">
  <h2 data-anim="in">${esc(e.titulo)}</h2>
  <div class="rejilla">
    ${e.items.map((it, i) => `<div class="tarjeta" data-rev="${i}"><div class="n">${i + 1}</div><p>${esc(it.texto)}</p></div>`).join('\n    ')}
  </div>
</div>`;
