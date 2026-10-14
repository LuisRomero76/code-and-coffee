import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/temas/:slug', name: 'tema', component: () => import('./views/TemaView.vue') },
    { path: '/admin/:token', name: 'admin', component: () => import('./views/AdminView.vue') },
    { path: '/:ruta(.*)*', name: 'no-encontrado', component: () => import('./components/layout/NoEncontrado.vue') },
  ],
  scrollBehavior(to, _from, guardado) {
    if (guardado) return guardado
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
