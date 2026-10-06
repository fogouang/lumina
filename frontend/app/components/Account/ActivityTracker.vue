<template>
  <section class="account-section">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="font-heading text-lg font-bold text-ink">Mon assiduité</h2>
        <p class="text-sm text-muted">La régularité compte plus que les longues séances.</p>
      </div>
      <button
        v-if="summary"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
        @click="openGoal"
      >
        <i class="pi pi-flag text-xs" />
        Objectif : {{ summary.weekly_goal_days }} j / semaine
        <i class="pi pi-pencil text-xs text-faint" />
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-3">
        <Skeleton v-for="n in 3" :key="n" height="8rem" border-radius="1rem" />
      </div>
      <Skeleton height="9rem" border-radius="1rem" />
    </div>

    <template v-else-if="summary">
      <div class="grid gap-4 md:grid-cols-3">
        <!-- Série -->
        <div class="rounded-card border border-line bg-card-2/50 p-5">
          <div class="flex items-center gap-2 text-xs font-semibold tracking-wider text-faint uppercase">
            <i class="pi pi-bolt text-amber-500" />
            Série en cours
          </div>
          <p class="mt-2 font-heading text-3xl font-extrabold text-ink tabular-nums">
            {{ summary.current_streak }}
            <span class="text-base font-bold text-muted">jour{{ summary.current_streak > 1 ? "s" : "" }}</span>
          </p>
          <p class="mt-1 text-xs text-muted">
            Record : {{ summary.best_streak }} jour{{ summary.best_streak > 1 ? "s" : "" }}
          </p>
        </div>

        <!-- Semaine -->
        <div class="rounded-card border border-line bg-card-2/50 p-5">
          <div class="flex items-center gap-2 text-xs font-semibold tracking-wider text-faint uppercase">
            <i class="pi pi-calendar text-primary" />
            Cette semaine
          </div>
          <p class="mt-2 font-heading text-3xl font-extrabold text-ink tabular-nums">
            {{ summary.active_days_this_week }}
            <span class="text-base font-bold text-muted">/ {{ summary.weekly_goal_days }} jours</span>
          </p>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-line">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="goalReached ? 'bg-emerald-500' : 'bg-primary'"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <!-- Par épreuve -->
        <div class="rounded-card border border-line bg-card-2/50 p-5">
          <div class="flex items-center gap-2 text-xs font-semibold tracking-wider text-faint uppercase">
            <i class="pi pi-chart-bar text-primary" />
            Épreuves cette semaine
          </div>
          <ul class="mt-3 space-y-2">
            <li v-for="t in TYPES" :key="t.key" class="flex items-center gap-2.5 text-sm">
              <span class="w-8 shrink-0 font-semibold text-ink">{{ t.short }}</span>
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  class="h-full rounded-full bg-primary/70"
                  :style="{ width: `${(summary.week_by_type[t.key] / 7) * 100}%` }"
                />
              </div>
              <span
                class="w-8 shrink-0 text-right text-xs tabular-nums"
                :class="summary.week_by_type[t.key] ? 'text-ink' : 'text-red-500'"
              >
                {{ summary.week_by_type[t.key] }} j
              </span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Message -->
      <div
        class="mt-4 flex items-start gap-3 rounded-card border p-4 text-sm"
        :class="feedback.tone"
      >
        <i :class="feedback.icon" class="mt-0.5" />
        <p class="leading-relaxed">{{ feedback.text }}</p>
      </div>

      <!-- Calendrier -->
      <div class="mt-5">
        <div class="mb-2 flex items-center justify-between gap-3">
          <p class="text-sm font-semibold text-ink">{{ HEATMAP_WEEKS }} dernières semaines</p>
          <p class="text-xs text-muted">{{ summary.total_active_days }} jour(s) de pratique au total</p>
        </div>

        <div class="overflow-x-auto pb-1">
          <div class="flex gap-2">
            <div class="grid grid-rows-7 gap-1 pt-0 text-[0.625rem] leading-3 text-faint">
              <span v-for="(label, i) in DAY_LABELS" :key="i" class="h-3.5">{{ label }}</span>
            </div>
            <div class="grid grid-flow-col grid-rows-7 gap-1">
              <span
                v-for="day in summary.heatmap"
                :key="day.date"
                class="size-3.5 rounded-[3px]"
                :class="[cellClass(day.count), day.date === summary.today ? 'ring-1 ring-ink/40' : '']"
                :title="cellTitle(day)"
              />
            </div>
          </div>
        </div>

        <div class="mt-2 flex items-center justify-end gap-1.5 text-[0.6875rem] text-faint">
          Moins
          <span v-for="n in 5" :key="n" class="size-3 rounded-[3px]" :class="LEVELS[n - 1]" />
          Plus
        </div>
      </div>
    </template>

    <!-- Objectif -->
    <Dialog
      v-model:visible="goalOpen"
      modal
      header="Mon objectif hebdomadaire"
      :draggable="false"
      :style="{ width: '24rem' }"
      :breakpoints="{ '640px': '94vw' }"
    >
      <p class="text-sm text-muted">Combien de jours par semaine voulez-vous pratiquer ?</p>
      <div class="mt-4 grid grid-cols-7 gap-1.5">
        <button
          v-for="n in 7"
          :key="n"
          type="button"
          class="rounded-xl border py-2.5 font-heading text-sm font-bold transition-colors"
          :class="
            goalDraft === n
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-card text-ink hover:border-primary/40'
          "
          @click="goalDraft = n"
        >
          {{ n }}
        </button>
      </div>
      <p class="mt-3 text-xs text-faint">Recommandé : 4 jours ou plus avant l'examen.</p>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="goalOpen = false" />
        <AppButton
          label="Enregistrer"
          icon="pi pi-check"
          variant="gradient"
          :loading="savingGoal"
          @click="saveGoal"
        />
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
type TypeKey = "ce" | "co" | "ee" | "eo";

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivitySummary {
  today: string;
  heatmap: ActivityDay[];
  current_streak: number;
  best_streak: number;
  active_days_this_week: number;
  weekly_goal_days: number;
  week_by_type: Record<TypeKey, number>;
  last_activity_date: string | null;
  total_active_days: number;
}

