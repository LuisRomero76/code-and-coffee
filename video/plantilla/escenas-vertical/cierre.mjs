import { esc } from '../escenas/util.mjs';
// El dominio se define UNA vez, en el guion del video completo (campo "dominio"). Vacío = solo la ruta.
// "canales" dice dónde está el video completo, p. ej. "YouTube y Facebook".
export default (e, ctx) => {
  const dom = ctx.dominio ? `<span class="dom">${esc(ctx.dominio)}</span>` : '';
  return `<div class="cuerpo">
  <div class="etiqueta" data-anim="in">Code &amp; Coffee</div>
  <h2 data-anim="in">${esc(e.titulo)}</h2>
  <div class="canal" data-anim="in">${esc(e.canales)}</div>
  <p class="texto" data-anim="in">${esc(e.texto)}</p>
  <div class="ruta" data-anim="in">${dom}/temas/${esc(ctx.slug)}</div>
</div>`;
};
