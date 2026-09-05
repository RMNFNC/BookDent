<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import IconBase from './IconBase.vue';

const props = defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ close: [] }>();

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close');
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal__header">
            <h3 class="modal__title">{{ title }}</h3>
            <button class="modal__close" type="button" aria-label="Chiudi" @click="emit('close')">
              <IconBase name="close" :size="18" />
            </button>
          </div>
          <div class="modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 38, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.modal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 24px;
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.modal__title {
  margin: 0;
  font-size: 1.2rem;
}

.modal__close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
}

.modal__close:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.modal__footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(12px) scale(0.98);
}
</style>
