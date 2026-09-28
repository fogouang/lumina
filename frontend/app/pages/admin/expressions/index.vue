<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Sessions mensuelles</h1>
        <p class="mt-0.5 text-sm text-muted">Gérez les sessions EE et EO publiées chaque mois</p>
      </div>
      <AppButton
        label="Nouvelle session"
        icon="pi pi-plus"
        variant="gradient"
        @click="formVisible = true; editingSession = null"
      />
    </div>

    <!-- Filtre -->
    <div class="mb-6 flex items-center gap-3">
      <span class="grid size-9 place-items-center rounded-lg bg-card-2 text-faint">
        <i class="pi pi-filter text-sm" />
      </span>
      <Select
        v-model="activeOnly"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        aria-label="Filtrer les sessions"
        class="w-full sm:w-52"
      />
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="i in 3" :key="i" height="210px" border-radius="1.25rem" />
    </div>

    <!-- Vide -->
    <div
      v-else-if="!sessions.length"
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <span class="mb-4 grid size-16 place-items-center rounded-leaf bg-card-2 text-faint">
        <i class="pi pi-calendar text-3xl" />
      </span>
      <h2 class="mb-1.5 font-heading text-lg font-bold text-ink">Aucune session</h2>
      <p class="mb-6 max-w-sm text-sm text-muted">
        {{ activeOnly ? "Aucune session active. Créez-en une ou affichez toutes." : "Aucune session créée." }}
      </p>
      <AppButton
        label="Créer une session"
        icon="pi pi-plus"
        variant="gradient"
        @click="formVisible = true; editingSession = null"
      />
    </div>

    <!-- Grille -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="session in sessions"
        :key="session.id"
        class="flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift"
      >
        <!-- En-tête carte -->
        <div class="flex items-start justify-between gap-3 border-b border-line p-5">
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="grid size-11 shrink-0 place-items-center rounded-leaf"
              :class="session.is_active ? 'brand-gradient text-white shadow-brand' : 'bg-card-2 text-faint'"
            >
              <i class="pi pi-calendar" />
            </span>
            <div class="min-w-0">
              <p class="truncate font-heading text-base font-bold text-ink">{{ session.name }}</p>
              <p class="text-xs capitalize text-muted">{{ formatMonth(session.month) }}</p>
            </div>
          </div>
          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              session.is_active
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-card-2 text-muted'
            "
          >
            <span class="size-1.5 rounded-full" :class="session.is_active ? 'bg-emerald-500' : 'bg-faint'" />
            {{ session.is_active ? "Active" : "Inactive" }}
          </span>
        </div>

        <!-- Corps -->
        <div class="flex flex-1 flex-col gap-4 p-5">
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt class="text-muted">Type</dt>
            <dd class="font-semibold text-ink">EE + EO (complète)</dd>
            <dt class="text-muted">Créée le</dt>
            <dd class="font-semibold text-ink">{{ formatDate(session.created_at) }}</dd>
          </dl>

          <!-- Actions -->
          <div class="mt-auto flex gap-2 border-t border-line pt-4">
            <NuxtLink
              :to="`/admin/expressions/${session.id}`"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-card-2/50 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <i class="pi pi-eye text-xs" />
              Tâches
            </NuxtLink>
            <Button
              v-tooltip.top="'Modifier'"
              icon="pi pi-pencil"
              outlined
              size="small"
              severity="secondary"
              aria-label="Modifier la session"
              @click="openEdit(session)"
            />
            <Button
              v-tooltip.top="'Supprimer'"
              icon="pi pi-trash"
              outlined
              size="small"
              severity="danger"
              aria-label="Supprimer la session"
              @click="openDelete(session.id)"
            />
          </div>
        </div>
      </article>
    </div>

    <!-- Dialog créer / modifier -->
    <Dialog
      v-model:visible="formVisible"
      modal
      :draggable="false"
      :style="{ width: '29rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i :class="editingSession ? 'pi pi-pencil' : 'pi pi-calendar-plus'" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingSession ? "Modifier la session" : "Nouvelle session mensuelle" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="session-name" class="text-sm font-semibold text-ink">Nom de la session</label>
          <InputText id="session-name" v-model="form.name" placeholder="Ex : Janvier 2026" fluid />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="session-month" class="text-sm font-semibold text-ink">
            Mois <span class="font-normal text-faint">(premier jour du mois)</span>
          </label>
          <InputText
            id="session-month"
            v-model="form.month"
            type="date"
            :disabled="!!editingSession"
            fluid
          />
          <small class="text-xs text-muted">
            {{ editingSession ? "Le mois ne peut pas être modifié." : "Ex : 2026-01-01" }}
          </small>
        </div>

        <div
          v-if="editingSession"
          class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2/50 px-4 py-3"
        >
          <div>
            <label for="session-active" class="text-sm font-semibold text-ink">Session active</label>
            <p class="text-xs text-muted">Les utilisateurs peuvent voir cette session</p>
          </div>
          <ToggleSwitch v-model="form.is_active" input-id="session-active" />
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="formVisible = false" />
        <AppButton
          :label="editingSession ? 'Mettre à jour' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          :disabled="!form.name || !form.month"
          @click="saveSession"
        />
      </template>
    </Dialog>

    <!-- Confirmation suppression -->
    <ConfirmDialog :pt="{ mask: { class: 'backdrop-blur-sm' } }" />
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