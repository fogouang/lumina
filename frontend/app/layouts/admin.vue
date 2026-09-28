<template>
  <div class="flex min-h-screen bg-canvas text-ink">
    <!-- Sidebar desktop (repliable) -->
    <aside
      class="sticky top-0 hidden h-screen shrink-0 border-r border-line bg-card transition-[width] duration-300 ease-spring lg:block"
      :class="collapsed ? 'w-20' : 'w-68'"
    >
      <AppSidebarPanel
        :sections="adminSections"
        tag="Admin"
        :footer-links="[backToSiteLink]"
        collapsible
        :collapsed="collapsed"
        @toggle="collapsed = !collapsed"
      />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Barre du haut -->
      <header
        class="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-card/80 px-4 backdrop-blur-md sm:px-6"
      >
        <div class="flex lg:hidden">
          <AppButton variant="ghost" icon="pi pi-bars" aria-label="Ouvrir le menu" @click="mobileOpen = true" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-wider text-faint">Administration</p>
          <h1 class="truncate font-heading text-lg font-bold leading-tight text-ink">{{ currentPageTitle }}</h1>
        </div>

        <div class="hidden items-center gap-2.5 rounded-full bg-card-2 py-1.5 pl-1.5 pr-4 sm:flex">
          <span class="brand-gradient grid size-8 place-items-center rounded-full font-heading text-xs font-bold text-white">
            <template v-if="initials">{{ initials }}</template>
            <i v-else class="pi pi-user text-xs" />
          </span>
          <span class="max-w-40 truncate text-sm font-medium text-ink">{{ auth.fullName }}</span>
        </div>
      </header>

      <!-- Contenu -->
      <main class="flex-1 p-5 sm:p-8">
        <slot />
      </main>
    </div>

    <!-- Tiroir mobile -->
    <Drawer
      v-model:visible="mobileOpen"
      position="left"
      class="w-80"
      :pt="{ header: { class: 'hidden' }, content: { class: 'p-0' } }"
    >
      <AppSidebarPanel :sections="adminSections" tag="Admin" :footer-links="[backToSiteLink]" />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { adminSections, backToSiteLink } from "~/config/navigation";

const auth = useAuthStore();
const route = useRoute();

const mobileOpen = ref(false);
const collapsed = useCookie<boolean>("admin-sidebar-collapsed", { default: () => false });

const initials = computed(() =>
  (auth.fullName ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
  },
);

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Utilisateurs",
  "/admin/series": "Séries",
  "/admin/expressions": "Expressions",
  "/admin/plans": "Plans",
  "/admin/subscriptions": "Abonnements",
  "/admin/payments": "Paiements",
  "/admin/partners": "Partenaires",
  "/admin/promo-code": "Codes promo",
  "/admin/referrals": "Ambassadeurs",
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