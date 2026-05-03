<template>
  <div class="dashboard">
    <h1 class="account-page-title">Tableau de bord</h1>

    <!-- ── Stats cards ───────────────────────────────────────── -->
    <div class="dashboard__stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--primary">
          <i class="pi pi-check-circle" />
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ completedCount }}</span>
          <span class="stat-card__label">Séries terminées</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--warning">
          <i class="pi pi-clock" />
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ inProgressCount }}</span>
          <span class="stat-card__label">En cours</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--success">
          <i class="pi pi-chart-line" />
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ avgScore ?? "—" }}</span>
          <span class="stat-card__label">Score moyen /699</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">
          <i class="pi pi-sparkles" />
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ sub.aiCreditsRemaining }}</span>
          <span class="stat-card__label">Crédits IA restants</span>
        </div>
      </div>
    </div>

    <!-- ── Abonnement actif ───────────────────────────────────── -->
    <div class="account-section dashboard__subscription">
      <div class="dashboard__sub-left">
        <div class="dashboard__sub-icon">
          <i class="pi pi-crown" />
        </div>
        <div>
          <p class="dashboard__sub-plan">
            <span v-if="sub.activeSubscription?.is_trial"> Essai gratuit </span>
            <span v-else-if="sub.hasActiveSubscription">
              {{ sub.activePlan?.name ?? "Premium" }}
            </span>
            <span v-else> Forfait Gratuit </span>
          </p>
          <p class="dashboard__sub-expiry" v-if="sub.activeSubscription">
            Expire le {{ formatDate(sub.activeSubscription.end_date) }}
          </p>
          <p class="dashboard__sub-expiry" v-else>Aucun abonnement actif</p>
        </div>
      </div>
      <NuxtLink to="/tarifs">
        <Button
          :label="sub.hasActiveSubscription ? 'Gérer' : 'S\'abonner'"
          icon="pi pi-arrow-right"
          icon-pos="right"
          size="small"
          class="dashboard__sub-btn bg-gradient-primary"
        />
      </NuxtLink>
    </div>

    <!-- ── Tentatives récentes ───────────────────────────────── -->
    <!-- <div class="account-section">
      <div class="dashboard__section-header">
        <h2
          class="account-section__title"
          style="margin: 0; border: none; padding: 0"
        >
          Tentatives récentes
        </h2>
        <NuxtLink to="/mon-compte/tentatives" class="dashboard__see-all">
          Voir tout <i class="pi pi-arrow-right" />
        </NuxtLink>
      </div>

      <div v-if="attemptsLoading" class="dashboard__loading">
        <ProgressSpinner style="width: 32px; height: 32px" />
      </div>

      <div v-else-if="!recentAttempts.length" class="dashboard__empty">
        <i class="pi pi-inbox" />
        <p>
          Aucune tentative.
          <NuxtLink to="/epreuve/comprehension-ecrite/series"
            >Commencer un test</NuxtLink
          >
        </p>
      </div>

      <div v-else class="dashboard__attempts">
        <div
          v-for="attempt in recentAttempts"
          :key="attempt.id"
          class="dashboard__attempt"
        >
          <div
            class="dashboard__attempt-icon"
            :class="`dashboard__attempt-icon--${attempt.status}`"
          >
            <i :class="statusIcon(attempt.status)" />
          </div>
          <div class="dashboard__attempt-body">
            <span class="dashboard__attempt-serie"
              >Série {{ attempt.series_number ?? "—" }}</span
            >
            <div class="dashboard__attempt-meta">
              <Tag
                :value="statusLabel(attempt.status)"
                :severity="statusSeverity(attempt.status)"
              />
              <span
                v-if="attempt.oral_score || attempt.written_score"
                class="dashboard__attempt-score"
              >
                {{ attempt.oral_score ?? attempt.written_score }}/699
              </span>
              <span class="dashboard__attempt-date">{{
                formatDate(attempt.started_at)
              }}</span>
            </div>
          </div>
          <NuxtLink
            v-if="attempt.status === 'completed'"
            :to="`/epreuve/comprehension-ecrite/resultats/${attempt.id}`"
          >
            <Button
              label="Résultats"
              icon="pi pi-chart-bar"
              size="small"
              outlined
            />
          </NuxtLink>
          <NuxtLink
            v-else-if="attempt.status === 'in_progress'"
            :to="`/epreuve/comprehension-ecrite/series/${attempt.series_id}`"
          >
            <Button
              label="Continuer"
              icon="pi pi-play"
              size="small"
              class="bg-gradient-primary"
            />
          </NuxtLink>
        </div>
      </div>
    </div> -->

    <!-- ── Accès rapides ──────────────────────────────────────── -->
    <div class="account-section">
      <h2 class="account-section__title">Accès rapides</h2>
      <div class="dashboard__quick">
        <NuxtLink
          v-for="ep in epreuves"
          :key="ep.slug"
          :to="`/epreuve/${ep.slug}/series`"
          class="dashboard__quick-item"
        >
          <div class="dashboard__quick-icon" :style="{ background: ep.iconBg }">
            <i :class="ep.icon" :style="{ color: ep.iconColor }" />
          </div>
          <span>{{ ep.title }}</span>
          <i
            class="pi pi-angle-right"
            style="margin-left: auto; color: var(--text-tertiary)"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptResponse } from "#shared/api/models/ExamAttemptResponse";