const HEATMAP_WEEKS = 16;
const DAY_LABELS = ["L", "", "M", "", "V", "", "D"];

const TYPES: { key: TypeKey; short: string }[] = [
  { key: "ce", short: "CE" },
  { key: "co", short: "CO" },
  { key: "ee", short: "EE" },
  { key: "eo", short: "EO" },
];

const LEVELS = [
  "bg-line",
  "bg-primary-200 dark:bg-primary-900",
  "bg-primary-400 dark:bg-primary-700",
  "bg-primary-600 dark:bg-primary-500",
  "bg-primary-800 dark:bg-primary-300",
];

const { get, patch } = useApi();
const toast = useToast();

const summary = ref<ActivitySummary | null>(null);
const loading = ref(true);

const progress = computed(() => {
  if (!summary.value) return 0;
  return Math.min(100, (summary.value.active_days_this_week / summary.value.weekly_goal_days) * 100);
});

const goalReached = computed(
  () => !!summary.value && summary.value.active_days_this_week >= summary.value.weekly_goal_days,
);

function toDate(d: string) {
  return new Date(`${d}T00:00:00`);
}

function daysBetween(a: string, b: string) {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86_400_000);
}

const feedback = computed(() => {
  const s = summary.value;
  const neutral = "border-line bg-card-2/50 text-ink";
  if (!s) return { text: "", icon: "", tone: neutral };

  if (!s.last_activity_date) {
    return {
      text: "Vous n'avez pas encore pratiqué. Commencez aujourd'hui : une série de questions suffit pour lancer votre suivi.",
      icon: "pi pi-play-circle text-primary",
      tone: neutral,
    };
  }

  const idle = daysBetween(s.last_activity_date, s.today);
  if (idle >= 3) {
    return {
      text: `Vous n'avez pas pratiqué depuis ${idle} jours. La régularité fait la différence au TCF : reprenez dès aujourd'hui.`,
      icon: "pi pi-exclamation-triangle",
      tone: "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
    };
  }

  if (goalReached.value) {
    return {
      text: `Objectif atteint cette semaine avec ${s.active_days_this_week} jours de pratique. Gardez ce rythme.`,
      icon: "pi pi-check-circle",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
    };
  }

  const needed = s.weekly_goal_days - s.active_days_this_week;
  const todayIndex = (toDate(s.today).getDay() + 6) % 7; // lundi = 0
  const practicedToday = s.last_activity_date === s.today;
  const daysLeft = 7 - todayIndex - (practicedToday ? 1 : 0);

  if (needed > daysLeft) {
    return {
      text: `Il reste trop peu de jours pour atteindre votre objectif de ${s.weekly_goal_days} jours cette semaine. Pratiquez chaque jour restant et visez-le la semaine prochaine.`,
      icon: "pi pi-info-circle",
      tone: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    };
  }

  const weakest = TYPES.filter((t) => s.week_by_type[t.key] === 0).map((t) => t.short);
  const hint = weakest.length && weakest.length < 4 ? ` Pensez aussi à : ${weakest.join(", ")}.` : "";

  return {
    text: `Encore ${needed} jour${needed > 1 ? "s" : ""} de pratique pour atteindre votre objectif cette semaine.${hint}`,
    icon: "pi pi-flag",
    tone: neutral,
  };
});

function cellClass(count: number) {
  if (count === 0) return LEVELS[0];
  if (count < 10) return LEVELS[1];
  if (count < 30) return LEVELS[2];
  if (count < 60) return LEVELS[3];
  return LEVELS[4];
}

function cellTitle(day: ActivityDay) {
  const label = toDate(day.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return day.count ? `${label} : ${day.count} action(s)` : `${label} : aucune pratique`;
}

async function load() {
  loading.value = true;
  try {
    const res = await get<any>("/v1/activity/me");
    summary.value = res.data ?? null;
  } catch {
    summary.value = null;
  } finally {
    loading.value = false;
  }
}

// ── Objectif ──
const goalOpen = ref(false);
const goalDraft = ref(4);
const savingGoal = ref(false);

function openGoal() {
  goalDraft.value = summary.value?.weekly_goal_days ?? 4;
  goalOpen.value = true;
}

async function saveGoal() {
  savingGoal.value = true;
  try {
    const res = await patch<any>("/v1/activity/me/goal", { weekly_goal_days: goalDraft.value });
    summary.value = res.data ?? summary.value;
    goalOpen.value = false;
    toast.add({ severity: "success", summary: "Objectif mis à jour", life: 2500 });
  } catch {
    toast.add({ severity: "error", summary: "Impossible d'enregistrer l'objectif", life: 3000 });
  } finally {
    savingGoal.value = false;
  }
}

onMounted(load);
</script>