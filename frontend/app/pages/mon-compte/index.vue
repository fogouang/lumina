<template>
  <div class="flex flex-col gap-6">
    <!-- En-tête -->
    <div v-reveal class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-faint">Tableau de bord</p>
        <h1 class="mt-1 font-heading text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Bonjour{{ firstName ? `, ${firstName}` : "" }}
        </h1>
        <p class="mt-1 text-muted">Voici où en est votre préparation au TCF Canada.</p>
      </div>
      <AppCta
        to="/epreuve/comprehension-ecrite/series"
        label="S'entraîner"
        icon="pi pi-play"
        icon-pos="left"
        size="md"
      />
    </div>

    <!-- Abonnement -->
    <div v-reveal="{ delay: 80 }">
      <div class="featured-panel flex flex-col gap-6 rounded-[2rem_0.5rem] p-6 text-white shadow-brand sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div class="flex items-center gap-4">
          <span class="grid size-13 shrink-0 place-items-center rounded-[1.2rem_0.4rem] bg-accent-400 text-accent-950 shadow-soft">
            <i class="pi pi-crown text-xl" />
          </span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-white/60">Votre formule</p>
            <p class="mt-1 font-heading text-xl font-extrabold sm:text-2xl">
              <span v-if="sub.activeSubscription?.is_trial">Essai gratuit</span>
              <span v-else-if="sub.hasActiveSubscription">{{ sub.activePlan?.name ?? "Premium" }}</span>
              <span v-else>Forfait gratuit</span>
            </p>
            <p class="mt-1 text-sm text-white/75">
              <template v-if="sub.activeSubscription">
                Expire le {{ formatDate(sub.activeSubscription.end_date) }}
              </template>
              <template v-else>Aucun abonnement actif</template>
            </p>
          </div>
        </div>
        <AppCta
          to="/tarifs"
          :label="sub.hasActiveSubscription ? 'Gérer' : 'S\'abonner'"
          icon="pi pi-arrow-right"
          variant="light"
          size="md"
          class="shrink-0"
        />
      </div>
    </div>

    <!-- Assiduité -->
    <div v-reveal="{ delay: 120 }">
      <AccountActivityTracker />
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        v-reveal="{ delay: 150 + i * 80 }"
        class="h-full"
      >
        <div class="group flex h-full flex-col gap-4 rounded-card border border-line bg-card p-5 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lift">
          <span
            class="grid size-11 place-items-center rounded-leaf transition-all duration-300 ease-spring group-hover:brand-gradient group-hover:text-white group-hover:shadow-brand"
            :class="stat.tone"
          >
            <i :class="[stat.icon, 'text-lg']" />
          </span>
          <div>
            <p class="font-heading text-3xl font-extrabold leading-none text-ink">{{ stat.value }}</p>
            <p class="mt-1.5 text-sm text-muted">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tentatives récentes (désactivé pour l'instant, déjà au nouveau design) -->
    <!--
    <div v-reveal class="account-section">
      <div class="mb-5 flex items-center justify-between border-b border-line pb-3.5">
        <h2 class="font-heading text-base font-bold text-ink">Tentatives récentes</h2>
        <NuxtLink to="/mon-compte/tentatives" class="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          Voir tout
          <i class="pi pi-arrow-right text-xs transition-transform duration-300 ease-spring group-hover:translate-x-1" />
        </NuxtLink>
      </div>

      <div v-if="attemptsLoading" class="flex flex-col gap-3">
        <Skeleton v-for="n in 3" :key="n" height="4rem" border-radius="1rem" />
      </div>

      <div v-else-if="!recentAttempts.length" class="flex flex-col items-center gap-3 py-10 text-center">
        <span class="grid size-12 place-items-center rounded-leaf bg-card-2 text-faint">
          <i class="pi pi-inbox text-lg" />
        </span>
        <p class="text-muted">Aucune tentative pour le moment.</p>
        <AppCta to="/epreuve/comprehension-ecrite/series" label="Commencer un test" size="md" icon="pi pi-play" icon-pos="left" />
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="attempt in recentAttempts"
          :key="attempt.id"
          class="flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-card-2"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-leaf"
            :class="{
              'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300': attempt.status === 'in_progress',
              'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300': attempt.status === 'completed',
              'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300': attempt.status === 'abandoned',
            }"
          >
            <i :class="statusIcon(attempt.status)" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-ink">Série {{ attempt.series_number ?? "—" }}</p>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-faint">
              <Tag :value="statusLabel(attempt.status)" :severity="statusSeverity(attempt.status)" rounded />
              <span v-if="attempt.oral_score || attempt.written_score" class="font-semibold text-ink">
                {{ attempt.oral_score ?? attempt.written_score }}/699
              </span>
              <span>{{ formatDate(attempt.started_at) }}</span>
            </div>
          </div>
          <AppCta
            v-if="attempt.status === 'completed'"
            :to="`/epreuve/comprehension-ecrite/resultats/${attempt.id}`"
            label="Résultats"
            icon="pi pi-chart-bar"
            icon-pos="left"
            variant="outline"
            size="md"
          />
          <AppCta
            v-else-if="attempt.status === 'in_progress'"
            :to="`/epreuve/comprehension-ecrite/series/${attempt.series_id}`"
            label="Continuer"
            icon="pi pi-play"
            icon-pos="left"
            size="md"
          />
        </div>
      </div>
    </div>
    -->

    <!-- Accès rapides -->
    <div v-reveal="{ delay: 250 }" class="account-section">
      <h2 class="account-section__title">Accès rapides</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          v-for="ep in epreuves"
          :key="ep.slug"
          :to="`/epreuve/${ep.slug}/series`"
          class="group flex items-center gap-4 rounded-2xl border border-line bg-canvas p-4 transition-all duration-300 ease-spring hover:-translate-y-1 hover:border-primary-200 hover:bg-card hover:shadow-lift dark:hover:border-primary-800"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 ease-spring group-hover:brand-gradient group-hover:text-white group-hover:shadow-brand dark:bg-primary-950 dark:text-primary-300"
          >
            <i :class="[ep.icon, 'text-lg']" />
          </span>
          <span class="flex-1 text-sm font-semibold text-ink">{{ ep.title }}</span>
          <i class="pi pi-angle-right text-faint transition-all duration-300 ease-spring group-hover:translate-x-1 group-hover:text-primary" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptResponse } from "#shared/api/models/ExamAttemptResponse";
