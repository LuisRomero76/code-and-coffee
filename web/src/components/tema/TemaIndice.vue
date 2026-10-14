<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Moka from '../Moka.vue'

const props = defineProps<{ secciones: { id: string; titulo: string }[] }>()
const activa = ref(props.secciones[0]?.id ?? '')
let io: IntersectionObserver | undefined

onMounted(() => {
  io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) if (e.isIntersecting) activa.value = e.target.id
    },
    { rootMargin: '-30% 0px -60% 0px' },
  )
  for (const s of props.secciones) {
    const el = document.getElementById(s.id)
    if (el) io.observe(el)
  }
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <aside class="toc">
    <p>En esta página</p>
    <ol>
      <li v-for="s in secciones" :key="s.id">
        <a :href="`#${s.id}`" :class="{ on: activa === s.id }" :aria-current="activa === s.id ? 'location' : undefined">{{ s.titulo }}</a>
      </li>
    </ol>
    <div class="moka-mini">
      <div><Moka expresion="happy" pose="rest" /></div>
      ¿Te perdiste? Cada sección es una parte del video.
    </div>
  </aside>
</template>

<style scoped>
.toc{position:sticky;top:calc(88px + env(safe-area-inset-top,0px));align-self:start}
.toc p{font-weight:700;margin:0 0 12px;font-size:16px}
.toc ol{list-style:none;margin:0;padding:0;border-left:2px solid var(--line)}
.toc a{display:block;text-decoration:none;color:var(--muted);font-size:15.5px;padding:7px 0 7px 16px;margin-left:-2px;border-left:2px solid transparent;transition:color .2s,border-color .2s}
.toc a.on{color:var(--ink);border-color:var(--terracota);font-weight:600}
.toc .moka-mini{margin-top:28px;background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:16px;font-size:14.5px;color:var(--muted)}
.toc .moka-mini>div{width:70px;margin-bottom:6px}
@media (max-width:900px){.toc{position:static}.toc .moka-mini{display:none}}
</style>
