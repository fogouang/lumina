<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1
          class="font-heading text-2xl font-extrabold tracking-tight text-ink"
        >
          Contrats ambassadeurs
        </h1>
        <p class="mt-0.5 text-sm text-muted">
          Modifiable tant qu'il est en brouillon. La signature fait de
          l'utilisateur un ambassadeur, la résiliation lui retire ce statut.
        </p>
      </div>
      <Button label="Nouveau contrat" icon="pi pi-plus" @click="openCreate" />
    </div>

    <div class="rounded-card border border-line bg-card p-4 shadow-soft">
      <InputText
        v-model="search"
        placeholder="Rechercher par nom, email ou numéro"
        class="w-full sm:w-96"
      />
    </div>

    <div
      class="overflow-hidden rounded-card border border-line bg-card shadow-soft"
    >
      <DataTable
        :value="filtered"
        :loading="loading"
        paginator
        :rows="10"
        striped-rows
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="flex flex-col items-center py-12 text-center">
            <span
              class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint"
            >
              <i class="pi pi-file-edit text-2xl" />
            </span>
            <p class="text-sm font-medium text-muted">
              Aucun contrat pour l'instant.
            </p>
          </div>
        </template>

        <Column
          field="numero"
          header="Contrat"
          sortable
          style="min-width: 150px"
        >
          <template #body="{ data }">
            <p class="font-mono text-sm font-semibold text-ink">
              {{ data.numero }}
            </p>
            <p class="text-xs text-muted">
              Créé le {{ formatDay(data.created_at) }}
            </p>
          </template>
        </Column>

        <Column
          field="nom_complet"
          header="Ambassadeur"
          sortable
          style="min-width: 200px"
        >
          <template #body="{ data }">
            <p class="text-sm font-semibold text-ink">{{ data.nom_complet }}</p>
            <p class="text-xs text-muted">
              {{ data.user_email }} · {{ data.telephone }}
            </p>
          </template>
        </Column>

        <Column
          field="taux_commission"
          header="Commission"
          sortable
          style="min-width: 110px"
        >
          <template #body="{ data }">
            <span
              class="font-heading text-sm font-bold text-emerald-600 tabular-nums dark:text-emerald-400"
            >
              {{ data.taux_commission }} %
            </span>
          </template>
        </Column>

        <Column
          field="statut"
          header="Statut"
          sortable
          style="min-width: 120px"
        >
          <template #body="{ data }">
            <Tag
              :value="STATUT[data.statut]?.label ?? data.statut"
              :severity="STATUT[data.statut]?.severity"
            />
            <p v-if="data.date_signature" class="mt-1 text-xs text-muted">
              Signé le {{ formatDay(data.date_signature) }}
            </p>
          </template>
        </Column>

        <Column header="" style="width: 1%">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-1">
              <Button
                icon="pi pi-file-pdf"
                text
                rounded
                aria-label="Voir le PDF"
                :loading="pdfLoading === data.id"
                @click="openPdf(data)"
              />
              <Button
                v-if="data.statut === 'brouillon'"
                icon="pi pi-pencil"
                text
                rounded
                aria-label="Modifier"
                @click="openEdit(data)"
              />
              <Button
                v-if="data.statut === 'brouillon'"
                label="Marquer signé"
                icon="pi pi-check"
                text
                severity="success"
                size="small"
                @click="openSign(data)"
              />
              <Button
                v-if="data.statut === 'signe'"
                label="Résilier"
                icon="pi pi-times"
                text
                severity="danger"
                size="small"
                @click="confirmTerminate(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Création / modification -->
    <Dialog
      v-model:visible="formOpen"
      modal
      :header="
        editingId ? 'Modifier le contrat' : 'Nouveau contrat ambassadeur'
      "
      :draggable="false"
      :style="{ width: '42rem' }"
      :breakpoints="{ '720px': '94vw' }"
    >
      <form class="space-y-5" @submit.prevent="submitForm">
        <div>
          <p
            class="mb-3 text-xs font-semibold tracking-wider text-faint uppercase"
          >
            Ambassadeur
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <!-- Choix de l'utilisateur -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="c-user" class="text-sm font-semibold text-ink"
                >Compte utilisateur</label
              >

              <div
                v-if="editingId"
                class="flex items-center gap-3 rounded-xl border border-line bg-card-2 px-3.5 py-2.5"
              >
                <i class="pi pi-user text-faint" />
                <span class="text-sm text-ink">{{ editingEmail }}</span>
                <span class="ml-auto text-xs text-faint">non modifiable</span>
              </div>

              <template v-else>
                <Select
                  v-model="selectedUserId"
                  input-id="c-user"
                  :options="userOptions"
                  option-label="label"
                  option-value="id"
                  option-disabled="has_active_contract"
                  filter
                  :filter-fields="['label', 'email']"
                  filter-placeholder="Nom ou email"
                  placeholder="Choisir un utilisateur"
                  :loading="loadingUsers"
                  fluid
                  @change="onUserSelected"
                >
                  <template #option="{ option }">
                    <div class="flex w-full items-center gap-3">
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold">
                          {{ option.label }}
                        </p>
                        <p class="truncate text-xs opacity-70">
                          {{ option.email }}
                        </p>
                      </div>
                      <span
                        v-if="option.has_active_contract"
                        class="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        Déjà ambassadeur
                      </span>
                    </div>
                  </template>
                </Select>
                <small class="text-xs text-muted">
                  Le nom et le téléphone sont repris de son compte, vous pouvez
                  les corriger.
                </small>
              </template>
            </div>

            <div class="flex flex-col gap-1.5">
              <label for="c-nom" class="text-sm font-semibold text-ink"
                >Nom complet</label
              >
              <InputText id="c-nom" v-model="form.nom_complet" fluid />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-tel" class="text-sm font-semibold text-ink"
                >Téléphone</label
              >
              <InputText id="c-tel" v-model="form.telephone" type="tel" fluid />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-adresse" class="text-sm font-semibold text-ink"
                >Adresse</label
              >
              <InputText id="c-adresse" v-model="form.adresse" fluid />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-cni" class="text-sm font-semibold text-ink"
                >N° pièce d'identité</label
              >
              <InputText id="c-cni" v-model="form.piece_identite" fluid />
            </div>
          </div>
        </div>

        <div>
          <p
            class="mb-3 text-xs font-semibold tracking-wider text-faint uppercase"
          >
            Termes négociés
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="c-taux" class="text-sm font-semibold text-ink"
                >Commission</label
              >
              <InputNumber
                v-model="form.taux_commission"
                input-id="c-taux"
                :min="0.5"
                :max="99"
                :max-fraction-digits="2"
                suffix=" %"
                fluid
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-momo" class="text-sm font-semibold text-ink">
                N° Mobile Money de réception
                <span class="font-normal text-faint">(optionnel)</span>
              </label>
              <InputText
                id="c-momo"
                v-model="form.numero_mobile_money_reception"
                placeholder="Votre numéro"
                fluid
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-delai" class="text-sm font-semibold text-ink"
                >Délai de reversement (heures)</label
              >
              <InputNumber
                v-model="form.delai_reversement_heures"
                input-id="c-delai"
                :min="1"
                fluid
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-duree" class="text-sm font-semibold text-ink"
                >Durée (mois)</label
              >
              <InputNumber
                v-model="form.duree_mois"
                input-id="c-duree"
                :min="1"
                fluid
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-preavis" class="text-sm font-semibold text-ink"
                >Préavis de résiliation (jours)</label
              >
              <InputNumber
                v-model="form.preavis_resiliation_jours"
                input-id="c-preavis"
                :min="0"
                fluid
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="c-ville" class="text-sm font-semibold text-ink"
                >Ville (juridiction)</label
              >
              <InputText id="c-ville" v-model="form.ville_juridiction" fluid />
            </div>
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="c-notes" class="text-sm font-semibold text-ink">
                Notes internes
                <span class="font-normal text-faint">(optionnel)</span>
              </label>
              <Textarea
                id="c-notes"
                v-model="form.notes"
                rows="2"
                auto-resize
                fluid
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <Button
            label="Annuler"
            text
            type="button"
            @click="formOpen = false"
          />
          <Button
            :label="editingId ? 'Enregistrer' : 'Créer le contrat'"
            icon="pi pi-check"
            type="button"
            :loading="saving"
            @click="submitForm"
          />
        </div>
      </form>
    </Dialog>

    <!-- Signature -->
    <Dialog
      v-model:visible="signOpen"
      modal
      header="Marquer le contrat comme signé"
      :draggable="false"
      :style="{ width: '26rem' }"
      :breakpoints="{ '640px': '94vw' }"
    >
      <form class="space-y-4" @submit.prevent="submitSign">
        <p class="text-sm text-muted">
          <span class="font-semibold text-ink">{{ toSign?.nom_complet }}</span>
          deviendra ambassadeur dès la confirmation. Le contrat ne sera plus
          modifiable.
        </p>
        <div class="flex flex-col gap-1.5">
          <label for="s-date" class="text-sm font-semibold text-ink"
            >Date de signature</label
          >
          <InputText
            id="s-date"
            v-model="sign.date_signature"
            type="date"
            fluid
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="s-debut" class="text-sm font-semibold text-ink">
            Date de début
            <span class="font-normal text-faint">(si différente)</span>
          </label>
          <InputText id="s-debut" v-model="sign.date_debut" type="date" fluid />
        </div>
        <Message v-if="formError" severity="error" :closable="false">
          {{ formError }}
        </Message>
        <div class="flex justify-end gap-2 pt-1">
          <Button
            label="Annuler"
            text
            type="button"
            @click="signOpen = false"
          />
          <Button
            label="Confirmer"
            icon="pi pi-check"
            type="submit"
            :loading="saving"
            :disabled="!sign.date_signature"
          />
        </div>
      </form>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

