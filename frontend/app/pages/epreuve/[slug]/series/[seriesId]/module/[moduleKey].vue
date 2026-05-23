<template>
  <div class="min-h-screen bg-(--bg-ground)">
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner style="width:48px;height:48px" />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen gap-4">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500" />
      <p class="text-(--text-secondary)">{{ error }}</p>
      <NuxtLink :to="`/epreuve/${slug}/series/${seriesId}`">
        <Button label="Retour" icon="pi pi-arrow-left" />
      </NuxtLink>
    </div>

    <template v-else>
      <!-- CO -->
      <ExamStepComprehension
        v-if="moduleKey === 'co' && attemptId && oralQuestions.length"
        :questions="oralQuestions"
        :all-oral-questions="oralQuestions"
        :all-written-questions="writtenQuestions"
        :attempt-id="attemptId"
        :total-seconds="35 * 60"
        :is-step-c-o="true"
        :model-value="answers"
        @update:model-value="answers = $event"
        @next-step="onDone"
        @quit="onQuit"
      />

      <!-- CE -->
      <ExamStepComprehension
        v-else-if="moduleKey === 'ce' && attemptId && writtenQuestions.length"
        :questions="writtenQuestions"
        :all-oral-questions="oralQuestions"
        :all-written-questions="writtenQuestions"
        :attempt-id="attemptId"
        :total-seconds="60 * 60"
        :is-step-c-o="false"
        :model-value="answers"
        @update:model-value="answers = $event"
        @next-step="onDone"
        @quit="onQuit"
      />

      <!-- EE -->
      <ExamStepExpressionEcrite
        v-else-if="moduleKey === 'ee' && attemptId"
        :tasks="writtenTasks"
        :attempt-id="attemptId"
        :ai-credits="aiCredits"
        @next-step="onDone"
        @quit="onQuit"
      />

      <!-- EO -->
      <ExamStepExpressionOrale
        v-else-if="moduleKey === 'eo'"
        :tasks="oralTasks"
        @finish="confirmFinish = true"
        @quit="onQuit"
      />
    </template>

    <!-- Dialog terminer -->
    <Dialog
      v-model:visible="confirmFinish"
      modal
      header="Module terminé"
      :style="{ width: '420px' }"
    >
      <p class="text-(--text-secondary) leading-relaxed">
        Vous avez terminé ce module. Voulez-vous valider et retourner à la liste des modules ?
      </p>
      <template #footer>
        <Button label="Continuer" text @click="confirmFinish = false" />
        <Button
          label="Terminer"
          icon="pi pi-check"
          severity="success"
          :loading="finishing"
          @click="onFinish"
        />
      </template>
    </Dialog>

    <!-- Dialog quitter -->
    <Dialog
      v-model:visible="confirmQuit"
      modal
      header="Quitter le module"
      :style="{ width: '380px' }"
    >
      <p class="text-(--text-secondary) leading-relaxed">
        Vos réponses déjà soumises sont sauvegardées. Vous pourrez reprendre plus tard.
      </p>
      <template #footer>
        <Button label="Annuler" text @click="confirmQuit = false" />
        <Button label="Quitter" severity="danger" icon="pi pi-sign-out" @click="doQuit" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import ExamStepComprehension from '~/components/Exam/steps/ExamStepComprehension.vue'
import ExamStepExpressionEcrite from '~/components/Exam/steps/ExamStepExpressionEcrite.vue'
import ExamStepExpressionOrale from '~/components/Exam/steps/ExamStepExpressionOrale.vue'

import type { QuestionResponse } from '#shared/api/models/QuestionResponse'
import type { ExpressionTaskResponse } from '#shared/api/models/ExpressionTaskResponse'
import type { SuccessResponse_ExamAttemptResponse_ } from '#shared/api/models/SuccessResponse_ExamAttemptResponse_'
import type { SuccessResponse_list_ExamAttemptResponse__ } from '#shared/api/models/SuccessResponse_list_ExamAttemptResponse__'
import type { SuccessResponse_list_QuestionResponse__ } from '#shared/api/models/SuccessResponse_list_QuestionResponse__'
import type { SuccessResponse_list_ExpressionTaskResponse__ } from '#shared/api/models/SuccessResponse_list_ExpressionTaskResponse__'

