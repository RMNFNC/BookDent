<script setup lang="ts">
import BaseButton from '../components/ui/BaseButton.vue';
import IconBase from '../components/ui/IconBase.vue';
</script>

<template>
  <div class="page">
    <div class="container page__inner">
      <div class="icon"><IconBase name="search" :size="28" /></div>
      <h1>Pagina non trovata</h1>
      <p>La pagina che cerchi non esiste o è stata spostata.</p>
      <RouterLink to="/"><BaseButton>Torna alla home</BaseButton></RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 60px 0;
}

.page__inner {
  text-align: center;
  max-width: 420px;
  margin: 0 auto;
}

.icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-bg-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.page__inner p {
  margin-bottom: 24px;
}
</style>
