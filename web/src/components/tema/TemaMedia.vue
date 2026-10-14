<script setup lang="ts">
import type { Tema } from '../../types'
import MiniaturaTema from './MiniaturaTema.vue'

// Sección "El video y su miniatura": solo la miniatura del tema. Los shorts no van en la página;
// cuando el video completo esté en YouTube, aquí se incrusta el video.
defineProps<{ tema: Tema }>()
</script>

<template>
  <section id="videos" class="media">
    <div class="wrap">
      <h2>El video y su miniatura</h2>
      <p class="lead">
        El contenido de esta página se convierte en el video. Moka solo aparece en las miniaturas; dentro del video se muestra únicamente el contenido.
      </p>
      <div class="thumbs">
        <MiniaturaTema :miniatura="tema.miniatura" :duracion="tema.hero.duracion" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.media{background:var(--tostado);color:var(--crema);padding:80px 0;position:relative;overflow:hidden}
.media h2{font-weight:800;font-stretch:85%;font-size:clamp(32px,4vw,48px);line-height:1.05;letter-spacing:-.02em;margin:0 0 12px}
.media .lead{color:#C9B6A2;max-width:58ch;margin:0 0 40px}
.thumbs{display:grid;gap:24px;max-width:820px;min-width:0}
</style>
