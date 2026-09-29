<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <header
      class="featured-panel relative overflow-hidden rounded-card p-6 text-white shadow-brand sm:p-8"
    >
      <div
        class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="min-w-0">
          <NuxtLink
            v-if="epreuve"
            :to="`/epreuve/${epreuve.slug}`"
            class="mb-3 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            <i class="pi pi-arrow-left text-xs" />
            {{ epreuve.title }}
          </NuxtLink>
          <h1
            class="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
          >
            Séries d'entraînement
          </h1>
        </div>

        <dl class="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-md">
          <div
            class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4"
          >
            <dt class="sr-only">Nombre de séries</dt>
            <i
              class="pi pi-th-large text-sm text-accent-400"
              aria-hidden="true"
            />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ ready ? `${seriesCount} séries` : "·" }}
            </dd>
          </div>
          <div
            class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4"
          >
            <dt class="sr-only">Contenu</dt>
            <i class="pi pi-list text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ epreuve?.questions ?? "·" }}
            </dd>
          </div>
          <div
            class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4"
          >
            <dt class="sr-only">Durée</dt>
            <i class="pi pi-clock text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ epreuve?.duration ?? "·" }}
            </dd>
          </div>
        </dl>
      </div>
    </header>

    <!-- Filtres -->
    <div
      role="tablist"
      aria-label="Filtrer les séries"
      class="inline-flex w-full rounded-xl border border-line bg-card p-1 shadow-soft sm:w-auto"
    >
      <button
        v-for="f in filters"
        :key="f.value"
        type="button"
        role="tab"
        :aria-selected="activeFilter === f.value"
        class="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none"
        :class="
          activeFilter === f.value
            ? 'bg-primary text-primary-contrast shadow-sm'
            : 'text-muted hover:bg-card-2 hover:text-ink'
        "
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <span
          v-if="ready"
          class="rounded-md px-1.5 py-0.5 text-xs tabular-nums"
          :class="
            activeFilter === f.value ? 'bg-white/20' : 'bg-card-2 text-faint'
          "
        >
          {{ countFor(f.value) }}
        </span>
      </button>
    </div>

    <!-- Chargement -->
    <div
      v-if="!ready"
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <div
        v-for="n in 8"
        :key="n"
        class="h-19 animate-pulse rounded-card border border-line bg-card"
      />
    </div>

    <!-- Liste -->
    <div
      v-else-if="filteredSeries.length"
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <button
        v-for="serie in filteredSeries"
        :key="serie.id"
        type="button"
        class="group flex items-center gap-4 rounded-card border bg-card p-4 text-left shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="
          attemptStatus[serie.id] === 'done'
            ? 'border-emerald-300/70 hover:border-emerald-400 dark:border-emerald-500/30'
            : 'border-line hover:border-primary/40'
        "
        @click="onSerieClick(serie)"
      >
        <span class="relative shrink-0">
          <span
            class="grid size-11 place-items-center rounded-leaf font-heading text-sm font-bold tabular-nums"
            :class="
              attemptStatus[serie.id] === 'done'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : seriesStore.isAccessible(serie.number)
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300'
            "
          >
            {{ serie.number }}
          </span>
          <span
            v-if="attemptStatus[serie.id] === 'done'"
            class="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-card bg-emerald-500 text-white"
          >
            <i class="pi pi-check text-[0.55rem]" />
          </span>
        </span>

        <span class="min-w-0 flex-1">
          <span class="block font-heading text-sm font-bold text-ink"
            >Série {{ serie.number }}</span
          >
          <span class="mt-1 flex flex-wrap items-center gap-1.5">
            <!-- Statut de progression -->
            <span
              v-if="attemptStatus[serie.id] === 'done'"
              class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.7rem] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            >
              <i class="pi pi-check-circle text-[0.6rem]" /> Terminée
            </span>
            <span
              v-else-if="attemptStatus[serie.id] === 'in_progress'"
              class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[0.7rem] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
            >
              <i class="pi pi-hourglass text-[0.6rem]" /> En cours
            </span>

            <!-- Accès -->
            <span
              class="inline-flex items-center gap-1 text-xs font-medium"
              :class="
                seriesStore.isAccessible(serie.number)
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-faint'
              "
            >
              <i
                class="pi text-[0.65rem]"
                :class="
                  seriesStore.isAccessible(serie.number)
                    ? 'pi-check-circle'
                    : 'pi-lock'
                "
              />
              {{
                seriesStore.isAccessible(serie.number)
                  ? "Disponible"
                  : "Premium"
              }}
            </span>
          </span>
        </span>

        <i
          class="pi shrink-0 text-sm text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
          :class="
            seriesStore.isAccessible(serie.number)
              ? 'pi-arrow-right'
              : 'pi-lock'
          "
        />
      </button>
    </div>

    <!-- Vide -->
    <div
      v-else
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <i class="pi pi-inbox mb-3 text-2xl text-faint" />
      <p class="text-sm font-medium text-muted">Aucune série dans ce filtre.</p>
    </div>

    <!-- Bandeau Premium : uniquement s'il reste des séries verrouillées -->
    <div
      v-if="ready && !subStore.hasActiveSubscription && lockedCount > 0"
      class="flex flex-col gap-4 rounded-card border border-line bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <span
          class="grid size-11 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300"
        >
          <i class="pi pi-lock" />
        </span>
        <p class="font-heading text-sm font-bold text-ink">
          {{ lockedCount }}
          {{ lockedCount > 1 ? "séries Premium" : "série Premium" }}
        </p>
      </div>
      <AppCta to="/tarifs" label="Voir les tarifs" variant="gradient" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SeriesListResponse } from "#shared/api/models/SeriesListResponse";
import type { SuccessResponse_list_ExamAttemptResponse__ } from "#shared/api/models/SuccessResponse_list_ExamAttemptResponse__";
import { site } from "~/config/site";

definePageMeta({ layout: "account" });

const route = useRoute();
const seriesStore = useSeriesStore();
const subStore = useSubscriptionStore();
const auth = useAuthStore();
const ready = ref(false);

// ── Tentatives (marqueur "Terminée" / "En cours") ────────────
const { get } = useApi();
const attemptStatus = ref<Record<string, "done" | "in_progress">>({});

async function fetchAttempts(): Promise<void> {
  try {
    const res =
      await get<SuccessResponse_list_ExamAttemptResponse__>(
        "/v1/exam-attempts",
      );
    const map: Record<string, "done" | "in_progress"> = {};
    for (const a of res.data ?? []) {
      if (a.status === "completed") map[a.series_id] = "done";
      else if (a.status === "in_progress" && !map[a.series_id])
        map[a.series_id] = "in_progress";
    }
    attemptStatus.value = map;
  } catch {
    // Pas bloquant : la liste s'affiche sans marqueur.
  }
}

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
  await Promise.all([seriesStore.fetchSeries(), seriesStore.fetchMyAccess()]);
  ready.value = true;
  if (auth.isAuthenticated) fetchAttempts();
});

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

// ── Compteurs (affichage) ────────────────────────────────────
const seriesCount = computed(() => seriesStore.series.length);

const accessibleCount = computed(
  () =>
    seriesStore.series.filter((s) => seriesStore.isAccessible(s.number)).length,
);

const lockedCount = computed(() => seriesCount.value - accessibleCount.value);

function countFor(value: "all" | "accessible" | "locked") {
  if (value === "accessible") return accessibleCount.value;
  if (value === "locked") return lockedCount.value;
  return seriesCount.value;
}

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
    ? `Séries ${epreuve.value.title} | ${site.name}`
    : `Séries | ${site.name}`,
});
</script>
