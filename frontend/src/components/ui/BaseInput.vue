<script setup lang="ts">
import { computed, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    type?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    autocomplete?: string;
    min?: string;
    max?: string;
  }>(),
  { type: 'text' }
);

defineEmits<{ 'update:modelValue': [value: string] }>();

const inputId = useId();
const describedBy = computed(() => (props.error ? `${inputId}-error` : undefined));
</script>

<template>
  <div class="field">
    <label v-if="label" :for="inputId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
    </label>
    <input
      :id="inputId"
      class="field__input"
      :class="{ 'field__input--error': error }"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :min="min"
      :max="max"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="hint && !error" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="`${inputId}-error`" class="field__error">{{ error }}</p>
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

.field__input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field__input::placeholder {
  color: var(--color-text-muted);
}

.field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.field__input--error {
  border-color: var(--color-danger);
}

.field__hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.field__error {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 500;
}
</style>
