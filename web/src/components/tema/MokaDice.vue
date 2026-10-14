<script setup lang="ts">
import Moka from '../Moka.vue'
import { enLinea } from '../../lib/texto'

defineProps<{ texto: string }>()
</script>

<template>
  <aside class="tip">
    <div><Moka expresion="wow" pose="point" /></div>
    <p><b>Moka dice:</b> <span v-html="enLinea(texto)"></span></p>
  </aside>
</template>

<style scoped>
.tip{display:grid;grid-template-columns:72px 1fr;gap:16px;align-items:center;background:linear-gradient(135deg,rgba(217,119,87,.16),rgba(217,119,87,.04));border:1px solid rgba(217,119,87,.35);border-radius:20px;padding:16px 22px;margin-top:22px}
.tip>div{width:72px}
.tip p{margin:0}.tip b{display:block}
</style>
