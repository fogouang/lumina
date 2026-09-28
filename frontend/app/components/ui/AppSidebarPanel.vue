<script setup lang="ts">
import type { NavItem, NavSection } from "~/types/navigation";
import { site } from "~/config/site";

withDefaults(
  defineProps<{
    sections: NavSection[];
    tag?: string;
    avatarIcon?: string;
    footerLinks?: NavItem[];
    collapsible?: boolean;
    collapsed?: boolean;
  }>(),
  {
    avatarIcon: "pi pi-user",
    footerLinks: () => [],
    collapsible: false,
    collapsed: false,
  }
);

const emit = defineEmits<{ toggle: [] }>();

const auth = useAuthStore();
const { isActive } = useActiveLink();

const isDark = ref(false);

const initials = computed(() =>
  (auth.fullName ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part: string) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);

onMounted(() => {
  isDark.value = document.documentElement.classList.contains("app-dark");
});

function toggleDark() {
  isDark.value = document.documentElement.classList.toggle("app-dark");
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Marque -->
    <div
      class="flex items-center gap-3 pb-4 pt-6"
      :class="collapsed ? 'flex-col px-2' : 'px-5'"
    >
      <NuxtLink to="/" class="flex min-w-0 items-center gap-3">
        <span class="brand-gradient flex size-9 shrink-0 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand">
          {{ site.name.charAt(0) }}
        </span>
        <span v-if="!collapsed" class="min-w-0">
          <span class="block truncate font-heading text-lg font-bold leading-tight text-ink">{{ site.name }}</span>
          <span
            v-if="tag"
            class="mt-0.5 inline-block rounded-full bg-accent-100 px-2 py-px text-[0.65rem] font-bold uppercase tracking-wider text-accent-800 dark:bg-accent-950 dark:text-accent-300"
          >
            {{ tag }}
          </span>
        </span>
      </NuxtLink>

      <button
        v-if="collapsible"
        type="button"
        :aria-label="collapsed ? 'Déplier le menu' : 'Replier le menu'"
        class="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-faint transition-colors hover:bg-card-2 hover:text-ink"
        :class="collapsed ? '' : 'ml-auto'"
        @click="emit('toggle')"
      >
        <i :class="[collapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left', 'text-xs']" />
      </button>
    </div>

    <!-- Profil -->
    <div
      class="mx-3 flex items-center gap-3 rounded-2xl bg-card-2"
      :class="collapsed ? 'justify-center p-2' : 'p-3'"
      :title="collapsed ? auth.fullName : undefined"
    >
      <span class="brand-gradient grid size-10 shrink-0 place-items-center rounded-full font-heading text-sm font-bold text-white">
        <template v-if="initials">{{ initials }}</template>
        <i v-else :class="avatarIcon" />
      </span>
      <div v-if="!collapsed" class="min-w-0">
        <p class="truncate text-sm font-bold text-ink">{{ auth.fullName }}</p>
        <p class="truncate text-xs text-faint">{{ auth.user?.email }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-5">
      <div v-for="(section, si) in sections" :key="section.title ?? si" class="mb-5 last:mb-0">
        <p
          v-if="section.title && !collapsed"
          class="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-faint"
        >
          {{ section.title }}
        </p>
        <div v-else-if="section.title" class="mx-3 mb-2 h-px bg-line" />

        <NuxtLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          :title="collapsed ? item.label : undefined"
          class="relative flex h-10 items-center gap-3 rounded-xl text-sm font-medium transition-colors duration-200"
          :class="[
            collapsed ? 'justify-center' : 'px-3',
            isActive(item)
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
              : 'text-muted hover:bg-card-2 hover:text-ink',
          ]"
        >
          <span v-if="isActive(item)" class="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />
          <i :class="[item.icon, 'text-base', collapsed ? '' : 'w-5']" />
          <span v-if="!collapsed" class="flex-1 truncate">{{ item.label }}</span>
          <span
            v-if="item.badge && !collapsed"
            class="rounded-full bg-accent-400 px-2 py-0.5 text-[11px] font-semibold text-accent-950"
          >
            {{ item.badge }}
          </span>
          <span v-else-if="item.badge" class="absolute right-2 top-2 size-2 rounded-full bg-accent-400" />
        </NuxtLink>
      </div>
    </nav>

    <!-- Pied -->
    <div class="flex flex-col gap-1 border-t border-line p-3">
      <NuxtLink
        v-for="link in footerLinks"
        :key="link.to + link.label"
        :to="link.to"
        :title="collapsed ? link.label : undefined"
        class="flex h-10 items-center gap-3 rounded-xl text-sm font-medium text-faint transition-colors hover:bg-card-2 hover:text-ink"
        :class="collapsed ? 'justify-center' : 'px-3'"
      >
        <i :class="[link.icon, 'text-base']" />
        <span v-if="!collapsed">{{ link.label }}</span>
      </NuxtLink>

      <div class="flex items-center gap-1" :class="collapsed ? 'flex-col' : ''">
        <button
          type="button"
          :title="collapsed ? 'Déconnexion' : undefined"
          class="flex h-10 items-center gap-3 rounded-xl text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          :class="collapsed ? 'w-10 justify-center' : 'flex-1 px-3'"
          @click="auth.logout()"
        >
          <i class="pi pi-sign-out" />
          <span v-if="!collapsed">Déconnexion</span>
        </button>
        <AppButton
          variant="ghost"
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          aria-label="Changer de thème"
          @click="toggleDark"
        />
      </div>
    </div>
  </div>
</template>