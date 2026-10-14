// Genera una pista de narración por escena con Edge TTS (python -m edge_tts).
// Uso: node video/plantilla/audio.mjs <slug> [short]   (con "short" usa temas/<slug>/short/)
// Reanuda: si NN.mp3 y NN.srt ya existen, no los rehace. Si Edge TTS falla, se detiene.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const slug = process.argv[2];
if (!slug) { console.error('Falta el slug'); process.exit(1); }
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[3] === 'short' ? join(raiz, 'temas', slug, 'short') : join(raiz, 'temas', slug);
const guion = JSON.parse(readFileSync(join(dir, 'guion.json'), 'utf8'));
const audio = join(dir, 'audio');
mkdirSync(audio, { recursive: true });

guion.escenas.forEach((e, i) => {
  const n = String(i + 1).padStart(2, '0');
  const mp3 = join(audio, `${n}.mp3`), srt = join(audio, `${n}.srt`), txt = join(audio, `${n}.txt`);
  if (existsSync(mp3) && existsSync(srt)) { console.log(`${n} ya existe`); return; }
  writeFileSync(txt, e.narracion, 'utf8');
  const r = spawnSync('python', ['-m', 'edge_tts', '--voice', guion.voz, '--file', txt,
    '--write-media', mp3, '--write-subtitles', srt], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`FALLÓ Edge TTS en la escena ${n}:\n${r.stderr}`);
    process.exit(2);
  }
  console.log(`${n} ok`);
});
