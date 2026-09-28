<template>
  <div class="space-y-6">
    <!-- Barre d'outils -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-3 sm:flex-row">
        <IconField class="w-full sm:w-72">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="search"
            placeholder="Rechercher un code..."
            aria-label="Rechercher un code"
            fluid
          />
        </IconField>
        <Select
          v-model="filterStatus"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          aria-label="Filtrer par statut"
          class="w-full sm:w-40"
        />
      </div>
      <AppButton label="Nouveau code" icon="pi pi-plus" variant="gradient" @click="openCreate" />
    </div>

    <!-- Chargement -->
    <div v-if="store.loading" class="space-y-2">
      <div v-for="n in 5" :key="n" class="h-16 animate-pulse rounded-2xl bg-card" />
    </div>

    <!-- Tableau -->
    <div v-else class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-line bg-card-2/60">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Code</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint sm:table-cell">Réduction</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint md:table-cell">Partenaire</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint md:table-cell">Utilisations</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint lg:table-cell">Expiration</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Statut</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="code in filteredCodes"
              :key="code.id"
              class="transition-colors hover:bg-card-2/50"
            >
              <!-- Code -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5">
                  <code
                    class="rounded-lg border border-line bg-card-2 px-2 py-1 font-mono text-xs font-bold tracking-wide text-ink"
                  >
                    {{ code.code }}
                  </code>
                  <button
                    v-tooltip.top="'Copier'"
                    type="button"
                    class="grid size-7 place-items-center rounded-lg text-faint transition-colors hover:bg-card-2 hover:text-primary"
                    :aria-label="`Copier le code ${code.code}`"
                    @click="copyCode(code.code)"
                  >
                    <i class="pi pi-copy text-xs" />
                  </button>
                </div>
              </td>

              <!-- Réduction -->
              <td class="hidden px-5 py-3.5 sm:table-cell">
                <span class="font-heading font-bold text-primary">{{ formatDiscount(code) }}</span>
                <span class="ml-1 text-xs text-faint">· comm. {{ code.commission_rate }}%</span>
              </td>

              <!-- Partenaire -->
              <td class="hidden px-5 py-3.5 text-muted md:table-cell">
                {{ getPartnerName(code.partner_id) }}
              </td>

              <!-- Utilisations -->
              <td class="hidden px-5 py-3.5 md:table-cell">
                <div class="flex items-baseline gap-1 tabular-nums">
                  <span class="font-semibold text-ink">{{ code.used_count }}</span>
                  <span v-if="code.max_uses" class="text-faint">/ {{ code.max_uses }}</span>
                  <span v-else class="text-xs text-faint">illimité</span>
                </div>
                <div v-if="code.max_uses" class="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-line">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="
                      code.used_count >= code.max_uses
                        ? 'bg-red-500'
                        : code.used_count / code.max_uses >= 0.8
                          ? 'bg-amber-500'
                          : 'bg-primary'
                    "
                    :style="{ width: `${Math.min((code.used_count / code.max_uses) * 100, 100)}%` }"
                  />
                </div>
              </td>

              <!-- Expiration -->
              <td class="hidden px-5 py-3.5 lg:table-cell">
                <span
                  v-if="code.expires_at"
                  class="inline-flex items-center gap-1.5"
                  :class="isExpired(code.expires_at) ? 'font-semibold text-red-600 dark:text-red-400' : 'text-muted'"
                >
                  <i
                    class="pi text-xs"
                    :class="isExpired(code.expires_at) ? 'pi-exclamation-circle' : 'pi-calendar text-faint'"
                  />
                  {{ formatDate(code.expires_at) }}
                </span>
                <span v-else class="text-faint">—</span>
              </td>

              <!-- Statut -->
              <td class="px-5 py-3.5">
                <Tag :value="getStatusLabel(code)" :severity="getStatusSeverity(code)" rounded />
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    v-tooltip.top="code.is_active ? 'Désactiver' : 'Activer'"
                    :icon="code.is_active ? 'pi pi-pause' : 'pi pi-play'"
                    text
                    rounded
                    size="small"
                    :severity="code.is_active ? 'warn' : 'success'"
                    :aria-label="code.is_active ? 'Désactiver' : 'Activer'"
                    @click="handleToggle(code)"
                  />
                  <Button
                    v-tooltip.top="'Modifier'"
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    severity="secondary"
                    aria-label="Modifier"
                    @click="openEdit(code)"
                  />
                  <Button
                    v-tooltip.top="'Supprimer'"
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    aria-label="Supprimer"
                    @click="confirmDelete(code)"
                  />
                </div>
              </td>
            </tr>

            <!-- Vide -->
            <tr v-if="filteredCodes.length === 0">
              <td colspan="7" class="px-5 py-14">
                <div class="flex flex-col items-center text-center">
                  <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                    <i class="pi pi-tag text-2xl" />
                  </span>
                  <p class="text-sm font-medium text-muted">Aucun code promo trouvé</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pied -->
      <div class="border-t border-line px-5 py-3 text-xs text-muted">
        <span class="font-semibold tabular-nums text-ink">{{ filteredCodes.length }}</span>
        code(s) affiché(s) sur
        <span class="font-semibold tabular-nums text-ink">{{ store.codes.length }}</span>
      </div>
    </div>

    <!-- Dialog créer -->
    <Dialog
      v-model:visible="createDialog"
      modal
      :draggable="false"
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i class="pi pi-tag" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Nouveau code promo</h3>
        </div>
      </template>

      <div class="space-y-4 pt-1">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="create-code" class="text-sm font-semibold text-ink">
              Code <span class="text-red-500">*</span>
            </label>
            <InputText
              id="create-code"
              v-model="createForm.code"
              class="font-mono uppercase"
              placeholder="GOETHE20"
              fluid
              @input="createForm.code = createForm.code.toUpperCase()"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="create-partner" class="text-sm font-semibold text-ink">Partenaire</label>
            <Select
              v-model="createForm.partner_id"
              input-id="create-partner"
              :options="partnerOptions"
              option-label="label"
              option-value="value"
              placeholder="Sans partenaire"
              fluid
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="create-type" class="text-sm font-semibold text-ink">
              Type de réduction <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="createForm.discount_type"
              input-id="create-type"
              :options="discountTypeOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="create-value" class="text-sm font-semibold text-ink">
              Valeur <span class="text-red-500">*</span>
              <span class="font-normal text-faint">
                ({{ createForm.discount_type === "percent" ? "%" : "FCFA" }})
              </span>
            </label>
            <InputNumber
              v-model="createForm.discount_value"
              input-id="create-value"
              fluid
              :min="0"
              :max="createForm.discount_type === 'percent' ? 100 : undefined"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="create-commission" class="text-sm font-semibold text-ink">Commission (%)</label>
            <InputNumber v-model="createForm.commission_rate" input-id="create-commission" fluid :min="0" :max="100" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="create-max" class="text-sm font-semibold text-ink">Max utilisations</label>
            <InputNumber v-model="createForm.max_uses" input-id="create-max" fluid :min="1" placeholder="Illimité" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="create-expires" class="text-sm font-semibold text-ink">Date d'expiration</label>
          <DatePicker
            v-model="createForm.expires_at"
            input-id="create-expires"
            fluid
            date-format="dd/mm/yy"
            show-icon
          />
        </div>

        <Message v-if="createError" severity="error" :closable="false">
          {{ createError }}
        </Message>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="createDialog = false" />
        <AppButton
          label="Créer"
          icon="pi pi-check"
          variant="gradient"
          :loading="creating"
          :disabled="!createForm.code || !createForm.discount_value"
          @click="handleCreate"
        />
      </template>
    </Dialog>

    <!-- Dialog modifier -->
    <Dialog
      v-model:visible="editDialog"
      modal
      :draggable="false"
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i class="pi pi-pencil" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Modifier le code promo</h3>
        </div>
      </template>

      <div v-if="editingCode" class="space-y-4 pt-1">
        <div class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2 p-3.5">
          <code class="font-mono text-sm font-bold tracking-wide text-ink">{{ editingCode.code }}</code>
          <span class="font-heading text-sm font-bold text-primary">{{ formatDiscount(editingCode) }}</span>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="edit-commission" class="text-sm font-semibold text-ink">Commission (%)</label>
            <InputNumber v-model="editForm.commission_rate" input-id="edit-commission" fluid :min="0" :max="100" />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="edit-max" class="text-sm font-semibold text-ink">Max utilisations</label>
            <InputNumber v-model="editForm.max_uses" input-id="edit-max" fluid :min="1" placeholder="Illimité" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="edit-expires" class="text-sm font-semibold text-ink">Date d'expiration</label>
          <DatePicker
            v-model="editForm.expires_at"
            input-id="edit-expires"
            fluid
            date-format="dd/mm/yy"
            show-icon
          />
        </div>

        <div class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2/50 px-4 py-3">
          <label for="edit-active" class="text-sm font-semibold text-ink">Code actif</label>
          <ToggleSwitch v-model="editForm.is_active" input-id="edit-active" />
        </div>

        <Message v-if="editError" severity="error" :closable="false">
          {{ editError }}
        </Message>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="editDialog = false" />
        <AppButton label="Enregistrer" icon="pi pi-check" variant="gradient" :loading="editing" @click="handleEdit" />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog
      v-model:visible="deleteDialog"
      modal
      :draggable="false"
      :style="{ width: '26rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-trash" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Supprimer le code ?</h3>
        </div>
      </template>

      <p v-if="selectedCode" class="leading-relaxed text-muted">
        Supprimer le code
        <code class="rounded-md bg-card-2 px-1.5 py-0.5 font-mono text-sm font-bold text-ink">{{ selectedCode.code }}</code>
        ? Cette action est irréversible.
      </p>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="deleteDialog = false" />
        <AppButton label="Supprimer" icon="pi pi-trash" variant="danger" :loading="deleting" @click="handleDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { PromoCodeResponse } from '#shared/api'
