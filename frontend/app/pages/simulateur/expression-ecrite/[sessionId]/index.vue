
<template>
  <div>
    <NuxtLink
      to="/simulateur/expression-ecrite"
      class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
    >
      <i class="pi pi-arrow-left text-xs" /> Expression Écrite
    </NuxtLink>

    <!-- En-tête -->
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="account-page-title mb-1!">{{ session?.name ?? "…" }}</h1>
        <p class="text-sm text-muted">
          <span class="capitalize">{{ session ? formatMonth(session.month) : "" }}</span>
          <span class="mx-1.5 text-faint">·</span>
          <span class="font-semibold tabular-nums text-ink">{{ combinations.length }}</span>
          combinaison{{ combinations.length > 1 ? "s" : "" }} de sujets
        </p>
      </div>
      <span
        v-if="session"
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
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
        @click="buyCreditsVisible = true"
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
        class="overflow-hidden rounded-card border border-line bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift"
      >
        <!-- En-tête -->
        <header class="flex items-center gap-3 border-b border-line bg-card-2/50 px-5 py-4">
          <span class="grid size-10 shrink-0 place-items-center rounded-leaf brand-gradient font-heading text-sm font-extrabold text-white shadow-brand">
            {{ combo.order }}
          </span>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-faint">Sujet {{ combo.order }}</p>
            <h2 class="truncate font-heading text-base font-bold text-ink">{{ combo.title }}</h2>
          </div>
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
            <div class="mb-2 flex items-center gap-2">
              <span class="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {{ task.n }}
              </span>
              <span class="text-xs font-bold uppercase tracking-wider text-primary">
                Tâche {{ task.n }} · {{ task.label }}
              </span>
            </div>
            <p class="line-clamp-4 flex-1 text-sm leading-relaxed text-ink">{{ task.text }}</p>
            <span class="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs font-semibold tabular-nums text-muted ring-1 ring-line">
              <i class="pi pi-align-left text-[0.6rem]" />
              {{ task.min }}–{{ task.max }} mots
            </span>
          </div>
        </div>

        <!-- Pied -->
        <footer class="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span class="inline-flex items-center gap-1.5 text-sm text-muted">
            <i class="pi pi-bolt text-xs text-accent-600 dark:text-accent-400" />
            Correction IA disponible
          </span>
          <NuxtLink
            :to="`/simulateur/expression-ecrite/${sessionId}/${combo.id}`"
            class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ease-spring"
            :class="
              sub.aiCreditsRemaining > 0
                ? 'brand-gradient text-white shadow-brand hover:-translate-y-0.5 hover:shadow-brand-hover'
                : 'border border-line bg-card text-ink hover:border-primary/40 hover:text-primary'
            "
          >
            <i :class="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'" class="text-xs" />
            {{ sub.aiCreditsRemaining > 0 ? "Simuler ce sujet" : "Voir ce sujet" }}
          </NuxtLink>
        </footer>
      </article>
    </div>

    <BuyCreditsDialog v-model="buyCreditsVisible" />
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
const buyCreditsVisible = ref(false);

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
