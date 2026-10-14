<script setup lang="ts">
import { onMounted } from 'vue'
import { esDev, temas, tueste } from '../content'
import Moka from '../components/Moka.vue'
import Boton from '../components/bloques/Boton.vue'

onMounted(() => (document.title = 'Code & Coffee · IA y desarrollo en español'))
</script>

<template>
  <header class="hero">
    <div class="wrap">
      <div class="copy-col">
        <p class="crumbs">IA y desarrollo, en español</p>
        <h1>Code &amp; Coffee <span>recién hecho</span></h1>
        <p class="intro">Temas cortos y prácticos para que aprendas a trabajar con IA mientras se enfría tu café. Cada uno tiene su página y su video.</p>
        <div class="ctas"><Boton href="#temas">Ver el menú</Boton></div>
      </div>
      <div class="stage" aria-hidden="true">
        <div class="disk"></div>
        <div class="hero-moka"><Moka expresion="happy" pose="wave" /></div>
      </div>
    </div>
  </header>

  <main id="temas" class="wrap menu">
    <div class="carta">
      <p class="sobre">Code &amp; Coffee</p>
      <h2>Menú de la casa</h2>
      <p class="nota">Elige un tema. El tueste indica la dificultad.</p>

      <ol v-if="temas.length" class="platos">
        <li v-for="t in temas" :key="t.slug">
          <RouterLink :to="`/temas/${t.slug}`" class="plato">
            <span class="linea">
              <span class="nombre">{{ t.hero.titulo }}</span>
              <span class="puntos" aria-hidden="true"></span>
              <span class="precio">{{ t.hero.duracion }}</span>
            </span>
            <span class="desc">{{ t.hero.subtitulo }}</span>
            <span class="meta">
              <span>{{ tueste(t.hero.tueste).puntos }} {{ tueste(t.hero.tueste).nombre }}</span>
              <span v-if="t.serie">{{ t.serie.nombre }} · parte {{ t.serie.parte }} de {{ t.serie.total }}</span>
              <span v-if="esDev && t.estado !== 'publicado'" class="estado">{{ t.estado }}</span>
            </span>
          </RouterLink>
        </li>
      </ol>

      <div v-else class="vacio">
        <div class="moka-vacia"><Moka expresion="wow" pose="rest" /></div>
        <p>El menú se está preparando. Vuelve pronto por el primer tema.</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.hero{background:radial-gradient(900px 520px at 78% 40%,rgba(217,119,87,.38),transparent 62%),radial-gradient(600px 400px at 0% 100%,rgba(138,90,59,.35),transparent 70%),var(--tostado);color:var(--crema);overflow:hidden;position:relative}
.hero::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(243,235,221,.07) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(180deg,#000 30%,transparent)}
.hero .wrap{display:grid;grid-template-columns:1.2fr .8fr;gap:24px;align-items:center;min-height:460px;padding-top:40px;padding-bottom:56px;position:relative}
.crumbs{font-size:15px;color:#C9B6A2;margin:0 0 18px}
.hero h1{font-weight:800;font-stretch:80%;font-size:clamp(48px,7.4vw,96px);line-height:.92;letter-spacing:-.025em;margin:0 0 22px;text-wrap:balance}
.hero h1 span{display:block;color:var(--brasa)}
.hero .intro{font-size:20px;color:#E5D6C4;max-width:40ch;margin:0 0 28px}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.stage{position:relative;height:380px}
.disk{position:absolute;left:50%;top:52%;width:300px;height:300px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 40% 30%,#4A3428,#2A1E17 60%,#1A120D);border:6px solid var(--terracota);box-shadow:0 0 0 14px rgba(217,119,87,.14),0 0 120px rgba(217,119,87,.5),inset 0 -20px 60px rgba(0,0,0,.4)}
.hero-moka{position:absolute;left:50%;top:50%;width:240px;transform:translate(-50%,-46%);filter:drop-shadow(0 30px 30px rgba(0,0,0,.35))}

.menu{padding-top:64px;padding-bottom:40px}
.carta{max-width:820px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:28px;padding:48px clamp(20px,5vw,56px) 40px;box-shadow:0 0 0 8px var(--bg),0 0 0 9px var(--line)}
.sobre{margin:0;text-align:center;font-weight:700;font-size:14px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracota)}
.carta h2{text-align:center;font-weight:800;font-stretch:80%;font-size:clamp(36px,5vw,56px);line-height:1;letter-spacing:-.02em;margin:6px 0 8px}
.nota{text-align:center;color:var(--muted);margin:0 0 32px;font-size:16px}
.platos{list-style:none;margin:0;padding:0}
.platos li+li{border-top:1px dashed var(--line)}
.plato{display:block;text-decoration:none;padding:20px 12px;border-radius:14px;transition:background .2s}
.plato:hover{background:rgba(217,119,87,.08)}
.linea{display:flex;align-items:baseline;gap:12px}
.nombre{font-weight:800;font-stretch:85%;font-size:clamp(22px,2.6vw,28px);line-height:1.15}
.puntos{flex:1;border-bottom:3px dotted var(--tueste);opacity:.5;transform:translateY(-6px);min-width:24px}
.precio{font:600 16px var(--mono);color:var(--terracota);white-space:nowrap}
.desc{display:block;color:var(--muted);margin-top:4px}
.meta{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px;font-size:14.5px;color:var(--muted)}
.estado{background:rgba(111,143,94,.2);color:var(--ink);border:1px solid var(--cardamomo);border-radius:999px;padding:0 10px}
.vacio{text-align:center;color:var(--muted)}
.moka-vacia{width:120px;margin:0 auto 12px}

@media (max-width:900px){
  .hero .wrap{grid-template-columns:1fr;min-height:0}
  .stage{height:320px}.disk{width:240px;height:240px}.hero-moka{width:190px}
}
</style>