definePageMeta({ middleware: 'auth', layout: 'exam' })

const route    = useRoute()
const router   = useRouter()
const { get, post } = useApi()
const sub      = useSubscriptionStore()
const toast    = useToast()

const slug      = route.params.slug      as string
const seriesId  = route.params.seriesId  as string
const moduleKey = route.params.moduleKey as string  // 'co' | 'ce' | 'ee' | 'eo'

const loading  = ref(true)
const error    = ref<string | null>(null)
const finishing = ref(false)
const confirmFinish = ref(false)
const confirmQuit   = ref(false)

const attemptId        = ref<string | null>(null)
const oralQuestions    = ref<QuestionResponse[]>([])
const writtenQuestions = ref<QuestionResponse[]>([])
const writtenTasks     = ref<ExpressionTaskResponse[]>([])
const oralTasks        = ref<ExpressionTaskResponse[]>([])
const answers          = ref<Record<string, string>>({})
const aiCredits        = computed(() => sub.aiCreditsRemaining ?? 0)

const moduleLabels: Record<string, string> = {
  co: 'Compréhension Orale',
  ce: 'Compréhension Écrite',
  ee: 'Expression Écrite',
  eo: 'Expression Orale',
}

onMounted(async () => {
  try {
    await sub.fetchMySubscriptions()

    // Tentative
    try {
      const res = await post<SuccessResponse_ExamAttemptResponse_>(
        '/v1/exam-attempts', { series_id: seriesId }
      )
      attemptId.value = res.data?.id ?? null
    } catch {
      const list = await get<SuccessResponse_list_ExamAttemptResponse__>('/v1/exam-attempts')
      const ex = (list.data ?? []).find(
        a => a.series_id === seriesId && a.status === 'in_progress'
      )
      if (ex) attemptId.value = ex.id
      else throw new Error('Impossible de démarrer le module.')
    }

    // Questions (seulement si CO ou CE)
    if (moduleKey === 'co' || moduleKey === 'ce') {
      const qRes = await get<SuccessResponse_list_QuestionResponse__>(
        `/v1/series/${seriesId}/questions`
      )
      const allQ = (qRes.data ?? []).sort((a, b) => a.question_number - b.question_number)
      oralQuestions.value    = allQ.filter(q => q.type === 'oral')
      writtenQuestions.value = allQ.filter(q => q.type === 'written')
    }

    // Tâches (seulement si EE ou EO)
    if (moduleKey === 'ee' || moduleKey === 'eo') {
      const tRes = await get<SuccessResponse_list_ExpressionTaskResponse__>(
        `/v1/expression-tasks/series/${seriesId}`
      )
      const allT = tRes.data ?? []
      writtenTasks.value = allT.filter(t => t.type === 'written')
      oralTasks.value    = allT.filter(t => t.type === 'oral')
    }
  } catch (err: unknown) {
    error.value = (err as Error)?.message ?? 'Une erreur est survenue.'
  } finally {
    loading.value = false
  }
})

// Appelé par @next-step des composants CO et CE
function onDone() {
  confirmFinish.value = true
}

const moduleStartedAt = ref<number>(Date.now())
    
async function onFinish() {
  finishing.value = true
  try {
    if (attemptId.value) {
      await post(`/v1/exam-attempts/${attemptId.value}/complete`)
    }
    confirmFinish.value = false
    const elapsed = Math.round((Date.now() - moduleStartedAt.value) / 1000)
    router.push(
      `/epreuve/${slug}/resultats/${attemptId.value}?from=${seriesId}&module=${moduleKey}&elapsed=${elapsed}`
    )
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur', life: 3000 })
  } finally {
    finishing.value = false
  }
}

function onQuit() {
  confirmQuit.value = true
}

function doQuit() {
  confirmQuit.value = false
  router.push(`/epreuve/${slug}/series/${seriesId}`)
}

useHead({
  title: computed(() => `${moduleLabels[moduleKey] ?? 'Module'} | Lumina TCF`)
})
</script>