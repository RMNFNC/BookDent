<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
</script>

<template>
  <AppHeader />
  <main class="main">
    <RouterView />
  </main>
  <AppFooter />
</template>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
