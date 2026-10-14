<script setup lang="ts">
import { onMounted } from 'vue'
import Moka from '../Moka.vue'
import Boton from '../bloques/Boton.vue'

withDefaults(defineProps<{ titulo?: string; texto?: string }>(), {
  titulo: 'Esta taza está vacía',
  texto: 'No encontramos lo que buscas. Puede que el tema todavía se esté preparando o que el enlace tenga un error.',
})
onMounted(() => (document.title = 'Página no encontrada · Code & Coffee'))
</script>

<template>
  <header class="vacio">
    <div class="wrap">
      <div class="moka-vacia"><Moka expresion="wow" pose="rest" /></div>
      <div>
        <p class="codigo">404</p>
        <h1>{{ titulo }}</h1>
        <p class="texto">{{ texto }}</p>
        <Boton to="/">Ver todos los temas</Boton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.vacio{background:radial-gradient(700px 420px at 30% 40%,rgba(217,119,87,.3),transparent 62%),var(--tostado);color:var(--crema)}
.vacio .wrap{display:grid;grid-template-columns:220px 1fr;gap:40px;align-items:center;min-height:calc(100vh - 64px - 140px);padding-top:40px;padding-bottom:56px}
.moka-vacia{width:220px;filter:drop-shadow(0 30px 30px rgba(0,0,0,.35))}
.codigo{font:600 15px var(--mono);color:var(--brasa);margin:0 0 8px}
h1{font-weight:800;font-stretch:80%;font-size:clamp(40px,6vw,72px);line-height:.95;letter-spacing:-.025em;margin:0 0 18px}
.texto{font-size:20px;color:#E5D6C4;max-width:44ch;margin:0 0 28px}
@media (max-width:700px){.vacio .wrap{grid-template-columns:1fr}.moka-vacia{width:160px}}
</style>
