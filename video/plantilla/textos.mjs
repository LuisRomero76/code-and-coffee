// Arma los textos de publicación listos para copiar y pegar: reemplaza {URL} y {URL_VIDEO}.
// Uso: node video/plantilla/textos.mjs <slug>
// Entradas: video/temas/<slug>/publicacion.json y video/plantilla/sitio.json (la dirección del sitio).
// Salida:   video/salida/<slug>-textos.md  (ignorada por Git)
//   {URL}       = <sitio>/temas/<slug>   (la página del tema)
//   {URL_VIDEO} = "urlVideo" de publicacion.json (el enlace del video completo en YouTube; se llena al subirlo)
// Si "urlVideo" está vacío, {URL_VIDEO} queda sin reemplazar y se avisa.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const slug = process.argv[2];
if (!slug) { console.error('Falta el slug'); process.exit(1); }
const aqui = dirname(fileURLToPath(import.meta.url));
const pub = JSON.parse(readFileSync(join(aqui, '..', 'temas', slug, 'publicacion.json'), 'utf8'));
const { sitio } = JSON.parse(readFileSync(join(aqui, 'sitio.json'), 'utf8'));
const urlPagina = `${sitio.replace(/\/$/, '')}/temas/${slug}`;
const sinVideo = !pub.urlVideo;

const exp = (t) => t.replaceAll('{URL}', urlPagina).replaceAll('{URL_VIDEO}', pub.urlVideo || '{URL_VIDEO}');
const bloque = (titulo, texto) => `### ${titulo}\n\n\`\`\`text\n${exp(texto)}\n\`\`\`\n`;

const md = [
  `# Textos de publicación: ${slug}`,
  '',
  `Página del tema: ${urlPagina}`,
  `Video completo en YouTube: ${pub.urlVideo || '(todavía no; llena "urlVideo" en publicacion.json cuando lo subas y vuelve a ejecutar este script)'}`,
  '',
  '## YouTube (video completo)',
  '',
  bloque('Título', pub.youtube.titulo),
  bloque('Descripción', pub.youtube.descripcion),
  bloque('Etiquetas (separadas por comas)', pub.youtube.etiquetas.join(', ')),
  '## Facebook',
  '',
  bloque('Video completo', pub.facebook.video),
  bloque('Short', pub.facebook.short),
  '## TikTok (short)',
  '',
  bloque('Texto', pub.tiktok.texto),
  '## Instagram',
  '',
  bloque('Reel (short)', pub.instagram.reel),
  bloque('Carrusel', pub.instagram.carrusel),
].join('\n');

const salida = join(aqui, '..', 'salida');
if (!existsSync(salida)) mkdirSync(salida, { recursive: true });
const archivo = join(salida, `${slug}-textos.md`);
writeFileSync(archivo, md, 'utf8');
console.log(`textos → ${archivo}`);
if (sinVideo) console.log('Aviso: "urlVideo" está vacío; {URL_VIDEO} queda sin reemplazar (los shorts lo necesitan).');
