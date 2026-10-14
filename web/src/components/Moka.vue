<script setup lang="ts">
// Moka, la mascota de Code & Coffee (versión Vue de assets/moka.js).
// Las animaciones viven en styles/tokens.css (bloque Mascota).
import { computed, useId } from 'vue'
import type { Expresion, Pose } from '../types'

const props = withDefaults(defineProps<{ expresion?: Expresion; pose?: Pose }>(), {
  expresion: 'happy',
  pose: 'rest',
})

const id = useId()
const taza = `c-${id}`
const espuma = `f-${id}`
const wow = computed(() => props.expresion === 'wow')
</script>

<template>
  <svg class="moka" viewBox="0 0 200 224" role="img" aria-label="Moka, la mascota de Code and Coffee">
    <defs>
      <linearGradient :id="taza" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#F6A483" /><stop offset=".45" stop-color="#D97757" /><stop offset="1" stop-color="#B0522F" />
      </linearGradient>
      <radialGradient :id="espuma" cx=".4" cy=".35" r=".8">
        <stop offset="0" stop-color="#FFF7EC" /><stop offset="1" stop-color="#E6CBAE" />
      </radialGradient>
    </defs>
    <ellipse class="shadow" cx="100" cy="214" rx="52" ry="7" fill="#000" opacity=".35" />
    <g class="bob">
      <g class="steam" fill="none" stroke="#F3EBDD" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M82 54 l-11 -10 l11 -10" /><path d="M106 28 l-9 30" /><path d="M118 34 l11 10 l-11 10" />
      </g>
      <path d="M150 100 h8 a24 24 0 0 1 0 48 h-12" fill="none" stroke="#B0522F" stroke-width="13" />
      <ellipse cx="84" cy="196" rx="11" ry="6" fill="#8F4229" /><ellipse cx="116" cy="196" rx="11" ry="6" fill="#8F4229" />

      <!-- Brazo izquierdo -->
      <g v-if="pose === 'wave'" class="arm-wave">
        <path d="M46 124 Q26 118 24 96" fill="none" :stroke="`url(#${taza})`" stroke-width="11" stroke-linecap="round" />
        <circle cx="24" cy="91" r="8.5" fill="#EE8F6C" />
      </g>
      <template v-else>
        <path d="M46 130 Q30 142 30 160" fill="none" :stroke="`url(#${taza})`" stroke-width="11" stroke-linecap="round" />
        <circle cx="30" cy="164" r="8.5" fill="#EE8F6C" />
      </template>

      <!-- Brazo derecho -->
      <template v-if="pose === 'point'">
        <path d="M152 150 Q170 140 180 120" fill="none" :stroke="`url(#${taza})`" stroke-width="11" stroke-linecap="round" />
        <circle cx="182" cy="115" r="8.5" fill="#EE8F6C" />
        <path d="M184 107 l4 -10" stroke="#EE8F6C" stroke-width="5" stroke-linecap="round" />
      </template>
      <template v-else>
        <path d="M150 156 Q164 166 166 180" fill="none" :stroke="`url(#${taza})`" stroke-width="11" stroke-linecap="round" />
        <circle cx="166" cy="184" r="8.5" fill="#EE8F6C" />
      </template>

      <path d="M38 82 h124 l-9 82 a30 30 0 0 1 -30 26 h-46 a30 30 0 0 1 -30 -26 z" :fill="`url(#${taza})`" />
      <path d="M56 98 Q52 132 64 162" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".38" />
      <circle cx="60" cy="172" r="3.5" fill="#fff" opacity=".35" />
      <ellipse cx="100" cy="83" rx="63" ry="15" fill="#A94F33" />
      <ellipse cx="100" cy="81" rx="57" ry="12" :fill="`url(#${espuma})`" />
      <path d="M100 90 c-10 -6 -12 -12 -6 -14 c3 -1 5 1 6 3 c1 -2 3 -4 6 -3 c6 2 4 8 -6 14 z" fill="#B07A55" />

      <g class="eyes">
        <template v-if="wow">
          <ellipse cx="80" cy="116" rx="8.5" ry="11" fill="#2A1E17" /><ellipse cx="120" cy="116" rx="8.5" ry="11" fill="#2A1E17" />
          <circle cx="83" cy="111" r="3.2" fill="#fff" /><circle cx="123" cy="111" r="3.2" fill="#fff" />
        </template>
        <template v-else>
          <ellipse cx="80" cy="118" rx="7" ry="9" fill="#2A1E17" /><ellipse cx="120" cy="118" rx="7" ry="9" fill="#2A1E17" />
          <circle cx="82.5" cy="114" r="2.6" fill="#fff" /><circle cx="122.5" cy="114" r="2.6" fill="#fff" />
        </template>
      </g>
      <ellipse cx="66" cy="134" rx="8" ry="4.5" fill="#FF9E80" opacity=".75" /><ellipse cx="134" cy="134" rx="8" ry="4.5" fill="#FF9E80" opacity=".75" />

      <template v-if="wow">
        <ellipse cx="100" cy="138" rx="7.5" ry="9" fill="#2A1E17" /><ellipse cx="100" cy="142" rx="4.5" ry="3" fill="#E5735A" />
      </template>
      <template v-else>
        <path d="M86 131 Q100 149 114 131 Z" fill="#2A1E17" />
        <path d="M93 139 Q100 144 107 139 Q100 136.5 93 139 Z" fill="#E5735A" />
      </template>
    </g>
  </svg>
</template>
