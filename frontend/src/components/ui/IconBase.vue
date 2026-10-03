<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 });
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="icon"
  >
    <template v-if="name === 'home'">
      <polyline points="4,11 12,4 20,11" />
      <path d="M6 10v9h12v-9" />
    </template>
    <template v-else-if="name === 'menu'">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </template>
    <template v-else-if="name === 'close'">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="4" y="6" width="16" height="15" rx="2" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12,7 12,12 16,14" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </template>
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 14.2c2.9.4 4.9 2.6 4.9 5.8" />
    </template>
    <template v-else-if="name === 'logout'">
      <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <polyline points="9,5 16,12 9,19" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <polyline points="5,9 12,16 19,9" />
    </template>
    <template v-else-if="name === 'check'">
      <polyline points="5,13 10,18 19,7" />
    </template>
    <template v-else-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8,12 11,15 16,9" />
    </template>
    <template v-else-if="name === 'x-circle'">
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </template>
    <template v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </template>
    <template v-else-if="name === 'trash'">
      <polyline points="4,7 20,7" />
      <path d="M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </template>
    <template v-else-if="name === 'file-text'">
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="16" y2="16" />
      <line x1="8" y1="8" x2="11" y2="8" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <line x1="4" y1="12" x2="19" y2="12" />
      <polyline points="13,6 19,12 13,18" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3,7 12,13 21,7" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </template>
    <template v-else-if="name === 'phone'">
      <path
        d="M5 4h4l2 5-2.5 2.5a12 12 0 0 0 5 5L16 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"
      />
    </template>
    <template v-else-if="name === 'id-card'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="13" y1="10" x2="18" y2="10" />
      <line x1="13" y1="14" x2="18" y2="14" />
    </template>
    <template v-else-if="name === 'edit'">
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-4-4L4 16z" />
      <line x1="13" y1="7" x2="17" y2="11" />
    </template>
    <template v-else-if="name === 'tooth'">
      <path
        d="M12 4c-1.6 0-2.6.8-3.6.8-1.2 0-2.2 1-2.2 3 0 1.6.4 3.2.9 4.6.4 1.4.9 2.9 1 3.9.2.8.7 1.2 1.2 1.2s1-.4 1.2-1.4c.2-1 .5-2.6 1-2.6s.8 1.6 1 2.6c.2 1 .7 1.4 1.2 1.4s1-.4 1.2-1.2c.1-1 .6-2.5 1-3.9.5-1.4.9-3 .9-4.6 0-2-1-3-2.2-3-.9 0-1.9-.8-3.4-.8z"
      />
    </template>
    <template v-else-if="name === 'grid'">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </template>
    <template v-else-if="name === 'inbox'">
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path
        d="M4 12 5.5 5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.4L20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
      />
    </template>
    <template v-else-if="name === 'alert'">
      <path d="M12 3 22 20H2z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.01" />
    </template>
  </svg>
</template>

<style scoped>
.icon {
  flex-shrink: 0;
}
</style>
