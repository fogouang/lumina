<template>
  <div class="min-h-screen bg-canvas">
    <!-- Hero -->
    <section class="featured-panel px-4 pb-36 pt-32 text-center sm:px-6 lg:pt-40">
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />
      <div class="relative mx-auto flex max-w-2xl flex-col items-center">
        <span
          v-reveal
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md"
        >
          <i class="pi pi-microphone text-[0.7rem] text-accent-400" />
          Sujets d'actualité
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="mt-6 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          Expression <span class="text-accent-400">orale</span>
        </h1>
        <p v-reveal="{ delay: 200 }" class="mt-5 text-lg leading-relaxed text-white/80">
          Entraînez-vous sur les vrais sujets du mois. Préparez vos tâches 2 et 3 en enregistrant vos
          réponses, puis réécoutez-vous pour évaluer vos performances.
        </p>
      </div>
    </section>

    <!-- Sessions -->
    <section class="relative z-10 -mt-24 px-4 pb-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <!-- Chargement -->
        <div v-if="loading" class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton v-for="i in 3" :key="i" height="18rem" border-radius="2rem 0.5rem" />
        </div>

        <!-- Vide -->
        <div
          v-else-if="!sessions.length"
          class="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-card border border-line bg-card p-12 text-center shadow-lift"
        >
          <span class="grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
            <i class="pi pi-microphone text-xl" />
          </span>
          <h2 class="font-heading text-xl font-bold text-ink">Aucune session disponible</h2>
          <p class="text-muted">Les sujets du mois apparaîtront ici dès leur publication.</p>
        </div>

        <!-- Grille -->
        <div v-else class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="(session, i) in sessions" :key="session.id" v-reveal="{ delay: 200 + i * 90 }" class="h-full">
            <article
              class="flex h-full flex-col overflow-hidden rounded-[2rem_0.5rem] border border-line bg-card shadow-lift transition-all duration-300 ease-spring hover:-translate-y-1.5"
            >
              <!-- En-tête -->
              <div class="featured-panel px-6 py-6 text-white">
                <div class="flex items-center justify-between">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
                    :class="session.is_active ? 'bg-green-400/20 text-green-200' : 'bg-white/15 text-white/70'"
                  >
                    <span class="size-1.5 rounded-full" :class="session.is_active ? 'bg-green-300' : 'bg-white/50'" />
                    {{ session.is_active ? "Actif" : "Archivé" }}
                  </span>
                  <i class="pi pi-microphone text-lg text-white/50" />
                </div>
                <h3 class="mt-4 font-heading text-xl font-extrabold">{{ session.name }}</h3>
                <p class="mt-1 text-sm text-white/70">{{ formatMonth(session.month) }}</p>
              </div>

              <!-- Contenu -->
              <div class="flex flex-1 flex-col gap-3 px-6 py-5">
                <div class="flex items-center gap-3 text-sm text-muted">
                  <span class="grid size-8 place-items-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    <i class="pi pi-comments text-xs" />
                  </span>
                  <i v-if="loadingCounts[session.id]" class="pi pi-spin pi-spinner text-xs" />
                  <span v-else>
                    <strong class="font-semibold text-ink">{{ taskCounts[session.id]?.task2 ?? 0 }}</strong>
                    sujet{{ (taskCounts[session.id]?.task2 ?? 0) > 1 ? "s" : "" }} de tâche 2
                  </span>
                </div>
                <div class="flex items-center gap-3 text-sm text-muted">
                  <span class="grid size-8 place-items-center rounded-lg bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    <i class="pi pi-users text-xs" />
                  </span>
                  <i v-if="loadingCounts[session.id]" class="pi pi-spin pi-spinner text-xs" />
                  <span v-else>
                    <strong class="font-semibold text-ink">{{ taskCounts[session.id]?.task3 ?? 0 }}</strong>
                    sujet{{ (taskCounts[session.id]?.task3 ?? 0) > 1 ? "s" : "" }} de tâche 3
                  </span>
                </div>
                <div class="flex items-center gap-3 text-sm text-muted">
                  <span class="grid size-8 place-items-center rounded-lg bg-card-2 text-faint">
                    <i class="pi pi-clock text-xs" />
                  </span>
                  Environ 4 minutes par passage
                </div>

                <AppButton
                  label="Commencer"
                  icon="pi pi-play"
                  variant="gradient"
                  block
                  class="mt-auto"
                  :disabled="!session.is_active"
                  @click="goToSession(session.id)"
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";
import type { SuccessResponse_list_EOTask2Response__ } from "#shared/api/models/SuccessResponse_list_EOTask2Response__";
import type { SuccessResponse_list_EOTask3Response__ } from "#shared/api/models/SuccessResponse_list_EOTask3Response__";

definePageMeta({ middleware: "auth" });

const router = useRouter();
const { get } = useApi();

const loading = ref(true);
const sessions = ref<MonthlySessionResponse[]>([]);

// Per-session EO task counts
const taskCounts = ref<Record<string, { task2: number; task3: number }>>({});
const loadingCounts = ref<Record<string, boolean>>({});

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_MonthlySessionResponse__>(
      "/v1/public-expressions/sessions?active_only=false",
    );
    sessions.value = (res.data ?? []).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime(),
    );

    // Fetch EO task counts for each session in parallel
    await Promise.all(sessions.value.map((s) => fetchTaskCounts(s.id)));
  } finally {
    loading.value = false;
  }
});

async function fetchTaskCounts(sessionId: string) {
  loadingCounts.value[sessionId] = true;
  try {
    const [t2Res, t3Res] = await Promise.all([
      get<SuccessResponse_list_EOTask2Response__>(
        `/v1/public-expressions/sessions/${sessionId}/eo/task2`,
      ),
      get<SuccessResponse_list_EOTask3Response__>(
        `/v1/public-expressions/sessions/${sessionId}/eo/task3`,
      ),
    ]);
    taskCounts.value[sessionId] = {
      task2: t2Res.data?.length ?? 0,
      task3: t3Res.data?.length ?? 0,
    };
  } catch {
    taskCounts.value[sessionId] = { task2: 0, task3: 0 };
  } finally {
    loadingCounts.value[sessionId] = false;
  }
}

function goToSession(sessionId: string) {
  router.push(`/epreuve/expression-orale/sujets-actualites/${sessionId}`);
}

function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

useHead({ title: "Simulateur Expression Orale | Lumina TCF" });
</script>
