<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { buscarTema, esDev } from '../content'
import { enLinea } from '../lib/texto'
import NoEncontrado from '../components/layout/NoEncontrado.vue'
import TemaHero from '../components/tema/TemaHero.vue'
import TemaIndice from '../components/tema/TemaIndice.vue'
import ListaRequisitos from '../components/tema/ListaRequisitos.vue'
import PasoAPaso from '../components/tema/PasoAPaso.vue'
import ErroresComunes from '../components/tema/ErroresComunes.vue'
import TemaMedia from '../components/tema/TemaMedia.vue'

const route = useRoute()
const tema = computed(() => buscarTema(String(route.params.slug)))

// Los ids deben coincidir con las secciones de abajo.
const secciones = [
  { id: 'que-es', titulo: 'De qué se trata' },
  { id: 'antes', titulo: 'Antes de empezar' },
  { id: 'pasos', titulo: 'Paso a paso' },
  { id: 'errores', titulo: 'Errores comunes' },
  { id: 'resumen', titulo: 'Resumen' },
]

watchEffect(() => {
  if (tema.value) document.title = `${tema.value.hero.titulo} · Code & Coffee`
})
</script>

<template>
  <NoEncontrado
    v-if="!tema"
    titulo="Este tema todavía no está servido"
    texto="No encontramos el tema que buscas. Puede que aún se esté preparando o que el enlace tenga un error."
  />
  <template v-else>
    <p v-if="esDev && tema.estado !== 'publicado'" class="aviso-estado" role="status">
      Estado: <b>{{ tema.estado }}</b>. Solo se ve en desarrollo; no se incluye en el build de producción.
    </p>

    <TemaHero :tema="tema" />

    <div id="temas" class="wrap page">
      <TemaIndice :secciones="secciones" />

      <main class="content">
        <section id="que-es">
          <h2>{{ secciones[0]!.titulo }}</h2>
          <p v-for="(p, i) in tema.secciones.queEs" :key="i" v-html="enLinea(p)"></p>
        </section>

        <section id="antes">
          <h2>{{ secciones[1]!.titulo }}</h2>
          <ListaRequisitos :requisitos="tema.secciones.requisitos" />
        </section>

        <section id="pasos">
          <h2>{{ secciones[2]!.titulo }}</h2>
          <PasoAPaso :pasos="tema.secciones.pasos" :moka-dice="tema.secciones.mokaDice" />
        </section>

        <section id="errores">
          <h2>{{ secciones[3]!.titulo }}</h2>
          <ErroresComunes :errores="tema.secciones.errores" />
        </section>

        <section id="resumen">
          <h2>{{ secciones[4]!.titulo }}</h2>
          <p v-html="enLinea(tema.secciones.resumen)"></p>
          <div v-if="tema.fuentes.length" class="fuentes">
            <h3>Fuentes</h3>
            <ul>
              <li v-for="f in tema.fuentes" :key="f"><a :href="f" target="_blank" rel="noopener noreferrer">{{ f }}</a></li>
            </ul>
          </div>
        </section>
      </main>
    </div>

    <TemaMedia :tema="tema" />
  </template>
</template>

<style scoped>
.aviso-estado{margin:0;background:rgba(111,143,94,.2);color:var(--ink);border-bottom:2px solid var(--cardamomo);font-size:15px;text-align:center;padding:8px 24px}
.page{display:grid;grid-template-columns:240px minmax(0,1fr);gap:56px;padding-top:64px;padding-bottom:40px}
.page>*{min-width:0}
.content{max-width:720px}
.content section{padding-bottom:56px}
.content h2{font-weight:800;font-stretch:85%;font-size:clamp(30px,3.6vw,42px);line-height:1.08;letter-spacing:-.02em;margin:0 0 16px}
.content h3{font-weight:700;font-size:22px;margin:0 0 6px}
.content p{margin:0 0 16px}
.fuentes{margin-top:28px;padding-top:20px;border-top:1px solid var(--line);font-size:15.5px;color:var(--muted)}
.fuentes h3{font-size:17px}
.fuentes ul{margin:0;padding-left:20px}
.fuentes a{overflow-wrap:anywhere}
.fuentes a:hover{color:var(--terracota)}
@media (max-width:900px){.page{grid-template-columns:minmax(0,1fr);gap:24px}}
</style>
