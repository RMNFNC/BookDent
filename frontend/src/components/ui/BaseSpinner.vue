<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Caricamento…' });
</script>

<template>
  <div class="spinner-wrap">
    <span class="spinner" aria-hidden="true" />
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid var(--color-primary-light);
  border-top-color: var(--color-primary);
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
