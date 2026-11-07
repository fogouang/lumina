<template>
  <div>
    <!-- En-tête -->
    <header class="featured-panel relative mb-6 overflow-hidden rounded-card p-6 text-white shadow-brand sm:p-8">
      <div class="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0 max-w-xl">
          <p class="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            <i class="pi pi-pen-to-square text-[0.7rem] text-accent-400" />
            Simulateur écrit
          </p>
          <h1 class="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">Expression Écrite</h1>
          <p class="mt-1.5 text-sm leading-relaxed text-white/75">
            Choisissez un sujet, rédigez les 3 tâches en 60 minutes et recevez votre note et votre correction.
          </p>
        </div>

        <button
          v-if="auth.isAuthenticated"
          type="button"
          class="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border px-4 py-2.5 text-sm font-bold backdrop-blur transition-colors sm:self-auto"
          :class="
            sub.aiCreditsRemaining > 0
              ? 'border-white/15 bg-white/10 hover:bg-white/15'
              : 'border-accent-400/60 bg-accent-400/20 hover:bg-accent-400/30'
          "
          aria-label="Acheter des crédits IA"
          @click="openBuyCredits()"
        >
          <i class="pi pi-bolt text-accent-400" />
          {{ sub.aiCreditsRemaining }} crédit{{ sub.aiCreditsRemaining > 1 ? "s" : "" }}
        </button>
      </div>
    </header>

    <!-- Non connecté -->
    <div
      v-if="!auth.isAuthenticated"
      class="flex flex-col items-center rounded-card border border-line bg-card px-6 py-14 text-center shadow-soft"
    >
      <span class="mb-4 grid size-16 place-items-center rounded-leaf bg-primary/10 text-primary">
        <i class="pi pi-lock text-2xl" />
      </span>
      <h2 class="mb-1 font-heading text-lg font-bold text-ink">Connexion requise</h2>
      <p class="mb-5 text-sm text-muted">Créez un compte gratuit pour accéder aux sujets du mois.</p>
      <AppButton label="Se connecter" icon="pi pi-sign-in" variant="gradient" @click="openLogin()" />
    </div>

    <template v-else>
      <!-- Chargement -->
      <div v-if="loading" class="space-y-4">
        <div class="h-32 animate-pulse rounded-card bg-card" />
        <div v-for="n in 3" :key="n" class="h-24 animate-pulse rounded-card bg-card" />
      </div>

      <!-- Erreur -->
      <div
        v-else-if="error"
        class="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/25 dark:bg-red-500/10"
      >
        <p class="flex items-start gap-2.5 text-sm font-medium text-red-700 dark:text-red-300">
          <i class="pi pi-times-circle mt-0.5" />
          {{ error }}
        </p>
        <AppButton label="Réessayer" icon="pi pi-refresh" variant="ghost" size="small" @click="init" />
      </div>

      <!-- Aucune session -->
      <div
        v-else-if="!sessions.length"
        class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
      >
        <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
          <i class="pi pi-calendar text-2xl" />
        </span>
        <p class="max-w-sm text-sm font-medium text-muted">
          Aucun sujet disponible pour le moment. Les sujets du mois apparaîtront ici dès leur publication.
        </p>
      </div>

      <template v-else>
        <!-- Mois affiché -->
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-faint">
              {{ isCurrentMonth ? "Sujets du mois" : "Derniers sujets disponibles" }}
            </p>
            <h2 class="font-heading text-xl font-bold capitalize text-ink">
              {{ selectedSession ? formatMonth(selectedSession.month) : "" }}
            </h2>
          </div>
          <Select
            v-if="sessions.length > 1"
            v-model="selectedId"
            :options="sessionOptions"
            option-label="label"
            option-value="value"
            aria-label="Changer de mois"
            class="w-full sm:w-56"
          />
        </div>

        <!-- Plus de crédits -->
        <div
          v-if="sub.aiCreditsRemaining === 0"
          class="mb-4 flex flex-col gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-accent-500/25 dark:bg-accent-500/10"
        >
          <p class="flex items-start gap-2.5 text-sm text-ink">
            <i class="pi pi-exclamation-circle mt-0.5 text-accent-700 dark:text-accent-300" />
            Vous n'avez plus de crédit IA : vous pouvez lire les sujets, mais pas obtenir de correction.
          </p>
          <AppButton
            label="Acheter des crédits"
            icon="pi pi-plus"
            variant="accent"
            size="small"
            class="shrink-0"
            @click="openBuyCredits()"
          />
        </div>

        <!-- Chargement des sujets -->
        <div v-if="loadingCombos" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-24 animate-pulse rounded-card bg-card" />
        </div>

        <div
          v-else-if="!combos.length"
          class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-12 text-center"
        >
          <i class="pi pi-inbox mb-3 text-2xl text-faint" />
          <p class="text-sm font-medium text-muted">Les sujets de ce mois n'ont pas encore été publiés.</p>
        </div>

        <template v-else>
          <!-- Démarrage rapide + progression -->
          <section class="mb-5 flex flex-col gap-4 rounded-card border border-primary/20 bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0 flex-1">
              <p class="font-heading text-base font-bold text-ink">
                <template v-if="allDone">Bravo, vous avez fait tous les sujets de ce mois !</template>
                <template v-else-if="doneCount === 0">Par où commencer ? Suivez simplement l'ordre.</template>
                <template v-else>Continuez avec le sujet suivant.</template>
              </p>
              <div class="mt-3 flex items-center gap-3">
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-card-2">
                  <div
                    class="brand-gradient h-full rounded-full transition-[width] duration-700"
                    :style="{ width: `${progressPercent}%` }"
                  />
                </div>
                <span class="shrink-0 text-sm font-semibold tabular-nums text-muted">
                  {{ doneCount }} / {{ combos.length }} sujets faits
                </span>
              </div>
            </div>
            <AppButton
              :label="allDone ? 'Refaire un sujet au hasard' : `Commencer le sujet ${nextNumber}`"
              :icon="allDone ? 'pi pi-refresh' : 'pi pi-play'"
              variant="gradient"
              size="large"
              class="shrink-0"
              @click="startNext"
            />
          </section>

          <!-- Liste compacte -->
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <NuxtLink
              v-for="(combo, idx) in combos"
              :key="combo.id"
              :to="comboLink(combo.id)"
              class="group flex items-start gap-4 rounded-card border bg-card p-4 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
              :class="isDone(combo.id) ? 'border-emerald-200 dark:border-emerald-500/25' : 'border-line'"
            >
              <span
                class="grid size-11 shrink-0 place-items-center rounded-leaf font-heading text-sm font-extrabold"
                :class="
                  isDone(combo.id)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'brand-gradient text-white shadow-brand'
                "
              >
                <i v-if="isDone(combo.id)" class="pi pi-check" />
                <template v-else>{{ idx + 1 }}</template>
              </span>

              <div class="min-w-0 flex-1">
                <div class="mb-1.5 flex items-center justify-between gap-2">
                  <p class="font-heading text-base font-bold text-ink">Sujet {{ idx + 1 }}</p>
                  <span
                    v-if="isDone(combo.id)"
                    class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  >
                    {{ done[combo.id] }}/20
                  </span>
                </div>
                <ul class="flex flex-col gap-0.5 text-sm text-muted">
                  <li class="truncate"><span class="font-semibold text-primary">1</span> · {{ combo.task1_instruction }}</li>
                  <li class="truncate"><span class="font-semibold text-primary">2</span> · {{ combo.task2_instruction }}</li>
                  <li class="truncate"><span class="font-semibold text-primary">3</span> · {{ combo.task3_title }}</li>
                </ul>
              </div>

              <i class="pi pi-chevron-right mt-3 shrink-0 text-xs text-faint transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>
        </template>

        <!-- Crédits IA -->
        <p class="mt-6 flex items-center gap-2 text-sm text-muted">
          <i class="pi pi-info-circle text-faint" />
          1 crédit = 1 correction complète des 3 tâches.
          <button type="button" class="font-semibold text-primary hover:underline" @click="openBuyCredits()">
            Acheter des crédits
          </button>
        </p>
      </template>
    </template>

    <BuyCreditsDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { EECombinationResponse } from "#shared/api/models/EECombinationResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";
