<script setup lang="ts">
import type { ErrorComun } from '../../types'
import { enLinea } from '../../lib/texto'

defineProps<{ errores: ErrorComun[] }>()
</script>

<template>
  <div>
    <details v-for="(e, i) in errores" :key="i" :open="i === 0">
      <summary>{{ e.problema }}</summary>
      <div v-html="enLinea(e.solucion)"></div>
    </details>
  </div>
</template>

<style scoped>
details{background:var(--surface);border:1px solid var(--line);border-radius:16px;margin-bottom:12px;overflow:hidden}
summary{cursor:pointer;list-style:none;padding:18px 56px 18px 22px;font-weight:700;position:relative}
summary::-webkit-details-marker{display:none}
summary::after{content:"";position:absolute;right:24px;top:50%;width:10px;height:10px;border:solid var(--terracota);border-width:0 3px 3px 0;transform:translateY(-70%) rotate(45deg);transition:transform .2s}
details[open] summary::after{transform:translateY(-30%) rotate(-135deg)}
details div{padding:0 22px 18px;color:var(--muted)}
</style>
