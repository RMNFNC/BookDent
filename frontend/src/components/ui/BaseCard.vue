<script setup lang="ts">
withDefaults(defineProps<{ padded?: boolean; hoverable?: boolean }>(), {
  padded: true,
  hoverable: false,
});
</script>

<template>
  <div class="card" :class="{ 'card--padded': padded, 'card--hoverable': hoverable }">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card--padded {
  padding: 28px;
}

@media (max-width: 640px) {
  .card--padded {
    padding: 20px;
  }
}

.card--hoverable {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.card--hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
</style>
