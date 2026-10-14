<script setup lang="ts">
import { computed, ref } from 'vue'
import { enLinea } from '../../lib/texto'

const props = defineProps<{ requisitos: string[] }>()
const marcados = ref<boolean[]>(props.requisitos.map(() => false))
const listos = computed(() => marcados.value.filter(Boolean).length)
const mensaje = computed(() =>
  listos.value === props.requisitos.length
    ? 'Todo listo, ¡a preparar el café!'
    : `${listos.value} de ${props.requisitos.length} listos`,
)
</script>

<template>
  <div class="check">
    <label v-for="(r, i) in requisitos" :key="i">
      <input v-model="marcados[i]" type="checkbox" />
      <span v-html="enLinea(r)"></span>
    </label>
    <p class="count" aria-live="polite">{{ mensaje }}</p>
  </div>
</template>

<style scoped>
.check{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:8px 24px 18px}
.check label{display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid var(--line);cursor:pointer}
.check label:last-of-type{border-bottom:0}
.check input{appearance:none;width:26px;height:26px;border-radius:8px;border:2px solid var(--tueste);flex:none;display:grid;place-items:center;cursor:pointer;transition:.15s;margin:0}
.check input:checked{background:var(--cardamomo);border-color:var(--cardamomo)}
.check input:checked::after{content:"";width:7px;height:13px;border:solid #fff;border-width:0 3px 3px 0;transform:rotate(45deg) translate(-1px,-1px)}
.check .count{font-size:15px;color:var(--muted);margin:10px 0 0}
</style>
