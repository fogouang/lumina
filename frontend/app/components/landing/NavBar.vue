<script setup lang="ts">
import { site } from "~/config/site";
import { mainNav, accountNav } from "~/config/navigation";

const auth = useAuthStore();
const { openLogin } = useAuthModal();
const { isActive } = useActiveLink();
const route = useRoute();

const scrolled = ref(false);
const mobileOpen = ref(false);
const isDark = ref(false);

const allLinks = [...mainNav, accountNav];

// Texte blanc tant qu'on est en haut d'une page avec une image en fond
const overlay = computed(() => Boolean(route.meta.navbarOverlay) && !scrolled.value);

const onScroll = () => {
  scrolled.value = window.scrollY > 12;
};

onMounted(() => {
  onScroll();
  isDark.value = document.documentElement.classList.contains("app-dark");
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  }
);

function linkClass(link: { to: string; exact?: boolean }) {
  if (overlay.value) return isActive(link) ? "text-white" : "text-white/75 hover:text-white";
  return isActive(link) ? "text-primary" : "text-muted hover:text-ink";
}

function toggleDark() {
  isDark.value = document.documentElement.classList.toggle("app-dark");
}

function login() {
  mobileOpen.value = false;
  openLogin();
}

function logout() {
  mobileOpen.value = false;
  auth.logout();
}
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ease-spring"
    :class="scrolled ? 'border-line bg-card/80 shadow-soft backdrop-blur-md' : 'border-transparent bg-transparent'"
  >
    <nav class="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex shrink-0 items-center gap-3">
        <span
          class="brand-gradient flex size-10 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand"
        >
          {{ site.name.charAt(0) }}
        </span>
        <span
          class="font-heading text-lg font-bold transition-colors duration-300"
          :class="overlay ? 'text-white' : 'text-ink'"
        >
          {{ site.name }}
        </span>
      </NuxtLink>

      <!-- Liens desktop -->
      <div class="hidden flex-1 items-center justify-center gap-1 xl:flex">
        <NuxtLink
          v-for="link in mainNav"
          :key="link.to"
          :to="link.to"
          class="group relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors duration-200"
          :class="linkClass(link)"
        >
          {{ link.label }}
          <span
            class="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full transition-transform duration-300 ease-spring"
            :class="[
              overlay ? 'bg-accent-400' : 'bg-primary',
              isActive(link) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
            ]"
          />
        </NuxtLink>
      </div>

      <!-- Actions -->
      <div class="ml-auto flex items-center gap-2 xl:ml-0">
        <NuxtLink
          :to="accountNav.to"
          :aria-label="accountNav.label"
          class="hidden size-10 items-center justify-center rounded-xl transition-colors duration-200 xl:flex"
          :class="
            overlay
              ? 'text-white/80 hover:bg-white/10 hover:text-white'
              : isActive(accountNav)
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                : 'text-muted hover:bg-card-2 hover:text-ink'
          "
        >
          <i :class="accountNav.icon" />
        </NuxtLink>

        <AppButton
          variant="ghost"
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          aria-label="Changer de thème"
          :class="overlay ? 'text-white hover:bg-white/10' : ''"
          @click="toggleDark"
        />

        <div class="hidden xl:flex">
          <ClientOnly>
            <AppButton
              v-if="!auth.isAuthenticated"
              label="Se connecter"
              icon="pi pi-sign-in"
              variant="gradient"
              size="small"
              @click="login"
            />
            <AppButton
              v-else
              label="Se déconnecter"
              icon="pi pi-sign-out"
              variant="secondary"
              size="small"
              :class="overlay ? 'border-white/40 text-white hover:bg-white/10' : ''"
              @click="logout"
            />
          </ClientOnly>
        </div>

        <div class="flex xl:hidden">
          <AppButton
            variant="ghost"
            icon="pi pi-bars"
            aria-label="Ouvrir le menu"
            :class="overlay ? 'text-white hover:bg-white/10' : ''"
            @click="mobileOpen = true"
          />
        </div>
      </div>
    </nav>
  </header>

  <!-- Menu mobile -->
  <Drawer v-model:visible="mobileOpen" position="right" class="w-80">
    <template #header>
      <div class="flex items-center gap-3">
        <span
          class="brand-gradient flex size-9 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand"
        >
          {{ site.name.charAt(0) }}
        </span>
        <span class="font-heading text-lg font-bold text-ink">{{ site.name }}</span>
      </div>
    </template>

    <div class="flex flex-col gap-1">
      <NuxtLink
        v-for="link in allLinks"
        :key="link.to"
        :to="link.to"
        class="relative flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors"
        :class="
          isActive(link)
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
            : 'text-muted hover:bg-card-2 hover:text-ink'
        "
      >
        <span v-if="isActive(link)" class="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />
        <i :class="link.icon" class="w-5 text-base" />
        {{ link.label }}
      </NuxtLink>
    </div>

    <template #footer>
      <ClientOnly>
        <AppButton
          v-if="!auth.isAuthenticated"
          label="Se connecter"
          icon="pi pi-sign-in"
          variant="gradient"
          block
          @click="login"
        />
        <AppButton
          v-else
          label="Se déconnecter"
          icon="pi pi-sign-out"
          variant="secondary"
          block
          @click="logout"
        />
      </ClientOnly>
    </template>
  </Drawer>
</template>