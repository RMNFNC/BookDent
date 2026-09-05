import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './styles/base.css';
import App from './App.vue';
import router from './router';
import { AUTH_LOGOUT_EVENT } from './api/client';
import { useAuthStore } from './stores/auth';

const app = createApp(App);

app.use(createPinia());
app.use(router);

const auth = useAuthStore();
if (auth.isAuthenticated) {
  auth.loadProfile().catch(() => auth.logout());
}

window.addEventListener(AUTH_LOGOUT_EVENT, () => {
  auth.logout();
  if (router.currentRoute.value.meta.requiresAuth) {
    router.push({ name: 'login' });
  }
});

app.mount('#app');
