<script setup lang="ts">
import IconBase from '../ui/IconBase.vue';

const year = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <span class="footer__brand-icon"><IconBase name="tooth" :size="16" /></span>
        BookDent-FlashCare
      </div>
      <p class="footer__note">
        © {{ year }} BookDent-FlashCare · Il tuo sorriso digitale · Prenotazioni e referti online per
        il tuo studio dentistico
      </p>
      <p class="footer__disclaimer" role="note">
        <IconBase name="info" :size="14" />
        <span>
          Progetto a esclusivo scopo didattico. BookDent-FlashCare è un’azienda di fantasia: non
          esiste uno studio reale con questo nome e tutti i dati presenti sono fittizi.
        </span>
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

.footer__disclaimer {
  flex-basis: 100%;
  margin: 0;
  padding-top: 12px;
  border-top: 1px dashed var(--color-border);
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--color-text-muted);
}

.footer__disclaimer :deep(svg) {
  flex-shrink: 0;
  margin-top: 2px;
}

.footer__note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
