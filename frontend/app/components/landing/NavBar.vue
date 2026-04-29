<template>
  <nav class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="container navbar__inner">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar__logo">
        <img src="/images/logo.png" alt="Lumina TCF" class="navbar__logo-img" />
      </NuxtLink>

      <!-- Nav links — tab bar style -->
      <div class="navbar__tabs">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="navbar__tab"
          active-class="navbar__tab--active"
          :exact="link.exact"
        >
          <i :class="link.icon" class="navbar__tab-icon" />
          <span class="navbar__tab-label">{{ link.label }}</span>
          <span class="navbar__tab-indicator" />
        </NuxtLink>
      </div>

      <!-- Actions -->
      <div class="navbar__actions">
        <NuxtLink to="/mon-compte" class="navbar__account">
          <i class="pi pi-user" />
          <span>Mon compte</span>
        </NuxtLink>
        <Button
          label="Se connecter"
          @click="openLogin()"
          icon="pi pi-sign-in"
          class="navbar__btn-connect"
        />
      </div>

      <!-- Mobile toggle -->
      <button
        class="navbar__mobile-toggle"
        @click="menuOpen = !menuOpen"
        aria-label="Menu"
      >
        <i :class="menuOpen ? 'pi pi-times' : 'pi pi-bars'" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="navbar__mobile-transition">
      <div v-if="menuOpen" class="navbar__mobile-menu">
        <NuxtLink
          v-for="link in allLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__mobile-link"
          active-class="navbar__mobile-link--active"
          @click="menuOpen = false"
        >
          <i :class="link.icon" />
          {{ link.label }}
        </NuxtLink>
        <div class="navbar__mobile-footer">
          <Button
            label="Se connecter"
            icon="pi pi-sign-in"
            class="navbar__btn-connect w-full"
          />
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  logo: {
    type: String,
    default: null,
  },
});

const isScrolled = ref(false);
const menuOpen = ref(false);
const { openLogin } = useAuthModal();

function onScroll() {
  isScrolled.value = window.scrollY > 60;
}

onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));

const links = [
  { to: "/", label: "Accueil", icon: "pi pi-home", exact: true },
  {
    to: "/epreuve/expression-ecrite",
    label: "Expression écrite",
    icon: "pi pi-pencil",
    exact: false,
  },
  {
    to: "/epreuve/expression-orale",
    label: "Expression orale",
    icon: "pi pi-microphone",
    exact: false,
  },
  {
    to: "/epreuve/comprehension-ecrite",
    label: "Compréhension écrite",
    icon: "pi pi-book",
    exact: false,
  },
  {
    to: "/epreuve/comprehension-orale",
    label: "Compréhension orale",
    icon: "pi pi-headphones",
    exact: false,
  },
];

// Mon compte inclus dans le menu mobile
const allLinks = [
  ...links,
  { to: "/mon-compte", label: "Mon compte", icon: "pi pi-user", exact: false },
];
</script>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-section);
  border-bottom: 1px solid var(--border-color);
  transition: box-shadow 0.3s ease;
}

.navbar--scrolled {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.07);
}

.navbar__inner {
  display: flex;
  align-items: center;
  height: 68px;
  gap: 1rem;
}

/* ── Logo ──────────────────────────────────────────────────── */
.navbar__logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.navbar__logo-img {
  height: 130px;
  width: auto;
  object-fit: contain;
}

.navbar__logo-placeholder {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 800;
}

/* ── Tabs ──────────────────────────────────────────────────── */
.navbar__tabs {
  display: flex;
  align-items: stretch;
  flex: 1;
  justify-content: center;
  height: 100%;
}

.navbar__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 500;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.navbar__tab:hover {
  color: var(--color-primary-600);
}

.navbar__tab-icon {
  font-size: 1.0625rem;
  transition: transform 0.2s ease;
}

.navbar__tab:hover .navbar__tab-icon {
  transform: translateY(-1px);
}

.navbar__tab-label {
  line-height: 1;
}

/* Indicateur bas */
.navbar__tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 70%;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--gradient-primary);
  transition: transform 0.25s ease;
}

.navbar__tab--active {
  color: var(--color-primary-700);
}

.navbar__tab--active .navbar__tab-icon {
  transform: translateY(-1px);
}

.navbar__tab--active .navbar__tab-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* ── Actions ───────────────────────────────────────────────── */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.navbar__account {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0 0.75rem;
  transition: color 0.2s ease;
}

.navbar__account i {
  font-size: 1.0625rem;
}

.navbar__account:hover {
  color: var(--color-primary-600);
}

.navbar__btn-connect {
  background: var(--gradient-primary) !important;
  border: none !important;
  border-radius: 0.625rem !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 1.125rem !important;
  white-space: nowrap;
}

/* ── Mobile toggle ─────────────────────────────────────────── */
.navbar__mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  margin-left: auto;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.navbar__mobile-toggle:hover {
  background: var(--bg-hover);
}

/* ── Mobile menu ───────────────────────────────────────────── */
.navbar__mobile-menu {
  background: var(--bg-section);
  border-top: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.navbar__mobile-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.navbar__mobile-link i {
  font-size: 1rem;
  width: 20px;
}

.navbar__mobile-link:hover,
.navbar__mobile-link--active {
  background: var(--bg-hover);
  color: var(--color-primary-700);
}

.navbar__mobile-footer {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

/* ── Transition mobile ─────────────────────────────────────── */
.navbar__mobile-transition-enter-active,
.navbar__mobile-transition-leave-active {
  transition: all 0.25s ease;
}
.navbar__mobile-transition-enter-from,
.navbar__mobile-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .navbar__tabs {
    display: none;
  }
  .navbar__actions {
    display: none;
  }
  .navbar__mobile-toggle {
    display: flex;
  }
}
</style>
