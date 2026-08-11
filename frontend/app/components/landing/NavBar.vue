<template>
  <nav
    class="sticky top-0 z-100 border-b border-(--border-color) bg-(--bg-section) transition-shadow duration-300"
    :class="{ 'shadow-lg': isScrolled }"
  >
    <div class="container flex h-17 items-center gap-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex shrink-0 items-center">
        <img
          src="/images/logo.png"
          alt="Lumina TCF"
          class="h-13 w-auto object-contain"
        />
      </NuxtLink>

      <!-- Nav links — desktop -->
      <div class="hidden flex-1 items-stretch justify-center lg:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :exact="link.exact"
          class="group relative flex flex-col items-center justify-center gap-1 whitespace-nowrap px-4 text-[11px] font-medium text-(--text-secondary) transition-colors hover:text-primary-600"
          active-class="!text-primary-700"
        >
          <i
            :class="link.icon"
            class="text-[17px] transition-transform group-hover:-translate-y-0.5"
          />
          <span class="leading-none">{{ link.label }}</span>
          <span
            class="absolute bottom-0 left-1/2 h-0.5 w-[70%] -translate-x-1/2 scale-x-0 rounded-t bg-gradient-primary transition-transform duration-300 group-[.router-link-active]:scale-x-100"
          />
        </NuxtLink>
      </div>

      <!-- Actions — desktop -->
      <div class="hidden shrink-0 items-center gap-3 lg:flex">
        <NuxtLink
          to="/mon-compte"
          class="flex flex-col items-center gap-1 px-3 text-[11px] font-medium text-(--text-secondary) transition-colors hover:text-primary-600"
        >
          <i class="pi pi-user text-[17px]" />
          <span>Mon compte</span>
        </NuxtLink>
        <ClientOnly>
          <Button
            v-if="!auth.isAuthenticated"
            label="Se connecter"
            icon="pi pi-sign-in"
            class="rounded-lg! bg-gradient-primary! border-none! px-4.5! py-2! text-sm! font-semibold! whitespace-nowrap!"
            @click="openLogin()"
          />
          <Button
            v-else
            label="Se déconnecter"
            icon="pi pi-sign-out"
            class="rounded-lg! bg-gradient-primary! border-none! px-4.5! py-2! text-sm! font-semibold! whitespace-nowrap!"
            @click="auth.logout()"
          />
        </ClientOnly>
      </div>

      <!-- Mobile toggle -->
      <button
        class="ml-auto flex rounded-lg p-2 text-xl text-(--text-primary) transition-colors hover:bg-(--bg-hover) lg:hidden"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <i :class="menuOpen ? 'pi pi-times' : 'pi pi-bars'" />
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-250 ease-out"
      leave-active-class="transition duration-250 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="menuOpen"
        class="flex flex-col gap-1 border-t border-(--border-color) bg-(--bg-section) px-6 pb-5 pt-3 lg:hidden"
      >
        <NuxtLink
          v-for="link in allLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--text-secondary) transition-colors hover:bg-(--bg-hover) hover:text-primary-700"
          active-class="bg-[var(--bg-hover)] !text-primary-700"
          @click="menuOpen = false"
        >
          <i :class="link.icon" class="w-5 text-base" />
          {{ link.label }}
        </NuxtLink>
        <div class="mt-3 border-t border-(--border-color) pt-3">
          <ClientOnly>
            <Button
              v-if="!auth.isAuthenticated"
              label="Se connecter"
              icon="pi pi-sign-in"
              class="w-full! rounded-lg! bg-gradient-primary! border-none! font-semibold!"
              @click="
                openLogin();
                menuOpen = false;
              "
            />
            <Button
              v-else
              label="Se déconnecter"
              icon="pi pi-sign-out"
              class="w-full! rounded-lg! bg-gradient-primary! border-none! font-semibold!"
              @click="
                auth.logout();
                menuOpen = false;
              "
            />
          </ClientOnly>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const auth = useAuthStore();

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

const allLinks = [
  ...links,
  { to: "/mon-compte", label: "Mon compte", icon: "pi pi-user", exact: false },
];
</script>
