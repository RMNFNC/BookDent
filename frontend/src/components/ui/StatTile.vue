<script setup lang="ts">
import IconBase from './IconBase.vue';

withDefaults(
  defineProps<{
    icon: string;
    label: string;
    value: string | number;
    tone?: 'primary' | 'secondary';
  }>(),
  {
    tone: 'primary',
  }
);
</script>

<template>
  <div class="stat">
    <div class="stat__icon" :class="`stat__icon--${tone}`">
      <IconBase :name="icon" :size="20" />
    </div>
    <div>
      <p class="stat__value">{{ value }}</p>
      <p class="stat__label">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat__icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat__icon--primary {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}

.stat__icon--secondary {
  background: var(--color-secondary-light);
  color: var(--color-secondary-dark);
}

.stat__value {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
}

.stat__label {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
</style>
