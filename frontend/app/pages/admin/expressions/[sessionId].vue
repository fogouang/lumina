<template>
  <div>
    <!-- Back + Header -->
    <div class="mb-6">
      <NuxtLink to="/admin/expressions"
        class="inline-flex items-center gap-2 text-sm text-(--text-tertiary) hover:text-primary-600 transition-colors mb-4">
        <i class="pi pi-arrow-left" /> Retour aux sessions
      </NuxtLink>

      <div v-if="session" class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-xl font-bold text-(--text-primary)">{{ session.name }}</h1>
          <p class="text-sm text-(--text-tertiary) mt-0.5">{{ formatMonth(session.month) }}</p>
        </div>
        <Tag :value="session.is_active ? 'Active' : 'Inactive'"
          :severity="session.is_active ? 'success' : 'secondary'" />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <ProgressSpinner style="width:40px;height:40px" />
    </div>

    <template v-else-if="session">

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in stats" :key="stat.label"
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4 text-center">
          <p class="text-2xl font-extrabold text-primary-600">{{ stat.val }}</p>
          <p class="text-xs text-(--text-tertiary) mt-1">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Tabs EE / EO Task2 / EO Task3 -->
      <TabView>

        <!-- EE -->
        <TabPanel value="0">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-pen-to-square" />
              Expression Écrite ({{ eeCombinations.length }})
            </div>
          </template>

          <div class="flex items-center justify-between mb-4 pt-2">
            <p class="text-sm text-(--text-secondary)">Chaque combinaison contient les 3 tâches EE.</p>
            <Button label="Nouvelle combinaison" icon="pi pi-plus" size="small"
              class="bg-gradient-primary border-none font-bold"
              @click="eeFormVisible = true; editingEE = null" />
          </div>

          <div v-if="!eeCombinations.length"
            class="text-center py-12 bg-(--bg-ground) rounded-2xl border border-(--border-color)">
            <i class="pi pi-pen-to-square text-4xl opacity-30 text-(--text-tertiary) mb-3 block" />
            <p class="font-semibold text-(--text-primary) mb-1">Aucune combinaison EE</p>
            <p class="text-sm text-(--text-secondary) mb-4">Créez votre première combinaison d'expression écrite</p>
            <Button label="Créer une combinaison" icon="pi pi-plus" outlined
              @click="eeFormVisible = true; editingEE = null" />
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="combo in eeCombinations" :key="combo.id"
              class="bg-(--bg-card) border border-(--border-color) rounded-xl overflow-hidden">
              <!-- Header combo -->
              <div class="px-4 py-3 bg-(--bg-ground) border-b border-(--border-color) flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {{ combo.order + 1 }}
                  </div>
                  <p class="font-semibold text-sm text-(--text-primary) truncate max-w-48">{{ combo.title }}</p>
                </div>
                <div class="flex gap-1">
                  <Button icon="pi pi-pencil" text size="small" @click="openEditEE(combo)" />
                  <Button icon="pi pi-trash" text severity="danger" size="small" @click="deleteEE(combo.id)" />
                </div>
              </div>
              <!-- Body combo -->
              <div class="px-4 py-3 flex flex-col gap-2">
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <p class="text-xs text-(--text-secondary) leading-relaxed line-clamp-2">{{ combo.task1_instruction }}</p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <p class="text-xs text-(--text-secondary) leading-relaxed line-clamp-2">{{ combo.task2_instruction }}</p>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <p class="text-xs text-(--text-secondary) leading-relaxed line-clamp-2">{{ combo.task3_title }}</p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- EO Task 2 -->
        <TabPanel value="1">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-microphone" />
              EO — Tâche 2 ({{ eoTask2Pool.length }})
            </div>
          </template>

          <div class="flex items-center justify-between mb-4 pt-2">
            <p class="text-sm text-(--text-secondary)">Exercice en interaction (5 min 30).</p>
            <Button label="Nouveau sujet" icon="pi pi-plus" size="small"
              class="bg-gradient-primary border-none font-bold"
              @click="task2FormVisible = true; editingTask2 = null" />
          </div>

          <div v-if="!eoTask2Pool.length"
            class="text-center py-12 bg-(--bg-ground) rounded-2xl border border-(--border-color)">
            <i class="pi pi-microphone text-4xl opacity-30 text-(--text-tertiary) mb-3 block" />
            <p class="font-semibold text-(--text-primary) mb-1">Aucun sujet Tâche 2</p>
            <Button label="Créer un sujet" icon="pi pi-plus" outlined
              @click="task2FormVisible = true; editingTask2 = null" />
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="task in eoTask2Pool" :key="task.id"
              class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                  {{ task.order + 1 }}
                </div>
                <div class="flex gap-1 shrink-0">
                  <Button icon="pi pi-pencil" text size="small" @click="openEditTask2(task)" />
                  <Button icon="pi pi-trash" text severity="danger" size="small" @click="deleteTask2(task.id)" />
                </div>
              </div>
              <p class="text-sm text-(--text-primary) leading-relaxed">{{ task.subject }}</p>
            </div>
          </div>
        </TabPanel>

        <!-- EO Task 3 -->
        <TabPanel value="2">
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-comments" />
              EO — Tâche 3 ({{ eoTask3Pool.length }})
            </div>
          </template>

          <div class="flex items-center justify-between mb-4 pt-2">
            <p class="text-sm text-(--text-secondary)">Expression d'un point de vue (4 min 30).</p>
            <Button label="Nouveau sujet" icon="pi pi-plus" size="small"
              class="bg-gradient-primary border-none font-bold"
              @click="task3FormVisible = true; editingTask3 = null" />
          </div>

          <div v-if="!eoTask3Pool.length"
            class="text-center py-12 bg-(--bg-ground) rounded-2xl border border-(--border-color)">
            <i class="pi pi-comments text-4xl opacity-30 text-(--text-tertiary) mb-3 block" />
            <p class="font-semibold text-(--text-primary) mb-1">Aucun sujet Tâche 3</p>
            <Button label="Créer un sujet" icon="pi pi-plus" outlined
              @click="task3FormVisible = true; editingTask3 = null" />
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="task in eoTask3Pool" :key="task.id"
              class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
              <div class="flex items-start justify-between gap-2 mb-3">
                <div class="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                  {{ task.order + 1 }}
                </div>
                <div class="flex gap-1 shrink-0">
                  <Button icon="pi pi-pencil" text size="small" @click="openEditTask3(task)" />
                  <Button icon="pi pi-trash" text severity="danger" size="small" @click="deleteTask3(task.id)" />
                </div>
              </div>
              <p class="text-sm text-(--text-primary) leading-relaxed">{{ task.subject }}</p>
            </div>
          </div>
        </TabPanel>

      </TabView>
    </template>

    <!-- Dialog EE Combinaison -->
    <Dialog v-model:visible="eeFormVisible" modal :draggable="false" :style="{ width: '760px', maxHeight: '90vh' }"
      :header="editingEE ? 'Modifier la combinaison EE' : 'Nouvelle combinaison EE'"
      :content-style="{ overflowY: 'auto' }">
      <div class="flex flex-col gap-5 pt-2">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-3 flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)">Titre général</label>
            <InputText v-model="eeForm.title" placeholder="Ex: La télévision dans l'éducation" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)">Ordre</label>
            <InputNumber v-model="eeForm.order" :min="0" fluid />
          </div>
        </div>

        <!-- Tabs tâches -->
        <TabView>
          <TabPanel value="0" header="Tâche 1 — Message">
            <div class="flex flex-col gap-4 pt-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-(--text-secondary)">Consigne</label>
                <Textarea v-model="eeForm.task1_instruction" :rows="4" fluid placeholder="Décrivez la consigne..." />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-(--text-secondary)">Correction</label>
                <Textarea v-model="eeForm.task1_correction" :rows="4" fluid placeholder="Décrivez la consigne..." />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Mots minimum</label>
                  <InputNumber v-model="eeForm.task1_word_min" :min="40" :max="100" fluid />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Mots maximum</label>
                  <InputNumber v-model="eeForm.task1_word_max" :min="60" :max="120" fluid />
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="1" header="Tâche 2 — Article">
            <div class="flex flex-col gap-4 pt-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-(--text-secondary)">Consigne</label>
                <Textarea v-model="eeForm.task2_instruction" :rows="4" fluid placeholder="Décrivez la consigne..." />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-(--text-secondary)">Correction</label>
                <Textarea v-model="eeForm.task2_correction" :rows="4" fluid placeholder="Décrivez la consigne..." />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Mots minimum</label>
                  <InputNumber v-model="eeForm.task2_word_min" :min="100" :max="150" fluid />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Mots maximum</label>
                  <InputNumber v-model="eeForm.task2_word_max" :min="120" :max="180" fluid />
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="2" header="Tâche 3 — Argumentation">
            <div class="flex flex-col gap-4 pt-3">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-(--text-secondary)">Titre du débat</label>
                <InputText v-model="eeForm.task3_title" placeholder="Ex: La chasse aux animaux : Pour ou Contre ?" fluid />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Document 1</label>
                  <Textarea v-model="eeForm.task3_document_1" :rows="4" fluid placeholder="Témoignage ou opinion..." />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Document 2</label>
                  <Textarea v-model="eeForm.task3_document_2" :rows="4" fluid placeholder="Témoignage ou opinion..." />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Correction</label>
                  <Textarea v-model="eeForm.task3_correction" :rows="4" fluid placeholder="Témoignage ou opinion..." />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Mots minimum</label>
                  <InputNumber v-model="eeForm.task3_word_min" :min="120" :max="180" fluid />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-(--text-secondary)">Mots maximum</label>
                  <InputNumber v-model="eeForm.task3_word_max" :min="150" :max="200" fluid />
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="eeFormVisible = false" />
        <Button :label="editingEE ? 'Mettre à jour' : 'Créer'" :loading="savingEE"
          class="bg-gradient-primary border-none font-bold" @click="saveEE" />
      </template>
    </Dialog>

    <!-- Dialog EO Task 2 -->
    <Dialog v-model:visible="task2FormVisible" modal :draggable="false" :style="{ width: '520px' }"
      :header="editingTask2 ? 'Modifier le sujet Tâche 2' : 'Nouveau sujet — Tâche 2 EO'">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Sujet</label>
          <Textarea v-model="task2Form.subject" :rows="4" fluid
            placeholder="Ex: Risques liés à l'utilisation des appareils électroniques..." />
          <small class="text-(--text-tertiary)">Le candidat devra échanger sur ce sujet pendant 3 min 30.</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Correction</label>
          <Textarea v-model="task2Form.eo_task2_correction" :rows="4" fluid
            placeholder="Ex: Gouvernements 50/50 hommes-femmes : Qu'en pensez-vous ?" />
          <small class="text-(--text-tertiary)">Correction.</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Ordre</label>
          <InputNumber v-model="task2Form.order" :min="0" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="task2FormVisible = false" />
        <Button :label="editingTask2 ? 'Mettre à jour' : 'Créer'" :loading="savingTask2"
          :disabled="!task2Form.subject" class="bg-gradient-primary border-none font-bold" @click="saveTask2" />
      </template>
    </Dialog>

    <!-- Dialog EO Task 3 -->
    <Dialog v-model:visible="task3FormVisible" modal :draggable="false" :style="{ width: '520px' }"
      :header="editingTask3 ? 'Modifier le sujet Tâche 3' : 'Nouveau sujet — Tâche 3 EO'">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Sujet</label>
          <Textarea v-model="task3Form.subject" :rows="4" fluid
            placeholder="Ex: Gouvernements 50/50 hommes-femmes : Qu'en pensez-vous ?" />
          <small class="text-(--text-tertiary)">Le candidat défendra son point de vue pendant 4 min 30.</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Correction</label>
          <Textarea v-model="task3Form.eo_task3_correction" :rows="4" fluid
            placeholder="Ex: Gouvernements 50/50 hommes-femmes : Qu'en pensez-vous ?" />
          <small class="text-(--text-tertiary)">Correction.</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Ordre</label>
          <InputNumber v-model="task3Form.order" :min="0" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="task3FormVisible = false" />
        <Button :label="editingTask3 ? 'Mettre à jour' : 'Créer'" :loading="savingTask3"
          :disabled="!task3Form.subject" class="bg-gradient-primary border-none font-bold" @click="saveTask3" />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionDetailResponse } from '#shared/api/models/MonthlySessionDetailResponse'
