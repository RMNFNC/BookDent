<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchServices } from '../api/services';
import type { DentalService } from '../types';
import { formatDuration, formatPrice } from '../utils/format';
import { useAuthStore } from '../stores/auth';
import BaseButton from '../components/ui/BaseButton.vue';
import BaseCard from '../components/ui/BaseCard.vue';
import IconBase from '../components/ui/IconBase.vue';

const auth = useAuthStore();
const services = ref<DentalService[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    services.value = (await fetchServices()).slice(0, 3);
  } catch {
    services.value = [];
  } finally {
    loading.value = false;
  }
});

const steps = [
  {
    icon: 'file-text',
    title: 'Scegli la prestazione',
    text: 'Seleziona il tipo di visita di cui hai bisogno, dalla pulizia dentale alla visita specialistica.',
  },
  {
    icon: 'calendar',
    title: 'Scegli giorno e orario',
    text: 'Indica quando preferisci essere visitato: ti mostriamo subito gli orari realmente disponibili.',
  },
  {
    icon: 'shield',
    title: 'Il dentista viene assegnato per te',
    text: 'Il sistema individua automaticamente un dentista disponibile in quell’orario. Nessuna scelta manuale, nessuna attesa.',
  },
];

const features = [
  {
    icon: 'calendar',
    title: 'Prenotazioni in tempo reale',
    text: 'Disponibilità sempre aggiornata, senza telefonate.',
  },
  {
    icon: 'file-text',
    title: 'Referti sempre a portata di mano',
    text: 'Consulta diagnosi e trattamenti online, quando vuoi.',
  },
  {
    icon: 'lock',
    title: 'Dati clinici protetti',
    text: 'Accesso ai referti riservato a te e al tuo dentista.',
  },
];
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__copy">
          <p class="hero__brand">Smart Dental Care</p>
          <span class="hero__eyebrow">Il tuo sorriso digitale</span>
          <h1>Prenota la tua visita in pochi click, senza pensare a chi te la farà.</h1>
          <p class="hero__lead">
            Scegli la prestazione, il giorno e l’orario che preferisci: Smart Dental Care trova
            automaticamente un dentista disponibile per te. Referti e appuntamenti sempre
            consultabili online.
          </p>
          <div class="hero__actions">
            <RouterLink v-if="!auth.isAuthenticated" to="/registrati">
              <BaseButton size="lg">
                Prenota la tua visita
                <IconBase name="arrow-right" :size="18" />
              </BaseButton>
            </RouterLink>
            <RouterLink v-else to="/prenota">
              <BaseButton size="lg">
                Prenota una visita
                <IconBase name="arrow-right" :size="18" />
              </BaseButton>
            </RouterLink>
            <RouterLink to="/servizi">
              <BaseButton size="lg" variant="outline">Scopri i servizi</BaseButton>
            </RouterLink>
          </div>
        </div>
        <div class="hero__art" aria-hidden="true">
          <div class="hero__art-card hero__art-card--1">
            <IconBase name="calendar" :size="22" />
            <div>
              <strong>Martedì 14 ottobre</strong>
              <span>10:30 · Igiene dentale</span>
            </div>
          </div>
          <div class="hero__art-card hero__art-card--2">
            <IconBase name="check-circle" :size="22" />
            <div>
              <strong>Dentista assegnato</strong>
              <span>Dr.ssa disponibile in automatico</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section__title">Come funziona</h2>
        <p class="section__subtitle">Tre passaggi, zero telefonate.</p>
        <div class="steps">
          <BaseCard v-for="(step, i) in steps" :key="step.title" class="step">
            <span class="step__number">{{ i + 1 }}</span>
            <div class="step__icon"><IconBase :name="step.icon" :size="22" /></div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </BaseCard>
        </div>
      </div>
    </section>

    <section class="section section--soft">
      <div class="container">
        <div class="section__head">
          <div>
            <h2 class="section__title">Le nostre prestazioni</h2>
            <p class="section__subtitle">Un assaggio di ciò che puoi prenotare.</p>
          </div>
          <RouterLink to="/servizi" class="section__link">
            Vedi tutte
            <IconBase name="chevron-right" :size="16" />
          </RouterLink>
        </div>

        <div v-if="loading" class="services-grid">
          <BaseCard v-for="i in 3" :key="i" class="service-card service-card--skeleton" />
        </div>
        <div v-else-if="services.length" class="services-grid">
          <BaseCard v-for="service in services" :key="service.id" hoverable class="service-card">
            <h3>{{ service.name }}</h3>
            <p v-if="service.description">{{ service.description }}</p>
            <div class="service-card__meta">
              <span
                ><IconBase name="clock" :size="15" />
                {{ formatDuration(service.durationMin) }}</span
              >
              <span class="service-card__price">{{ formatPrice(service.price) }}</span>
            </div>
          </BaseCard>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container features">
        <div v-for="feature in features" :key="feature.title" class="feature">
          <div class="feature__icon"><IconBase :name="feature.icon" :size="20" /></div>
          <div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container cta__inner">
        <h2>Pronto a prenotare la tua prossima visita?</h2>
        <RouterLink :to="auth.isAuthenticated ? '/prenota' : '/registrati'">
          <BaseButton size="lg" variant="secondary">Inizia ora</BaseButton>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(180deg, var(--color-bg-soft) 0%, #ffffff 100%);
  padding: 64px 0 40px;
}

.hero__inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
}

.hero__brand {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary-dark);
  margin: 0 0 10px;
}

.hero__eyebrow {
  display: inline-block;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 18px;
}

.hero__lead {
  font-size: 1.08rem;
  max-width: 46ch;
}

.hero__actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.hero__art {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero__art-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  box-shadow: var(--shadow-md);
}

.hero__art-card--1 {
  color: var(--color-primary);
  margin-right: 10%;
}

.hero__art-card--2 {
  color: var(--color-secondary-dark);
  margin-left: 10%;
}

.hero__art-card strong {
  display: block;
  font-size: 0.92rem;
  color: var(--color-text);
}

.hero__art-card span {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.section {
  padding: 56px 0;
}

.section--soft {
  background: var(--color-bg-soft);
}

.section__title {
  margin-bottom: 4px;
}

.section__subtitle {
  margin-bottom: 28px;
}

.section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.section__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-primary-dark);
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 28px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.step {
  position: relative;
}

.step__number {
  position: absolute;
  top: 20px;
  right: 24px;
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-bg-soft-strong);
}

.step__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.step h3 {
  margin-bottom: 6px;
}

.step p {
  margin: 0;
  font-size: 0.92rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.service-card--skeleton {
  height: 160px;
}

.service-card h3 {
  margin-bottom: 6px;
}

.service-card p {
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.service-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}

.service-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.service-card__price {
  font-weight: 700;
  color: var(--color-primary-dark);
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.feature {
  display: flex;
  gap: 14px;
}

.feature__icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background: var(--color-secondary-light);
  color: var(--color-secondary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature h3 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.feature p {
  margin: 0;
  font-size: 0.9rem;
}

.cta {
  background: var(--color-primary-darker);
  background-image: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary-darker));
  padding: 56px 0;
}

.cta__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cta h2 {
  color: #fff;
  margin: 0;
  max-width: 32ch;
}

@media (max-width: 900px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }

  .hero__art {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .hero__art-card {
    flex: 1 1 220px;
    margin: 0 !important;
  }

  .steps,
  .services-grid,
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
