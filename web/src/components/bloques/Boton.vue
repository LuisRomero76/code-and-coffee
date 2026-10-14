<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

// Botón de la plantilla. Con `href` es un enlace normal (anclas de la página);
// con `to` usa el router.
const props = withDefaults(
  defineProps<{ variante?: 'main' | 'ghost'; href?: string; to?: RouteLocationRaw }>(),
  { variante: 'main' },
)
const clase = computed(() => ['btn', `btn-${props.variante}`])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="clase"><slot /></RouterLink>
  <a v-else-if="href" :href="href" :class="clase"><slot /></a>
  <button v-else type="button" :class="clase"><slot /></button>
</template>

<style scoped>
.btn{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-weight:700;font-size:17px;padding:14px 24px;border-radius:14px;border:0;cursor:pointer;transition:transform .15s,box-shadow .15s}
.btn-main{background:var(--terracota);color:#fff;box-shadow:0 6px 0 #A94F33,0 14px 30px rgba(217,119,87,.35)}
.btn-main:hover{transform:translateY(-2px);box-shadow:0 8px 0 #A94F33,0 18px 34px rgba(217,119,87,.4)}
.btn-main:active{transform:translateY(4px);box-shadow:0 2px 0 #A94F33}
.btn-ghost{background:transparent;color:var(--crema);border:2px solid rgba(243,235,221,.25)}
.btn-ghost:hover{border-color:var(--crema)}
</style>