import type { EECombinationResponse } from '#shared/api/models/EECombinationResponse'
import type { EOTask2Response } from '#shared/api/models/EOTask2Response'
import type { EOTask3Response } from '#shared/api/models/EOTask3Response'
import type { SuccessResponse_MonthlySessionDetailResponse_ } from '#shared/api/models/SuccessResponse_MonthlySessionDetailResponse_'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route     = useRoute()
const { get, post, patch, del } = useApi()
const toast     = useToast()
const confirm   = useConfirm()
const sessionId = route.params.sessionId as string

const loading = ref(true)
const session = ref<MonthlySessionDetailResponse | null>(null)

const eeCombinations = computed(() => session.value?.ee_combinations ?? [])
const eoTask2Pool    = computed(() => session.value?.eo_task2_pool ?? [])
const eoTask3Pool    = computed(() => session.value?.eo_task3_pool ?? [])

const stats = computed(() => [
  { label: 'Combinaisons EE', val: eeCombinations.value.length },
  { label: 'Sujets EO Tâche 2', val: eoTask2Pool.value.length },
  { label: 'Sujets EO Tâche 3', val: eoTask3Pool.value.length },
  { label: 'Statut', val: session.value?.is_active ? 'Active' : 'Inactive' },
])

async function loadSession() {
  loading.value = true
  try {
    const res = await get<SuccessResponse_MonthlySessionDetailResponse_>(
      `/v1/public-expressions/sessions/${sessionId}`
    )
    session.value = res.data ?? null
  } finally {
    loading.value = false
  }
}

