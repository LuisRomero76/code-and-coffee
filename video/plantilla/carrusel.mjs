// Genera el carrusel de Instagram de un tema: HTML + una imagen PNG por slide (1080x1350, formato 4:5).
// Uso: node video/plantilla/carrusel.mjs <slug>
// Entradas: web/content/temas/<slug>/tema.json (la portada usa su "miniatura") y
//           video/temas/<slug>/carrusel.json (los slides, con textos cortos).
// Salidas:  video/temas/<slug>/carrusel/index.html  (se regenera, no se edita a mano)
//           video/salida/<slug>-carrusel/NN.png     (ignorada por Git)
// Moka SÍ aparece en los carruseles (portada y cierre); en los videos nunca.
// Sale con código 1 si algún texto no cabe en su slide. El dominio vacío solo muestra la ruta.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { esc } from './escenas/util.mjs';
import { resaltar, tamano } from './escenas/paso.mjs';

const slug = process.argv[2];
if (!slug) { console.error('Falta el slug'); process.exit(1); }
const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..', '..');
const dirTema = join(aqui, '..', 'temas', slug);
const tema = JSON.parse(readFileSync(join(raiz, 'web', 'content', 'temas', slug, 'tema.json'), 'utf8'));
const carrusel = JSON.parse(readFileSync(join(dirTema, 'carrusel.json'), 'utf8'));
const guionVideo = join(dirTema, 'guion.json');
const dominio = existsSync(guionVideo) ? JSON.parse(readFileSync(guionVideo, 'utf8')).dominio ?? '' : '';

const W = 1080, H = 1350, N = carrusel.slides.length;
const ANCHO_COD = W - 2 * 72 - 60 - 4;   // ancho interior del panel de código (px)

function cuerpo(s, i) {
  switch (s.tipo) {
    case 'portada': {
      const m = tema.miniatura;
      return `<div class="cuerpo portada-c">
  <span class="etiqueta">${esc(m.etiqueta)}</span>
  <h1>${esc(m.titulo)} <em>${esc(m.resaltado)}</em></h1>
  <div class="tarjeta-flota">${esc(m.tarjeta)}</div>
  <div class="moka-g" data-moka="${m.moka.expresion},${m.moka.pose}"></div>
</div>`;
    }
    case 'texto':
      return `<div class="cuerpo"><span class="etiqueta">${esc(s.etiqueta || 'Code & Coffee')}</span><h2>${esc(s.titulo)}</h2><p class="texto">${esc(s.texto)}</p></div>`;
    case 'paso': {
      const c = s.codigo;
      const fs = tamano(c.contenido, ANCHO_COD, 560, 40);
      const html = c.contenido.split('\n').map((l) => resaltar(l, s.lenguaje || (c.archivo === 'SKILL.md' ? 'markdown' : 'bash'))).join('\n');
      return `<div class="cuerpo"><div class="cabecera"><div class="num">${s.numero}</div><h2>${esc(s.titulo)}</h2></div><p class="nota">${esc(s.nota)}</p><div class="panel"><div class="barra">${esc(c.archivo)}</div><pre style="font-size:${fs}px">${html}</pre></div></div>`;
    }
    case 'error':
      return `<div class="cuerpo"><span class="etiqueta">Error común</span><h2>${esc(s.problema)}</h2><div class="solucion"><b>Solución</b><p>${esc(s.solucion)}</p></div></div>`;
    case 'cierre': {
      const dom = dominio ? `<span class="dom">${esc(dominio)}</span>` : '';
      return `<div class="cuerpo cierre-c"><h2>${esc(s.titulo)}</h2><p class="texto">${esc(s.texto)}</p><div class="ruta">${dom}/temas/${esc(slug)}</div><div class="canal">${esc(s.canales)}</div><div class="moka-m" data-moka="happy,wave"></div></div>`;
    }
    default: throw new Error(`Tipo de slide desconocido: ${s.tipo}`);
  }
}

const slides = carrusel.slides.map((s, i) => `<section class="slide" id="s${String(i + 1).padStart(2, '0')}">
  <header><span class="logo">Code <i>&amp;</i> Coffee</span><span class="cuenta">${i + 1}/${N}</span></header>
  ${cuerpo(s, i)}
  ${i < N - 1 ? '<footer>Desliza →</footer>' : ''}
</section>`).join('\n');

