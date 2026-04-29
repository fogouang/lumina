<template>
  <Dialog
    v-model:visible="isOpen"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: '480px' }"
    class="auth-modal"
    @hide="auth.clearError()"
  >
    <!-- Header -->
    <template #header>
      <div class="auth-modal__header">
        <div class="auth-modal__logo">
          <img src="/images/logo.png" alt="Lumina TCF" class="auth-modal__logo-img" />
        </div>
        <h2 class="auth-modal__title">
          {{ activeTab === 'login' ? 'Bon retour 👋' : 'Créer un compte' }}
        </h2>
        <p class="auth-modal__subtitle">
          {{ activeTab === 'login'
            ? 'Connectez-vous pour accéder à votre espace.'
            : 'Rejoignez des milliers de candidats qui préparent leur TCF Canada.'
          }}
        </p>
      </div>
    </template>

    <!-- Tabs -->
    <div class="auth-modal__tabs">
      <button
        class="auth-modal__tab"
        :class="{ 'auth-modal__tab--active': activeTab === 'login' }"
        @click="switchTab('login')"
      >
        <i class="pi pi-sign-in" />
        Connexion
      </button>
      <button
        class="auth-modal__tab"
        :class="{ 'auth-modal__tab--active': activeTab === 'register' }"
        @click="switchTab('register')"
      >
        <i class="pi pi-user-plus" />
        Inscription
      </button>
    </div>

    <!-- Formulaires -->
    <div class="auth-modal__body">
      <Transition name="auth-modal__fade" mode="out-in">
        <AuthLoginForm    v-if="activeTab === 'login'"    key="login"    />
        <AuthRegisterForm v-else                          key="register" />
      </Transition>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
const { isOpen, activeTab, switchTab } = useAuthModal()
const auth = useAuthStore()
</script>

<style scoped>
/* ── Header ────────────────────────────────────────────────── */
.auth-modal__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.auth-modal__logo-img {
  height: 36px;
  object-fit: contain;
  margin-bottom: 0.25rem;
}

.auth-modal__title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.auth-modal__subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* ── Tabs ──────────────────────────────────────────────────── */
.auth-modal__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  background: var(--bg-ground);
  border-radius: 0.75rem;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

.auth-modal__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-modal__tab i { font-size: 0.875rem; }

.auth-modal__tab--active {
  background: var(--bg-card);
  color: var(--color-primary-600);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* ── Body ──────────────────────────────────────────────────── */
.auth-modal__body {
  min-height: 200px;
}

/* ── Transition ────────────────────────────────────────────── */
.auth-modal__fade-enter-active,
.auth-modal__fade-leave-active {
  transition: all 0.2s ease;
}
.auth-modal__fade-enter-from,
.auth-modal__fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>