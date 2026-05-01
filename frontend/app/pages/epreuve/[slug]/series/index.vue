<template>
  <div v-if="epreuve">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <section class="series-hero">
      <div class="container series-hero__inner">
        <NuxtLink :to="`/epreuve/${epreuve.slug}`" class="series-hero__back">
          <i class="pi pi-arrow-left" /> Retour
        </NuxtLink>
        <h1 class="series-hero__title">
          {{ seriesCount }} Séries d'Entraînement
        </h1>
        <p class="series-hero__sub">{{ epreuve.title }} TCF Canada</p>
        <div class="series-hero__badges">
          <span class="series-hero__badge">
            <i class="pi pi-list" /> {{ epreuve.questions }}
          </span>
          <span class="series-hero__badge">
            <i class="pi pi-clock" /> {{ epreuve.duration }}
          </span>
        </div>
      </div>
      <div class="series-hero__wave">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L60 72C120 64 240 48 360 42.7C480 37 600 43 720 48C840 53 960 59 1080 58.7C1200 59 1320 53 1380 50.7L1440 48V80H0Z"
            fill="var(--bg-ground)"
          />
        </svg>
      </div>
    </section>

    <div class="container series-body">
      <!-- ── Filtres ──────────────────────────────────────────── -->
      <div class="series-filters">
        <button
          v-for="f in filters"
          :key="f.value"
          class="series-filter"
          :class="{ 'series-filter--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- ── Loading ─────────────────────────────────────────── -->
      <div v-if="!ready" class="series-loading">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <!-- ── Grid séries ─────────────────────────────────────── -->
      <div v-else class="series-grid">
        <div
          v-for="serie in filteredSeries"
          :key="serie.id"
          class="serie-card"
          :class="{
            'serie-card--accessible': seriesStore.isAccessible(serie.number),
            'serie-card--locked': !seriesStore.isAccessible(serie.number),
          }"
        >
          <!-- Icône état -->
          <div class="serie-card__icon">
            <i
              :class="
                seriesStore.isAccessible(serie.number)
                  ? 'pi pi-book'
                  : 'pi pi-lock'
              "
            />
          </div>

          <!-- Infos -->
          <div class="serie-card__body">
            <span class="serie-card__title"> Série {{ serie.number }} </span>
            <span class="serie-card__sub">
              {{
                seriesStore.isAccessible(serie.number)
                  ? epreuve.questions
                  : "Accès premium"
              }}
            </span>
          </div>

          <!-- CTA -->
          <div class="serie-card__cta">
            <Button
              v-if="seriesStore.isAccessible(serie.number)"
              label="Commencer"
              size="small"
              class="serie-card__btn bg-gradient-primary"
              @click.stop="onSerieClick(serie)"
            />
            <Button
              v-else
              label="Débloquer"
              size="small"
              outlined
              icon="pi pi-lock"
              class="serie-card__btn--locked"
              @click.stop="router.push('/tarifs')"
            />
          </div>
        </div>
      </div>

      <!-- ── Banner upgrade ───────────────────────────────────── -->
      <div v-if="!subStore.hasActiveSubscription" class="series-upgrade">
        <i class="pi pi-lock series-upgrade__icon" />
        <div class="series-upgrade__text">
          <h3>Débloquez toutes les séries</h3>
          <p>
            Les séries 100, 148 et 149 sont gratuites. Passez à un forfait pour
            accéder aux {{ seriesCount - 3 }} séries restantes.
          </p>
        </div>
        <NuxtLink to="/tarifs">
          <Button
            label="Voir les forfaits"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="series-upgrade__btn bg-gradient-primary"
          />
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Slug invalide -->
  <div
    v-else
    class="container"
    style="padding: 5rem 1.5rem; text-align: center"
  >
    <h2>Épreuve introuvable.</h2>
    <NuxtLink to="/"
      ><Button label="Retour à l'accueil" icon="pi pi-home"
    /></NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { SeriesListResponse } from "#shared/api/models/SeriesListResponse";

const route = useRoute();
const seriesStore = useSeriesStore();
const subStore = useSubscriptionStore();
const auth = useAuthStore();
const ready = ref(false);

// ── Données épreuve ──────────────────────────────────────────
const epreuvesMeta: Record<
  string,
  {
    slug: string;
    title: string;
    questions: string;
    duration: string;
  }