import type { SuccessResponse_list_ExamAttemptResponse__ } from "#shared/api/models/SuccessResponse_list_ExamAttemptResponse__";

definePageMeta({ layout: "account", middleware: "auth" });

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
   console.log('is_trial:', sub.activeSubscription?.is_trial)
  console.log('activeSubscription:', sub.activeSubscription)
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
  {
    slug: "comprehension-ecrite",
    title: "Compréhension Écrite",
    icon: "pi pi-book",
    iconColor: "#1d4ed8",
    iconBg: "#eff6ff",
  },
  {
    slug: "comprehension-orale",
    title: "Compréhension Orale",
    icon: "pi pi-headphones",
    iconColor: "#0d9488",
    iconBg: "#f0fdfa",
  },
  {
    slug: "expression-ecrite",
    title: "Expression Écrite",
    icon: "pi pi-pen-to-square",
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
  },
  {
    slug: "expression-orale",
    title: "Expression Orale",
    icon: "pi pi-microphone",
    iconColor: "#d97706",
    iconBg: "#fffbeb",
  },
];

useHead({ title: "Tableau de bord | Lumina TCF" });
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Stats ─────────────────────────────────────────────────── */
.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__icon i {
  font-size: 1.25rem;
}

.stat-card__icon--primary {
  background: var(--color-primary-50);
}
.stat-card__icon--primary i {
  color: var(--color-primary-600);
}

.stat-card__icon--warning {
  background: #fffbeb;
}
.stat-card__icon--warning i {
  color: #d97706;
}

.stat-card__icon--success {
  background: #f0fdf4;
}
.stat-card__icon--success i {
  color: #16a34a;
}

.stat-card__icon--purple {
  background: #f5f3ff;
}
.stat-card__icon--purple i {
  color: #7c3aed;
}

.stat-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-card__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-card__label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* ── Abonnement ────────────────────────────────────────────── */
.dashboard__subscription {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard__sub-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard__sub-icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-50);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard__sub-icon i {
  font-size: 1.125rem;
  color: var(--color-primary-600);
}

.dashboard__sub-plan {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
}

.dashboard__sub-expiry {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
}

.dashboard__sub-btn {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

/* ── Section header ────────────────────────────────────────── */
.dashboard__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

.dashboard__see-all {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-600);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dashboard__see-all i {
  font-size: 0.75rem;
}

/* ── Loading / Empty ───────────────────────────────────────── */
.dashboard__loading {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.dashboard__empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0;
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

.dashboard__empty i {
  font-size: 1.25rem;
}

/* ── Attempts ──────────────────────────────────────────────── */
.dashboard__attempts {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dashboard__attempt {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-color);
}

.dashboard__attempt:last-child {
  border-bottom: none;
}

.dashboard__attempt-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashboard__attempt-icon--completed {
  background: #f0fdf4;
}
.dashboard__attempt-icon--completed i {
  color: #16a34a;
}
.dashboard__attempt-icon--in_progress {
  background: #fffbeb;
}
.dashboard__attempt-icon--in_progress i {
  color: #d97706;
}
.dashboard__attempt-icon--abandoned {
  background: var(--color-danger-50);
}
.dashboard__attempt-icon--abandoned i {
  color: var(--color-danger-600);
}

.dashboard__attempt-body {
  flex: 1;
  min-width: 0;
}

.dashboard__attempt-serie {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.dashboard__attempt-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dashboard__attempt-score {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary-600);
}

.dashboard__attempt-date {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* ── Quick access ──────────────────────────────────────────── */
.dashboard__quick {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dashboard__quick-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dashboard__quick-item:last-child {
  border-bottom: none;
}

.dashboard__quick-item:hover {
  color: var(--color-primary-700);
}

.dashboard__quick-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashboard__quick-icon i {
  font-size: 1rem;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .dashboard__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard__stats {
    grid-template-columns: 1fr 1fr;
  }
  .dashboard__subscription {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
