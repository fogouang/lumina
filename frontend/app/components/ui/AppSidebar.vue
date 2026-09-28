<script setup lang="ts">
import type { NavSection } from "~/types/navigation";

const props = withDefaults(
  defineProps<{
    sections: NavSection[];
    appName?: string;
  }>(),
  {
    appName: "Mon App",
  }
);

const { collapsed, mobileOpen, toggleCollapsed } = useSidebar();
const route = useRoute();

const initial = computed(() => props.appName.charAt(0).toUpperCase());

// Sur mobile, on ferme le tiroir après avoir cliqué un lien
watch(
  () => route.path,
  () => {
    mobileOpen.value = false;
  }
);
</script>

<template>
  <!-- Desktop -->
  <aside
    class="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-card transition-[width] duration-300 ease-spring lg:flex"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <div class="flex h-16 items-center gap-3 px-5" :class="{ 'justify-center px-0': collapsed }">
      <span
        class="brand-gradient flex size-10 shrink-0 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand"
      >
        {{ initial }}
      </span>
      <span v-if="!collapsed" class="truncate font-heading text-lg font-semibold text-ink">
        {{ appName }}
      </span>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-4">
      <AppSidebarNav :sections="sections" :collapsed="collapsed" />
    </div>

    <div class="flex flex-col gap-2 border-t border-line p-3">
      <slot name="footer" :collapsed="collapsed" />
      <AppButton
        variant="ghost"
        size="small"
        block
        :icon="collapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"
        :label="collapsed ? undefined : 'Réduire'"
        @click="toggleCollapsed"
      />
    </div>
  </aside>

  <!-- Mobile -->
  <Drawer v-model:visible="mobileOpen" position="left" class="w-72">
    <template #header>
      <div class="flex items-center gap-3">
        <span
          class="brand-gradient flex size-10 items-center justify-center rounded-leaf font-heading font-bold text-white shadow-brand"
        >
          {{ initial }}
        </span>
        <span class="font-heading text-lg font-semibold text-ink">{{ appName }}</span>
      </div>
    </template>

    <AppSidebarNav :sections="sections" />

    <template #footer>
      <slot name="footer" :collapsed="false" />
    </template>
  </Drawer>
</template>