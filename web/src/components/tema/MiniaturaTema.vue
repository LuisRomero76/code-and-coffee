<script setup lang="ts">
import type { Tema } from '../../types'
import Moka from '../Moka.vue'

// Miniatura 16:9 del tema (variantes t1, t2, t3 de assets/plantilla-miniatura.html).
defineProps<{ miniatura: Tema['miniatura']; duracion?: string }>()
</script>

<template>
  <div class="thumb" :class="miniatura.variante" role="img" :aria-label="`Miniatura: ${miniatura.titulo} ${miniatura.resaltado}`">
    <div class="t-title">{{ miniatura.titulo }} <span class="hl">{{ miniatura.resaltado }}</span></div>
    <div class="t-card">{{ miniatura.tarjeta }}</div>
    <span class="t-tag">{{ miniatura.etiqueta }}</span>
    <div class="t-moka"><Moka :expresion="miniatura.moka.expresion" :pose="miniatura.moka.pose" /></div>
    <span v-if="duracion" class="t-dur">{{ duracion }}</span>
  </div>
</template>

<style scoped>
.thumb{container-type:inline-size;aspect-ratio:16/9;border-radius:20px;position:relative;overflow:hidden;box-shadow:0 24px 50px rgba(0,0,0,.45);isolation:isolate}
.thumb::before{content:"";position:absolute;inset:0;z-index:-1;background-image:radial-gradient(rgba(243,235,221,.09) 1.2px,transparent 1.2px);background-size:18px 18px}
.t1{background:radial-gradient(60cqw 60cqw at 78% 60%,rgba(242,154,120,.85),rgba(217,119,87,.4) 35%,transparent 70%),#1E1611}
.t2{background:radial-gradient(55cqw 55cqw at 22% 55%,rgba(242,154,120,.75),transparent 65%),#2A1E17}
.t3{background:linear-gradient(120deg,#D97757,#A94F33)}
.t-title{position:absolute;left:5cqw;top:7cqw;width:58cqw;font-weight:800;font-stretch:75%;text-transform:uppercase;line-height:.86;letter-spacing:-.01em;color:#fff;font-size:10.5cqw;text-shadow:0 .6cqw 0 rgba(0,0,0,.35)}
.t-title .hl{display:block;color:var(--brasa)}
.t3 .t-title .hl{color:var(--espresso);text-shadow:none}
.t-tag{position:absolute;left:5cqw;bottom:6cqw;background:var(--crema);color:var(--espresso);font-weight:800;font-size:3.2cqw;padding:.8cqw 2.4cqw;border-radius:99cqw;transform:rotate(-3deg)}
.t3 .t-tag{background:var(--espresso);color:var(--crema)}
.t-moka{position:absolute;width:40cqw;right:3cqw;bottom:-4cqw;filter:drop-shadow(0 2cqw 2cqw rgba(0,0,0,.4))}
.t2 .t-title{left:auto;right:5cqw;text-align:right;width:56cqw}
.t2 .t-tag{left:auto;right:5cqw}
.t2 .t-moka{right:auto;left:3cqw}
.t-card{position:absolute;background:#140E0B;color:var(--crema);border-radius:1.6cqw;padding:1.6cqw 2.2cqw;font:600 2.2cqw/1.5 var(--mono);box-shadow:0 2cqw 4cqw rgba(0,0,0,.4);border:1px solid rgba(243,235,221,.12);white-space:pre-line}
.t1 .t-card{right:5cqw;top:5cqw;transform:rotate(6deg)}
.t2 .t-card{left:4cqw;top:5cqw;transform:rotate(-5deg)}
.t3 .t-card{right:5cqw;top:5cqw;transform:rotate(5deg);background:var(--crema);color:var(--espresso)}
.t-dur{position:absolute;right:2cqw;bottom:2cqw;background:rgba(0,0,0,.75);color:#fff;font:600 2.4cqw var(--font);padding:.3cqw 1.2cqw;border-radius:.8cqw}
</style>