interface ContractRow {
  id: string;
  numero: string;
  statut: "brouillon" | "signe" | "resilie";
  user_id: string;
  user_email: string;
  nom_complet: string;
  telephone: string;
  adresse: string;
  piece_identite: string;
  taux_commission: number;
  numero_mobile_money_reception: string | null;
  delai_reversement_heures: number;
  duree_mois: number;
  preavis_resiliation_jours: number;
  ville_juridiction: string;
  date_signature: string | null;
  notes: string | null;
  created_at: string;
}

interface UserItem {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
}

const STATUT: Record<string, { label: string; severity: string }> = {
  brouillon: { label: "Brouillon", severity: "secondary" },
  signe: { label: "Signé", severity: "success" },
  resilie: { label: "Résilié", severity: "danger" },
};

const { get, post, patch } = useApi();
const toast = useToast();
const confirm = useConfirm();
const pdf = usePdf();
const route = useRoute();

const contracts = ref<ContractRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const search = ref("");
const pdfLoading = ref<string | null>(null);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return contracts.value;
  return contracts.value.filter(
    (c) =>
      c.nom_complet.toLowerCase().includes(q) ||
      c.user_email.toLowerCase().includes(q) ||
      c.numero.toLowerCase().includes(q),
  );
});

function errorDetail(err: any): string | undefined {
  const data = err?.data;
  if (!data) return err?.message;
  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;
  // Erreurs de validation FastAPI (422) : liste de { loc, msg }
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((e: any) => `${(e.loc ?? []).slice(-1)[0] ?? "champ"} : ${e.msg}`)
      .join(" · ");
  }
  return undefined;
}

