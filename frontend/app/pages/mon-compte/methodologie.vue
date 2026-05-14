<template>
  <div class="min-h-screen bg-(--bg-ground)">

    <!-- Hero -->
    <div class="relative bg-linear-to-br from-primary-700 to-primary-900 py-14 text-center overflow-hidden">
      <div class="absolute inset-0 opacity-10"
        style="background-image: linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px); background-size: 24px 24px;" />
      <div class="relative z-10 container mx-auto px-4">
        <h1 class="text-3xl lg:text-4xl font-extrabold text-white mb-3">Méthodologie TCF Canada</h1>
        <p class="text-white/80 text-base lg:text-lg max-w-xl mx-auto">Stratégies et astuces pour réussir chaque épreuve du TCF Canada</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="container mx-auto px-4 py-8 max-w-4xl">
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
      <div class="mt-8 bg-(--bg-card) border border-(--border-color) rounded-2xl p-8 text-center flex flex-col items-center gap-4">
        <p class="text-(--text-secondary) text-base">
          Prêt à vous entraîner ? Découvrez nos
          <NuxtLink to="/epreuve/comprehension-ecrite/series" class="text-primary-600 font-semibold hover:underline">examens blancs</NuxtLink>
          et nos
          <NuxtLink to="/tarifs" class="text-primary-600 font-semibold hover:underline">corrections détaillées IA</NuxtLink> !
        </p>
        <NuxtLink v-if="!seriesStore.hasPremiumAccess" to="/tarifs">
          <Button label="Débloquer l'accès complet" icon="pi pi-crown" icon-pos="left" class="bg-gradient-primary border-none font-bold px-6" />
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import MethodologyCE from '~/components/Methodology/MethodologyCE.vue'
import MethodologyCO from '~/components/Methodology/MethodologyCO.vue'
import MethodologyEE from '~/components/Methodology/MethodologyEE.vue'
import MethodologyEO from '~/components/Methodology/MethodologyEO.vue'

const seriesStore = useSeriesStore()

onMounted(() => {
  seriesStore.fetchMyAccess()
})

useHead({ title: 'Méthodologie TCF Canada | Lumina TCF' })
</script>