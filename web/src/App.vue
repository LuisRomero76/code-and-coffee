<script setup lang="ts">
import { useRoute } from 'vue-router'
import NavBar from './components/layout/NavBar.vue'
import ProgressBar from './components/layout/ProgressBar.vue'
import SiteFooter from './components/layout/SiteFooter.vue'

const route = useRoute()
</script>

<template>
  <ProgressBar />
  <NavBar />
  <RouterView :key="route.path" />
  <SiteFooter />
</template>
