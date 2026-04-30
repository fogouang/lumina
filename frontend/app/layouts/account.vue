<template>
  <div class="account">

    <!-- ── Hero ─────────────────────────────────────────────── -->
    <section class="account__hero">
      <div class="container">
        <div class="account__hero-inner">
          <div class="account__avatar">
            <i class="pi pi-user" />
          </div>
          <div>
            <h1 class="account__hero-title">{{ auth.fullName }}</h1>
            <p class="account__hero-sub">{{ auth.user?.email }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="container account__body">

      <!-- ── Nav latérale ────────────────────────────────────── -->
      <aside class="account__nav">
        <NuxtLink to="/mon-compte" class="account__nav-item" active-class="account__nav-item--active" exact>
          <i class="pi pi-user" />
          Mon profil
        </NuxtLink>
        <NuxtLink to="/mon-compte/profil" class="account__nav-item" active-class="account__nav-item--active">
          <i class="pi pi-id-card" />
          Modifier le profil
        </NuxtLink>
        <NuxtLink to="/mon-compte/securite" class="account__nav-item" active-class="account__nav-item--active">
          <i class="pi pi-shield" />
          Sécurité
        </NuxtLink>
        <NuxtLink to="/contact" class="account__nav-item" active-class="account__nav-item--active">
          <i class="pi pi-envelope" />
          Support
        </NuxtLink>
        <button class="account__nav-item account__nav-item--danger" @click="auth.logout()">
          <i class="pi pi-sign-out" />
          Déconnexion
        </button>
      </aside>

      <!-- ── Contenu de la page ──────────────────────────────── -->
      <div class="account__content">
        <slot />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>

<style>
/* ── Hero ──────────────────────────────────────────────────── */
.account__hero {
  background: var(--gradient-primary);
  padding: 2.5rem 0;
}

.account__hero-inner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.account__avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account__avatar i {
  font-size: 1.75rem;
  color: #ffffff;
}

.account__hero-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.25rem;
}

.account__hero-sub {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* ── Body ──────────────────────────────────────────────────── */
.account__body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  padding-top: 2rem;
  padding-bottom: 4rem;
  align-items: start;
}

/* ── Nav ───────────────────────────────────────────────────── */
.account__nav {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 88px;
}

.account__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-left: 3px solid transparent;
}

.account__nav-item:hover {
  background: var(--bg-hover);
  color: var(--color-primary-700);
}

.account__nav-item--active {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-600);
  font-weight: 600;
}

.account__nav-item--danger {
  color: var(--color-danger-600);
  margin-top: auto;
  border-top: 1px solid var(--border-color);
}

.account__nav-item--danger:hover {
  background: var(--color-danger-50);
  color: var(--color-danger-700);
}

/* ── Content ───────────────────────────────────────────────── */
.account__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Sections partagées ────────────────────────────────────── */
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

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .account__body {
    grid-template-columns: 1fr;
  }

  .account__nav {
    flex-direction: row;
    flex-wrap: wrap;
    position: static;
  }

  .account__nav-item--danger {
    border-top: none;
    border-left: 3px solid transparent;
  }
}
</style>