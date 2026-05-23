<template>
  <div class="min-h-screen bg-(--bg-ground)">

    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner style="width:48px;height:48px" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-gradient-primary text-white text-center py-12 px-4">
        <NuxtLink
          :to="`/epreuve/${slug}/series`"
          class="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors"
        >
          <i class="pi pi-arrow-left text-xs" /> Retour aux séries
        </NuxtLink>
        <h1 class="text-2xl md:text-3xl font-extrabold mb-2">
          Vous êtes sur le point de commencer la série
          <span class="underline decoration-white/40">{{ serieNumber }}</span>
        </h1>
        <p class="text-white/70 mt-2 text-sm">
          Vous devez choisir un module pour débuter, bon apprentissage !
        </p>
      </div>

      <!-- Modules -->
      <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            v-for="mod in modules"
            :key="mod.key"
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-primary-400 hover:shadow-lg transition-all duration-200 group cursor-pointer"
            @click="launchModule(mod.key)"
          >
            <div class="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <i :class="mod.icon" class="text-3xl text-primary-600" />
            </div>
            <p class="font-bold text-(--text-primary) text-center leading-tight text-sm">
              {{ mod.label }}
            </p>
            <div class="flex flex-col items-center gap-0.5 text-xs text-(--text-tertiary)">
              <span class="flex items-center gap-1">
                <i class="pi pi-clock text-[10px]" /> {{ mod.duration }}
              </span>
              <span class="flex items-center gap-1">
                <i class="pi pi-list text-[10px]" /> {{ mod.questions }}
              </span>
            </div>
          </button>
        </div>

        <p class="text-center text-xs text-(--text-tertiary) mt-8">
          Vous pouvez aussi
          <button
            class="text-primary-600 font-semibold hover:underline"
            @click="launchFull"
          >
            lancer les 4 modules en séquence complète
          </button>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SeriesListResponse } from '#shared/api/models/SeriesListResponse'

definePageMeta({ middleware: 'auth', layout: 'exam' })

const route  = useRoute()
const router = useRouter()
const slug     = route.params.slug as string
const seriesId = route.params.seriesId as string

const seriesStore = useSeriesStore()
const loading     = ref(true)
const serieNumber = ref<number | string>('')

const modules = [
  { key: 'co', label: 'Compréhension Orale',  icon: 'pi pi-headphones',   duration: '35 min', questions: '39 questions' },
  { key: 'ce', label: 'Compréhension Écrite', icon: 'pi pi-book',          duration: '60 min', questions: '39 questions' },
  { key: 'ee', label: 'Expression Écrite',    icon: 'pi pi-pen-to-square', duration: '60 min', questions: '3 tâches'     },
  { key: 'eo', label: 'Expression Orale',     icon: 'pi pi-microphone',    duration: '12 min', questions: '3 tâches'     },
]

onMounted(async () => {
  await seriesStore.fetchSeries()
  const serie = seriesStore.series.find((s: SeriesListResponse) => s.id === seriesId)
  serieNumber.value = serie?.number ?? ''
  loading.value = false
})

function launchModule(moduleKey: string) {
  router.push(`/epreuve/${slug}/series/${seriesId}/module/${moduleKey}`)
}

function launchFull() {
  router.push(`/epreuve/${slug}/series/${seriesId}/complet`)
}

useHead({ title: 'Choisir un module | Lumina TCF' })
</script>