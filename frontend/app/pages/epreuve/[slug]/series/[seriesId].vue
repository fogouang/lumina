<template>
  <div class="exam-page">

    <!-- Loading -->
    <div v-if="loading" class="exam-page__loading">
      <ProgressSpinner style="width:48px;height:48px" />
      <p>Chargement de l'examen...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="exam-page__error">
      <i class="pi pi-exclamation-triangle" />
      <p>{{ error }}</p>
      <NuxtLink :to="`/epreuve/${slug}/series`">
        <Button label="Retour aux séries" icon="pi pi-arrow-left" />
      </NuxtLink>
    </div>

    <template v-else-if="currentQuestion">

      <!-- ── Topbar mobile ──────────────────────────────────── -->
      <ExamTopBar
        :total-seconds="totalSeconds"
        :current-index="currentIndex"
        :total="questions.length"
        :answered-count="Object.keys(answers).length"
        @open-nav="navDrawerOpen = true"
        @quit="confirmQuit = true"
        @expired="onExpired"
      />

      <!-- ── Layout desktop ─────────────────────────────────── -->
      <div class="exam-page__desktop">

        <!-- Question panel -->
        <ExamQuestionPanel
          :question="currentQuestion"
          :selected="answers[currentQuestion.id] ?? null"
          :current-index="currentIndex"
          :total="questions.length"
          :is-first="currentIndex === 0"
          :is-last="currentIndex === questions.length - 1"
          :submitting="submitting"
          class="exam-page__panel"
          @select="onSelect"
          @prev="onPrev"
          @next="onNext"
          @finish="confirmFinish = true"
        />

        <!-- Sidebar desktop -->
        <aside class="exam-page__sidebar">
          <ExamTimer
            :total-seconds="totalSeconds"
            @expired="onExpired"
          />
          <div class="exam-page__sidebar-nav">
            <ExamQuestionNav
              :questions="questions"
              :current-index="currentIndex"
              :answered-ids="Object.keys(answers)"
              @go="onGo"
            />
          </div>
          <button class="exam-page__quit" @click="confirmQuit = true">
            <i class="pi pi-sign-out" /> Quitter l'examen
          </button>
        </aside>

      </div>

      <!-- ── Footer mobile ──────────────────────────────────── -->
      <ExamFooterBar
        :is-first="currentIndex === 0"
        :is-last="currentIndex === questions.length - 1"
        :selected="answers[currentQuestion.id] ?? null"
        :level="currentQuestion.points <= 9 ? 'A1' : currentQuestion.points <= 15 ? 'A2' : currentQuestion.points <= 21 ? 'B1' : currentQuestion.points <= 26 ? 'B2' : 'C1'"
        :pts="currentQuestion.points"
        class="exam-page__footer-mobile"
        @prev="onPrev"
        @next="onNext"
        @finish="confirmFinish = true"
      />

    </template>

    <!-- ── Drawer navigation ──────────────────────────────────── -->
    <ExamNavDrawer
      v-model="navDrawerOpen"
      :questions="questions"
      :current-index="currentIndex"
      :answered-ids="Object.keys(answers)"
      @go="onGo"
    />

    <!-- ── Dialog quitter ─────────────────────────────────────── -->
    <Dialog v-model:visible="confirmQuit" modal header="Quitter l'examen" :style="{ width: '380px' }">
      <p style="color:var(--text-secondary);line-height:1.6">
        Vos réponses seront sauvegardées. Vous pourrez reprendre plus tard.
      </p>
      <template #footer>
        <Button label="Annuler" text @click="confirmQuit = false" />
        <Button label="Quitter" severity="danger" icon="pi pi-sign-out" @click="onQuit" />
      </template>
    </Dialog>

    <!-- ── Dialog terminer ────────────────────────────────────── -->
    <Dialog v-model:visible="confirmFinish" modal header="Terminer l'examen" :style="{ width: '420px' }">
      <p style="color:var(--text-secondary);line-height:1.6">
        Vous avez répondu à <strong>{{ Object.keys(answers).length }}</strong> question(s) sur
        <strong>{{ questions.length }}</strong>. Confirmer ?
      </p>
      <template #footer>
        <Button label="Continuer" text @click="confirmFinish = false" />
        <Button label="Terminer" icon="pi pi-check" severity="success" :loading="submitting" @click="onFinish" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from '#shared/api/models/QuestionResponse'
import type { SuccessResponse_ExamAttemptResponse_ } from '#shared/api/models/SuccessResponse_ExamAttemptResponse_'
import type { SuccessResponse_list_ExamAttemptResponse__ } from '#shared/api/models/SuccessResponse_list_ExamAttemptResponse__'
import type { SuccessResponse_list_QuestionResponse__ } from '#shared/api/models/SuccessResponse_list_QuestionResponse__'

definePageMeta({ middleware: 'auth', layout: 'exam' })

