<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchMyRecords } from '../api/records';
import type { MedicalRecord } from '../types';
import { formatDate } from '../utils/format';
import BaseCard from '../components/ui/BaseCard.vue';
import BaseSpinner from '../components/ui/BaseSpinner.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import IconBase from '../components/ui/IconBase.vue';

const records = ref<MedicalRecord[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    records.value = await fetchMyRecords();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page__header">
        <h1>I miei referti</h1>
        <p>Lo storico delle diagnosi e dei trattamenti ricevuti.</p>
      </header>

      <BaseSpinner v-if="loading" />
      <EmptyState
        v-else-if="!records.length"
        icon="file-text"
        title="Nessun referto disponibile"
        description="I referti compariranno qui dopo le tue visite completate."
      />
      <div v-else class="list">
        <RouterLink
          v-for="record in records"
          :key="record.id"
          :to="`/referti/${record.id}`"
          class="record-link"
        >
          <BaseCard hoverable class="record">
            <div class="record__icon"><IconBase name="file-text" :size="20" /></div>
            <div class="record__info">
              <p class="record__title">{{ record.appointment?.service.name }}</p>
              <p class="record__meta">
                {{ record.appointment ? formatDate(record.appointment.slot.startTime) : '' }} · Dr.
                {{ record.appointment?.doctor.firstName }} {{ record.appointment?.doctor.lastName }}
              </p>
            </div>
            <IconBase name="chevron-right" :size="18" />
          </BaseCard>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 40px 0 72px;
  flex: 1;
}

.page__header {
  margin-bottom: 24px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-link {
  text-decoration: none;
  color: inherit;
}

.record {
  display: flex;
  align-items: center;
  gap: 16px;
}

.record__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.record__info {
  flex: 1;
}

.record__title {
  margin: 0;
  font-weight: 700;
}

.record__meta {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}
</style>
