<template>
  <div>

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Gestion des séries</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">Créer et gérer les séries d'examens TCF Canada</p>
      </div>
      <Button
        label="Nouvelle série"
        icon="pi pi-plus"
        class="border-none font-bold bg-gradient-primary"
        @click="openCreate"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Skeleton v-for="i in 6" :key="i" height="180px" border-radius="12px" />
    </div>

    <!-- Grid cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="serie in series"
        :key="serie.id"
        class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
      >
        <!-- Header card -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-(--text-primary)">Série #{{ serie.number }}</span>
            <Tag
              :value="serie.is_active ? 'Activé' : 'Désactivé'"
              :severity="serie.is_active ? 'success' : 'secondary'"
            />
          </div>
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            size="small"
            severity="secondary"
            @click="(e) => toggleMenu(e, serie)"
          />
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-2">
          <div class="text-center">
            <p class="text-xs text-(--text-tertiary)">Questions orales</p>
            <p class="text-lg font-bold text-(--text-primary)">—</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-(--text-tertiary)">Questions écrites</p>
            <p class="text-lg font-bold text-(--text-primary)">—</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-(--text-tertiary)">Tâches expression</p>
            <p class="text-lg font-bold text-(--text-primary)">—</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-auto">
          <Button
            label="Voir"
            icon="pi pi-eye"
            outlined
            size="small"
            class="flex-1"
            @click="navigateTo(`/admin/series/${serie.id}`)"
          />
          <Button
            label="Questions"
            icon="pi pi-list"
            size="small"
            class="flex-1 bg-gradient-primary border-none font-semibold"
            @click="navigateTo(`/admin/series/${serie.id}/questions`)"
          />
        </div>
      </div>
    </div>

    <!-- Menu contextuel -->
    <Menu ref="menuRef" :model="menuItems" popup />

    <!-- Dialog créer série -->
    <Dialog
      v-model:visible="createVisible"
      header="Nouvelle série"
      modal
      :style="{ width: '420px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Numéro de série</label>
          <InputNumber v-model="form.number" placeholder="Ex: 150" fluid :min="1" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Titre (optionnel)</label>
          <InputText v-model="form.title" placeholder="Titre de la série" fluid />
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="form.is_active" inputId="active" />
          <label for="active" class="text-sm text-(--text-secondary)">Série active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="createVisible = false" />
        <Button
          label="Créer"
          icon="pi pi-check"
          :loading="saving"
          class="bg-gradient-primary border-none font-bold"
          @click="onCreate"
        />
      </template>
    </Dialog>

    <!-- Dialog modifier série -->
    <Dialog
      v-model:visible="editVisible"
      header="Modifier la série"
      modal
      :style="{ width: '420px' }"
      :draggable="false"
    >
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
        <Button
          label="Enregistrer"
          icon="pi pi-check"
          :loading="saving"
          class="bg-gradient-primary border-none font-bold"
          @click="onEdit"
        />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog
      v-model:visible="deleteVisible"
      header="Supprimer la série"
      modal
      :style="{ width: '400px' }"
      :draggable="false"
    >
      <p class="text-(--text-secondary) leading-relaxed">
        Êtes-vous sûr de vouloir supprimer la <strong>Série #{{ selectedSerie?.number }}</strong> ?
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
import type { SeriesListResponse } from '#shared/api/models/SeriesListResponse'
import type { SuccessResponse_list_SeriesListResponse__ } from '#shared/api/models/SuccessResponse_list_SeriesListResponse__'
import type { SuccessResponse_SeriesResponse_ } from '#shared/api/models/SuccessResponse_SeriesResponse_'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { get, post, patch, del } = useApi()
const toast   = useToast()
const menuRef = ref()

const loading = ref(true)
const saving  = ref(false)
const series  = ref<SeriesListResponse[]>([])

// ── Fetch ─────────────────────────────────────────────────────
async function fetchSeries() {
  loading.value = true
  try {
    const res = await get<SuccessResponse_list_SeriesListResponse__>(
      '/v1/series?active_only=false&limit=100'
    )
    series.value = (res.data ?? []).sort((a, b) => a.number - b.number)
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur de chargement', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(fetchSeries)

// ── Menu contextuel ───────────────────────────────────────────
const selectedSerie = ref<SeriesListResponse | null>(null)

const menuItems = computed(() => [
  {
    label: 'Modifier',
    icon:  'pi pi-pencil',
    command: () => openEdit(),
  },
  {
    label: 'Voir les questions',
    icon:  'pi pi-list',
    command: () => navigateTo(`/admin/series/${selectedSerie.value?.id}/questions`),
  },
  {
    label: 'Importer questions',
    icon:  'pi pi-upload',
    command: () => navigateTo(`/admin/series/${selectedSerie.value?.id}/questions/import`),
  },
  { separator: true },
  {
    label: 'Supprimer',
    icon:  'pi pi-trash',
    class: 'text-red-500',
    command: () => { deleteVisible.value = true },
  },
])

function toggleMenu(event: MouseEvent, serie: SeriesListResponse) {
  selectedSerie.value = serie
  menuRef.value?.toggle(event)
}

// ── Créer ─────────────────────────────────────────────────────
const createVisible = ref(false)
const form = reactive({ number: null as number | null, title: '', is_active: true })

function openCreate() {
  form.number    = null
  form.title     = ''
  form.is_active = true
  createVisible.value = true
}

async function onCreate() {
  if (!form.number) return
  saving.value = true
  try {
    await post<SuccessResponse_SeriesResponse_>('/v1/series', {
      number:    form.number,
      title:     form.title || null,
      is_active: form.is_active,
    })
    toast.add({ severity: 'success', summary: 'Série créée', life: 3000 })
    createVisible.value = false
    await fetchSeries()
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur', life: 3000 })
  } finally {
    saving.value = false
  }
}

// ── Modifier ──────────────────────────────────────────────────
const editVisible = ref(false)
const editForm    = reactive({ title: '', is_active: true })

function openEdit() {
  if (!selectedSerie.value) return
  editForm.title     = selectedSerie.value.title ?? ''
  editForm.is_active = selectedSerie.value.is_active
  editVisible.value  = true
}

async function onEdit() {
  if (!selectedSerie.value) return
  saving.value = true
  try {
    await patch(`/v1/series/${selectedSerie.value.id}`, {
      title:     editForm.title || null,
      is_active: editForm.is_active,
    })
    toast.add({ severity: 'success', summary: 'Série modifiée', life: 3000 })
    editVisible.value = false
    await fetchSeries()
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur', life: 3000 })
  } finally {
    saving.value = false
  }
}

// ── Supprimer ─────────────────────────────────────────────────
const deleteVisible = ref(false)

async function onDelete() {
  if (!selectedSerie.value) return
  saving.value = true
  try {
    await del(`/v1/series/${selectedSerie.value.id}`)
    toast.add({ severity: 'success', summary: 'Série supprimée', life: 3000 })
    deleteVisible.value = false
    await fetchSeries()
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur de suppression', life: 3000 })
  } finally {
    saving.value = false
  }
}

useHead({ title: 'Séries | Admin Lumina' })
</script>