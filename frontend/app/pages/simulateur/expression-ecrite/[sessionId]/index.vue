<template>
  <div>
    <NuxtLink to="/simulateur/expression-ecrite" class="ee-back-link">
      <i class="pi pi-arrow-left text-xs" /> Expression Écrite
    </NuxtLink>

    <div class="ee-session-header">
      <div>
        <h1 class="account-page-title" style="margin-bottom: 0.25rem">
          {{ session?.name ?? "…" }}
        </h1>
        <p class="ee-session-sub">
          {{ session ? formatMonth(session.month) : "" }} ·
          {{ combinations.length }} combinaison{{ combinations.length > 1 ? "s" : "" }}
          de sujets
        </p>
      </div>
      <Tag
        v-if="session"
        :value="session.is_active ? 'Actif' : 'Archivé'"
        :severity="session.is_active ? 'success' : 'secondary'"
      />
    </div>

    <!-- Crédits -->
    <div
      v-if="sub.aiCreditsRemaining === 0"
      class="ee-credit-warning"
    >
      <i class="pi pi-exclamation-triangle" />
      <div class="ee-credit-warning__body">
        <strong>Aucun crédit IA disponible</strong>
        <p>Vous pouvez lire les sujets mais pas lancer la correction IA. Achetez des crédits pour simuler.</p>
      </div>
      <Button
        label="Acheter des crédits"
        icon="pi pi-plus"
        severity="warning"
        size="small"
        @click="buyCreditsVisible = true"
      />
    </div>

    <div class="account-section">
      <div v-if="loading" style="display: flex; justify-content: center; padding: 3rem">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <Message v-else-if="!combinations.length" severity="info">
        Aucune combinaison disponible — les sujets de cette session n'ont pas encore été publiés.
      </Message>

      <div v-else class="ee-combo-list">
        <div v-for="combo in combinations" :key="combo.id" class="ee-combo-card">
          <div class="ee-combo-card__header">
            <span class="ee-combo-card__badge">Sujet {{ combo.order }}</span>
            <h3 class="ee-combo-card__title">{{ combo.title }}</h3>
          </div>

          <div class="ee-combo-card__tasks">
            <div class="ee-combo-task">
              <span class="ee-combo-task__label">Tâche 1 · Message</span>
              <p class="ee-combo-task__text">{{ combo.task1_instruction }}</p>
              <span class="ee-combo-task__words">{{ combo.task1_word_min }}–{{ combo.task1_word_max }} mots</span>
            </div>
            <div class="ee-combo-task">
              <span class="ee-combo-task__label">Tâche 2 · Narration</span>
              <p class="ee-combo-task__text">{{ combo.task2_instruction }}</p>
              <span class="ee-combo-task__words">{{ combo.task2_word_min }}–{{ combo.task2_word_max }} mots</span>
            </div>
            <div class="ee-combo-task">
              <span class="ee-combo-task__label">Tâche 3 · Argumentation</span>
              <p class="ee-combo-task__text">{{ combo.task3_title }}</p>
              <span class="ee-combo-task__words">{{ combo.task3_word_min }}–{{ combo.task3_word_max }} mots</span>
            </div>
          </div>

          <div class="ee-combo-card__footer">
            <span class="ee-combo-card__hint">Correction IA disponible</span>
            <NuxtLink :to="`/simulateur/expression-ecrite/${sessionId}/${combo.id}`">
              <Button
                :label="sub.aiCreditsRemaining > 0 ? 'Simuler ce sujet' : 'Voir ce sujet'"
                :icon="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'"
                :class="sub.aiCreditsRemaining > 0 ? 'bg-gradient-primary border-none' : ''"
                :outlined="sub.aiCreditsRemaining === 0"
                size="small"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <BuyCreditsDialog v-model="buyCreditsVisible" />
  </div>
</template>

<style scoped>
.ee-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.2s;
}
.ee-back-link:hover {
  color: var(--color-primary-600);
}

.ee-session-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.ee-session-sub {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin: 0;
}

.ee-credit-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 0.875rem;
  padding: 1rem 1.125rem;
  margin-bottom: 1.5rem;
}
.ee-credit-warning i {
  color: #d97706;
  font-size: 1.125rem;
  margin-top: 0.125rem;
}
.ee-credit-warning__body {
  flex: 1;
}
.ee-credit-warning__body strong {
  display: block;
  color: #92400e;
  font-size: 0.9rem;
  margin-bottom: 0.125rem;
}
.ee-credit-warning__body p {
  font-size: 0.8125rem;
  color: #b45309;
  margin: 0;
  line-height: 1.5;
}

.ee-combo-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.ee-combo-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  padding: 1rem 1.125rem;
  transition: all 0.2s ease;
}
.ee-combo-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.ee-combo-card__header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}
.ee-combo-card__badge {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-primary-600);
  background: var(--color-primary-50);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
}
.ee-combo-card__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.ee-combo-card__tasks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}
@media (max-width: 640px) {
  .ee-combo-card__tasks {
    grid-template-columns: 1fr;
  }
}
.ee-combo-task {
  background: var(--bg-ground);
  border-radius: 0.625rem;
  padding: 0.625rem 0.75rem;
}
.ee-combo-task__label {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
}
.ee-combo-task__text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 0.25rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ee-combo-task__words {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.ee-combo-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.25rem;
}
.ee-combo-card__hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
</style>

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
