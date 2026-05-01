<template>
  <div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton height="40px" width="300px" />
      <div class="grid grid-cols-3 gap-4">
        <Skeleton v-for="i in 3" :key="i" height="120px" border-radius="12px" />
      </div>
    </div>

    <template v-else-if="serie">

      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <NuxtLink to="/admin/series" class="flex items-center gap-1 text-sm text-(--text-tertiary) hover:text-primary-600 mb-2 transition-colors">
            <i class="pi pi-arrow-left text-xs" /> Retour aux séries
          </NuxtLink>
          <h1 class="text-2xl font-bold text-(--text-primary)">Série #{{ serie.number }}</h1>
          <p class="text-sm text-(--text-tertiary) mt-0.5">{{ serie.title ?? 'Série d\'examen TCF Canada' }}</p>
          <Tag
            :value="serie.is_active ? 'Activé' : 'Désactivé'"
            :severity="serie.is_active ? 'success' : 'secondary'"
            class="mt-2"
          />
        </div>
        <div class="flex gap-2">
          <Button label="Modifier" icon="pi pi-pencil" outlined @click="openEdit" />
          <Button label="Supprimer" icon="pi pi-trash" severity="danger" @click="deleteVisible = true" />
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
          <p class="text-sm text-(--text-tertiary) mb-1">Questions orales</p>
          <p class="text-3xl font-bold text-(--text-primary)">{{ oralCount }}</p>
          <p class="text-xs text-(--text-tertiary) mt-1">sur 39</p>
        </div>
        <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
          <p class="text-sm text-(--text-tertiary) mb-1">Questions écrites</p>
          <p class="text-3xl font-bold text-(--text-primary)">{{ writtenCount }}</p>
          <p class="text-xs text-(--text-tertiary) mt-1">sur 39</p>
        </div>
        <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
          <p class="text-sm text-(--text-tertiary) mb-1">Tâches d'expression</p>
          <p class="text-3xl font-bold text-(--text-primary)">{{ tasksCount }}</p>
          <p class="text-xs text-(--text-tertiary) mt-1">sur 6</p>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
        <h2 class="text-base font-bold text-(--text-primary) mb-4">Actions rapides</h2>
        <div class="flex flex-col gap-2">
          <NuxtLink :to="`/admin/series/${seriesId}/questions`">
            <Button
              label="Gérer les questions"
              icon="pi pi-list"
              class="w-full bg-gradient-primary border-none font-semibold justify-start"
            />
          </NuxtLink>
          <NuxtLink :to="`/admin/series/${seriesId}/questions/import`">
            <Button
              label="Importer des questions (JSON)"
              icon="pi pi-upload"
              outlined
              class="w-full justify-start"
            />
          </NuxtLink>
          <NuxtLink :to="`/admin/series/${seriesId}/tasks`">
            <Button
              label="Gérer les tâches d'expression"
              icon="pi pi-file"
              outlined
              class="w-full justify-start"
            />
          </NuxtLink>
        </div>
      </div>

    </template>

    <!-- Dialog modifier -->
    <Dialog v-model:visible="editVisible" header="Modifier la série" modal :style="{ width: '420px' }" :draggable="false">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Titre</label>
          <InputText v-model="editForm.title" placeholder="Titre de la série" fluid />
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="editForm.is_active" inputId="edit-active" />
          <label for="edit-active" class="text-sm text-(--text-secondary)">Série active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="editVisible = false" />
        <Button label="Enregistrer" icon="pi pi-check" :loading="saving" class="bg-gradient-primary border-none font-bold" @click="onEdit" />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog v-model:visible="deleteVisible" header="Supprimer la série" modal :style="{ width: '400px' }" :draggable="false">
      <p class="text-(--text-secondary) leading-relaxed">
        Supprimer la <strong>Série #{{ serie?.number }}</strong> ?
        <br />
        <span class="text-red-500 text-sm font-semibold">⚠️ Toutes les questions seront supprimées.</span>
      </p>
      <template #footer>
        <Button label="Annuler" text @click="deleteVisible = false" />
        <Button label="Supprimer" severity="danger" icon="pi pi-trash" :loading="saving" @click="onDelete" />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import type { SeriesResponse } from '#shared/api/models/SeriesResponse'
import type { SuccessResponse_SeriesResponse_ } from '#shared/api/models/SuccessResponse_SeriesResponse_'
import type { SuccessResponse_list_QuestionResponse__ } from '#shared/api/models/SuccessResponse_list_QuestionResponse__'
import type { SuccessResponse_list_ExpressionTaskResponse__ } from '#shared/api/models/SuccessResponse_list_ExpressionTaskResponse__'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route    = useRoute()
const { get, patch, del } = useApi()
const toast    = useToast()
const seriesId = route.params.seriesId as string

const loading = ref(true)
const saving  = ref(false)
const serie   = ref<SeriesResponse | null>(null)
const oralCount    = ref(0)
const writtenCount = ref(0)
const tasksCount   = ref(0)

onMounted(async () => {
  try {
    const [serieRes, questionsRes, tasksRes] = await Promise.all([
      get<SuccessResponse_SeriesResponse_>(`/v1/series/${seriesId}`),
      get<SuccessResponse_list_QuestionResponse__>(`/v1/series/${seriesId}/questions`),
      get<SuccessResponse_list_ExpressionTaskResponse__>(`/v1/expression-tasks/series/${seriesId}`),
    ])
    serie.value    = serieRes.data ?? null
    const questions = questionsRes.data ?? []
    oralCount.value    = questions.filter(q => q.type === 'oral').length
    writtenCount.value = questions.filter(q => q.type === 'written').length
    tasksCount.value   = (tasksRes.data ?? []).length
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur de chargement', life: 3000 })
  } finally {
    loading.value = false
  }
})

// ── Modifier ──────────────────────────────────────────────────
const editVisible = ref(false)
const editForm    = reactive({ title: '', is_active: true })

function openEdit() {
  editForm.title     = serie.value?.title ?? ''
  editForm.is_active = serie.value?.is_active ?? true
  editVisible.value  = true
}

async function onEdit() {
  saving.value = true
  try {
    const res = await patch<SuccessResponse_SeriesResponse_>(`/v1/series/${seriesId}`, {
      title:     editForm.title || null,
      is_active: editForm.is_active,
    })
    serie.value = res.data ?? serie.value
    toast.add({ severity: 'success', summary: 'Série modifiée', life: 3000 })
    editVisible.value = false
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur', life: 3000 })
  } finally {
    saving.value = false
  }
}

// ── Supprimer ─────────────────────────────────────────────────
const deleteVisible = ref(false)

async function onDelete() {
  saving.value = true
  try {
    await del(`/v1/series/${seriesId}`)
    toast.add({ severity: 'success', summary: 'Série supprimée', life: 3000 })
    navigateTo('/admin/series')
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur', life: 3000 })
  } finally {
    saving.value = false
  }
}

useHead({ title: `Série | Admin Lumina` })
</script>