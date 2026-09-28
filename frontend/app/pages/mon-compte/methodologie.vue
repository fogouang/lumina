<template>
  <div class="flex flex-col gap-6">
    <div v-reveal>
      <h1 class="account-page-title mb-1">Méthodologie TCF Canada</h1>
      <p class="max-w-xl text-sm text-muted">
        Stratégies et astuces pour réussir chaque épreuve du TCF Canada.
      </p>
    </div>

    <div v-reveal="{ delay: 80 }" class="account-section overflow-hidden p-0">
      <!-- Onglets des épreuves -->
      <div role="tablist" class="grid grid-cols-4 gap-1 border-b border-line bg-canvas p-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.key"
          class="flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition-all duration-300 ease-spring sm:flex-row sm:gap-2 sm:text-sm"
          :class="activeTab === tab.key ? 'bg-card text-primary shadow-soft' : 'text-muted hover:bg-card/60 hover:text-ink'"
          @click="activeTab = tab.key"
        >
          <i :class="[tab.icon, 'text-base']" />
          <span class="hidden lg:inline">{{ tab.label }}</span>
          <span class="lg:hidden">{{ tab.short }}</span>
        </button>
      </div>

      <!-- Contenu -->
      <div class="p-5 sm:p-8">
        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-spring"
          leave-active-class="transition-all duration-150"
          enter-from-class="opacity-0 translate-y-2"
          leave-to-class="opacity-0"
        >
          <KeepAlive>
            <component :is="current.component" :key="current.key" />
          </KeepAlive>
        </Transition>
      </div>
    </div>

    <!-- CTA -->
    <div v-reveal="{ delay: 120 }">
      <div class="featured-panel flex flex-col items-center gap-5 rounded-[2rem_0.5rem] p-8 text-center text-white shadow-brand">
        <p class="max-w-2xl text-lg leading-relaxed text-white/90">
          Prêt à vous entraîner ? Découvrez nos
          <NuxtLink to="/epreuve/comprehension-ecrite/series" class="font-semibold text-accent-400 underline-offset-4 hover:underline">
            examens blancs
          </NuxtLink>
          et nos
          <NuxtLink to="/tarifs" class="font-semibold text-accent-400 underline-offset-4 hover:underline">
            corrections détaillées par IA
          </NuxtLink>.
        </p>
        <AppCta
          v-if="!seriesStore.hasPremiumAccess"
          to="/tarifs"
          label="Débloquer l'accès complet"
          icon="pi pi-crown"
          icon-pos="left"
          variant="light"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MethodologyCE from "~/components/Methodology/MethodologyCE.vue";
import MethodologyCO from "~/components/Methodology/MethodologyCO.vue";
import MethodologyEE from "~/components/Methodology/MethodologyEE.vue";
import MethodologyEO from "~/components/Methodology/MethodologyEO.vue";
import { site } from "~/config/site";

definePageMeta({ layout: "account", middleware: "auth" });

const seriesStore = useSeriesStore();

onMounted(() => {
  seriesStore.fetchMyAccess();
});

const tabs = [
  { key: "ce", label: "Compréhension écrite", short: "CE", icon: "pi pi-book", component: markRaw(MethodologyCE) },
  { key: "co", label: "Compréhension orale", short: "CO", icon: "pi pi-headphones", component: markRaw(MethodologyCO) },
  { key: "ee", label: "Expression écrite", short: "EE", icon: "pi pi-pen-to-square", component: markRaw(MethodologyEE) },
  { key: "eo", label: "Expression orale", short: "EO", icon: "pi pi-microphone", component: markRaw(MethodologyEO) },
];

const activeTab = ref("ce");
const current = computed(() => tabs.find((t) => t.key === activeTab.value) ?? tabs[0]!);

useHead({ title: `Méthodologie TCF Canada | ${site.name}` });
</script>