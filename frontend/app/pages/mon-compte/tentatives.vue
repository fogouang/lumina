<template>
  <div>
    <h1 class="account-page-title">Mes tentatives</h1>

    <div class="account-section">

      <!-- Filtres -->
      <div class="tentatives__filters">
        <button
          v-for="f in filters"
          :key="f.value"
          class="tentatives__filter"
          :class="{ 'tentatives__filter--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span class="tentatives__filter-count">{{ filterCount(f.value) }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" style="display:flex;justify-content:center;padding:3rem">
        <ProgressSpinner style="width:40px;height:40px" />
      </div>

      <!-- Vide -->
      <div v-else-if="!filteredAttempts.length" class="tentatives__empty">
        <i class="pi pi-inbox" />
        <p>Aucune tentative trouvée.</p>
      </div>

      <!-- Liste -->
      <div v-else class="tentatives__list">
        <div
          v-for="attempt in filteredAttempts"
          :key="attempt.id"
          class="tentative-row"
        >
          <div class="tentative-row__icon" :class="`tentative-row__icon--${attempt.status}`">
            <i :class="statusIcon(attempt.status)" />
          </div>

          <div class="tentative-row__body">
            <span class="tentative-row__serie">Série {{ attempt.series_number ?? '—' }}</span>
            <div class="tentative-row__meta">
              <Tag :value="statusLabel(attempt.status)" :severity="statusSeverity(attempt.status)" />
              <span v-if="attempt.oral_score || attempt.written_score" class="tentative-row__score">
                {{ attempt.oral_score ?? attempt.written_score }}/699
              </span>
              <span class="tentative-row__date">{{ formatDate(attempt.started_at) }}</span>
              <span v-if="attempt.completed_at" class="tentative-row__duration">
                {{ duration(attempt.started_at, attempt.completed_at) }}
              </span>
            </div>
          </div>

          <div class="tentative-row__actions">
            <NuxtLink
              v-if="attempt.status === 'completed'"
              :to="`/epreuve/comprehension-ecrite/resultats/${attempt.id}`"
            >
              <Button label="Résultats" icon="pi pi-chart-bar" size="small" outlined />
            </NuxtLink>
            <NuxtLink
              v-else-if="attempt.status === 'in_progress'"
              :to="`/epreuve/comprehension-ecrite/series/${attempt.series_id}`"
            >
              <Button label="Continuer" icon="pi pi-play" size="small" class="bg-gradient-primary" />
            </NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptResponse } from '#shared/api/models/ExamAttemptResponse'
import type { SuccessResponse_list_ExamAttemptResponse__ } from '#shared/api/models/SuccessResponse_list_ExamAttemptResponse__'

definePageMeta({ layout: 'account', middleware: 'auth' })

const { get } = useApi()
const loading = ref(true)
const attempts = ref<ExamAttemptResponse[]>([])
const activeFilter = ref<'all' | 'completed' | 'in_progress' | 'abandoned'>('all')

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_ExamAttemptResponse__>('/v1/exam-attempts')
    attempts.value = (res.data ?? []).sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    )
  } finally {
    loading.value = false
  }
})

const filters: { label: string; value: 'all' | 'completed' | 'in_progress' | 'abandoned' }[] = [
  { label: 'Toutes',     value: 'all'         },
  { label: 'Terminées',  value: 'completed'   },
  { label: 'En cours',   value: 'in_progress' },
  { label: 'Abandonnées', value: 'abandoned'  },
]

function filterCount(value: string): number {
  if (value === 'all') return attempts.value.length
  return attempts.value.filter(a => a.status === value).length
}

const filteredAttempts = computed(() => {
  if (activeFilter.value === 'all') return attempts.value
  return attempts.value.filter(a => a.status === activeFilter.value)
})

function statusLabel(s: string) {
  return { in_progress: 'En cours', completed: 'Terminé', abandoned: 'Abandonné' }[s] ?? s
}
function statusSeverity(s: string) {
  return { in_progress: 'warning', completed: 'success', abandoned: 'danger' }[s] ?? 'secondary'
}
function statusIcon(s: string) {
  return { in_progress: 'pi pi-clock', completed: 'pi pi-check', abandoned: 'pi pi-times' }[s] ?? 'pi pi-circle'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function duration(start: string, end: string): string {
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return `${m}min ${s}s`
}

useHead({ title: 'Mes tentatives | Lumina TCF' })
</script>

<style scoped>
.tentatives__filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.tentatives__filter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tentatives__filter:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-600);
}

.tentatives__filter--active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
  font-weight: 600;
}

.tentatives__filter-count {
  background: rgba(0,0,0,0.1);
  border-radius: 9999px;
  padding: 1px 7px;
  font-size: 0.75rem;
  font-weight: 700;
}

.tentatives__filter--active .tentatives__filter-count {
  background: rgba(255,255,255,0.25);
}

.tentatives__empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: var(--text-tertiary);
}

.tentatives__empty i { font-size: 1.5rem; }

.tentatives__list { display: flex; flex-direction: column; }

.tentative-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.tentative-row:last-child { border-bottom: none; }

.tentative-row__icon {
  width: 40px; height: 40px;
  border-radius: 0.625rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.tentative-row__icon--completed   { background: #f0fdf4; }
.tentative-row__icon--completed i { color: #16a34a; font-size: 1rem; }
.tentative-row__icon--in_progress   { background: #fffbeb; }
.tentative-row__icon--in_progress i { color: #d97706; font-size: 1rem; }
.tentative-row__icon--abandoned   { background: var(--color-danger-50); }
.tentative-row__icon--abandoned i { color: var(--color-danger-600); font-size: 1rem; }

.tentative-row__body { flex: 1; min-width: 0; }

.tentative-row__serie {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.tentative-row__meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.tentative-row__score {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary-600);
}

.tentative-row__date,
.tentative-row__duration {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.tentative-row__actions { flex-shrink: 0; }
</style>