onMounted(loadSession)

// ── EE ────────────────────────────────────────────────────────
const eeFormVisible = ref(false)
const savingEE      = ref(false)
const editingEE     = ref<EECombinationResponse | null>(null)

const eeForm = reactive({
  title: '', order: 0,
  task1_instruction: '',task1_correction:'', task1_word_min: 60, task1_word_max: 120,
  task2_instruction: '',task2_correction:'', task2_word_min: 120, task2_word_max: 150,
  task3_title: '', task3_document_1: '', task3_document_2: '',task3_correction:'',
  task3_word_min: 150, task3_word_max: 180,
})

function openEditEE(combo: EECombinationResponse) {
  editingEE.value = combo
  Object.assign(eeForm, {
    title: combo.title, order: combo.order,
    task1_instruction: combo.task1_instruction,task1_correction:combo.task1_correction, task1_word_min: combo.task1_word_min, task1_word_max: combo.task1_word_max,
    task2_instruction: combo.task2_instruction,task2_correction:combo.task2_correction,  task2_word_min: combo.task2_word_min, task2_word_max: combo.task2_word_max,
    task3_title: combo.task3_title, task3_document_1: combo.task3_document_1, task3_document_2: combo.task3_document_2,task3_correction:combo.task3_correction, 
    task3_word_min: combo.task3_word_min, task3_word_max: combo.task3_word_max,
  })
  eeFormVisible.value = true
}

