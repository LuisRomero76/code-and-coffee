// Genera index.html a partir de guion.json + audio/ (NN.mp3 y NN.srt de Edge TTS).
// Uso: node video/plantilla/generar.mjs <slug>          video completo horizontal (temas/<slug>/)
//      node video/plantilla/generar.mjs <slug> short    short vertical (temas/<slug>/short/)
// No se edita a mano el index.html: se regenera. Para cambiar el dominio, edita "dominio" en guion.json.
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc } from './escenas/util.mjs';

const slug = process.argv[2];
if (!slug) { console.error('Falta el slug'); process.exit(1); }
const aqui = dirname(fileURLToPath(import.meta.url));
const esShort = process.argv[3] === 'short';
const dir = esShort ? join(aqui, '..', 'temas', slug, 'short') : join(aqui, '..', 'temas', slug);
const guion = JSON.parse(readFileSync(join(dir, 'guion.json'), 'utf8'));
const FORMATOS = {
  horizontal: { W: 1920, H: 1080, css: 'video.css', escenas: 'escenas' },
  vertical: { W: 1080, H: 1920, css: 'video-vertical.css', escenas: 'escenas-vertical' },
};
const fmt = FORMATOS[guion.formato];
if (!fmt) throw new Error(`Formato desconocido: ${guion.formato}`);
if ((guion.formato === 'vertical') !== esShort) throw new Error('El short debe ser vertical y el video completo horizontal');
const { W, H } = fmt;

const INICIO = 0.3, COLA = 0.5;   // pausa antes y después de cada pista
const BYTES_POR_SEG = 6000;       // Edge TTS entrega MP3 a 48 kbps constantes