const route     = useRoute()
const { post, get } = useApi()
const toast     = useToast()
const slug      = route.params.slug as string
const seriesId  = route.params.seriesId as string

const durationMap: Record<string, number> = {
  'comprehension-ecrite': 60 * 60,
  'comprehension-orale':  35 * 60,
  'expression-ecrite':    60 * 60,
  'expression-orale':     12 * 60,
}
const totalSeconds = durationMap[slug] ?? 60 * 60

const loading       = ref(true)
const error         = ref<string | null>(null)
const submitting    = ref(false)
const confirmQuit   = ref(false)
const confirmFinish = ref(false)
const navDrawerOpen = ref(false)

const attemptId  = ref<string | null>(null)
const questions  = ref<QuestionResponse[]>([])
const currentIndex = ref(0)
const answers    = ref<Record<string, string>>({})

const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)

onMounted(async () => {
  try {
    // 1. Créer ou récupérer tentative
    try {
      const res = await post<SuccessResponse_ExamAttemptResponse_>(
        '/v1/exam-attempts', { series_id: seriesId }
      )
      attemptId.value = res.data?.id ?? null
    } catch {
      const list = await get<SuccessResponse_list_ExamAttemptResponse__>('/v1/exam-attempts')
      const existing = (list.data ?? []).find(
        a => a.series_id === seriesId && a.status === 'in_progress'
      )
      if (existing) attemptId.value = existing.id
      else throw new Error("Impossible de démarrer l'examen.")
    }

    // 2. Charger questions
    const qRes = await get<SuccessResponse_list_QuestionResponse__>(
      `/v1/series/${seriesId}/questions`
    )
    questions.value = (qRes.data ?? []).sort(
      (a, b) => a.question_number - b.question_number
    )

    if (!questions.value.length) throw new Error('Aucune question disponible.')
  } catch (err: unknown) {
    error.value = (err as Error)?.message ?? 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
})

// ── Sélection locale ─────────────────────────────────────────
function onSelect(key: string) {
  if (!currentQuestion.value) return
  answers.value[currentQuestion.value.id] = key
}

// ── Soumettre réponse courante ────────────────────────────────
async function submitCurrentAnswer() {
  if (!attemptId.value || !currentQuestion.value) return
  const selected = answers.value[currentQuestion.value.id]
  if (!selected) return
  try {
    await post(`/v1/exam-attempts/${attemptId.value}/answers`, {
      question_id:     currentQuestion.value.id,
      selected_answer: selected,
    })
  } catch { /* silencieux */ }
}

// ── Navigation ───────────────────────────────────────────────
async function onNext() {
  await submitCurrentAnswer()
  if (currentIndex.value < questions.value.length - 1) currentIndex.value++
}

async function onPrev() {
  await submitCurrentAnswer()
  if (currentIndex.value > 0) currentIndex.value--
}

async function onGo(index: number) {
  await submitCurrentAnswer()
  currentIndex.value = index
}

// ── Terminer ─────────────────────────────────────────────────
async function onFinish() {
  if (!attemptId.value) return
  submitting.value = true
  try {
    await submitCurrentAnswer()
    await post(`/v1/exam-attempts/${attemptId.value}/complete`)
    confirmFinish.value = false
    navigateTo(`/epreuve/${slug}/resultats/${attemptId.value}`)
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur lors de la finalisation', life: 3000 })
  } finally {
    submitting.value = false
  }
}

async function onExpired() {
  toast.add({ severity: 'warn', summary: 'Temps écoulé !', life: 4000 })
  await onFinish()
}

function onQuit() {
  confirmQuit.value = false
  navigateTo(`/epreuve/${slug}/series`)
}

useHead({ title: 'Examen | Lumina TCF' })
</script>

<style scoped>
.exam-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-ground);
}

.exam-page__loading,
.exam-page__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  flex: 1;
}

.exam-page__error i {
  font-size: 2rem;
  color: var(--color-danger-500);
}

/* ── Desktop layout ────────────────────────────────────────── */
.exam-page__desktop {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  align-items: flex-start;
  flex: 1;
}

.exam-page__panel { flex: 1; min-width: 0; }

.exam-page__sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 64px;
  height: fit-content;
}

.exam-page__sidebar-nav {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  padding: 1.25rem;
}

.exam-page__quit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid var(--color-danger-200);
  border-radius: 0.75rem;
  color: var(--color-danger-600);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.exam-page__quit:hover {
  background: var(--color-danger-50);
}

/* Footer mobile — caché sur desktop */
.exam-page__footer-mobile { display: none; }

/* ── Mobile ────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .exam-page__desktop {
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.75rem;
    padding-bottom: 0;
  }

  /* Sidebar desktop cachée sur mobile */
  .exam-page__sidebar { display: none; }

  /* Footer mobile visible */
  .exam-page__footer-mobile { display: flex; }
}
</style>