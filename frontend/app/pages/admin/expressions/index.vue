<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Sessions mensuelles</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">Gérez les sessions EE et EO publiées chaque mois</p>
      </div>
      <Button label="Nouvelle session" icon="pi pi-plus" class="bg-gradient-primary border-none font-bold"
        @click="formVisible = true; editingSession = null" />
    </div>

    <!-- Filtre -->
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-filter text-(--text-tertiary)" />
      <Select v-model="activeOnly" :options="filterOptions" option-label="label" option-value="value"
        class="w-48" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton v-for="i in 3" :key="i" height="200px" border-radius="16px" />
    </div>

    <!-- Empty -->
    <div v-else-if="!sessions.length"
      class="text-center py-16 bg-(--bg-card) border border-(--border-color) rounded-2xl">
      <i class="pi pi-calendar text-5xl text-(--text-tertiary) mb-4 block opacity-30" />
      <h2 class="text-xl font-bold text-(--text-primary) mb-2">Aucune session</h2>
      <p class="text-(--text-secondary) mb-6">
        {{ activeOnly ? 'Aucune session active. Créez-en une ou affichez toutes.' : 'Aucune session créée.' }}
      </p>
      <Button label="Créer une session" icon="pi pi-plus" class="bg-gradient-primary border-none font-bold"
        @click="formVisible = true; editingSession = null" />
    </div>

    <!-- Grid sessions -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="session in sessions" :key="session.id"
        class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200">
        <!-- Card header -->
        <div class="px-5 py-5 border-b border-(--border-color) flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <i class="pi pi-calendar text-primary-600" />
            </div>
            <div>
              <p class="font-bold text-(--text-primary) text-base">{{ session.name }}</p>
              <p class="text-xs text-(--text-tertiary)">{{ formatMonth(session.month) }}</p>
            </div>
          </div>
          <Tag :value="session.is_active ? 'Active' : 'Inactive'"
            :severity="session.is_active ? 'success' : 'secondary'" />
        </div>

        <!-- Card body -->
        <div class="px-5 py-4 flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <span class="text-(--text-tertiary)">Type</span>
            <span class="font-medium text-(--text-primary)">EE + EO (complète)</span>
            <span class="text-(--text-tertiary)">Créée le</span>
            <span class="font-medium text-(--text-primary)">{{ formatDate(session.created_at) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-1">
            <NuxtLink :to="`/admin/expressions/${session.id}`" class="flex-1">
              <Button label="Tâches" icon="pi pi-eye" outlined size="small" class="w-full" />
            </NuxtLink>
            <Button icon="pi pi-pencil" outlined size="small" @click="openEdit(session)" />
            <Button icon="pi pi-trash" severity="danger" outlined size="small"
              @click="openDelete(session.id)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog Créer / Éditer -->
    <Dialog v-model:visible="formVisible" modal :draggable="false" :style="{ width: '460px' }"
      :header="editingSession ? 'Modifier la session' : 'Nouvelle session mensuelle'">
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Nom de la session</label>
          <InputText v-model="form.name" placeholder="Ex: Janvier 2026" fluid />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">
            Mois <span class="text-(--text-tertiary) font-normal">(premier jour du mois)</span>
          </label>
          <InputText v-model="form.month" type="date" :disabled="!!editingSession" fluid />
          <small class="text-(--text-tertiary)">
            {{ editingSession ? 'Le mois ne peut pas être modifié.' : 'Ex: 2026-01-01' }}
          </small>
        </div>
        <div v-if="editingSession"
          class="flex items-center justify-between bg-(--bg-ground) rounded-xl p-4">
          <div>
            <p class="font-semibold text-sm text-(--text-primary)">Session active</p>
            <p class="text-xs text-(--text-tertiary)">Les utilisateurs peuvent voir cette session</p>
          </div>
          <ToggleSwitch v-model="form.is_active" />
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="formVisible = false" />
        <Button :label="editingSession ? 'Mettre à jour' : 'Créer'" :loading="saving"
          :disabled="!form.name || !form.month" class="bg-gradient-primary border-none font-bold"
          @click="saveSession" />
      </template>
    </Dialog>

    <!-- Confirm Delete -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from '#shared/api/models/MonthlySessionResponse'
import type { SuccessResponse_list_MonthlySessionResponse__ } from '#shared/api/models/SuccessResponse_list_MonthlySessionResponse__'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { get, post, patch, del } = useApi()
const toast   = useToast()
const confirm = useConfirm()

const loading        = ref(true)
const saving         = ref(false)
const sessions       = ref<MonthlySessionResponse[]>([])
const activeOnly     = ref(true)
const formVisible    = ref(false)
const editingSession = ref<MonthlySessionResponse | null>(null)

const filterOptions = [
  { label: 'Sessions actives', value: true },
  { label: 'Toutes les sessions', value: false },
]

const form = reactive({ name: '', month: defaultMonth(), is_active: true })

function defaultMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

async function loadSessions() {
  loading.value = true
  try {
    const res = await get<SuccessResponse_list_MonthlySessionResponse__>(
      `/v1/public-expressions/sessions?active_only=${activeOnly.value}`
    )
    sessions.value = (res.data ?? []).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
    )
  } finally {
    loading.value = false
  }
}

onMounted(loadSessions)
watch(activeOnly, loadSessions)

function openEdit(session: MonthlySessionResponse) {
  editingSession.value = session
  form.name     = session.name
  form.month    = session.month.slice(0, 10)
  form.is_active = session.is_active
  formVisible.value = true
}

function openDelete(id: string) {
  confirm.require({
    message: 'Cette action est irréversible. Toutes les tâches EE/EO associées seront supprimées.',
    header:  'Supprimer la session',
    icon:    'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler',
    acceptLabel: 'Supprimer',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/sessions/${id}`)
      toast.add({ severity: 'success', summary: 'Session supprimée', life: 3000 })
      loadSessions()
    },
  })
}

async function saveSession() {
  saving.value = true
  try {
    if (editingSession.value) {
      await patch(`/v1/public-expressions/sessions/${editingSession.value.id}`, {
        name:      form.name,
        is_active: form.is_active,
      })
      toast.add({ severity: 'success', summary: 'Session mise à jour', life: 3000 })
    } else {
      await post('/v1/public-expressions/sessions', {
        name:  form.name,
        month: form.month,
      })
      toast.add({ severity: 'success', summary: 'Session créée', life: 3000 })
    }
    formVisible.value = false
    loadSessions()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    saving.value = false
  }
}

function formatMonth(month: string) {
  return new Date(month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR')
}

useHead({ title: 'Sessions EE/EO | Admin Lumina' })
</script>