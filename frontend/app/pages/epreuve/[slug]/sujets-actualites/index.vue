<template>
  <div class="min-h-screen bg-(--bg-ground)">
    <!-- Hero -->
    <div
      class="relative bg-linear-to-br from-primary-700 to-primary-900 py-14 text-center overflow-hidden"
    >
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px);
          background-size: 24px 24px;
        "
      />
      <div class="relative z-10 container mx-auto px-4">
        <h1 class="text-3xl lg:text-4xl font-extrabold text-white mb-3">
          Expression Orale
        </h1>
        <p class="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
          Entraînez-vous sur les vrais sujets du mois. Préparez vos Tâche 2 et
          Tâche 3 en enregistrant vos réponses, puis réécoutez-vous pour évaluer
          vos performances.
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-10 max-w-5xl">
      <!-- Loading -->
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <Skeleton v-for="i in 3" :key="i" height="220px" border-radius="16px" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!sessions.length"
        class="text-center py-16 bg-(--bg-card) border border-(--border-color) rounded-2xl"
      >
        <i
          class="pi pi-microphone text-5xl text-(--text-tertiary) mb-4 block opacity-30"
        />
        <h2 class="text-xl font-bold text-(--text-primary) mb-2">
          Aucune session disponible
        </h2>
        <p class="text-(--text-secondary)">
          Les sujets du mois apparaîtront ici dès leur publication.
        </p>
      </div>

      <!-- Sessions grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4"
      >
        <div
          v-for="session in sessions"
          :key="session.id"
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
        >
          <!-- Card header -->
          <div
            class="bg-linear-to-br from-primary-600 to-primary-800 px-5 py-6"
          >
            <div class="flex items-center justify-between mb-3">
              <Tag
                :value="session.is_active ? 'Actif' : 'Archivé'"
                :severity="session.is_active ? 'success' : 'secondary'"
              />
              <i class="pi pi-microphone text-white/60 text-lg" />
            </div>
            <h3 class="text-xl font-extrabold text-white mb-1">
              {{ session.name }}
            </h3>
            <p class="text-white/70 text-sm">
              {{ formatMonth(session.month) }}
            </p>
          </div>

          <!-- Card body -->
          <div class="px-5 py-4 flex-1 flex flex-col gap-3">
            <!-- Tâche 2 count -->
            <div
              class="flex items-center gap-2 text-sm text-(--text-secondary)"
            >
              <i class="pi pi-comments text-primary-400" />
              <span>
                <template v-if="loadingCounts[session.id]">
                  <i class="pi pi-spin pi-spinner text-xs" />
                </template>
                <template v-else>
                  {{ taskCounts[session.id]?.task2 ?? 0 }} sujet{{
                    (taskCounts[session.id]?.task2 ?? 0) > 1 ? "s" : ""
                  }}
                  Tâche 2
                </template>
              </span>
            </div>
            <!-- Tâche 3 count -->
            <div
              class="flex items-center gap-2 text-sm text-(--text-secondary)"
            >
              <i class="pi pi-users text-primary-400" />
              <span>
                <template v-if="loadingCounts[session.id]">
                  <i class="pi pi-spin pi-spinner text-xs" />
                </template>
                <template v-else>
                  {{ taskCounts[session.id]?.task3 ?? 0 }} sujet{{
                    (taskCounts[session.id]?.task3 ?? 0) > 1 ? "s" : ""
                  }}
                  Tâche 3
                </template>
              </span>
            </div>
            <!-- Durée -->
            <div
              class="flex items-center gap-2 text-sm text-(--text-secondary)"
            >
              <i class="pi pi-clock text-primary-400" />
              <span>~ 4 minutes par passage</span>
            </div>

            <!-- CTA -->
            <div class="mt-auto pt-2">
              <Button
                label="Commencer"
                icon="pi pi-play"
                class="w-full"
                :disabled="!session.is_active"
                @click="goToSession(session.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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
