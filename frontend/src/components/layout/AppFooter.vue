<script setup lang="ts">
import IconBase from '../ui/IconBase.vue';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="footer__brand-icon"><IconBase name="tooth" :size="16" /></span>
        Smart Dental Care
      </div>
      <p class="footer__note">
        © {{ year }} Smart Dental Care · Il tuo sorriso digitale · Prenotazioni e referti online per
        il tuo studio dentistico
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  margin-top: auto;
  background: var(--color-bg-soft);
}

.footer__inner {
  padding: 28px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.footer__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-text);
}

.footer__brand-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer__note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