const aSeg = (s) => { const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(s); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
function leerSrt(ruta) {
  return readFileSync(ruta, 'utf8').replace(/\r/g, '').trim().split(/\n\n+/).map((b) => {
    const l = b.split('\n'); const [a, z] = l[1].split(' --> ');
    return { ini: aSeg(a), fin: aSeg(z), texto: l.slice(2).join(' ').trim() };
  });
}

// Tiempos por palabra: dentro de cada frase se reparte por número de caracteres.
function palabras(narracion, cues) {
  const out = [];
  for (const c of cues) {
    const toks = c.texto.split(/\s+/).filter(Boolean);
    const pesos = toks.map((t) => t.length + (/[,;:.?!]$/.test(t) ? 2 : 0));
    const tot = pesos.reduce((a, b) => a + b, 0);
    let t = c.ini;
    toks.forEach((tok, i) => { const d = (c.fin - c.ini) * pesos[i] / tot; out.push({ t: tok, ini: t, fin: t + d }); t += d; });
  }
  const esperadas = narracion.split(/\s+/).filter(Boolean).length;
  if (out.length !== esperadas) throw new Error(`Palabras de subtítulos (${out.length}) distintas a la narración (${esperadas})`);
  return out;
}

// El dominio se define una sola vez, en el guion del video completo; el short lo hereda.
const guionPadre = join(dir, '..', 'guion.json');
const dominioPadre = esShort && existsSync(guionPadre) ? JSON.parse(readFileSync(guionPadre, 'utf8')).dominio : '';
// "subtitulos": false en guion.json genera el video sin subtítulos (por defecto se muestran).
const conSubtitulos = guion.subtitulos !== false;
const ctx = { slug, dominio: guion.dominio ?? dominioPadre ?? '', conSubtitulos };
let cursor = 0;
const escenasHtml = [], audios = [], js = [];

for (let i = 0; i < guion.escenas.length; i++) {
  const e = guion.escenas[i];
  const n = String(i + 1).padStart(2, '0');
  const mp3 = join(dir, 'audio', `${n}.mp3`);
  const aud = statSync(mp3).size / BYTES_POR_SEG;
  const dur = +(INICIO + aud + COLA + (i === guion.escenas.length - 1 ? 1 : 0)).toFixed(3);
  const ini = +cursor.toFixed(3);
  const cues = leerSrt(join(dir, 'audio', `${n}.srt`));
  const ws = palabras(e.narracion, cues).map((w) => ({ ...w, ini: w.ini + INICIO, fin: w.fin + INICIO }));

  // cuerpo de la escena
  const { default: render } = await import(`./${fmt.escenas}/${e.tipo}.mjs`);
  const cuerpo = render(e, ctx);

  // subtítulos: trozos de máximo 10 palabras, sin cruzar frases
  let k = 0; const trozos = [];
  if (conSubtitulos) for (const c of cues) {
    const cnt = c.texto.split(/\s+/).filter(Boolean).length;
    const nT = Math.ceil(cnt / 10), base = Math.ceil(cnt / nT);
    for (let a = 0; a < cnt; a += base) trozos.push([k + a, k + Math.min(cnt, a + base)]);
    k += cnt;
  }
  let sid = 0;
  const subs = trozos.map(([a, b], ti) => {
    const spans = ws.slice(a, b).map((w, j) => `<span class="w" id="s${n}-${a + j}">${esc(w.t)}</span>`).join(' ');
    return `<div class="sub" id="s${n}-c${ti}"><p>${spans}</p></div>`;
  }).join('');

  escenasHtml.push(`<section id="e${n}" class="escena clip ${e.tipo}" data-start="${ini}" data-duration="${dur}" data-track-index="0">
${cuerpo}
${conSubtitulos ? `<div class="subs">${subs}</div>
` : ''}</section>`);
  audios.push(`<audio id="aud-${n}" src="audio/${n}.mp3" data-start="${+(ini + INICIO).toFixed(3)}" data-duration="${+aud.toFixed(3)}" data-track-index="1" data-volume="1"></audio>`);

  // animaciones (tiempos absolutos)
  const L = [];
  L.push(`tl.fromTo("#e${n} [data-anim]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.12 }, ${ini + 0.1});`);
  L.push(`tl.to("#e${n} .cuerpo", { opacity: 0, duration: 0.35, ease: "power1.in" }, ${+(ini + dur - 0.4).toFixed(3)});`);
  if (e.items) {
    e.items.forEach((it, j) => {
      const pos = e.narracion.indexOf(it.ancla);
      if (pos < 0) throw new Error(`Ancla no encontrada en escena ${n}: ${it.ancla}`);
      const idx = e.narracion.slice(0, pos).split(/\s+/).filter(Boolean).length;
      const t = Math.max(ws[Math.min(idx, ws.length - 1)].ini - 0.2, INICIO + 0.3);
      L.push(`tl.fromTo("#e${n} [data-rev='${j}']", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${+(ini + t).toFixed(3)});`);
    });
    L.unshift(`gsap.set("#e${n} [data-rev]", { opacity: 0 });`);
  }
  trozos.forEach(([a, b], ti) => {
    const t0 = ini + ws[a].ini;
    const t1 = ini + (ti + 1 < trozos.length ? ws[trozos[ti + 1][0]].ini : ws[b - 1].fin);
    L.push(`tl.set("#s${n}-c${ti}", { opacity: 1 }, ${t0.toFixed(3)}); tl.set("#s${n}-c${ti}", { opacity: 0 }, ${(t1 - 0.001).toFixed(3)});`);
    for (let w = a; w < b; w++) {
      const wi = ini + ws[w].ini, wf = ini + (w + 1 < b ? ws[w + 1].ini : ws[w].fin);
      L.push(`tl.set("#s${n}-${w}", { backgroundColor: "#D97757", color: "#1E1611" }, ${wi.toFixed(3)}); tl.set("#s${n}-${w}", { backgroundColor: "rgba(217,119,87,0)", color: "#F3EBDD" }, ${wf.toFixed(3)});`);
    }
  });
  js.push(L.join('\n'));
  cursor += dur;
}
const total = +cursor.toFixed(3);

const css = readFileSync(join(aqui, 'assets', 'tokens.css'), 'utf8') + '\n' + readFileSync(join(aqui, 'assets', fmt.css), 'utf8');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=${W}, height=${H}" />
<title>${esc(slug)} | Code &amp; Coffee</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
${css}
</style>
</head>
<body>
<div id="root"${conSubtitulos ? '' : ' class="sin-subs"'} data-composition-id="main" data-start="0" data-width="${W}" data-height="${H}" data-duration="${total}">
<div id="prog"></div>
<div id="marca">Code <i>&amp;</i> Coffee</div>
${escenasHtml.join('\n')}
${audios.join('\n')}
</div>
<script>
const tl = gsap.timeline({ paused: true });
tl.fromTo("#prog", { scaleX: 0 }, { scaleX: 1, duration: ${total}, ease: "none" }, 0);
${js.join('\n')}
window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
writeFileSync(join(dir, 'index.html'), html, 'utf8');
console.log(`index.html generado: ${guion.escenas.length} escenas, ${total}s (${(total / 60).toFixed(2)} min)`);
