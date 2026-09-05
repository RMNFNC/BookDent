<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    error?: string;
    required?: boolean;
    placeholder?: string;
  }>(),
  {}
);

defineEmits<{ 'update:modelValue': [value: string] }>();

const selectId = useId();
</script>

<template>
  <div class="field">
    <label v-if="label" :for="selectId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
    </label>
    <div class="field__select-wrap">
      <select
        :id="selectId"
        class="field__select"
        :class="{ 'field__select--error': error }"
        :value="modelValue"
        :required="required"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot />
      </select>
    </div>
    <p v-if="error" class="field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.field__required {
  color: var(--color-danger);
}

.field__select-wrap {
  position: relative;
}

.field__select {
  width: 100%;
  height: 46px;
  padding: 0 40px 0 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23526b72' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='5,9 12,16 19,9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}

.field__select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.field__select--error {
  border-color: var(--color-danger);
}

.field__error {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 500;
}
</style>