async function fetchContracts() {
  loading.value = true;
  try {
    const res = await get<any>("/v1/ambassador-contracts");
    contracts.value = res.data ?? [];
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de chargement",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

// ── Choix de l'utilisateur (même source que la page Utilisateurs) ──
const users = ref<UserItem[]>([]);
const loadingUsers = ref(false);
const selectedUserId = ref<string | null>(null);

// Utilisateurs ayant déjà un contrat signé : non sélectionnables
const usersWithSignedContract = computed(
  () =>
    new Set(
      contracts.value.filter((c) => c.statut === "signe").map((c) => c.user_id),
    ),
);

const userOptions = computed(() =>
  users.value.map((u) => ({
    id: u.id,
    label: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email,
    email: u.email,
    phone: u.phone,
    has_active_contract: usersWithSignedContract.value.has(u.id),
  })),
);

async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const res = await get<any>("/v1/users?limit=100");
    users.value = res.data ?? [];
  } catch {
    toast.add({
      severity: "error",
      summary: "Impossible de charger les utilisateurs",
      life: 3000,
    });
  } finally {
    loadingUsers.value = false;
  }
}

function onUserSelected() {
  const user = userOptions.value.find((u) => u.id === selectedUserId.value);
  if (!user) return;
  form.value.nom_complet = user.label;
  if (user.phone) form.value.telephone = user.phone;
}

