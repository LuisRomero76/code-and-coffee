<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { resaltar } from '../../lib/texto'

const props = defineProps<{ archivo: string; lenguaje: string; contenido: string }>()

const html = computed(() => resaltar(props.contenido, props.lenguaje))
const estado = ref<'listo' | 'ok' | 'error'>('listo')
let temporizador: ReturnType<typeof setTimeout> | undefined

async function copiar() {
  try {
    if (!navigator.clipboard) throw new Error('sin portapapeles')
    await navigator.clipboard.writeText(props.contenido)
    estado.value = 'ok'
    clearTimeout(temporizador)
    temporizador = setTimeout(() => (estado.value = 'listo'), 1600)
  } catch {
    estado.value = 'error'
  }
}
onBeforeUnmount(() => clearTimeout(temporizador))

const textoBoton = computed(() =>
  estado.value === 'ok' ? 'Copiado' : estado.value === 'error' ? 'Selecciona y copia' : 'Copiar',
)
</script>

<template>
  <div class="code">
    <header>
      <span>{{ archivo }}</span>
      <button class="copy" :class="{ ok: estado === 'ok' }" type="button" :aria-label="`Copiar el código de ${archivo}`" @click="copiar">
        {{ textoBoton }}
      </button>
      <span class="sr-only" aria-live="polite">{{ estado === 'ok' ? 'Código copiado' : '' }}</span>
    </header>
    <pre :class="`lang-${lenguaje}`" tabindex="0" v-html="html"></pre>
  </div>
</template>

<style scoped>
.code{position:relative;max-width:100%;background:#140E0B;color:var(--crema);border-radius:16px;margin:16px 0 0;overflow:hidden;border:1px solid rgba(243,235,221,.08)}
.code header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 14px 10px 18px;background:#1E1611;font:13px var(--mono);color:#C9B6A2}
.copy{background:rgba(243,235,221,.08);color:var(--crema);border:0;border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer}
.copy.ok{background:var(--cardamomo)}
.code pre{margin:0;padding:18px 20px;overflow-x:auto;font:14.5px/1.75 var(--mono)}
</style>