> = {
  "comprehension-ecrite": {
    slug: "comprehension-ecrite",
    title: "Compréhension Écrite",
    questions: "39 questions",
    duration: "60 min",
  },
  "comprehension-orale": {
    slug: "comprehension-orale",
    title: "Compréhension Orale",
    questions: "39 questions",
    duration: "35 min",
  },
  "expression-ecrite": {
    slug: "expression-ecrite",
    title: "Expression Écrite",
    questions: "3 tâches",
    duration: "60 min",
  },
  "expression-orale": {
    slug: "expression-orale",
    title: "Expression Orale",
    questions: "3 tâches",
    duration: "12 min",
  },
};

const epreuve = computed(
  () => epreuvesMeta[route.params.slug as string] ?? null,
);

// ── Fetch ────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    seriesStore.fetchSeries(),
    seriesStore.fetchMyAccess(),
  ])
  ready.value = true
})

// ── Filtres ──────────────────────────────────────────────────
const activeFilter = ref<"all" | "accessible" | "locked">("all");

const filters: { label: string; value: "all" | "accessible" | "locked" }[] = [
  { label: "Tous", value: "all" },
  { label: "Disponibles", value: "accessible" },
  { label: "Premium", value: "locked" },
];

const filteredSeries = computed(() => {
  switch (activeFilter.value) {
    case "accessible":
      return seriesStore.series.filter((s) =>
        seriesStore.isAccessible(s.number),
      );
    case "locked":
      return seriesStore.series.filter(
        (s) => !seriesStore.isAccessible(s.number),
      );
    default:
      return seriesStore.series;
  }
});

const seriesCount = computed(() => seriesStore.series.length);

// ── Clic série ───────────────────────────────────────────────
const router = useRouter();

function onSerieClick(serie: SeriesListResponse) {
  if (!seriesStore.isAccessible(serie.number)) {
    router.push("/tarifs");
    return;
  }
  if (!auth.isAuthenticated) {
    const { openLogin } = useAuthModal();
    openLogin();
    return;
  }
  router.push(`/epreuve/${route.params.slug}/series/${serie.id}`);
}

useHead({
  title: epreuve.value
    ? `Séries ${epreuve.value.title} | Lumina TCF`
    : "Séries | Lumina TCF",
});
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────── */
.series-hero {
  position: relative;
  background: var(--gradient-primary);
  padding: 3rem 0 5rem;
  text-align: center;
}

.series-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.series-hero__back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.series-hero__back:hover {
  color: #ffffff;
}

.series-hero__title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.series-hero__sub {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.series-hero__badges {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.series-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.series-hero__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.series-hero__wave svg {
  width: 100%;
  display: block;
}

/* ── Body ──────────────────────────────────────────────────── */
.series-body {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

/* ── Filtres ───────────────────────────────────────────────── */
.series-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}

.series-filter {
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.series-filter:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-600);
}

.series-filter--active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
  font-weight: 600;
}

/* ── Loading ───────────────────────────────────────────────── */
.series-loading {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

/* ── Grid ──────────────────────────────────────────────────── */
.series-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.875rem;
  margin-bottom: 2rem;
}

/* ── Card ──────────────────────────────────────────────────── */
.serie-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.serie-card--accessible:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
}

.serie-card--locked {
  opacity: 0.65;
  cursor: default;
}

.serie-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.serie-card--accessible .serie-card__icon {
  background: var(--color-primary-50);
}

.serie-card--accessible .serie-card__icon i {
  color: var(--color-primary-600);
  font-size: 1rem;
}

.serie-card--locked .serie-card__icon {
  background: var(--bg-ground);
}

.serie-card--locked .serie-card__icon i {
  color: var(--text-tertiary);
  font-size: 1rem;
}

.serie-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.serie-card__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.serie-card__sub {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.serie-card__btn {
  border: none !important;
  border-radius: 0.5rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.serie-card__btn--locked {
  border-radius: 0.5rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
  border-color: var(--border-color) !important;
  color: var(--text-secondary) !important;
}

/* ── Upgrade banner ────────────────────────────────────────── */
.series-upgrade {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #0f172a;
  border-radius: 1rem;
}

.series-upgrade__icon {
  font-size: 1.5rem;
  color: var(--color-primary-400);
  flex-shrink: 0;
}

.series-upgrade__text {
  flex: 1;
}

.series-upgrade__text h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem;
}

.series-upgrade__text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

.series-upgrade__btn {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .series-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .series-grid {
    grid-template-columns: 1fr;
  }
  .series-upgrade {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
