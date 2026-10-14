<script setup lang="ts">
// Píldora informativa del hero. Lo destacado va en el slot "destacado" (en negrita, color brasa).
</script>

<template>
  <span class="chip"><b v-if="$slots.destacado"><slot name="destacado" /></b> <slot /></span>
</template>

<style scoped>
.chip{display:inline-flex;align-items:center;gap:8px;background:rgba(243,235,221,.08);border:1px solid rgba(243,235,221,.14);padding:6px 14px;border-radius:999px;font-size:15px}
.chip b{color:var(--brasa)}
</style>