async function saveEE() {
  savingEE.value = true
  try {
    if (editingEE.value) {
      await patch(`/v1/public-expressions/ee/${editingEE.value.id}`, { ...eeForm })
      toast.add({ severity: 'success', summary: 'Combinaison mise à jour', life: 3000 })
    } else {
      await post(`/v1/public-expressions/sessions/${sessionId}/ee`, { ...eeForm })
      toast.add({ severity: 'success', summary: 'Combinaison créée', life: 3000 })
    }
    eeFormVisible.value = false
    loadSession()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    savingEE.value = false
  }
}

function deleteEE(id: string) {
  confirm.require({
    message: 'Cette combinaison EE sera définitivement supprimée.',
    header: 'Supprimer', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler', acceptLabel: 'Supprimer', acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/ee/${id}`)
      toast.add({ severity: 'success', summary: 'Supprimé', life: 3000 })
      loadSession()
    },
  })
}

// ── EO Task 2 ─────────────────────────────────────────────────
const task2FormVisible = ref(false)
const savingTask2      = ref(false)
const editingTask2     = ref<EOTask2Response | null>(null)
const task2Form        = reactive({ subject: '',eo_task2_correction:'', order: 0 })

function openEditTask2(task: EOTask2Response) {
  editingTask2.value = task
  task2Form.subject  = task.subject
  task2Form.eo_task2_correction = task.eo_task2_correction
  task2Form.order    = task.order
  task2FormVisible.value = true
}

