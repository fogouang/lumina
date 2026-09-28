<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    dismissable-mask
    :draggable="false"
    :style="{ width: '30rem' }"
    :breakpoints="{ '640px': '94vw' }"
    :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    @hide="auth.clearError()"
  >
    <!-- En-tête -->
    <template #header>
      <div class="flex w-full flex-col items-center gap-3 pt-2 text-center">
        <span class="brand-gradient grid size-12 place-items-center rounded-leaf font-heading text-lg font-bold text-white shadow-brand">
          {{ site.name.charAt(0) }}
        </span>
        <div>
          <h2 class="font-heading text-2xl font-extrabold tracking-tight text-ink">
            {{ activeTab === "login" ? "Bon retour parmi nous" : "Créer un compte" }}
          </h2>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">
            {{
              activeTab === "login"
                ? "Connectez-vous pour accéder à votre espace."
                : "Rejoignez des milliers de candidats qui préparent leur TCF Canada."
            }}
          </p>
        </div>
      </div>
    </template>

    <!-- Onglets -->
    <div role="tablist" class="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-card-2 p-1">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.value"
        class="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ease-spring"
        :class="
          activeTab === tab.value
            ? 'bg-card text-primary shadow-soft'
            : 'text-muted hover:text-ink'
        "
        @click="switchTab(tab.value)"
      >
        <i :class="[tab.icon, 'text-sm']" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Formulaires -->
    <div class="min-h-52">
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-300 ease-spring"
        leave-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <AuthLoginForm v-if="activeTab === 'login'" key="login" />
        <AuthRegisterForm v-else key="register" />
      </Transition>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { site } from "~/config/site";

const { isOpen, activeTab, switchTab } = useAuthModal();
const auth = useAuthStore();

const tabs = [
  { value: "login", label: "Connexion", icon: "pi pi-sign-in" },
  { value: "register", label: "Inscription", icon: "pi pi-user-plus" },
] as const;
</script>