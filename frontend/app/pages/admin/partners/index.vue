<template>
  <div class="space-y-6">
    <!-- Barre d'outils -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <IconField class="w-full sm:w-80">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Rechercher un partenaire..."
          aria-label="Rechercher un partenaire"
          fluid
        />
      </IconField>
      <AppButton label="Nouveau partenaire" icon="pi pi-plus" variant="gradient" @click="openCreate" />
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
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Partenaire</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint sm:table-cell">Contact</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint md:table-cell">Codes</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint md:table-cell">Utilisations</th>
              <th class="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint lg:table-cell">Commission due</th>
              <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Statut</th>
              <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr
              v-for="partner in filteredPartners"
              :key="partner.id"
              class="transition-colors hover:bg-card-2/50"
            >
              <!-- Nom -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary">
                    <i class="pi pi-building text-sm" />
                  </span>
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-ink">{{ partner.name }}</p>
                    <p class="text-xs text-faint">{{ formatDate(partner.created_at) }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="hidden px-5 py-3.5 sm:table-cell">
                <p class="truncate text-muted">{{ partner.contact_email }}</p>
                <p v-if="partner.phone" class="text-xs tabular-nums text-faint">{{ partner.phone }}</p>
              </td>

              <!-- Codes -->
              <td class="hidden px-5 py-3.5 md:table-cell">
                <span class="font-semibold tabular-nums text-ink">
                  {{ stats[partner.id]?.total_codes ?? "—" }}
                </span>
                <span v-if="stats[partner.id]" class="ml-1 text-xs text-faint">
                  ({{ stats[partner.id]?.active_codes }} actifs)
                </span>
              </td>

              <!-- Utilisations -->
              <td class="hidden px-5 py-3.5 md:table-cell">
                <span class="font-semibold tabular-nums text-ink">
                  {{ stats[partner.id]?.total_uses ?? "—" }}
                </span>
              </td>

              <!-- Commission -->
              <td class="hidden px-5 py-3.5 lg:table-cell">
                <span
                  v-if="stats[partner.id]"
                  class="font-heading font-bold tabular-nums text-primary"
                >
                  {{ Math.round(stats[partner.id]?.total_commission_due ?? 0).toLocaleString("fr-FR") }} FCFA
                </span>
                <span v-else class="text-faint">—</span>
              </td>

              <!-- Statut -->
              <td class="px-5 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="
                    partner.is_active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                  "
                >
                  <span class="size-1.5 rounded-full" :class="partner.is_active ? 'bg-emerald-500' : 'bg-red-500'" />
                  {{ partner.is_active ? "Actif" : "Inactif" }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1">
                  <Button
                    v-tooltip.top="'Modifier'"
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    severity="secondary"
                    aria-label="Modifier"
                    @click="openEdit(partner)"
                  />
                  <Button
                    v-tooltip.top="'Supprimer'"
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    aria-label="Supprimer"
                    @click="confirmDelete(partner)"
                  />
                </div>
              </td>
            </tr>

            <!-- Vide -->
            <tr v-if="filteredPartners.length === 0">
              <td colspan="7" class="px-5 py-14">
                <div class="flex flex-col items-center text-center">
                  <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                    <i class="pi pi-building text-2xl" />
                  </span>
                  <p class="text-sm font-medium text-muted">Aucun partenaire trouvé</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pied -->
      <div class="border-t border-line px-5 py-3 text-xs text-muted">
        <span class="font-semibold tabular-nums text-ink">{{ filteredPartners.length }}</span>
        partenaire(s) sur
        <span class="font-semibold tabular-nums text-ink">{{ store.partners.length }}</span>
      </div>
    </div>

    <!-- Dialog créer / modifier -->
    <Dialog
      v-model:visible="formDialog"
      modal
      :draggable="false"
      :style="{ width: '30rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i :class="editingPartner ? 'pi pi-pencil' : 'pi pi-building'" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingPartner ? "Modifier le partenaire" : "Nouveau partenaire" }}
          </h3>
        </div>
      </template>

      <div class="space-y-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="partner-name" class="text-sm font-semibold text-ink">
            Nom <span class="text-red-500">*</span>
          </label>
          <InputText id="partner-name" v-model="form.name" placeholder="Centre de langue Berlin" fluid />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="partner-email" class="text-sm font-semibold text-ink">
            Email de contact <span class="text-red-500">*</span>
          </label>
          <InputText
            id="partner-email"
            v-model="form.contact_email"
            type="email"
            placeholder="contact@centre.com"
            fluid
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="partner-phone" class="text-sm font-semibold text-ink">Téléphone</label>
          <InputText id="partner-phone" v-model="form.phone" placeholder="+237 6XX XXX XXX" fluid />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="partner-notes" class="text-sm font-semibold text-ink">Notes internes</label>
          <Textarea
            id="partner-notes"
            v-model="form.notes"
            :rows="3"
            auto-resize
            fluid
            placeholder="Informations internes..."
          />
        </div>
        <Message v-if="formError" severity="error" :closable="false">{{ formError }}</Message>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="formDialog = false" />
        <AppButton
          :label="editingPartner ? 'Enregistrer' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          :disabled="!form.name || !form.contact_email"
          @click="handleSave"
        />
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
          <h3 class="font-heading text-lg font-bold text-ink">Supprimer le partenaire ?</h3>
        </div>
      </template>

      <p v-if="selectedPartner" class="leading-relaxed text-muted">
        Supprimer <strong class="text-ink">{{ selectedPartner.name }}</strong> ?
      </p>
      <div
        class="mt-3 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
      >
        <i class="pi pi-exclamation-triangle mt-0.5 shrink-0" />
        Les codes promo associés seront aussi supprimés.
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="deleteDialog = false" />
        <AppButton label="Supprimer" icon="pi pi-trash" variant="danger" :loading="deleting" @click="handleDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { PartnerDetailResponse, PartnerStatsResponse } from '#shared/api'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const store = useAdminPartnersStore()
const toast = useToast()

const search = ref('')
const formDialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const formError = ref('')
const editingPartner = ref<PartnerDetailResponse | null>(null)
const selectedPartner = ref<PartnerDetailResponse | null>(null)
const stats = ref<Record<string, PartnerStatsResponse>>({})

const defaultForm = () => ({
  name: '',
  contact_email: '',
  phone: '',
  notes: '',
})

const form = ref(defaultForm())

const filteredPartners = computed(() => {
  if (!search.value) return store.partners
  const q = search.value.toLowerCase()
  return store.partners.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.contact_email.toLowerCase().includes(q)
  )
})

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

const openCreate = () => {
  editingPartner.value = null
  form.value = defaultForm()
  formError.value = ''
  formDialog.value = true
}

const openEdit = (partner: PartnerDetailResponse) => {
  editingPartner.value = partner
  form.value = {
    name: partner.name,
    contact_email: partner.contact_email,
    phone: (partner as any).phone || '',
    notes: partner.notes || '',
  }
  formError.value = ''
  formDialog.value = true
}

const handleSave = async () => {
  saving.value = true
  formError.value = ''

  const payload = {
    name: form.value.name,
    contact_email: form.value.contact_email,
    phone: form.value.phone || null,
    notes: form.value.notes || null,
  }

  let res
  if (editingPartner.value) {
    res = await store.updatePartner(editingPartner.value.id, payload)
  } else {
    res = await store.createPartner(payload)
  }

  saving.value = false

  if (res.success) {
    formDialog.value = false
    toast.add({
      severity: 'success',
      summary: editingPartner.value ? 'Modifié' : 'Créé',
      detail: `Partenaire ${editingPartner.value ? 'mis à jour' : 'créé'} avec succès.`,
      life: 3000,
    })
    if (res.data) loadStats(res.data.id)
  } else {
    formError.value = res.error || 'Erreur lors de la sauvegarde'
  }
}

const confirmDelete = (partner: PartnerDetailResponse) => {
  selectedPartner.value = partner
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!selectedPartner.value) return
  deleting.value = true
  const res = await store.deletePartner(selectedPartner.value.id)
  deleting.value = false
  deleteDialog.value = false
  if (!res.success) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: res.error, life: 3000 })
  }
}

const loadStats = async (partnerId: string) => {
  const s = await store.getStats(partnerId)
  if (s) stats.value[partnerId] = s
}

onMounted(async () => {
  await store.fetchPartners()
  store.partners.forEach(p => loadStats(p.id))
})
</script>