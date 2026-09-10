<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    error?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
  }>(),
  { rows: 4 }
);

defineEmits<{ 'update:modelValue': [value: string] }>();

const textareaId = useId();
</script>

<template>
  <div class="field">
    <label v-if="label" :for="textareaId" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
    </label>
    <textarea
      :id="textareaId"
      class="field__textarea"
      :class="{ 'field__textarea--error': error }"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
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

.field__textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.95rem;
  resize: vertical;
}

.field__textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.field__textarea--error {
  border-color: var(--color-danger);
}

.field__error {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 500;
}
</style>