// ── Formulaire création / modification ──
const formOpen = ref(false);
const editingId = ref<string | null>(null);
const editingEmail = ref("");
const formError = ref<string | null>(null);

function emptyForm() {
  return {
    nom_complet: "",
    telephone: "",
    adresse: "",
    piece_identite: "",
    taux_commission: 10 as number | null,
    numero_mobile_money_reception: "",
    delai_reversement_heures: 24 as number | null,
    duree_mois: 12 as number | null,
    preavis_resiliation_jours: 10 as number | null,
    ville_juridiction: "Dschang",
    notes: "",
  };
}
const form = ref(emptyForm());

const canSubmit = computed(() => {
  const f = form.value;
  const fieldsOk =
    !!f.nom_complet &&
    !!f.telephone &&
    !!f.adresse &&
    !!f.piece_identite &&
    !!f.taux_commission;
  if (editingId.value) return fieldsOk;
  return (
    fieldsOk &&
    !!selectedUserId.value &&
    !usersWithSignedContract.value.has(selectedUserId.value)
  );
});

function openCreate() {
  formError.value = null;
  editingId.value = null;
  editingEmail.value = "";
  selectedUserId.value = null;
  form.value = emptyForm();
  formOpen.value = true;
}

function openEdit(c: ContractRow) {
  formError.value = null;
  editingId.value = c.id;
  editingEmail.value = c.user_email;
  form.value = {
    nom_complet: c.nom_complet,
    telephone: c.telephone,
    adresse: c.adresse,
    piece_identite: c.piece_identite,
    taux_commission: c.taux_commission,
    numero_mobile_money_reception: c.numero_mobile_money_reception ?? "",
    delai_reversement_heures: c.delai_reversement_heures,
    duree_mois: c.duree_mois,
    preavis_resiliation_jours: c.preavis_resiliation_jours,
    ville_juridiction: c.ville_juridiction,
    notes: c.notes ?? "",
  };
  formOpen.value = true;
}

