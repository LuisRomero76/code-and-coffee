import { esc } from './util.mjs';
// El dominio se define UNA vez, en guion.json (campo "dominio"). Vacío = solo se muestra la ruta.
export default (e, ctx) => {
  const dom = ctx.dominio ? `<span class="dom">${esc(ctx.dominio)}</span>` : '';
  return `<div class="cuerpo">
  <div class="etiqueta" data-anim="in">Code &amp; Coffee</div>
  <h2 data-anim="in" style="font-size:110px">${esc(e.titulo)}</h2>
  <p class="texto" data-anim="in">${esc(e.texto)}</p>
  <div class="ruta" data-anim="in">${dom}/temas/${esc(ctx.slug)}</div>
</div>`;
};