async function saveTask2() {
  savingTask2.value = true
  try {
    if (editingTask2.value) {
      await patch(`/v1/public-expressions/eo/task2/${editingTask2.value.id}`, { ...task2Form })
      toast.add({ severity: 'success', summary: 'Sujet mis à jour', life: 3000 })
    } else {
      await post(`/v1/public-expressions/sessions/${sessionId}/eo/task2`, { ...task2Form })
      toast.add({ severity: 'success', summary: 'Sujet créé', life: 3000 })
    }
    task2FormVisible.value = false
    loadSession()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    savingTask2.value = false
  }
}

function deleteTask2(id: string) {
  confirm.require({
    message: 'Ce sujet EO Tâche 2 sera définitivement supprimé.',
    header: 'Supprimer', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler', acceptLabel: 'Supprimer', acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/eo/task2/${id}`)
      toast.add({ severity: 'success', summary: 'Supprimé', life: 3000 })
      loadSession()
    },
  })
}

// ── EO Task 3 ─────────────────────────────────────────────────
const task3FormVisible = ref(false)
const savingTask3      = ref(false)
const editingTask3     = ref<EOTask3Response | null>(null)
const task3Form        = reactive({ subject: '',eo_task3_correction:'', order: 0 })

function openEditTask3(task: EOTask3Response) {
  editingTask3.value = task
  task3Form.subject  = task.subject
  task3Form.eo_task3_correction = task.eo_task3_correction
  task3Form.order    = task.order
  task3FormVisible.value = true
}

async function saveTask3() {
  savingTask3.value = true
  try {
    if (editingTask3.value) {
      await patch(`/v1/public-expressions/eo/task3/${editingTask3.value.id}`, { ...task3Form })
      toast.add({ severity: 'success', summary: 'Sujet mis à jour', life: 3000 })
    } else {
      await post(`/v1/public-expressions/sessions/${sessionId}/eo/task3`, { ...task3Form })
      toast.add({ severity: 'success', summary: 'Sujet créé', life: 3000 })
    }
    task3FormVisible.value = false
    loadSession()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    savingTask3.value = false
  }
}

function deleteTask3(id: string) {
  confirm.require({
    message: 'Ce sujet EO Tâche 3 sera définitivement supprimé.',
    header: 'Supprimer', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler', acceptLabel: 'Supprimer', acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/eo/task3/${id}`)
      toast.add({ severity: 'success', summary: 'Supprimé', life: 3000 })
      loadSession()
    },
  })
}

function formatMonth(month: string) {
  return new Date(month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

useHead({ title: `Session EE/EO | Admin Lumina` })
</script>