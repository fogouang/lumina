<template>
  <div class="account-section">
    <h2 class="account-section__title">Mes tentatives récentes</h2>

    <!-- Loading -->
    <div v-if="loading" class="attempts__loading">
      <ProgressSpinner style="width:32px;height:32px" />
    </div>

    <!-- Vide -->
    <div v-else-if="!attempts.length" class="attempts__empty">
      <i class="pi pi-inbox" />
      <p>Aucune tentative pour le moment. Commencez un test !</p>
    </div>

    <!-- Liste -->
    <div v-else class="attempts__list">
      <div
        v-for="attempt in attempts"
        :key="attempt.id"
        class="attempt-item"
      >
        <!-- Icône statut -->
        <div class="attempt-item__icon" :class="`attempt-item__icon--${attempt.status}`">
          <i :class="statusIcon(attempt.status)" />
        </div>

        <!-- Infos -->
        <div class="attempt-item__body">
          <span class="attempt-item__serie">
            Série {{ attempt.series_number ?? '—' }}
          </span>
          <div class="attempt-item__meta">
            <Tag
              :value="statusLabel(attempt.status)"
              :severity="statusSeverity(attempt.status)"
              class="attempt-item__tag"
            />
            <span v-if="attempt.oral_score || attempt.written_score" class="attempt-item__score">
              {{ attempt.oral_score ?? attempt.written_score }}/699
            </span>
            <span class="attempt-item__date">
              {{ formatDate(attempt.started_at) }}
            </span>
          </div>
        </div>

        <!-- Action -->
        <NuxtLink
          v-if="attempt.status === 'completed'"
          :to="`/epreuve/${slugFromSeriesId(attempt.series_id)}/resultats/${attempt.id}`"
        >
          <Button
            label="Résultats"
            icon="pi pi-chart-bar"
            size="small"
            outlined
            class="attempt-item__btn"
          />
        </NuxtLink>
        <NuxtLink
          v-else-if="attempt.status === 'in_progress'"
          :to="`/epreuve/${slugFromSeriesId(attempt.series_id)}/series/${attempt.series_id}`"
        >
          <Button
            label="Continuer"
            icon="pi pi-play"
            size="small"
            class="attempt-item__btn bg-gradient-primary"
          />
        </NuxtLink>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptResponse } from '#shared/api/models/ExamAttemptResponse'
import type { SuccessResponse_list_ExamAttemptResponse__ } from '#shared/api/models/SuccessResponse_list_ExamAttemptResponse__'

const { get } = useApi()

const loading  = ref(true)
const attempts = ref<ExamAttemptResponse[]>([])

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_ExamAttemptResponse__>(
      '/v1/exam-attempts'
    )
    attempts.value = (res.data ?? [])
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 10) // 10 dernières
  } catch {
    // silencieux
  } finally {
    loading.value = false
  }
})

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    in_progress: 'En cours',
    completed:   'Terminé',
    abandoned:   'Abandonné',
  }
  return labels[status] ?? status
}

function statusSeverity(status: string): string {
  const map: Record<string, string> = {
    in_progress: 'warning',
    completed:   'success',
    abandoned:   'danger',
  }
  return map[status] ?? 'secondary'
}

function statusIcon(status: string): string {
  const map: Record<string, string> = {
    in_progress: 'pi pi-clock',
    completed:   'pi pi-check',
    abandoned:   'pi pi-times',
  }
  return map[status] ?? 'pi pi-circle'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// On ne stocke pas le slug dans l'attempt — on utilise une map basique
// À améliorer si le back retourne le type de série
function slugFromSeriesId(_seriesId: string): string {
  return 'comprehension-ecrite' // TODO: à affiner si le back retourne le type
}
</script>

<style scoped>
.attempts__loading {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.attempts__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 0;
  color: var(--text-tertiary);
  text-align: center;
}

.attempts__empty i {
  font-size: 2rem;
  color: var(--border-color);
}

.attempts__empty p {
  font-size: 0.9rem;
  margin: 0;
}

/* ── Liste ─────────────────────────────────────────────────── */
.attempts__list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.attempt-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-color);
}

.attempt-item:last-child {
  border-bottom: none;
}

/* Icône */
.attempt-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.attempt-item__icon--completed   { background: var(--color-success-50); }
.attempt-item__icon--completed i { color: var(--color-success-600); }

.attempt-item__icon--in_progress   { background: var(--color-secondary-50); }
.attempt-item__icon--in_progress i { color: var(--color-secondary-600); }

.attempt-item__icon--abandoned   { background: var(--color-danger-50); }
.attempt-item__icon--abandoned i { color: var(--color-danger-600); }

/* Body */
.attempt-item__body {
  flex: 1;
  min-width: 0;
}

.attempt-item__serie {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.attempt-item__meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.attempt-item__tag {
  font-size: 0.75rem !important;
}

.attempt-item__score {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary-600);
}

.attempt-item__date {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* Bouton */
.attempt-item__btn {
  border-radius: 0.5rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>