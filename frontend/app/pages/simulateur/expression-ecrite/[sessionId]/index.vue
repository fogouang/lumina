
<template>
  <div>
    <!-- En-tête -->
    <header class="featured-panel relative mb-6 overflow-hidden rounded-card p-6 text-white shadow-brand sm:p-8">
      <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0">
          <NuxtLink
            to="/simulateur/expression-ecrite"
            class="mb-3 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            <i class="pi pi-arrow-left text-xs" />
            Expression Écrite
          </NuxtLink>
          <h1 class="truncate font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            {{ session?.name ?? "…" }}
          </h1>
          <p class="mt-1 text-sm capitalize text-white/75">
            {{ session ? formatMonth(session.month) : "" }}
          </p>
        </div>

        <dl class="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-md">
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Nombre de sujets</dt>
            <i class="pi pi-list text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ loading ? "·" : `${combinations.length} sujet${combinations.length > 1 ? "s" : ""}` }}
            </dd>
          </div>
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Statut</dt>
            <i
              class="pi text-sm text-accent-400"
              :class="session?.is_active ? 'pi-check-circle' : 'pi-inbox'"
              aria-hidden="true"
            />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ session ? (session.is_active ? "Active" : "Archivée") : "·" }}
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

    <!-- Plus de crédits -->
    <div
      v-if="sub.aiCreditsRemaining === 0"
      class="mb-5 flex flex-col gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 sm:flex-row sm:items-center dark:border-accent-500/25 dark:bg-accent-500/10"
    >
      <span class="grid size-10 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
        <i class="pi pi-exclamation-triangle" />
      </span>
      <div class="flex-1 text-sm">
        <p class="font-bold text-ink">Aucun crédit IA disponible</p>
        <p class="text-muted">
          Vous pouvez lire les sujets mais pas lancer la correction IA. Achetez des crédits pour simuler.
        </p>
      </div>
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
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 2" :key="n" class="h-72 animate-pulse rounded-card bg-card" />
    </div>

    <!-- Aucune combinaison -->
    <div
      v-else-if="!combinations.length"
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
        <i class="pi pi-inbox text-2xl" />
      </span>
      <p class="max-w-sm text-sm font-medium text-muted">
        Aucune combinaison disponible. Les sujets de cette session n'ont pas encore été publiés.
      </p>
    </div>

    <!-- Combinaisons -->
    <div v-else class="space-y-4">
      <article
        v-for="combo in combinations"
        :key="combo.id"
        class="group overflow-hidden rounded-card border border-line bg-card shadow-soft transition-all duration-300 hover:border-primary/30 hover:shadow-lift"
      >
        <!-- En-tête du sujet -->
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card-2/50 px-5 py-4">
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid size-11 shrink-0 place-items-center rounded-leaf brand-gradient font-heading text-sm font-extrabold text-white shadow-brand">
              {{ combo.order }}
            </span>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wider text-faint">Sujet {{ combo.order }}</p>
              <h2 class="truncate font-heading text-base font-bold text-ink">{{ combo.title }}</h2>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-bold text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
            <i class="pi pi-bolt text-[0.6rem]" />
            Correction IA disponible
          </span>
        </header>

        <!-- Tâches -->
        <div class="grid grid-cols-1 gap-3 p-5 lg:grid-cols-3">
          <div
            v-for="task in [
              { n: 1, label: 'Message', text: combo.task1_instruction, min: combo.task1_word_min, max: combo.task1_word_max },
              { n: 2, label: 'Narration', text: combo.task2_instruction, min: combo.task2_word_min, max: combo.task2_word_max },
              { n: 3, label: 'Argumentation', text: combo.task3_title, min: combo.task3_word_min, max: combo.task3_word_max },
            ]"
            :key="task.n"
            class="flex flex-col rounded-2xl border border-line bg-card-2/40 p-4"
          >
            <div class="mb-2 flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-2">
                <span class="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {{ task.n }}
                </span>
                <span class="text-xs font-bold uppercase tracking-wider text-primary">{{ task.label }}</span>
              </span>
              <span class="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-muted ring-1 ring-line">
                {{ task.min }}–{{ task.max }} mots
              </span>
            </div>
            <p class="line-clamp-4 flex-1 text-sm leading-relaxed text-ink">{{ task.text }}</p>
          </div>
        </div>

        <!-- Pied -->
        <footer class="flex justify-end border-t border-line px-5 py-4">
          <NuxtLink
            :to="`/simulateur/expression-ecrite/${sessionId}/${combo.id}`"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ease-spring sm:w-auto"
            :class="
              sub.aiCreditsRemaining > 0
                ? 'brand-gradient text-white shadow-brand hover:-translate-y-0.5 hover:shadow-brand-hover'
                : 'border border-line bg-card text-ink hover:border-primary/40 hover:text-primary'
            "
          >
            <i :class="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'" class="text-xs" />
            {{ sub.aiCreditsRemaining > 0 ? "Simuler ce sujet" : "Voir ce sujet" }}
            <i class="pi pi-arrow-right text-xs transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </footer>
      </article>
    </div>

    <BuyCreditsDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { EECombinationResponse } from "#shared/api/models/EECombinationResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";
import type { SuccessResponse_list_EECombinationResponse__ } from "#shared/api/models/SuccessResponse_list_EECombinationResponse__";

definePageMeta({ layout: "account", middleware: "auth" });

const route = useRoute();
const sessionId = route.params.sessionId as string;
const { get } = useApi();
const sub = useSubscriptionStore();

const loading = ref(true);
const session = ref<MonthlySessionResponse | null>(null);
const combinations = ref<EECombinationResponse[]>([]);
const { open: openBuyCredits } = useBuyCreditsDialog();

onMounted(async () => {
  await sub.fetchMySubscriptions();
  try {
    const [sessionsRes, combosRes] = await Promise.all([
      get<SuccessResponse_list_MonthlySessionResponse__>(
        "/v1/public-expressions/sessions?active_only=false",
      ),
      get<SuccessResponse_list_EECombinationResponse__>(
        `/v1/public-expressions/sessions/${sessionId}/ee`,
      ),
    ]);

    session.value =
      (sessionsRes.data ?? []).find((s) => s.id === sessionId) ?? null;
    combinations.value = (combosRes.data ?? []).sort(
      (a, b) => a.order - b.order,
    );
  } finally {
    loading.value = false;
  }
});

function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

useHead({
  title: computed(
    () =>
      `${session.value?.name ?? "Session"} - Expression Écrite | Lumina TCF`,
  ),
});
</script>
