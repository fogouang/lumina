<template>
  <div class="flex min-h-screen bg-canvas text-ink">
    <!-- Sidebar desktop -->
    <aside class="sticky top-0 hidden h-screen w-68 shrink-0 border-r border-line bg-card lg:block">
      <AppSidebarPanel :sections="accountSections" />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Barre du haut (mobile) -->
      <header
        class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-card/80 px-4 backdrop-blur-md lg:hidden"
      >
        <NuxtLink to="/" class="flex items-center gap-3">
          <span class="brand-gradient flex size-9 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand">
            {{ site.name.charAt(0) }}
          </span>
          <span class="font-heading text-lg font-bold text-ink">{{ site.name }}</span>
        </NuxtLink>
        <AppButton variant="ghost" icon="pi pi-bars" aria-label="Ouvrir le menu" @click="menuOpen = true" />
      </header>

      <!-- Contenu -->
      <main class="flex-1 p-5 sm:p-8 xl:p-10 2xl:p-12">
        <div class="mx-auto w-full max-w-screen-2xl">
          <slot />
        </div>
      </main>
    </div>

    <!-- Tiroir mobile -->
    <Drawer
      v-model:visible="menuOpen"
      position="left"
      class="w-80"
      :pt="{ header: { class: 'hidden' }, content: { class: 'p-0' } }"
    >
      <AppSidebarPanel :sections="accountSections" />
    </Drawer>
  </div>

  <BuyCreditsDialog :is-open="buyCreditsOpen" />
  <Toast />
</template>

<script setup lang="ts">
import { site } from "~/config/site";
import { accountSections } from "~/config/navigation";

const route = useRoute();
const { isOpen: buyCreditsOpen } = useBuyCreditsDialog();

const menuOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
</script>