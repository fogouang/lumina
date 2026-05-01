<template>
  <div class="admin">
    <!-- ── Sidebar ───────────────────────────────────────────── -->
    <aside
      class="admin__sidebar"
      :class="{ 'admin__sidebar--collapsed': sidebarCollapsed }"
    >
      <!-- Logo + toggle -->
      <div class="admin__sidebar-header">
        <div class="admin__logo">
          <i class="pi pi-graduation-cap text-white text-xl" />
          <span v-if="!sidebarCollapsed" class="admin__logo-text"
            >Lumina Admin</span
          >
        </div>
        <button
          class="admin__toggle"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <i
            :class="sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
          />
        </button>
      </div>

      <!-- Nav -->
      <nav class="admin__nav">
        <div
          v-for="group in navGroups"
          :key="group.label"
          class="admin__nav-group"
        >
          <p v-if="!sidebarCollapsed" class="admin__nav-group-label">
            {{ group.label }}
          </p>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="admin__nav-item"
            active-class="admin__nav-item--active"
            :exact="item.exact"
          >
            <i :class="item.icon" class="admin__nav-icon" />
            <span v-if="!sidebarCollapsed" class="admin__nav-label">{{
              item.label
            }}</span>
            <Badge
              v-if="item.badge && !sidebarCollapsed"
              :value="item.badge"
              severity="danger"
              class="ml-auto"
            />
          </NuxtLink>
        </div>
      </nav>

      <!-- Footer sidebar -->
      <div class="admin__sidebar-footer">
        <NuxtLink to="/" class="admin__nav-item admin__nav-item--muted">
          <i class="pi pi-arrow-left admin__nav-icon" />
          <span v-if="!sidebarCollapsed">Retour au site</span>
        </NuxtLink>
        <button
          class="admin__nav-item admin__nav-item--danger"
          @click="auth.logout()"
        >
          <i class="pi pi-sign-out admin__nav-icon" />
          <span v-if="!sidebarCollapsed">Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- ── Main ──────────────────────────────────────────────── -->
    <div class="admin__body">
      <!-- Topbar -->
      <header class="admin__topbar">
        <!-- Mobile menu -->
        <button
          class="admin__mobile-toggle lg:hidden"
          @click="mobileOpen = true"
        >
          <i class="pi pi-bars" />
        </button>

        <div class="admin__topbar-left">
          <span class="admin__breadcrumb">{{ currentPageTitle }}</span>
        </div>

        <div class="admin__topbar-right">
          <span class="admin__topbar-user">
            <i class="pi pi-user" />
            {{ auth.fullName }}
          </span>
        </div>
      </header>

      <!-- Content -->
      <main class="admin__content">
        <slot />
      </main>
    </div>

    <!-- Mobile drawer -->
    <Drawer
      v-model:visible="mobileOpen"
      position="left"
      :style="{ width: '280px' }"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <i class="pi pi-graduation-cap text-primary-500" />
          <span class="font-bold">Lumina Admin</span>
        </div>
      </template>
      <nav class="flex flex-col gap-1">
        <template v-for="group in navGroups" :key="group.label">
          <p
            class="text-xs font-bold text-(--text-tertiary) uppercase tracking-wider px-2 mt-3 mb-1"
          >
            {{ group.label }}
          </p>
          <NuxtLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="admin__nav-item"
            active-class="admin__nav-item--active"
            :exact="item.exact"
            @click="mobileOpen = false"
          >
            <i :class="item.icon" class="admin__nav-icon" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const route = useRoute();

const navGroups: {
  label: string;
  items: {
    to: string;
    label: string;
    icon: string;
    exact: boolean;
    badge?: string | number;
  }[];
}[] = [
  {
    label: "Vue d'ensemble",
    items: [
      { to: "/admin", label: "Dashboard", icon: "pi pi-home", exact: true },
    ],
  },
  {
    label: "Contenu",
    items: [
      {
        to: "/admin/series",
        label: "Séries",
        icon: "pi pi-list",
        exact: false,
      },
      { to: "/admin/plans", label: "Plans", icon: "pi pi-tag", exact: false },
    ],
  },
  {
    label: "Utilisateurs",
    items: [
      {
        to: "/admin/users",
        label: "Utilisateurs",
        icon: "pi pi-users",
        exact: false,
      },
      {
        to: "/admin/subscriptions",
        label: "Abonnements",
        icon: "pi pi-crown",
        exact: false,
      },
      {
        to: "/admin/payments",
        label: "Paiements",
        icon: "pi pi-credit-card",
        exact: false,
      },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Utilisateurs",
  "/admin/series": "Séries",
  "/admin/plans": "Plans",
  "/admin/subscriptions": "Abonnements",
  "/admin/payments": "Paiements",
};

const currentPageTitle = computed(() => {
  const path = route.path;
  return (
    pageTitles[path] ??
    pageTitles[
      Object.keys(pageTitles).find(
        (k) => path.startsWith(k) && k !== "/admin",
      ) ?? ""
    ] ??
    "Admin"
  );
});
</script>

<style>
/* ── Layout ────────────────────────────────────────────────── */
.admin {
  display: flex;
  min-height: 100vh;
  background: var(--bg-ground);
}

/* ── Sidebar ───────────────────────────────────────────────── */
.admin__sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  transition: width 0.25s ease;
}

.admin__sidebar--collapsed {
  width: 64px;
}

/* Header sidebar */
.admin__sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.admin__logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  overflow: hidden;
}

.admin__logo-text {
  font-size: 0.9375rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
}

.admin__toggle {
  width: 28px;
  height: 28px;
  border-radius: 0.375rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.admin__toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

/* Nav */
.admin__nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.admin__nav-group {
  margin-bottom: 0.5rem;
}

.admin__nav-group-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 0.5rem;
  margin: 0.625rem 0 0.25rem;
}

.admin__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.admin__nav-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.admin__nav-item--active {
  background: var(--color-primary-600) !important;
  color: #ffffff !important;
  font-weight: 600;
}

.admin__nav-item--muted {
  color: rgba(255, 255, 255, 0.4);
}
.admin__nav-item--muted:hover {
  color: rgba(255, 255, 255, 0.8);
}

.admin__nav-item--danger {
  color: #f87171;
}
.admin__nav-item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
}

.admin__nav-icon {
  font-size: 1rem;
  flex-shrink: 0;
  width: 16px;
}
.admin__nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer sidebar */
.admin__sidebar-footer {
  padding: 0.625rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex-shrink: 0;
}

/* ── Body ──────────────────────────────────────────────────── */
.admin__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Topbar */
.admin__topbar {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.admin__topbar-left {
  flex: 1;
}

.admin__breadcrumb {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.admin__topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin__topbar-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.admin__mobile-toggle {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* Content */
.admin__content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .admin__sidebar {
    display: none;
  }
}
</style>
