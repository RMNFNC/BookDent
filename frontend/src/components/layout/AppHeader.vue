<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import IconBase from '../ui/IconBase.vue';
import { initials } from '../../utils/format';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const mobileOpen = ref(false);
const userMenuOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
    userMenuOpen.value = false;
  }
);

interface NavItem {
  label: string;
  to: string;
}

const navItems = computed<NavItem[]>(() => {
  if (!auth.isAuthenticated) {
    return [{ label: 'Servizi', to: '/servizi' }];
  }

  switch (auth.role) {
    case 'PATIENT':
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Prenota visita', to: '/prenota' },
        { label: 'Appuntamenti', to: '/appuntamenti' },
        { label: 'Referti', to: '/referti' },
      ];
    case 'DOCTOR':
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Appuntamenti', to: '/appuntamenti' },
        { label: 'Disponibilità', to: '/disponibilita' },
      ];
    case 'ADMIN':
      return [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Dottori', to: '/admin/dottori' },
        { label: 'Servizi', to: '/admin/servizi' },
        { label: 'Appuntamenti', to: '/admin/appuntamenti' },
      ];
    default:
      return [];
  }
});

const roleLabel = computed(() => {
  switch (auth.role) {
    case 'PATIENT':
      return 'Paziente';
    case 'DOCTOR':
      return 'Dentista';
    case 'ADMIN':
      return 'Amministratore';
    default:
      return '';
  }
});

const userInitials = computed(() => {
  const p = auth.profile;
  if (p?.doctor) return initials(p.doctor.firstName, p.doctor.lastName);
  if (p?.patient) return initials(p.patient.firstName, p.patient.lastName);
  return (auth.user?.email ?? '').slice(0, 2).toUpperCase();
});

const handleLogout = () => {
  auth.logout();
  userMenuOpen.value = false;
  router.push({ name: 'home' });
};
</script>

<template>
  <header class="header">
    <div class="header__bar container">
      <RouterLink to="/" class="header__brand">
        <span class="header__brand-icon"><IconBase name="tooth" :size="20" /></span>
        <span>DentalCare</span>
      </RouterLink>

      <nav class="header__nav header__nav--desktop" aria-label="Principale">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="header__link">
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header__actions header__actions--desktop">
        <template v-if="!auth.isAuthenticated">
          <RouterLink to="/login" class="header__ghost-link">Accedi</RouterLink>
          <RouterLink to="/registrati" class="header__cta">Registrati</RouterLink>
        </template>
        <div v-else class="header__user">
          <button class="header__user-trigger" type="button" @click="userMenuOpen = !userMenuOpen">
            <span class="header__avatar">{{ userInitials || 'U' }}</span>
            <span class="header__user-info">
              <strong>{{ auth.displayName }}</strong>
              <small>{{ roleLabel }}</small>
            </span>
            <IconBase name="chevron-down" :size="16" />
          </button>
          <div v-if="userMenuOpen" class="header__dropdown">
            <button class="header__dropdown-item" type="button" @click="handleLogout">
              <IconBase name="logout" :size="16" />
              Esci
            </button>
          </div>
        </div>
      </div>

      <button
        class="header__burger"
        type="button"
        aria-label="Apri menu"
        @click="mobileOpen = !mobileOpen"
      >
        <IconBase :name="mobileOpen ? 'close' : 'menu'" :size="24" />
      </button>
    </div>

    <Transition name="drawer">
      <div v-if="mobileOpen" class="header__drawer">
        <nav class="header__drawer-nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="header__drawer-link"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="header__drawer-actions">
          <template v-if="!auth.isAuthenticated">
            <RouterLink to="/login" class="header__ghost-link header__ghost-link--block">
              Accedi
            </RouterLink>
            <RouterLink to="/registrati" class="header__cta header__cta--block">
              Registrati
            </RouterLink>
          </template>
          <button
            v-else
            class="header__ghost-link header__ghost-link--block"
            type="button"
            @click="handleLogout"
          >
            <IconBase name="logout" :size="16" />
            Esci ({{ auth.displayName }})
          </button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
}

.header__bar {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 68px;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--color-text);
  text-decoration: none;
  margin-right: auto;
}

.header__brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
}

.header__nav--desktop {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header__link {
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.header__link:hover,
.header__link.router-link-active {
  background: var(--color-bg-soft);
  color: var(--color-primary-dark);
}

.header__actions--desktop {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header__ghost-link {
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
}

.header__ghost-link:hover {
  background: var(--color-bg-soft);
}

.header__cta {
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: var(--shadow-sm);
}

.header__cta:hover {
  background: var(--color-primary-dark);
}

.header__user {
  position: relative;
}

.header__user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 6px 14px 6px 6px;
  cursor: pointer;
  color: var(--color-text);
}

.header__user-trigger:hover {
  background: var(--color-bg-soft);
}

.header__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.78rem;
}

.header__user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.2;
  max-width: 160px;
}

.header__user-info strong {
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header__user-info small {
  color: var(--color-text-muted);
  font-size: 0.72rem;
}

.header__dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  min-width: 160px;
  overflow: hidden;
}

.header__dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--color-danger);
  font-weight: 600;
  font-size: 0.88rem;
}

.header__dropdown-item:hover {
  background: var(--color-danger-bg);
}

.header__burger {
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 6px;
}

.header__drawer {
  display: none;
}

@media (max-width: 860px) {
  .header__nav--desktop,
  .header__actions--desktop {
    display: none;
  }

  .header__burger {
    display: flex;
  }

  .header__drawer {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 20px 20px 28px;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .header__drawer-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .header__drawer-link {
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    color: var(--color-text);
    text-decoration: none;
    font-weight: 600;
  }

  .header__drawer-link.router-link-active {
    background: var(--color-bg-soft);
    color: var(--color-primary-dark);
  }

  .header__drawer-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .header__ghost-link--block,
  .header__cta--block {
    width: 100%;
    justify-content: center;
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
