import { esc } from './util.mjs';
export default (e) => `<div class="cuerpo">
  <div class="etiqueta" data-anim="in">${esc(e.etiqueta)}</div>
  <h1 data-anim="in">${esc(e.titulo)}</h1>
  <div class="subt" data-anim="in">${esc(e.subtitulo)}</div>
</div>`;
