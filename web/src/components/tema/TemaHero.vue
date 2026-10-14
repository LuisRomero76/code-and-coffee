<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Tema } from '../../types'
import { escapar } from '../../lib/texto'
import { mesYAnio, tueste } from '../../content'
import Moka from '../Moka.vue'
import Chip from '../bloques/Chip.vue'
import Boton from '../bloques/Boton.vue'

const props = defineProps<{ tema: Tema }>()
const hero = computed(() => props.tema.hero)
const nivel = computed(() => tueste(hero.value.tueste))

// "Temas / Skills": el primer tramo enlaza al inicio.
const migas = computed(() => hero.value.migas.split('/').map((m) => m.trim()).filter(Boolean))

// Tarjetas flotantes: resaltado mínimo con las clases de la plantilla.
function tarjeta(texto: string): string {
  return texto
    .split('\n')
    .map((l) => {
      const prompt = /^\$\s?(.*)$/.exec(l)
      if (prompt) return `<span class="p">$</span> ${escapar(prompt[1]!)}`
      const clave = /^([\w-]+:)(\s.*)$/.exec(l)
      if (clave) return `<span class="k">${escapar(clave[1]!)}</span> <span class="s">${escapar(clave[2]!.trim())}</span>`
      return `<span class="s">${escapar(l)}</span>`
    })
    .join('<br>')
}
const tarjetas = computed(() => hero.value.tarjetas.map(tarjeta))

// Parallax del hero (solo con puntero fino y sin movimiento reducido).
const stage = ref<HTMLElement | null>(null)
const heroEl = ref<HTMLElement | null>(null)
function mover(e: PointerEvent) {
  const s = stage.value
  if (!s) return
  const r = s.getBoundingClientRect()
  s.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
  s.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
}
onMounted(() => {
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    heroEl.value?.addEventListener('pointermove', mover)
  }
})
onBeforeUnmount(() => heroEl.value?.removeEventListener('pointermove', mover))
</script>

<template>
  <header ref="heroEl" class="hero">
    <div class="wrap">
      <div class="copy-col">
        <p class="crumbs">
          <template v-for="(m, i) in migas" :key="i">
            <RouterLink v-if="i === 0" :to="{ path: '/', hash: '#temas' }">{{ m }}</RouterLink>
            <template v-else> / {{ m }}</template>
          </template>
        </p>
        <h1>{{ hero.titulo }} <span>{{ hero.subtitulo }}</span></h1>
        <p class="intro">{{ hero.intro }}</p>
        <div class="chips">
          <Chip><template #destacado>{{ hero.duracion }}</template>de video</Chip>
          <Chip>
            <template #destacado><span :aria-label="`Nivel ${hero.tueste} de 3`">{{ nivel.puntos }}</span></template>{{ nivel.nombre }}
          </Chip>
          <Chip>Actualizado en {{ mesYAnio(tema.fecha) }}</Chip>
        </div>
        <div class="ctas">
          <Boton href="#que-es">Empezar a leer</Boton>
          <Boton variante="ghost" href="#videos">Ver el video</Boton>
        </div>
      </div>
      <div ref="stage" class="stage" aria-hidden="true">
        <div class="ring"></div>
        <div class="disk"></div>
        <div v-if="tarjetas[0]" class="float f1">
          <div class="dots"><i></i><i></i><i></i></div>
          <span v-html="tarjetas[0]"></span>
        </div>
        <div v-if="tarjetas[1]" class="float f2" v-html="tarjetas[1]"></div>
        <div class="float f3">☕ Moka te acompaña</div>
        <div class="hero-moka"><Moka expresion="happy" pose="wave" /></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero{background:radial-gradient(900px 520px at 78% 40%,rgba(217,119,87,.38),transparent 62%),radial-gradient(600px 400px at 0% 100%,rgba(138,90,59,.35),transparent 70%),var(--tostado);color:var(--crema);overflow:hidden;position:relative}
.hero::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(243,235,221,.07) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(180deg,#000 30%,transparent)}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:center;min-height:620px;padding-top:40px;padding-bottom:56px;position:relative}
.crumbs{font-size:15px;color:#C9B6A2;margin:0 0 18px}
.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--crema)}
.hero h1{font-weight:800;font-stretch:80%;font-size:clamp(48px,7.4vw,96px);line-height:.92;letter-spacing:-.025em;margin:0 0 22px;text-wrap:balance}
.hero h1 span{display:block;color:var(--brasa)}
.hero .intro{font-size:20px;color:#E5D6C4;max-width:40ch;margin:0 0 28px}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px}
.ctas{display:flex;flex-wrap:wrap;gap:12px}

.stage{position:relative;height:520px;--mx:0;--my:0}
.disk{position:absolute;left:50%;top:52%;width:380px;height:380px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 40% 30%,#4A3428,#2A1E17 60%,#1A120D);border:6px solid var(--terracota);box-shadow:0 0 0 14px rgba(217,119,87,.14),0 0 120px rgba(217,119,87,.5),inset 0 -20px 60px rgba(0,0,0,.4)}
.ring{position:absolute;left:50%;top:52%;width:470px;height:470px;transform:translate(-50%,-50%);border-radius:50%;border:2px dashed rgba(243,235,221,.18);animation:spin 40s linear infinite}
.hero-moka{position:absolute;left:50%;top:50%;width:300px;transform:translate(calc(-50% + var(--mx)*-10px),calc(-46% + var(--my)*-10px));filter:drop-shadow(0 30px 30px rgba(0,0,0,.35))}
.float{position:absolute;background:#140E0B;color:var(--crema);border:1px solid rgba(243,235,221,.12);border-radius:14px;padding:12px 16px;font:13.5px/1.6 var(--mono);box-shadow:0 20px 40px rgba(0,0,0,.4);transform:translate(calc(var(--mx)*var(--d)*1px),calc(var(--my)*var(--d)*1px))}
.hero .wrap>*{min-width:0}
.float{max-width:calc(100% - 12px);overflow-wrap:anywhere}
.float .dots{display:flex;gap:6px;margin-bottom:8px}.float .dots i{width:9px;height:9px;border-radius:50%;background:#5B4335}.float .dots i:first-child{background:var(--terracota)}
.f1{top:30px;left:0;--d:22;animation:hover1 6s ease-in-out infinite}
.f2{bottom:60px;right:-6px;--d:30;animation:hover1 7s ease-in-out -2s infinite}
.f3{bottom:26px;left:30px;--d:16;font-family:var(--font);font-size:15px;padding:10px 16px;border-radius:999px;background:var(--crema);color:var(--espresso);font-weight:700;animation:hover1 5s ease-in-out -1s infinite}

@media (max-width:900px){
  .hero .wrap{grid-template-columns:minmax(0,1fr);min-height:0}
  .stage{height:420px}.disk{width:300px;height:300px}.ring{width:370px;height:370px}.hero-moka{width:240px}
}
@media (max-width:520px){
  .f2{display:none}
  .stage{height:340px}.disk{width:230px;height:230px}.ring{width:290px;height:290px}.hero-moka{width:185px}
}
</style>