import type { SuccessResponse_list_ExamAttemptResponse__ } from "#shared/api/models/SuccessResponse_list_ExamAttemptResponse__";
import { site } from "~/config/site";

definePageMeta({ layout: "account", middleware: "auth" });

const auth = useAuthStore();
const sub = useSubscriptionStore();
const { get } = useApi();
const attemptsLoading = ref(true);
const allAttempts = ref<ExamAttemptResponse[]>([]);

onMounted(async () => {
  await Promise.all([
    sub.fetchMySubscriptions(),
    sub.fetchPlans(),
    fetchAttempts(),
  ]);
});

async function fetchAttempts() {
  try {
    const res =
      await get<SuccessResponse_list_ExamAttemptResponse__>(
        "/v1/exam-attempts",
      );
    allAttempts.value = (res.data ?? []).sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
  } finally {
    attemptsLoading.value = false;
  }
}

const firstName = computed(() => (auth.fullName ?? "").split(" ")[0] ?? "");

const recentAttempts = computed(() => allAttempts.value.slice(0, 5));
const completedCount = computed(
  () => allAttempts.value.filter((a) => a.status === "completed").length,
);
const inProgressCount = computed(
  () => allAttempts.value.filter((a) => a.status === "in_progress").length,
);

const avgScore = computed(() => {
  const completed = allAttempts.value.filter(
    (a) => a.status === "completed" && (a.oral_score || a.written_score),
  );
  if (!completed.length) return null;
  const total = completed.reduce(
    (sum, a) => sum + (a.oral_score ?? a.written_score ?? 0),
    0,
  );
  return Math.round(total / completed.length);
});

// Tuiles de statistiques
const stats = computed(() => [
  {
    label: "Séries terminées",
    value: completedCount.value,
    icon: "pi pi-check-circle",
    tone: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
  },
  {
    label: "En cours",
    value: inProgressCount.value,
    icon: "pi pi-clock",
    tone: "bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300",
  },
  {
    label: "Score moyen /699",
    value: avgScore.value ?? "—",
    icon: "pi pi-chart-line",
    tone: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  {
    label: "Crédits IA restants",
    value: sub.aiCreditsRemaining,
    icon: "pi pi-sparkles",
    tone: "bg-card-2 text-primary",
  },
]);

function statusLabel(status: string) {
  return (
    { in_progress: "En cours", completed: "Terminé", abandoned: "Abandonné" }[
      status
    ] ?? status
  );
}
function statusSeverity(status: string) {
  return (
    { in_progress: "warning", completed: "success", abandoned: "danger" }[
      status
    ] ?? "secondary"
  );
}
function statusIcon(status: string) {
  return (
    {
      in_progress: "pi pi-clock",
      completed: "pi pi-check",
      abandoned: "pi pi-times",
    }[status] ?? "pi pi-circle"
  );
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const epreuves = [
  { slug: "comprehension-ecrite", title: "Compréhension écrite", icon: "pi pi-book" },
  { slug: "comprehension-orale", title: "Compréhension orale", icon: "pi pi-headphones" },
  { slug: "expression-ecrite", title: "Expression écrite", icon: "pi pi-pen-to-square" },
  { slug: "expression-orale", title: "Expression orale", icon: "pi pi-microphone" },
];

useHead({ title: `Tableau de bord | ${site.name}` });
</script>