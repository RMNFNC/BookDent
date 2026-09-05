import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { Role } from '../types';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    roles?: Role[];
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/servizi',
      name: 'services',
      component: () => import('../views/ServicesView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/registrati',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/prenota',
      name: 'book-appointment',
      component: () => import('../views/BookAppointmentView.vue'),
      meta: { requiresAuth: true, roles: ['PATIENT'] },
    },
    {
      path: '/appuntamenti',
      name: 'appointments',
      component: () => import('../views/AppointmentsView.vue'),
      meta: { requiresAuth: true, roles: ['PATIENT', 'DOCTOR'] },
    },
    {
      path: '/appuntamenti/:id',
      name: 'appointment-detail',
      component: () => import('../views/AppointmentDetailView.vue'),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/appuntamenti/:appointmentId/referto',
      name: 'record-form',
      component: () => import('../views/RecordFormView.vue'),
      meta: { requiresAuth: true, roles: ['DOCTOR'] },
      props: true,
    },
    {
      path: '/referti',
      name: 'my-records',
      component: () => import('../views/MyRecordsView.vue'),
      meta: { requiresAuth: true, roles: ['PATIENT'] },
    },
    {
      path: '/referti/:id',
      name: 'record-detail',
      component: () => import('../views/RecordDetailView.vue'),
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: '/disponibilita',
      name: 'availability',
      component: () => import('../views/AvailabilityView.vue'),
      meta: { requiresAuth: true, roles: ['DOCTOR'] },
    },
    {
      path: '/admin/dottori',
      name: 'admin-doctors',
      component: () => import('../views/AdminDoctorsView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
    },
    {
      path: '/admin/servizi',
      name: 'admin-services',
      component: () => import('../views/AdminServicesView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
    },
    {
      path: '/admin/appuntamenti',
      name: 'admin-appointments',
      component: () => import('../views/AdminAppointmentsView.vue'),
      meta: { requiresAuth: true, roles: ['ADMIN'] },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }

  if (to.meta.roles && auth.role && !to.meta.roles.includes(auth.role)) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
