import { esc } from './util.mjs';
export default (e) => `<div class="cuerpo">
  <h2 data-anim="in" style="font-size:72px;margin-bottom:24px">${esc(e.titulo)}</h2>
  <div class="filas">
    ${e.items.map((it, i) => `<div class="fila" data-rev="${i}"><b>${esc(it.problema)}</b><span>${esc(it.solucion)}</span></div>`).join('\n    ')}
  </div>
</div>`;
