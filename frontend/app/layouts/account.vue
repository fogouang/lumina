<template>
  <div class="account-layout">

    <!-- ── Sidebar ───────────────────────────────────────────── -->
    <aside class="account-sidebar">

      <!-- Avatar + infos -->
      <div class="account-sidebar__profile">
        <div class="account-sidebar__avatar">
          <i class="pi pi-user" />
        </div>
        <div class="account-sidebar__info">
          <p class="account-sidebar__name">{{ auth.fullName }}</p>
          <p class="account-sidebar__email">{{ auth.user?.email }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="account-sidebar__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="account-sidebar__link"
          active-class="account-sidebar__link--active"
          :exact="item.exact"
        >
          <i :class="item.icon" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Déconnexion -->
      <button class="account-sidebar__logout" @click="auth.logout()">
        <i class="pi pi-sign-out" />
        <span>Déconnexion</span>
      </button>

    </aside>

    <!-- ── Contenu ───────────────────────────────────────────── -->
    <main class="account-main">
      <slot />
    </main>

  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()

const navItems = [
  { to: '/mon-compte',             label: 'Tableau de bord', icon: 'pi pi-home',        exact: true  },
  { to: '/mon-compte/profil',      label: 'Mon profil',      icon: 'pi pi-user',        exact: false },
  { to: '/mon-compte/securite',    label: 'Sécurité',        icon: 'pi pi-shield',      exact: false },
  { to: '/mon-compte/tentatives',  label: 'Mes tentatives',  icon: 'pi pi-list',        exact: false },
  { to: '/mon-compte/abonnement',  label: 'Abonnement',      icon: 'pi pi-crown',       exact: false },
  { to: '/mon-compte/factures',    label: 'Factures',        icon: 'pi pi-receipt',     exact: false },
  { to: '/contact',                label: 'Support',         icon: 'pi pi-envelope',    exact: false },
]
</script>

<style>
/* ── Layout global ─────────────────────────────────────────── */
.account-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: var(--bg-ground);
}

/* ── Sidebar ───────────────────────────────────────────────── */
.account-sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* Profile */
.account-sidebar__profile {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.account-sidebar__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account-sidebar__avatar i {
  font-size: 1.25rem;
  color: #ffffff;
}

.account-sidebar__info {
  min-width: 0;
}

.account-sidebar__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-sidebar__email {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Nav */
.account-sidebar__nav {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
  flex: 1;
}

.account-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.account-sidebar__link i {
  font-size: 1rem;
  width: 20px;
  flex-shrink: 0;
}

.account-sidebar__link:hover {
  background: var(--bg-hover);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-200);
}

.account-sidebar__link--active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-600);
  font-weight: 600;
}

/* Logout */
.account-sidebar__logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  margin: 0.5rem 0.75rem 1rem;
  border: 1px solid var(--color-danger-200);
  border-radius: 0.75rem;
  background: none;
  color: var(--color-danger-600);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.account-sidebar__logout:hover {
  background: var(--color-danger-50);
  border-color: var(--color-danger-400);
}

/* ── Main ──────────────────────────────────────────────────── */
.account-main {
  padding: 2rem;
  min-width: 0;
}

/* Sections partagées */
.account-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
}

.account-section__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

.account-page-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .account-layout {
    grid-template-columns: 1fr;
  }

  .account-sidebar {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .account-sidebar__nav {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .account-sidebar__link {
    border-left: none;
    border-bottom: 3px solid transparent;
    border-radius: 0.5rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  .account-sidebar__link--active {
    border-left: none;
    border-bottom-color: var(--color-primary-600);
  }

  .account-sidebar__logout {
    margin: 0.5rem;
  }

  .account-main {
    padding: 1.25rem;
  }
}
</style>