const css = readFileSync(join(aqui, 'assets', 'tokens.css'), 'utf8');
const moka = readFileSync(join(aqui, 'assets', 'moka.js'), 'utf8');
const estilo = `
*{box-sizing:border-box}
html,body{margin:0;background:#0F0A08;font-family:var(--font);color:var(--crema)}
*,*::before,*::after{animation:none!important;transition:none!important}
.slide{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(ellipse 80% 45% at 85% 4%,rgba(217,119,87,.34),rgba(217,119,87,0) 70%),radial-gradient(circle at 1px 1px,rgba(243,235,221,.07) 1.5px,transparent 2px) 0 0/36px 36px,var(--tostado)}
.slide header{position:absolute;top:44px;left:72px;right:72px;display:flex;justify-content:space-between;font-size:32px;font-weight:600;color:rgba(243,235,221,.75)}
.slide header i{font-family:'Fraunces',serif;font-style:italic;color:var(--terracota)}
.slide footer{position:absolute;bottom:44px;right:72px;font-size:30px;font-weight:700;color:var(--brasa)}
.cuerpo{position:absolute;left:72px;right:72px;top:130px;bottom:120px;display:flex;flex-direction:column;justify-content:center;gap:36px;min-width:0}
.etiqueta{align-self:flex-start;background:var(--terracota);color:var(--tostado);font-weight:800;font-size:32px;padding:8px 26px;border-radius:999px;letter-spacing:.04em;text-transform:uppercase}
h1,h2{margin:0;font-weight:800;font-stretch:80%;line-height:1.02;overflow-wrap:anywhere}
h2{font-size:84px}
.texto{margin:0;font-size:52px;line-height:1.3;color:rgba(243,235,221,.92)}
.portada-c{justify-content:center}
.portada-c h1{font-size:150px;text-transform:uppercase;line-height:.9;letter-spacing:-.01em}
.portada-c h1 em{display:block;font-style:normal;color:var(--brasa)}
.tarjeta-flota{align-self:flex-start;background:#140E0B;border:1px solid rgba(243,235,221,.14);border-radius:20px;padding:20px 30px;font:600 34px/1.4 var(--mono);transform:rotate(-3deg);box-shadow:0 24px 50px rgba(0,0,0,.4)}
.moka-g{position:absolute;right:-20px;bottom:-40px;width:430px;filter:drop-shadow(0 30px 30px rgba(0,0,0,.4))}
.cabecera{display:flex;align-items:center;gap:26px}
.cabecera .num{flex:none;width:104px;height:104px;border-radius:50%;background:var(--terracota);color:var(--tostado);font-weight:800;font-size:64px;display:grid;place-items:center}
.cabecera h2{font-size:80px;min-width:0}
.nota{margin:0;font-size:40px;color:var(--brasa);font-weight:600;line-height:1.2}
.panel{background:#140E0B;border:2px solid rgba(243,235,221,.14);border-radius:26px;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.panel .barra{padding:14px 30px;font:600 28px var(--mono);color:var(--brasa);border-bottom:2px solid rgba(243,235,221,.1);background:rgba(243,235,221,.04)}
.panel pre{margin:0;padding:26px 30px;font-family:var(--mono);color:var(--crema);white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;line-height:1.42;min-width:0}
.panel .cm{color:rgba(243,235,221,.5)}.panel .k{color:var(--brasa)}
.solucion{background:var(--espresso);border-left:14px solid var(--terracota);border-radius:26px;padding:40px 46px;display:flex;flex-direction:column;gap:16px}
.solucion b{font-size:36px;color:var(--brasa);text-transform:uppercase;letter-spacing:.04em}
.solucion p{margin:0;font-size:48px;line-height:1.28}
.cierre-c{justify-content:center}
.cierre-c h2{font-size:100px}
.ruta{background:#140E0B;border:3px solid var(--terracota);border-radius:26px;padding:28px 34px;font:600 44px var(--mono);overflow-wrap:anywhere;white-space:pre-wrap}
.ruta .dom{color:var(--brasa)}
.canal{font-size:44px;font-weight:800;color:var(--brasa)}
.moka-m{position:absolute;right:-10px;bottom:-70px;width:290px;filter:drop-shadow(0 20px 20px rgba(0,0,0,.4))}`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>${esc(slug)} | Carrusel | Code &amp; Coffee</title>
<style>
${css}
${estilo}
</style>
</head>
<body>
${slides}
<script>
${moka}
</script>
</body>
</html>
`;
const dirHtml = join(dirTema, 'carrusel');
mkdirSync(dirHtml, { recursive: true });
const archivoHtml = join(dirHtml, 'index.html');
writeFileSync(archivoHtml, html, 'utf8');

// Exporta cada slide a PNG con el Chrome instalado (playwright-core vive en web/node_modules).
const { chromium } = await import(pathToFileURL(join(raiz, 'web', 'node_modules', 'playwright-core', 'index.mjs')).href);
const salida = join(aqui, '..', 'salida', `${slug}-carrusel`);
mkdirSync(salida, { recursive: true });
const navegador = await chromium.launch({ channel: 'chrome' });
const problemas = [];
try {
  const pagina = await navegador.newPage({ viewport: { width: W, height: H } });
  await pagina.goto(pathToFileURL(archivoHtml).href, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  for (let i = 0; i < N; i++) {
    const id = `#s${String(i + 1).padStart(2, '0')}`;
    // El texto no puede salirse de su slide: se compara el contenido con el cuerpo que lo contiene.
    const cabe = await pagina.$eval(`${id} .cuerpo`, (c) => {
      const caja = c.getBoundingClientRect();
      const fuera = [...c.querySelectorAll('h1,h2,p,pre,.solucion,.ruta,.canal')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > caja.bottom + 1 || r.right > caja.right + 1 || r.left < caja.left - 1;
      });
      return fuera.map((el) => el.tagName.toLowerCase() + (el.className ? '.' + el.className : ''));
    });
    if (cabe.length) problemas.push(`Slide ${i + 1}: no cabe (${cabe.join(', ')})`);
    await (await pagina.$(id)).screenshot({ path: join(salida, `${String(i + 1).padStart(2, '0')}.png`) });
  }
} finally {
  await navegador.close();
}
console.log(`carrusel: ${N} slides → ${salida}`);
if (problemas.length) { console.error('✗ ' + problemas.join('\n✗ ')); process.exit(1); }
