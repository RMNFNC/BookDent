<script setup lang="ts">
import IconBase from './IconBase.vue';

withDefaults(defineProps<{ tone?: 'danger' | 'success' | 'info' | 'warning' }>(), {
  tone: 'info',
});
</script>

<template>
  <div class="alert" :class="`alert--${tone}`" role="status">
    <IconBase :name="tone === 'success' ? 'check-circle' : 'alert'" :size="18" />
    <div class="alert__content"><slot /></div>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
}

.alert__content {
  flex: 1;
}

.alert--danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.alert--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.alert--info {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.alert--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}
</style>
