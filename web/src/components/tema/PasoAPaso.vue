<script setup lang="ts">
import type { Paso } from '../../types'
import { enLinea } from '../../lib/texto'
import CodeBlock from '../bloques/CodeBlock.vue'
import MokaDice from './MokaDice.vue'

defineProps<{ pasos: Paso[]; mokaDice?: { paso: number; texto: string } }>()
</script>

<template>
  <ol class="steps">
    <li v-for="(p, i) in pasos" :key="i">
      <h3>{{ p.titulo }}</h3>
      <p v-html="enLinea(p.texto)"></p>
      <CodeBlock v-if="p.codigo" :archivo="p.codigo.archivo" :lenguaje="p.codigo.lenguaje" :contenido="p.codigo.contenido" />
      <p v-if="p.probado === false" class="sin-probar">Paso sin probar todavía: si algo cambió, revisa las fuentes del final.</p>
      <MokaDice v-if="mokaDice && mokaDice.paso === i + 1" :texto="mokaDice.texto" />
    </li>
  </ol>
</template>

<style scoped>
.steps{list-style:none;margin:0;padding:0;counter-reset:s}
.steps>li{counter-increment:s;position:relative;padding:0 0 36px 68px}
.steps>li::before{content:counter(s);position:absolute;left:0;top:-2px;width:46px;height:46px;border-radius:14px;background:var(--terracota);color:#fff;font-weight:800;font-size:22px;display:grid;place-items:center;box-shadow:0 4px 0 #A94F33}
.steps>li::after{content:"";position:absolute;left:22px;top:54px;bottom:6px;width:2px;background:var(--line)}
.steps>li:last-child::after{display:none}
h3{font-weight:700;font-size:22px;margin:0 0 6px}
p{margin:0 0 16px}
.sin-probar{font-size:15px;color:var(--muted);margin:12px 0 0;padding-left:12px;border-left:3px solid var(--tueste)}
@media (max-width:520px){.steps>li{padding-left:58px}}
</style>
