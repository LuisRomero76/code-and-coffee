// Cuenta las palabras narrables de cada tema, con desglose por sección.
// Uso: npm run contar-palabras [-- <slug>]
// Sale con código 1 si algún tema queda fuera de 700-800 palabras.
import { MAX_PALABRAS, MIN_PALABRAS, contarPalabras, leerTema, slugsPedidos, textoNarrable } from './lib-temas.mjs'

let fallos = 0
for (const slug of slugsPedidos()) {
  const partes = textoNarrable(leerTema(slug))
  let total = 0
  const filas = []
  for (const [seccion, textos] of Object.entries(partes)) {
    const n = contarPalabras(textos)
    total += n
    filas.push(`    ${seccion.padEnd(11)} ${String(n).padStart(4)}`)
  }
  const ok = total >= MIN_PALABRAS && total <= MAX_PALABRAS
  if (!ok) fallos++
  console.log(`${ok ? '✓' : '✗'} ${slug}: ${total} palabras narrables (rango ${MIN_PALABRAS}-${MAX_PALABRAS})`)
  console.log(filas.join('\n'))
  if (total > MAX_PALABRAS) console.log(`    Sobran ${total - MAX_PALABRAS}: recorta frases sin quitar datos.`)
  if (total < MIN_PALABRAS) console.log(`    Faltan ${MIN_PALABRAS - total}.`)
}
process.exit(fallos ? 1 : 0)
