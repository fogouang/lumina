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
  <div class="eo-sim-entry">
    <h1>Simulateur Expression Orale</h1>
    <p class="eo-sim-entry__sub">Choisissez une série pour démarrer une simulation vocale en temps réel.</p>

    <div v-if="!ready" class="eo-sim-entry__loading">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <div v-else class="eo-sim-entry__grid">
      <div
        v-for="serie in seriesStore.series"
        :key="serie.id"
        class="eo-sim-entry__card"
        :class="{ 'eo-sim-entry__card--locked': !seriesStore.isAccessible(serie.number) }"
        @click="onSerieClick(serie)"
      >
        <i :class="seriesStore.isAccessible(serie.number) ? 'pi pi-microphone' : 'pi pi-lock'" />
        <span>Série {{ serie.number }}</span>
        <Button
          v-if="seriesStore.isAccessible(serie.number)"
          label="Démarrer"
          size="small"
          @click.stop="onSerieClick(serie)"
        />
        <Button
          v-else
          label="Débloquer"
          size="small"
          outlined
          icon="pi pi-lock"
          @click.stop="router.push('/tarifs')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.eo-sim-entry {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}
.eo-sim-entry__sub {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}
.eo-sim-entry__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.875rem;
}
.eo-sim-entry__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  padding: 1.25rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  cursor: pointer;
  text-align: center;
}
.eo-sim-entry__card--locked {
  opacity: 0.65;
  cursor: default;
}
</style>