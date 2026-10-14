import { esc } from './util.mjs';
export default (e) => `<div class="cuerpo">
  <div class="etiqueta" data-anim="in">${esc(e.etiqueta)}</div>
  <div class="caja" data-anim="in"><h2>${esc(e.titulo)}</h2><p>${esc(e.texto)}</p></div>
</div>`;
