<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Estado, TemaAdmin } from '../types'
import NoEncontrado from '../components/layout/NoEncontrado.vue'

// Panel con el estado de TODOS los temas. El token viaja en el encabezado
// Authorization y lo valida el Worker (GET /api/admin). Si no coincide, 404.
const route = useRoute()
const estado = ref<'cargando' | 'ok' | 'no-encontrado'>('cargando')
const temas = ref<TemaAdmin[]>([])

const ORDEN: Estado[] = ['borrador', 'pagina-aprobada', 'video-listo', 'publicado']
const conteo = computed(() => ORDEN.map((e) => ({ estado: e, n: temas.value.filter((t) => t.estado === e).length })))

onMounted(async () => {
  // Que el panel no se indexe.
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.appendChild(robots)
  document.title = 'Panel · Code & Coffee'

  try {
    const r = await fetch('/api/admin', {
      headers: { Authorization: `Bearer ${String(route.params.token)}` },
      cache: 'no-store',
    })
    if (!r.ok) throw new Error(String(r.status))
    const datos = (await r.json()) as { temas: TemaAdmin[] }
    temas.value = datos.temas
    estado.value = 'ok'
  } catch {
    estado.value = 'no-encontrado'
  }
})
</script>

<template>
  <NoEncontrado v-if="estado === 'no-encontrado'" />
  <main v-else class="wrap panel" :aria-busy="estado === 'cargando'">
    <h1>Panel de temas</h1>
    <p v-if="estado === 'cargando'" class="nota">Cargando…</p>
    <template v-else>
      <ul class="resumen">
        <li v-for="c in conteo" :key="c.estado" :class="c.estado"><b>{{ c.n }}</b> {{ c.estado }}</li>
      </ul>
      <div class="tabla">
        <table>
          <thead>
            <tr><th scope="col">Tema</th><th scope="col">Slug</th><th scope="col">Estado</th><th scope="col">Fecha</th></tr>
          </thead>
          <tbody>
            <tr v-for="t in temas" :key="t.slug">
              <td>
                <RouterLink v-if="t.estado === 'publicado'" :to="`/temas/${t.slug}`">{{ t.titulo }}</RouterLink>
                <template v-else>{{ t.titulo }}</template>
              </td>
              <td><code class="i">{{ t.slug }}</code></td>
              <td><span class="estado" :class="t.estado">{{ t.estado }}</span></td>
              <td>{{ t.fecha }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </main>
</template>

<style scoped>
.panel{padding-top:48px;padding-bottom:40px}
h1{font-weight:800;font-stretch:85%;font-size:clamp(32px,4vw,48px);letter-spacing:-.02em;margin:0 0 20px}
.nota{color:var(--muted)}
.resumen{list-style:none;margin:0 0 24px;padding:0;display:flex;flex-wrap:wrap;gap:10px}
.resumen li{background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:6px 16px;font-size:15px}
.resumen b{color:var(--terracota)}
.tabla{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:20px}
table{width:100%;border-collapse:collapse;font-size:16px}
th,td{text-align:left;padding:14px 18px;border-bottom:1px solid var(--line)}
th{font-size:14px;color:var(--muted);font-weight:700}
tbody tr:last-child td{border-bottom:0}
.estado{display:inline-block;border-radius:999px;padding:2px 12px;font-size:14px;font-weight:600;border:1px solid var(--line)}
.estado.borrador{border-color:var(--tueste)}
.estado.pagina-aprobada{border-color:var(--brasa)}
.estado.video-listo{border-color:var(--terracota)}
.estado.publicado{background:var(--cardamomo);border-color:var(--cardamomo);color:#fff}
</style>
