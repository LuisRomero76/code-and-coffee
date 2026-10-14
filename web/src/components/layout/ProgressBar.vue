<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Barra de progreso de lectura.
const ancho = ref(0)
function actualizar() {
  const h = document.documentElement
  const total = h.scrollHeight - h.clientHeight
  ancho.value = total > 0 ? (h.scrollTop / total) * 100 : 0
}
onMounted(() => {
  addEventListener('scroll', actualizar, { passive: true })
  addEventListener('resize', actualizar, { passive: true })
  actualizar()
})
onBeforeUnmount(() => {
  removeEventListener('scroll', actualizar)
  removeEventListener('resize', actualizar)
})
</script>

<template>
  <div class="progress" aria-hidden="true"><i :style="{ width: ancho + '%' }"></i></div>
</template>

<style scoped>
.progress{position:fixed;top:0;left:0;right:0;z-index:30;padding-top:env(safe-area-inset-top,0px);pointer-events:none}
.progress i{display:block;height:4px;width:0;background:linear-gradient(90deg,var(--terracota),var(--brasa))}
</style>