import { PromoCodeCreateRequest } from '#shared/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const store = useAdminPromoCodesStore()
const partnersStore = useAdminPartnersStore()
const toast = useToast()

const search = ref('')
const filterStatus = ref('')
const createDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const creating = ref(false)
const editing = ref(false)
const deleting = ref(false)
const createError = ref('')
const editError = ref('')
const editingCode = ref<PromoCodeResponse | null>(null)
const selectedCode = ref<PromoCodeResponse | null>(null)

const statusOptions = [
  { label: 'Tous', value: '' },
  { label: 'Actifs', value: 'active' },
  { label: 'Inactifs', value: 'inactive' },
  { label: 'Expirés', value: 'expired' },
]

const discountTypeOptions = [
  { label: 'Pourcentage (%)', value: 'percent' },
  { label: 'Montant fixe (FCFA)', value: 'fixed' },
]

const defaultCreateForm = () => ({
  code: '',
  partner_id: null as string | null,
  discount_type: PromoCodeCreateRequest.discount_type.PERCENT,
  discount_value: 10,
  commission_rate: 0,
  max_uses: null as number | null,
  expires_at: null as Date | null,
  is_active: true,
})

const createForm = ref(defaultCreateForm())

const editForm = ref({
  commission_rate: 0,
  max_uses: null as number | null,
  expires_at: null as Date | null,
  is_active: true,
})

