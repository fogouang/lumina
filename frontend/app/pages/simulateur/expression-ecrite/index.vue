
<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="account-page-title mb-1!">Expression Écrite</h1>
        <p class="max-w-xl text-sm leading-relaxed text-muted">
          Entraînez-vous sur les vrais sujets du mois. Rédigez vos 3 tâches et
          obtenez une correction IA instantanée.
        </p>
      </div>
      <span
        v-if="auth.isAuthenticated"
        class="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1.5 text-sm font-bold text-accent-800 dark:bg-accent-500/15 dark:text-accent-300"
      >
        <i class="pi pi-bolt text-xs" />
        {{ sub.aiCreditsRemaining }} crédit{{ sub.aiCreditsRemaining > 1 ? "s" : "" }} IA
      </span>
    </div>

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
        <div v-for="n in 3" :key="n" class="h-64 animate-pulse rounded-card bg-card" />
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
          class="flex flex-col rounded-card border border-line bg-card p-5 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="grid size-11 shrink-0 place-items-center rounded-leaf"
                :class="session.is_active ? 'brand-gradient text-white shadow-brand' : 'bg-card-2 text-faint'"
              >
                <i class="pi pi-calendar" />
              </span>
              <div class="min-w-0">
                <h2 class="truncate font-heading text-base font-bold text-ink">{{ session.name }}</h2>
                <p class="text-xs capitalize text-muted">{{ formatMonth(session.month) }}</p>
              </div>
            </div>
            <span
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
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

          <ul class="mb-5 flex-1 space-y-2 text-sm text-muted">
            <li class="flex items-center gap-2.5">
              <i class="pi pi-list text-xs text-primary" /> Plusieurs combinaisons de sujets
            </li>
            <li class="flex items-center gap-2.5">
              <i class="pi pi-clock text-xs text-primary" /> 60 minutes recommandées
            </li>
            <li class="flex items-center gap-2.5">
              <i class="pi pi-bolt text-xs text-primary" /> Correction IA disponible
            </li>
          </ul>

          <NuxtLink
            :to="`/simulateur/expression-ecrite/${session.id}`"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ease-spring"
            :class="
              sub.aiCreditsRemaining > 0
                ? 'brand-gradient text-white shadow-brand hover:-translate-y-0.5 hover:shadow-brand-hover'
                : 'border border-line bg-card text-ink hover:border-primary/40 hover:text-primary'
            "
          >
            <i :class="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'" class="text-xs" />
            {{ sub.aiCreditsRemaining > 0 ? "Voir les sujets" : "Lire les sujets" }}
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
