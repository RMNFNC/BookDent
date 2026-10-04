<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit';
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
    block: false,
  }
);
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'btn--loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <span class="btn__content"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-weight: 600;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease,
    box-shadow 0.15s ease;
  white-space: nowrap;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--sm {
  height: 36px;
  padding: 0 16px;
  font-size: 0.875rem;
}

.btn--md {
  height: 44px;
  padding: 0 22px;
  font-size: 0.95rem;
}

.btn--lg {
  height: 52px;
  padding: 0 28px;
  font-size: 1.05rem;
}

.btn--block {
  width: 100%;
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn--secondary {
  background: var(--color-secondary);
  color: #ffffff;
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-secondary-dark);
}

.btn--outline {
  background: transparent;
  color: var(--color-primary-dark);
  border-color: var(--color-border-strong);
}

.btn--outline:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.btn--danger {
  background: transparent;
  color: var(--color-danger);
  border-color: var(--color-danger-bg);
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-bg);
}

.btn__spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 0.6s linear infinite;
  opacity: 0.8;
}

/* Icona e testo affiancati: gli svg sono display: block (base.css) e
   altrimenti andrebbero a capo dentro lo span. */
.btn__content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn--loading .btn__content {
  opacity: 0.85;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
