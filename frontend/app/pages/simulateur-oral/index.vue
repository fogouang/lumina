<script setup lang="ts">
import type { SeriesListResponse } from "#shared/api/models/SeriesListResponse";

definePageMeta({ layout: "account", middleware: "auth" });

const seriesStore = useSeriesStore();
const auth = useAuthStore();
const router = useRouter();
const ready = ref(false);

onMounted(async () => {
  await Promise.all([seriesStore.fetchSeries(), seriesStore.fetchMyAccess()]);
  ready.value = true;
});

function onSerieClick(serie: SeriesListResponse): void {
  if (!seriesStore.isAccessible(serie.number)) {
    router.push("/tarifs");
    return;
  }
  if (!auth.isAuthenticated) {
    const { openLogin } = useAuthModal();
    openLogin();
    return;
  }
  router.push(`/simulateur-oral/${serie.id}`);
}

useHead({ title: "Simulateur Expression Orale | Lumina TCF" });
</script>


<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6">
      <h1 class="account-page-title mb-1!">Simulateur Expression Orale</h1>
      <p class="max-w-xl text-sm leading-relaxed text-muted">
        Choisissez une série pour démarrer une simulation vocale en temps réel.
      </p>
    </div>

    <!-- Chargement -->
    <div v-if="!ready" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <div v-for="n in 8" :key="n" class="h-19 animate-pulse rounded-card border border-line bg-card" />
    </div>

    <!-- Séries -->
    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      <button
        v-for="serie in seriesStore.series"
        :key="serie.id"
        type="button"
        class="group flex items-center gap-4 rounded-card border border-line bg-card p-4 text-left shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="onSerieClick(serie)"
      >
        <span
          class="grid size-11 shrink-0 place-items-center rounded-leaf"
          :class="
            seriesStore.isAccessible(serie.number)
              ? 'brand-gradient text-white shadow-brand'
              : 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300'
          "
        >
          <i :class="seriesStore.isAccessible(serie.number) ? 'pi pi-microphone' : 'pi pi-lock'" />
        </span>

        <span class="min-w-0 flex-1">
          <span class="block font-heading text-sm font-bold text-ink">Série {{ serie.number }}</span>
          <span
            class="mt-1 inline-flex items-center gap-1.5 text-xs font-medium"
            :class="
              seriesStore.isAccessible(serie.number)
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-faint'
            "
          >
            <i
              class="pi text-[0.65rem]"
              :class="seriesStore.isAccessible(serie.number) ? 'pi-check-circle' : 'pi-lock'"
            />
            {{ seriesStore.isAccessible(serie.number) ? "Disponible" : "Premium" }}
          </span>
        </span>

        <!-- Action -->
        <span
          v-if="seriesStore.isAccessible(serie.number)"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-contrast"
        >
          <i class="pi pi-play text-[0.6rem]" />
          Démarrer
        </span>
        <span
          v-else
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-300 px-3 py-1.5 text-xs font-bold text-accent-800 transition-colors hover:bg-accent-100 dark:border-accent-500/40 dark:text-accent-300 dark:hover:bg-accent-500/15"
          @click.stop="router.push('/tarifs')"
        >
          <i class="pi pi-lock text-[0.6rem]" />
          Débloquer
        </span>
      </button>
    </div>
  </div>
</template>