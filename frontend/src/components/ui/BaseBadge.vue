<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  }>(),
  { tone: 'neutral' }
);
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.badge--neutral {
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
}

.badge--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badge--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.badge--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.badge--info {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.badge--primary {
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
}
</style>
