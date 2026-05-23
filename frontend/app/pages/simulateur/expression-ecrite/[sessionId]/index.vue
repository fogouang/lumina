<template>
  <div class="min-h-screen bg-(--bg-ground)">
    <!-- Hero -->
    <div
      class="relative bg-linear-to-br from-primary-700 to-primary-900 py-12 overflow-hidden"
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
      <div class="relative z-10 container mx-auto px-4 max-w-5xl">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-white/60 text-sm mb-6">
          <NuxtLink
            to="/simulateur/expression-ecrite"
            class="hover:text-white transition-colors flex items-center gap-1"
          >
            <i class="pi pi-arrow-left text-xs" />
            Expression Écrite
          </NuxtLink>
          <i class="pi pi-angle-right text-xs" />
          <span class="text-white/90 font-medium">{{
            session ? session.name : "Chargement…"
          }}</span>
        </nav>

        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 class="text-3xl font-extrabold text-white mb-1">
              {{ session?.name ?? "…" }}
            </h1>
            <p class="text-white/70 text-sm">
              {{ session ? formatMonth(session.month) : "" }} ·
              {{ combinations.length }} combinaison{{
                combinations.length > 1 ? "s" : ""
              }}
              de sujets
            </p>
          </div>
          <Tag
            v-if="session"
            :value="session.is_active ? 'Actif' : 'Archivé'"
            :severity="session.is_active ? 'success' : 'secondary'"
            class="mt-1"
          />
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-10 max-w-5xl">
      <!-- Crédits -->
      <div
        v-if="sub.aiCreditsRemaining === 0"
        class="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 mt-8"
      >
        <i
          class="pi pi-exclamation-triangle text-amber-500 text-xl shrink-0 mt-0.5"
        />
        <div class="flex-1">
          <p class="font-bold text-amber-800 mb-0.5">
            Aucun crédit IA disponible
          </p>
          <p class="text-sm text-amber-700 leading-relaxed">
            Vous pouvez lire les sujets mais pas lancer la correction IA.
            Achetez des crédits pour simuler.
          </p>
        </div>
        <Button
          label="Acheter des crédits"
          icon="pi pi-plus"
          severity="warning"
          size="small"
          @click="buyCreditsVisible = true"
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-4">
        <Skeleton v-for="i in 3" :key="i" height="140px" border-radius="16px" />
      </div>

      <!-- Empty -->
      <div
        v-else-if="!combinations.length"
        class="text-center py-16 bg-(--bg-card) border border-(--border-color) rounded-2xl"
      >
        <i
          class="pi pi-inbox text-5xl text-(--text-tertiary) mb-4 block opacity-30"
        />
        <h2 class="text-xl font-bold text-(--text-primary) mb-2">
          Aucune combinaison disponible
        </h2>
        <p class="text-(--text-secondary)">
          Les sujets de cette session n'ont pas encore été publiés.
        </p>
      </div>

      <!-- Combinaisons -->
      <div v-else class="flex flex-col gap-4 mb-16">
        <div
          v-for="combo in combinations"
          :key="combo.id"
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
        >
          <div class="flex items-start gap-0 flex-col sm:flex-row">
            <!-- Numéro & couleur -->
            <div
              class="bg-linear-to-br from-primary-600 to-primary-800 px-6 py-5 flex flex-col items-center justify-center shrink-0 sm:w-24 w-full sm:min-h-full"
            >
              <span
                class="text-white/60 text-xs font-semibold uppercase tracking-wide"
                >Sujet</span
              >
              <span class="text-white font-extrabold text-3xl leading-none">{{
                combo.order
              }}</span>
            </div>

            <!-- Infos -->
            <div class="flex-1 px-5 py-4 flex flex-col gap-3">
              <div>
                <h3 class="text-base font-bold text-(--text-primary) mb-0.5">
                  {{ combo.title }}
                </h3>
              </div>

              <!-- Aperçu des 3 tâches -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="bg-(--bg-ground) rounded-xl px-3 py-2.5">
                  <p
                    class="text-[10px] font-bold text-(--text-tertiary) uppercase tracking-wide mb-1"
                  >
                    Tâche 1 — Message
                  </p>
                  <p
                    class="text-xs text-(--text-secondary) leading-relaxed line-clamp-2"
                  >
                    {{ combo.task1_instruction }}
                  </p>
                  <p class="text-[10px] text-(--text-tertiary) mt-1">
                    {{ combo.task1_word_min }}–{{ combo.task1_word_max }} mots
                  </p>
                </div>
                <div class="bg-(--bg-ground) rounded-xl px-3 py-2.5">
                  <p
                    class="text-[10px] font-bold text-(--text-tertiary) uppercase tracking-wide mb-1"
                  >
                    Tâche 2 — Narration
                  </p>
                  <p
                    class="text-xs text-(--text-secondary) leading-relaxed line-clamp-2"
                  >
                    {{ combo.task2_instruction }}
                  </p>
                  <p class="text-[10px] text-(--text-tertiary) mt-1">
                    {{ combo.task2_word_min }}–{{ combo.task2_word_max }} mots
                  </p>
                </div>
                <div class="bg-(--bg-ground) rounded-xl px-3 py-2.5">
                  <p
                    class="text-[10px] font-bold text-(--text-tertiary) uppercase tracking-wide mb-1"
                  >
                    Tâche 3 — Argumentation
                  </p>
                  <p
                    class="text-xs text-(--text-secondary) leading-relaxed line-clamp-2"
                  >
                    {{ combo.task3_title }}
                  </p>
                  <p class="text-[10px] text-(--text-tertiary) mt-1">
                    {{ combo.task3_word_min }}–{{ combo.task3_word_max }} mots
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-3 pt-1">
                <div
                  class="flex items-center gap-1.5 text-xs text-(--text-tertiary)"
                >
                  <span>Correction IA disponible</span>
                </div>
                <NuxtLink
                  :to="`/simulateur/expression-ecrite/${sessionId}/${combo.id}`"
                >
                  <Button
                    :label="
                      sub.aiCreditsRemaining > 0
                        ? 'Simuler ce sujet'
                        : 'Voir ce sujet'
                    "
                    :icon="
                      sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'
                    "
                    :class="
                      sub.aiCreditsRemaining > 0
                        ? 'bg-gradient-primary border-none font-bold'
                        : ''
                    "
                    :outlined="sub.aiCreditsRemaining === 0"
                    size="small"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <BuyCreditsDialog v-model="buyCreditsVisible" />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { EECombinationResponse } from "#shared/api/models/EECombinationResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";
import type { SuccessResponse_list_EECombinationResponse__ } from "#shared/api/models/SuccessResponse_list_EECombinationResponse__";

definePageMeta({ middleware: "auth" });

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
      `${session.value?.name ?? "Session"} — Expression Écrite | Lumina TCF`,
  ),
});
</script>