import type { SuccessResponse_list_EECombinationResponse__ } from "#shared/api/models/SuccessResponse_list_EECombinationResponse__";
import { site } from "~/config/site";

definePageMeta({ layout: "account", middleware: "auth" });

const route = useRoute();
const router = useRouter();
const { get } = useApi();
const auth = useAuthStore();
const sub = useSubscriptionStore();
const { openLogin } = useAuthModal();
const { open: openBuyCredits } = useBuyCreditsDialog();
const { done, load: loadProgress, isDone } = useEEProgress();

const loading = ref(true);
const loadingCombos = ref(false);
const error = ref<string | null>(null);
const sessions = ref<MonthlySessionResponse[]>([]);
const combos = ref<EECombinationResponse[]>([]);
const selectedId = ref<string | null>(null);

const selectedSession = computed(() => sessions.value.find((s) => s.id === selectedId.value) ?? null);

const sessionOptions = computed(() =>
  sessions.value.map((s) => ({ label: capitalize(formatMonth(s.month)), value: s.id })),
);

const isCurrentMonth = computed(() => {
  if (!selectedSession.value) return false;
  const m = new Date(selectedSession.value.month);
  const now = new Date();
  return m.getMonth() === now.getMonth() && m.getFullYear() === now.getFullYear();
});

