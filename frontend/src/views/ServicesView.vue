<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchServices } from '../api/services';
import type { DentalService } from '../types';
import { formatDuration, formatPrice } from '../utils/format';
import { useAuthStore } from '../stores/auth';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import IconBase from '../components/ui/IconBase.vue';

const auth = useAuthStore();
const services = ref<DentalService[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    services.value = await fetchServices();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page__header">
        <h1>Le nostre prestazioni</h1>
        <p>
          Tutte le visite prenotabili online. Scegli, indica quando preferisci e ti assegneremo un
          dentista disponibile.
        </p>
      </header>

      <BaseSpinner v-if="loading" />
      <EmptyState
        v-else-if="!services.length"
        icon="file-text"
        title="Nessuna prestazione disponibile"
        description="Al momento non ci sono prestazioni attive. Riprova più tardi."
      />
      <div v-else class="grid">
        <BaseCard v-for="service in services" :key="service.id" hoverable>
          <h3>{{ service.name }}</h3>
          <p v-if="service.description">{{ service.description }}</p>
          <div class="meta">
            <span
              ><IconBase name="clock" :size="15" /> {{ formatDuration(service.durationMin) }}</span
            >
            <span class="meta__price">{{ formatPrice(service.price) }}</span>
          </div>
          <RouterLink :to="auth.isAuthenticated ? '/prenota' : '/registrati'">
            <BaseButton block variant="outline" size="sm">Prenota questa visita</BaseButton>
          </RouterLink>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 48px 0 72px;
  flex: 1;
}

.page__header {
  max-width: 60ch;
  margin-bottom: 36px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.grid h3 {
  margin-bottom: 6px;
}

.grid p {
  font-size: 0.9rem;
  min-height: 40px;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  padding: 12px 0 16px;
}

.meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta__price {
  font-weight: 700;
  color: var(--color-primary-dark);
}
</style>
