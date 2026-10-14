import { esc } from './util.mjs';
export default (e) => `<div class="cuerpo">
  <h2 data-anim="in">${esc(e.titulo)}</h2>
  <div class="filas grande">
    ${e.items.map((it, i) => `<div class="fila" data-rev="${i}"><b>${esc(it.texto)}</b></div>`).join('\n    ')}
  </div>
</div>`;