async function submitForm() {
  formError.value = null;

  const f = form.value;
  const missing: string[] = [];
  if (!editingId.value && !selectedUserId.value)
    missing.push("compte utilisateur");
  if (!f.nom_complet) missing.push("nom complet");
  if (!f.telephone || f.telephone.trim().length < 6)
    missing.push("téléphone (6 caractères min.)");
  if (!f.adresse || f.adresse.trim().length < 2) missing.push("adresse");
  if (!f.piece_identite || f.piece_identite.trim().length < 3)
    missing.push("pièce d'identité (3 caractères min.)");
  if (!f.taux_commission) missing.push("commission");
  if (
    !editingId.value &&
    selectedUserId.value &&
    usersWithSignedContract.value.has(selectedUserId.value)
  ) {
    missing.push("un utilisateur sans contrat signé");
  }

  if (missing.length) {
    formError.value = `À compléter : ${missing.join(", ")}.`;
    return;
  }

  saving.value = true;
  const payload = {
    ...f,
    numero_mobile_money_reception: f.numero_mobile_money_reception || null,
    notes: f.notes || null,
  };
  try {
    if (editingId.value) {
      await patch<any>(`/v1/ambassador-contracts/${editingId.value}`, payload);
      toast.add({
        severity: "success",
        summary: "Contrat modifié",
        life: 3000,
      });
    } else {
      await post<any>("/v1/ambassador-contracts", {
        ...payload,
        user_id: selectedUserId.value,
      });
      toast.add({
        severity: "success",
        summary: "Contrat créé",
        detail: "Imprimez-le et faites-le signer.",
        life: 4000,
      });
    }
    formOpen.value = false;
    await fetchContracts();
  } catch (err: any) {
    formError.value =
      errorDetail(err) ??
      `Erreur ${err?.statusCode ?? err?.status ?? ""}`.trim();
  } finally {
    saving.value = false;
  }
}
// ── Signature ──
const signOpen = ref(false);
const toSign = ref<ContractRow | null>(null);
const sign = ref({ date_signature: "", date_debut: "" });

function openSign(c: ContractRow) {
  toSign.value = c;
  sign.value = {
    date_signature: new Date().toISOString().slice(0, 10),
    date_debut: "",
  };
  signOpen.value = true;
}

async function submitSign() {
  if (!toSign.value || !sign.value.date_signature) return;
  saving.value = true;
  try {
    await post<any>(`/v1/ambassador-contracts/${toSign.value.id}/signer`, {
      date_signature: sign.value.date_signature,
      date_debut: sign.value.date_debut || null,
    });
    toast.add({
      severity: "success",
      summary: "Contrat signé",
      detail: "L'utilisateur est maintenant ambassadeur.",
      life: 4000,
    });
    signOpen.value = false;
    await fetchContracts();
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Échec",
      detail: errorDetail(err),
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
}

// ── Résiliation ──
function confirmTerminate(c: ContractRow) {
  confirm.require({
    header: "Résilier le contrat",
    message: `${c.nom_complet} perdra immédiatement son statut d'ambassadeur. Les sommes dues resteront exigibles.`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Résilier",
    rejectLabel: "Annuler",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await post<any>(`/v1/ambassador-contracts/${c.id}/resilier`, {});
        toast.add({
          severity: "success",
          summary: "Contrat résilié",
          life: 3000,
        });
        await fetchContracts();
      } catch (err: any) {
        toast.add({
          severity: "error",
          summary: "Échec",
          detail: errorDetail(err),
          life: 5000,
        });
      }
    },
  });
}

// ── PDF ──
async function openPdf(c: ContractRow) {
  pdfLoading.value = c.id;
  try {
    await pdf.open(`/v1/ambassador-contracts/${c.id}/pdf`);
  } catch {
    toast.add({
      severity: "error",
      summary: "Impossible d'ouvrir le PDF",
      life: 3000,
    });
  } finally {
    pdfLoading.value = null;
  }
}

function formatDay(d: string) {
  const date = d.length === 10 ? new Date(`${d}T00:00:00`) : new Date(d);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

onMounted(async () => {
  await Promise.all([fetchContracts(), fetchUsers()]);

  // Arrivée depuis la page Utilisateurs ou Ambassadeurs :
  // formulaire ouvert, compte présélectionné
  const userId = route.query.user_id;
  if (typeof userId === "string" && userId) {
    openCreate();
    selectedUserId.value = userId;
    onUserSelected();
    navigateTo({ path: route.path }, { replace: true });
  }
});

useHead({ title: "Contrats ambassadeurs | Admin" });
</script>
