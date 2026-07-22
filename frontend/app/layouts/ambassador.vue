<template>
  <div class="ambassador-layout">
    <!-- ── Sidebar ───────────────────────────────────────────── -->
    <aside class="ambassador-sidebar">
      <div class="ambassador-sidebar__brand">
        <img src="/images/logo.png" alt="Lumina TCF" class="ambassador-sidebar__logo" />
        <p class="ambassador-sidebar__tag">Espace Ambassadeur</p>
      </div>

      <div class="ambassador-sidebar__profile">
        <div class="ambassador-sidebar__avatar">
          <i class="pi pi-star-fill" />
        </div>
        <div class="ambassador-sidebar__info">
          <p class="ambassador-sidebar__name">{{ auth.fullName }}</p>
          <p class="ambassador-sidebar__email">{{ auth.user?.email }}</p>
        </div>
      </div>

      <nav class="ambassador-sidebar__nav">
        <NuxtLink
          to="/ambassadeur"
          class="ambassador-sidebar__link"
          active-class="ambassador-sidebar__link--active"
          exact
        >
          <i class="pi pi-users" />
          <span>Programme de parrainage</span>
        </NuxtLink>

        <div class="ambassador-sidebar__divider" />

        <NuxtLink to="/mon-compte" class="ambassador-sidebar__link ambassador-sidebar__link--muted">
          <i class="pi pi-arrow-left" />
          <span>Espace étudiant</span>
        </NuxtLink>
      </nav>

      <button class="ambassador-sidebar__logout" @click="auth.logout()">
        <i class="pi pi-sign-out" />
        <span>Déconnexion</span>
      </button>
    </aside>

    <!-- ── Contenu ───────────────────────────────────────────── -->
    <main class="ambassador-main">
      <slot />
    </main>
  </div>
  <Toast />
</template>

<script setup lang="ts">
const auth = useAuthStore();
</script>

<style>
.ambassador-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: var(--bg-ground);
}

.ambassador-sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.ambassador-sidebar__brand {
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.ambassador-sidebar__logo {
  height: 32px;
  object-fit: contain;
  display: block;
  margin-bottom: 0.375rem;
}

.ambassador-sidebar__tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0;
}

.ambassador-sidebar__profile {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.ambassador-sidebar__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ambassador-sidebar__avatar i {
  font-size: 1.125rem;
  color: #ffffff;
}

.ambassador-sidebar__info {
  min-width: 0;
}

.ambassador-sidebar__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ambassador-sidebar__email {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ambassador-sidebar__nav {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
  flex: 1;
}

.ambassador-sidebar__link {
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

.ambassador-sidebar__link i {
  font-size: 1rem;
  width: 20px;
  flex-shrink: 0;
}

.ambassador-sidebar__link:hover {
  background: var(--bg-hover);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-200);
}

.ambassador-sidebar__link--active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-600);
  font-weight: 600;
}

.ambassador-sidebar__link--muted {
  color: var(--text-tertiary);
  font-size: 0.8125rem;
}

.ambassador-sidebar__divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 1.25rem;
}

.ambassador-sidebar__logout {
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

.ambassador-sidebar__logout:hover {
  background: var(--color-danger-50);
  border-color: var(--color-danger-400);
}

.ambassador-main {
  padding: 2rem;
  min-width: 0;
}

@media (max-width: 1024px) {
  .ambassador-layout {
    grid-template-columns: 1fr;
  }

  .ambassador-sidebar {
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .ambassador-sidebar__nav {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .ambassador-sidebar__link {
    border-left: none;
    border-bottom: 3px solid transparent;
    border-radius: 0.5rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  .ambassador-sidebar__link--active {
    border-left: none;
    border-bottom-color: var(--color-primary-600);
  }

  .ambassador-main {
    padding: 1.25rem;
  }
}
</style>