const partnerOptions = computed(() => [
  { label: 'Sans partenaire', value: null },
  ...partnersStore.partners.map(p => ({ label: p.name, value: p.id })),
])

const filteredCodes = computed(() => {
  let list = [...store.codes]

  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c => c.code.toLowerCase().includes(q))
  }

  if (filterStatus.value === 'active') list = list.filter(c => c.is_active && !isExpired(c.expires_at))
  if (filterStatus.value === 'inactive') list = list.filter(c => !c.is_active)
  if (filterStatus.value === 'expired') list = list.filter(c => isExpired(c.expires_at))

  return list
})

const getPartnerName = (partnerId: string | null) => {
  if (!partnerId) return '—'
  return partnersStore.partners.find(p => p.id === partnerId)?.name || '—'
}

const formatDiscount = (code: PromoCodeResponse) => {
  return code.discount_type === 'percent'
    ? `${code.discount_value}%`
    : `${code.discount_value} FCFA`
}

const isExpired = (expiresAt: string | null) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const getStatusLabel = (code: PromoCodeResponse) => {
  if (isExpired(code.expires_at)) return 'Expiré'
  if (!code.is_active) return 'Inactif'
  if (code.max_uses && code.used_count >= code.max_uses) return 'Épuisé'
  return 'Actif'
}

