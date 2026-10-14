<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const enTema = computed(() => route.name === 'tema')

// Modo claro / oscuro, igual que la plantilla (clave "cc-theme" en localStorage).
const root = document.documentElement
const media = matchMedia('(prefers-color-scheme: dark)')
const oscuro = ref(false)
const leer = () => (oscuro.value = root.dataset.theme ? root.dataset.theme === 'dark' : media.matches)

function alternar() {
  root.dataset.theme = oscuro.value ? 'light' : 'dark'
  try {
    localStorage.setItem('cc-theme', root.dataset.theme)
  } catch {
    /* sin almacenamiento */
  }
  leer()
}
onMounted(() => {
  leer()
  media.addEventListener('change', leer)
})
onBeforeUnmount(() => media.removeEventListener('change', leer))
</script>

<template>
  <nav class="nav" aria-label="Principal">
    <div class="wrap">
      <RouterLink class="brand" to="/">Code <em>&amp;</em> Coffee</RouterLink>
      <div class="nav-links">
        <RouterLink :to="{ path: '/', hash: '#temas' }">Temas</RouterLink>
        <a v-if="enTema" href="#videos">Videos</a>
        <button class="toggle" type="button" :aria-pressed="oscuro" @click="alternar">
          {{ oscuro ? 'Modo crema' : 'Modo espresso' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:rgba(30,22,17,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--crema)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;font-size:20px;letter-spacing:-.01em}
.brand em{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:600;color:var(--brasa)}
.nav-links{display:flex;gap:6px;align-items:center}
.nav-links a{text-decoration:none;padding:8px 14px;border-radius:999px;font-size:16px;color:#E5D6C4}
.nav-links a:hover{background:rgba(243,235,221,.08)}
.toggle{background:rgba(243,235,221,.1);color:var(--crema);border:1px solid rgba(243,235,221,.18);border-radius:999px;padding:8px 14px;font-size:15px;cursor:pointer}
@media (max-width:900px){.nav-links a{display:none}}
</style>
