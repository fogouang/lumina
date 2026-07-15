<template>
  <div class="">
    <!-- Hero -->
    <div class="mb-6">
      <h1 class="account-page-title mb-1">Méthodologie TCF Canada</h1>
      <p class="text-sm text-(--text-secondary) max-w-xl">
        Stratégies et astuces pour réussir chaque épreuve du TCF Canada
      </p>
    </div>

    <!-- Tabs -->
    <div class="account-section8">
      <TabView>
        <!-- CE -->
        <TabPanel value="0">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-book" />
              <span class="hidden sm:inline">Compréhension Écrite</span>
              <span class="sm:hidden">CE</span>
            </div>
          </template>
          <MethodologyCE />
        </TabPanel>

        <!-- CO -->
        <TabPanel value="1">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-headphones" />
              <span class="hidden sm:inline">Compréhension Orale</span>
              <span class="sm:hidden">CO</span>
            </div>
          </template>
          <MethodologyCO />
        </TabPanel>

        <!-- EE -->
        <TabPanel value="2">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-pen-to-square" />
              <span class="hidden sm:inline">Expression Écrite</span>
              <span class="sm:hidden">EE</span>
            </div>
          </template>
          <MethodologyEE />
        </TabPanel>

        <!-- EO -->
        <TabPanel value="3">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-microphone" />
              <span class="hidden sm:inline">Expression Orale</span>
              <span class="sm:hidden">EO</span>
            </div>
          </template>
          <MethodologyEO />
        </TabPanel>
      </TabView>

      <!-- CTA -->
      <div
        class="mt-8 bg-(--bg-card) border border-(--border-color) rounded-2xl p-8 text-center flex flex-col items-center gap-4"
      >
        <p class="text-(--text-secondary) text-base">
          Prêt à vous entraîner ? Découvrez nos
          <NuxtLink
            to="/epreuve/comprehension-ecrite/series"
            class="text-primary-600 font-semibold hover:underline"
            >examens blancs</NuxtLink
          >
          et nos
          <NuxtLink
            to="/tarifs"
            class="text-primary-600 font-semibold hover:underline"
            >corrections détaillées IA</NuxtLink
          >
          !
        </p>
        <NuxtLink v-if="!seriesStore.hasPremiumAccess" to="/tarifs">
          <Button
            label="Débloquer l'accès complet"
            icon="pi pi-crown"
            icon-pos="left"
            class="bg-gradient-primary border-none font-bold px-6"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MethodologyCE from "~/components/Methodology/MethodologyCE.vue";
import MethodologyCO from "~/components/Methodology/MethodologyCO.vue";
import MethodologyEE from "~/components/Methodology/MethodologyEE.vue";
import MethodologyEO from "~/components/Methodology/MethodologyEO.vue";
definePageMeta({ layout: "account", middleware: "auth" });

const seriesStore = useSeriesStore();

onMounted(() => {
  seriesStore.fetchMyAccess();
});

useHead({ title: "Méthodologie TCF Canada | Lumina TCF" });
</script>
