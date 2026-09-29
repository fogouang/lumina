
<template>
  <div>
    <!-- En-tête -->
    <header class="featured-panel relative mb-6 overflow-hidden rounded-card p-6 text-white shadow-brand sm:p-8">
      <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0 max-w-xl">
          <p class="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            <i class="pi pi-pen-to-square text-[0.7rem] text-accent-400" />
            Simulateur écrit
          </p>
          <h1 class="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">Expression Écrite</h1>
          <p class="mt-1.5 text-sm leading-relaxed text-white/75">
            Entraînez-vous sur les vrais sujets du mois. Rédigez vos 3 tâches et
            obtenez une correction IA instantanée.
          </p>
          <ul class="mt-4 flex flex-wrap gap-2">
            <li class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold">
              <i class="pi pi-list text-[0.65rem] text-accent-400" /> 3 tâches
            </li>
            <li class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold">
              <i class="pi pi-clock text-[0.65rem] text-accent-400" /> 60 minutes recommandées
            </li>
            <li class="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold">
              <i class="pi pi-bolt text-[0.65rem] text-accent-400" /> Correction IA
            </li>
          </ul>
        </div>

        <dl v-if="auth.isAuthenticated" class="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-md">
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Sessions</dt>
            <i class="pi pi-calendar text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ loading ? "·" : `${sessions.length} sessions` }}
            </dd>
          </div>
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Sessions actives</dt>
            <i class="pi pi-check-circle text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ loading ? "·" : `${activeCount} actives` }}
            </dd>
          </div>
          <button
            type="button"
            class="rounded-xl border px-3 py-3 text-left backdrop-blur transition-colors sm:px-4"
            :class="
              sub.aiCreditsRemaining > 0
                ? 'border-white/15 bg-white/10 hover:bg-white/15'
                : 'border-accent-400/60 bg-accent-400/20 hover:bg-accent-400/30'
            "
            aria-label="Acheter des crédits IA"
            @click="openBuyCredits()"
          >
            <i class="pi pi-bolt text-sm text-accent-400" aria-hidden="true" />
            <span class="mt-1.5 block font-heading text-sm font-bold sm:text-base">
              {{ sub.aiCreditsRemaining }} crédit{{ sub.aiCreditsRemaining > 1 ? "s" : "" }}
            </span>
          </button>
        </dl>
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
      <!-- Plus de crédits -->
      <div
        v-if="sub.aiCreditsRemaining === 0"
        class="mb-5 flex flex-col gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-accent-500/25 dark:bg-accent-500/10"
      >
        <p class="flex items-start gap-2.5 text-sm text-ink">
          <i class="pi pi-exclamation-circle mt-0.5 text-accent-700 dark:text-accent-300" />
          Aucun crédit IA disponible. Vous pouvez lire les sujets mais pas lancer de correction.
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

      <!-- Chargement -->
      <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="n in 3" :key="n" class="h-40 animate-pulse rounded-card bg-card" />
      </div>

      <!-- Erreur -->
      <div
        v-else-if="error"
        class="mb-4 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/25 dark:bg-red-500/10"
      >
        <p class="flex items-start gap-2.5 text-sm font-medium text-red-700 dark:text-red-300">
          <i class="pi pi-times-circle mt-0.5" />
          {{ error }}
        </p>
        <AppButton
          label="Réessayer"
          icon="pi pi-refresh"
          variant="ghost"
          size="small"
          class="shrink-0"
          @click="loadSessions"
        />
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
          Aucune session disponible. Les sujets du mois apparaîtront ici dès leur publication.
        </p>
      </div>

      <!-- Sessions -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="session in sessions"
          :key="session.id"
          class="group flex flex-col rounded-card border border-line bg-card p-5 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift"
        >
          <div class="mb-5 flex items-start gap-4">
            <span
              class="grid size-14 shrink-0 place-items-center rounded-leaf font-heading text-lg font-extrabold uppercase"
              :class="session.is_active ? 'brand-gradient text-white shadow-brand' : 'bg-card-2 text-faint'"
            >
              {{ formatMonth(session.month).charAt(0) }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold capitalize text-muted">{{ formatMonth(session.month) }}</p>
              <h2 class="truncate font-heading text-base font-bold text-ink">{{ session.name }}</h2>
              <span
                class="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  session.is_active
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-card-2 text-muted'
                "
              >
                <span class="size-1.5 rounded-full" :class="session.is_active ? 'bg-emerald-500' : 'bg-faint'" />
                {{ session.is_active ? "Actif" : "Archivé" }}
              </span>
            </div>
          </div>

          <NuxtLink
            :to="`/simulateur/expression-ecrite/${session.id}`"
            class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ease-spring"
            :class="
              sub.aiCreditsRemaining > 0
                ? 'brand-gradient text-white shadow-brand hover:shadow-brand-hover'
                : 'border border-line bg-card text-ink hover:border-primary/40 hover:text-primary'
            "
          >
            <i :class="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'" class="text-xs" />
            {{ sub.aiCreditsRemaining > 0 ? "Voir les sujets" : "Lire les sujets" }}
            <i class="pi pi-arrow-right ml-auto text-xs transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </article>
      </div>

      <!-- Crédits IA -->
      <div
        v-if="!loading && !error"
        class="mt-6 flex flex-col items-start gap-4 rounded-card border border-line bg-card p-5 shadow-soft md:flex-row md:items-center"
      >
        <span class="grid size-12 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
          <i class="pi pi-bolt text-lg" />
        </span>
        <div class="flex-1">
          <p class="mb-0.5 font-heading font-bold text-ink">Comment fonctionnent les crédits IA ?</p>
          <p class="text-sm text-muted">
            1 crédit = 1 correction IA complète (3 tâches). Chaque simulation consomme 1 crédit.
          </p>
        </div>
        <AppButton
          label="Acheter des crédits"
          icon="pi pi-plus"
          variant="secondary"
          class="shrink-0"
          @click="openBuyCredits()"
        />
      </div>
    </template>

    <BuyCreditsDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";

definePageMeta({ layout: "account", middleware: "auth" });

const { get } = useApi();
const auth = useAuthStore();
const sub = useSubscriptionStore();
const { openLogin } = useAuthModal();

const loading = ref(true);
const error = ref<string | null>(null);
const sessions = ref<MonthlySessionResponse[]>([]);
const { open: openBuyCredits } = useBuyCreditsDialog();

// ── En-tête (affichage) ──────────────────────────────────────
const activeCount = computed(() => sessions.value.filter((s) => s.is_active).length);

async function loadSessions() {
  loading.value = true;
  error.value = null;
  try {
    const [, res] = await Promise.all([
      sub.fetchMySubscriptions().catch(() => null),
      get<SuccessResponse_list_MonthlySessionResponse__>(
        "/v1/public-expressions/sessions",
        { params: { active_only: false } },
      ),
    ]);
    sessions.value = (res.data ?? []).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime(),
    );
  } catch (err: any) {
    error.value =
      err?.data?.message ??
      err?.message ??
      "Impossible de charger les sessions.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadSessions);

function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

useHead({ title: "Simulateur Expression Écrite | Lumina TCF" });
</script>
