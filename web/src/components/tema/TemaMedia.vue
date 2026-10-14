<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Tema } from '../../types'
import MiniaturaTema from './MiniaturaTema.vue'

// Sección "El video": vista previa vertical 9:16 (sin Moka) y la miniatura del tema.
const props = defineProps<{ tema: Tema }>()

const etiqueta = computed(() =>
  props.tema.serie ? `Parte ${props.tema.serie.parte} de ${props.tema.serie.total}` : props.tema.miniatura.etiqueta,
)
const terminal = computed(() => props.tema.hero.tarjetas[0]?.replace(/^\$\s?/, '') ?? '')
const conPrompt = computed(() => props.tema.hero.tarjetas[0]?.startsWith('$') ?? false)

// Subtítulos animados: frases cortas sacadas del primer párrafo de "Qué es".
const lineas = computed(() => {
  const frases = (props.tema.secciones.queEs[0] ?? props.tema.hero.intro)
    .split(/(?<=[.!?])\s+|,\s+|;\s+/)
    .map((f) => f.replace(/[.!?]$/, '').trim())
    .filter((f) => f.split(/\s+/).length >= 3 && f.split(/\s+/).length <= 10)
  return frases.length ? frases.slice(0, 3) : [props.tema.hero.titulo]
})
const li = ref(0)
const wi = ref(0)
const palabras = computed(() => lineas.value[li.value]!.split(' '))
let intervalo: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return
  intervalo = setInterval(() => {
    wi.value++
    if (wi.value >= palabras.value.length) {
      wi.value = 0
      li.value = (li.value + 1) % lineas.value.length
    }
  }, 420)
})
onBeforeUnmount(() => clearInterval(intervalo))
</script>

<template>
  <section id="videos" class="media">
    <div class="wrap">
      <h2>El video y su miniatura</h2>
      <p class="lead">
        El contenido de esta página se convierte en el video. Moka solo aparece en las miniaturas; dentro del video se muestra únicamente el contenido.
      </p>
      <div class="media-grid">
        <div>
          <div class="vert">
            <span class="tag">{{ etiqueta }}</span>
            <h4>{{ tema.hero.titulo }}</h4>
            <div class="term">
              <span v-if="conPrompt" class="p">$ </span>{{ terminal }} <span class="cursor"></span>
            </div>
            <div class="caption" aria-hidden="true">
              <template v-for="(p, k) in palabras" :key="`${li}-${k}`"><span :class="{ on: k === wi }">{{ p }}</span>{{ ' ' }}</template>
            </div>
          </div>
          <p class="flabel">Video vertical 9:16, con subtítulos animados</p>
        </div>
        <div class="thumbs">
          <MiniaturaTema :miniatura="tema.miniatura" :duracion="tema.hero.duracion" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.media{background:var(--tostado);color:var(--crema);padding:80px 0;position:relative;overflow:hidden}
.media h2{font-weight:800;font-stretch:85%;font-size:clamp(32px,4vw,48px);line-height:1.05;letter-spacing:-.02em;margin:0 0 12px}
.media .lead{color:#C9B6A2;max-width:58ch;margin:0 0 40px}
.media-grid{display:grid;grid-template-columns:300px 1fr;gap:40px;align-items:start}
.vert{aspect-ratio:9/16;border-radius:26px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% 30%,rgba(217,119,87,.45),transparent 60%),#140E0B;padding:24px 20px;display:flex;flex-direction:column;box-shadow:0 30px 60px rgba(0,0,0,.45)}
.vert .tag{align-self:flex-start;background:var(--terracota);color:#fff;font-size:13px;font-weight:700;padding:5px 12px;border-radius:999px}
.vert h4{font-weight:800;font-stretch:78%;font-size:40px;line-height:.95;margin:18px 0 0;letter-spacing:-.02em}
.vert .term{margin-top:auto;background:#000;border-radius:12px;padding:14px;font:12.5px/1.7 var(--mono);overflow-wrap:anywhere}
.cursor{display:inline-block;width:8px;height:15px;background:var(--brasa);vertical-align:-2px;animation:blink 1s steps(1) infinite}
.caption{margin-top:16px;text-align:center;font-weight:800;font-size:21px;line-height:1.25;min-height:54px}
.caption span{padding:0 4px;border-radius:6px;transition:background .15s,color .15s}
.caption span.on{background:var(--terracota);color:#fff}
.flabel{font-size:14px;color:#C9B6A2;margin:12px 0 0}
.thumbs{display:grid;gap:24px}
.media-grid>*{min-width:0}
@media (max-width:900px){.media-grid{grid-template-columns:minmax(0,1fr)}.vert{max-width:300px}}
</style>