// ── Progression ──────────────────────────────────────────────
const doneCount = computed(() => combos.value.filter((c) => isDone(c.id)).length);
const progressPercent = computed(() =>
  combos.value.length ? Math.round((doneCount.value / combos.value.length) * 100) : 0,
);
const nextIndex = computed(() => combos.value.findIndex((c) => !isDone(c.id)));
const nextNumber = computed(() => nextIndex.value + 1);
const allDone = computed(() => combos.value.length > 0 && nextIndex.value === -1);

function comboLink(comboId: string) {
  return `/simulateur/expression-ecrite/${selectedId.value}/${comboId}`;
}

function startNext() {
  const list = combos.value;
  if (!list.length) return;
  const target = allDone.value
    ? list[Math.floor(Math.random() * list.length)]!
    : list[nextIndex.value]!;
  navigateTo(comboLink(target.id));
}

// ── Chargement ───────────────────────────────────────────────
async function init() {
  loading.value = true;
  error.value = null;
  loadProgress();
  try {
    const [, res] = await Promise.all([
      sub.fetchMySubscriptions().catch(() => null),
      get<SuccessResponse_list_MonthlySessionResponse__>("/v1/public-expressions/sessions", {
        params: { active_only: false },
      }),
    ]);
    sessions.value = (res.data ?? []).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime(),
    );

    // Mois demandé dans l'URL, sinon la session active la plus récente, sinon la plus récente
    const fromQuery = route.query.session as string | undefined;
    selectedId.value =
      sessions.value.find((s) => s.id === fromQuery)?.id ??
      sessions.value.find((s) => s.is_active)?.id ??
      sessions.value[0]?.id ??
      null;
  } catch (err: any) {
    error.value = err?.data?.message ?? "Impossible de charger les sujets.";
  } finally {
    loading.value = false;
  }
}

async function loadCombos(sessionId: string) {
  loadingCombos.value = true;
  try {
    const res = await get<SuccessResponse_list_EECombinationResponse__>(
      `/v1/public-expressions/sessions/${sessionId}/ee`,
    );
    combos.value = (res.data ?? []).sort((a, b) => a.order - b.order);
  } catch {
    combos.value = [];
  } finally {
    loadingCombos.value = false;
  }
}

watch(selectedId, (id) => {
  if (!id) return;
  router.replace({ query: { ...route.query, session: id } });
  loadCombos(id);
});

onMounted(init);

// ── Utilitaires ──────────────────────────────────────────────
function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

useHead({ title: `Expression Écrite | ${site.name}` });
</script>