const getStatusSeverity = (code: PromoCodeResponse) => {
  if (isExpired(code.expires_at)) return 'danger'
  if (!code.is_active) return 'secondary'
  if (code.max_uses && code.used_count >= code.max_uses) return 'warn'
  return 'success'
}

const copyCode = async (code: string) => {
  await navigator.clipboard.writeText(code)
  toast.add({ severity: 'success', summary: 'Copié !', detail: code, life: 2000 })
}

const openCreate = () => {
  createForm.value = defaultCreateForm()
  createError.value = ''
  createDialog.value = true
}

const handleCreate = async () => {
  creating.value = true
  createError.value = ''

  const payload = {
    code: createForm.value.code,
    partner_id: createForm.value.partner_id || null,
    discount_type: createForm.value.discount_type,
    discount_value: createForm.value.discount_value,
    commission_rate: createForm.value.commission_rate,
    max_uses: createForm.value.max_uses || null,
    expires_at: createForm.value.expires_at
      ? (createForm.value.expires_at as Date).toISOString()
      : null,
    is_active: true,
  }

  const res = await store.createCode(payload)
  creating.value = false

  if (res.success) {
    createDialog.value = false
    toast.add({ severity: 'success', summary: 'Code créé', detail: `Code ${payload.code} créé.`, life: 3000 })
  } else {
    createError.value = res.error || 'Erreur lors de la création'
  }
}

const openEdit = (code: PromoCodeResponse) => {
  editingCode.value = code
  editForm.value = {
    commission_rate: code.commission_rate,
    max_uses: code.max_uses,
    expires_at: code.expires_at ? new Date(code.expires_at) : null,
    is_active: code.is_active,
  }
  editError.value = ''
  editDialog.value = true
}

const handleEdit = async () => {
  if (!editingCode.value) return
  editing.value = true
  editError.value = ''

  const payload = {
    commission_rate: editForm.value.commission_rate,
    max_uses: editForm.value.max_uses || null,
    expires_at: editForm.value.expires_at
      ? (editForm.value.expires_at as Date).toISOString()
      : null,
    is_active: editForm.value.is_active,
  }

  const res = await store.updateCode(editingCode.value.id, payload)
  editing.value = false

  if (res.success) {
    editDialog.value = false
    toast.add({ severity: 'success', summary: 'Modifié', detail: 'Code mis à jour.', life: 3000 })
  } else {
    editError.value = res.error || 'Erreur lors de la modification'
  }
}

const handleToggle = async (code: PromoCodeResponse) => {
  await store.updateCode(code.id, { is_active: !code.is_active })
}

const confirmDelete = (code: PromoCodeResponse) => {
  selectedCode.value = code
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedCode.value) return
  deleting.value = true
  const res = await store.deleteCode(selectedCode.value.id)
  deleting.value = false
  deleteDialog.value = false
  if (!res.success) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: res.error, life: 3000 })
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchCodes(),
    partnersStore.partners.length === 0 ? partnersStore.fetchPartners() : Promise.resolve(),
  ])
})
</script>