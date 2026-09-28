<template>
  <div class="min-h-screen bg-canvas">
    <!-- Chargement -->
    <div v-if="loading" class="flex min-h-screen flex-col items-center justify-center gap-3">
      <i class="pi pi-spin pi-spinner text-3xl text-primary" />
      <p class="text-sm text-muted">Chargement de la série...</p>
    </div>

    <template v-else>
      <!-- Hero -->
      <section class="featured-panel px-4 pb-36 pt-14 text-center sm:px-6 lg:pt-20">
        <div
          class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
          style="--app-line: rgba(255, 255, 255, 0.06)"
        />
        <div class="relative mx-auto flex max-w-3xl flex-col items-center">
          <NuxtLink
            :to="`/epreuve/${slug}/series`"
            class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white"
          >
            <i class="pi pi-arrow-left text-xs" />
            Retour aux séries
          </NuxtLink>
          <h1
            v-reveal="{ delay: 100 }"
            class="mt-6 font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.15] tracking-tight text-white"
          >
            Vous êtes sur le point de commencer la série
            <span class="text-accent-400">{{ serieNumber }}</span>
          </h1>
          <p v-reveal="{ delay: 200 }" class="mt-4 text-lg text-white/80">
            Choisissez un module pour débuter. Bon apprentissage !
          </p>
        </div>
      </section>

      <!-- Modules : chevauchent le bas du hero -->
      <section class="relative z-10 -mt-24 px-4 pb-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-5xl">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(mod, i) in modules" :key="mod.key" v-reveal="{ delay: 250 + i * 90 }" class="h-full">
              <button
                type="button"
                class="group flex h-full w-full flex-col items-center gap-4 rounded-card border border-line bg-card p-6 text-center shadow-lift transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:border-primary-200 dark:hover:border-primary-800"
                @click="launchModule(mod.key)"
              >
                <span
                  class="grid size-16 place-items-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 ease-spring group-hover:brand-gradient group-hover:text-white group-hover:shadow-brand dark:bg-primary-950 dark:text-primary-300"
                >
                  <i :class="[mod.icon, 'text-2xl']" />
                </span>

                <p class="font-heading font-bold leading-tight text-ink">{{ mod.label }}</p>

                <div class="flex flex-wrap justify-center gap-1.5">
                  <span class="inline-flex items-center gap-1 rounded-full bg-card-2 px-2.5 py-1 text-xs text-muted">
                    <i class="pi pi-clock text-[0.65rem]" />
                    {{ mod.duration }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-card-2 px-2.5 py-1 text-xs text-muted">
                    <i class="pi pi-list text-[0.65rem]" />
                    {{ mod.questions }}
                  </span>
                </div>

                <span class="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Commencer
                  <i class="pi pi-arrow-right text-xs transition-transform duration-300 ease-spring group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>

          <!-- Séquence complète -->
          <div
            v-reveal="{ delay: 600 }"
            class="mt-8 flex flex-col items-center gap-4 rounded-card border-2 border-dashed border-line bg-card/60 p-6 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <div class="flex items-center gap-4">
              <span class="grid size-12 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
                <i class="pi pi-forward text-lg" />
              </span>
              <div>
                <p class="font-heading font-bold text-ink">Conditions réelles de l'examen</p>
                <p class="mt-0.5 text-sm text-muted">Enchaînez les 4 modules à la suite, comme le jour J.</p>
              </div>
            </div>
            <AppButton
              label="Lancer la séquence complète"
              icon="pi pi-play"
              variant="gradient"
              class="shrink-0"
              @click="launchFull"
            />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SeriesListResponse } from '#shared/api/models/SeriesListResponse'
import { site } from '~/config/site'

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

useHead({ title: `Choisir un module | ${site.name}` })
</script>