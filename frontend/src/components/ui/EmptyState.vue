<script setup lang="ts">
import IconBase from './IconBase.vue';

withDefaults(defineProps<{ icon?: string; title: string; description?: string }>(), {
  icon: 'inbox',
});
</script>

<template>
  <div class="empty">
    <div class="empty__icon"><IconBase :name="icon" :size="28" /></div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--color-text-secondary);
}

.empty__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-bg-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty__title {
  margin: 0 0 6px;
  font-size: 1.1rem;
  color: var(--color-text);
}

.empty__description {
  margin: 0 auto;
  max-width: 360px;
}
</style>
