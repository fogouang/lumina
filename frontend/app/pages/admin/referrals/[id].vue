<template>
  <div class="space-y-6">
    <!-- Fil d'Ariane -->
    <NuxtLink
      to="/admin/referrals"
      class="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
    >
      <i class="pi pi-arrow-left text-xs" />
      Ambassadeurs
    </NuxtLink>

    <!-- Chargement -->
    <div v-if="loading && !detail" class="space-y-4">
      <div class="h-20 animate-pulse rounded-card bg-card" />
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded-card bg-card" />
      </div>
      <div class="h-64 animate-pulse rounded-card bg-card" />
    </div>

    <template v-else-if="detail">
      <!-- En-tête -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <span
            class="grid size-14 shrink-0 place-items-center rounded-leaf bg-accent-100 font-heading text-xl font-bold text-accent-800 uppercase dark:bg-accent-500/15 dark:text-accent-300"
          >
            {{ detail.name.charAt(0) }}
          </span>
          <div class="min-w-0">
            <h1 class="flex flex-wrap items-center gap-2 font-heading text-2xl font-extrabold tracking-tight text-ink">
              {{ detail.name }}
              <span
                v-if="detail.totals.is_suspended"
                class="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-500/15 dark:text-red-300"
              >
                Suspendu
              </span>
              <span
                v-else-if="!detail.contract"
                class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              >
                Sans contrat
              </span>
            </h1>
            <p class="truncate text-sm text-muted">
              {{ detail.email }} · <span class="font-mono">{{ detail.referral_code }}</span>
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <Button
            icon="pi pi-refresh"
            outlined
            rounded
            aria-label="Actualiser"
            :loading="loading"
            @click="load"
          />
          <Button label="Enregistrer un reversement" icon="pi pi-plus" @click="openRemittanceForm" />
        </div>
      </div>

      <!-- Alerte retard -->
      <div
        v-if="detail.totals.is_suspended"
        class="flex items-start gap-3 rounded-card border border-red-300 bg-red-50 p-4 dark:border-red-500/40 dark:bg-red-500/10"
      >
        <i class="pi pi-exclamation-triangle mt-0.5 text-red-600 dark:text-red-300" />
        <p class="text-sm text-red-800 dark:text-red-200">
          <span class="font-bold tabular-nums">{{ fcfa(detail.totals.overdue_amount) }} FCFA</span>
          en retard de reversement. Ses activations sont bloquées jusqu'à ce que ce montant soit couvert.
        </p>
      </div>

      <!-- Bilan -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div class="rounded-card border border-line bg-card p-5 shadow-soft">
          <p class="text-xs font-semibold tracking-wider text-faint uppercase">Encaissé</p>
          <p class="mt-1 font-heading text-2xl font-extrabold text-ink tabular-nums">
            {{ fcfa(detail.totals.total_collected) }}
          </p>
          <p class="mt-1 text-xs text-muted">{{ detail.totals.sales_count }} vente(s) directe(s)</p>
        </div>
        <div class="rounded-card border border-line bg-card p-5 shadow-soft">
          <p class="text-xs font-semibold tracking-wider text-faint uppercase">Commission</p>
          <p class="mt-1 font-heading text-2xl font-extrabold text-emerald-600 tabular-nums dark:text-emerald-400">
            {{ fcfa(detail.totals.total_commission) }}
          </p>
          <p class="mt-1 text-xs text-muted">Conservée par l'ambassadeur</p>
        </div>
        <div class="rounded-card border border-line bg-card p-5 shadow-soft">
          <p class="text-xs font-semibold tracking-wider text-faint uppercase">Reversé</p>
          <p class="mt-1 font-heading text-2xl font-extrabold text-ink tabular-nums">
            {{ fcfa(detail.totals.total_remitted) }}
          </p>
          <p class="mt-1 text-xs text-muted">sur {{ fcfa(detail.totals.total_due) }} FCFA dus</p>
        </div>
        <div class="rounded-card border p-5 shadow-soft" :class="balanceTone.card">
          <p class="text-xs font-semibold tracking-wider uppercase" :class="balanceTone.text">Reste dû</p>
          <p class="mt-1 font-heading text-2xl font-extrabold tabular-nums" :class="balanceTone.text">
            {{ fcfa(detail.totals.balance_due) }}
          </p>
          <p class="mt-1 text-xs opacity-80" :class="balanceTone.text">FCFA</p>
        </div>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <!-- Ventes -->
        <section class="xl:col-span-2">
          <h2 class="mb-3 font-heading text-lg font-bold text-ink">Ventes encaissées</h2>
          <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
            <DataTable :value="detail.sales" paginator :rows="10" striped-rows class="p-datatable-sm">
              <template #empty>
                <div class="flex flex-col items-center py-12 text-center">
                  <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                    <i class="pi pi-shopping-bag text-2xl" />
                  </span>
                  <p class="text-sm font-medium text-muted">Aucune vente directe.</p>
                </div>
              </template>

              <Column field="client_name" header="Client" sortable style="min-width: 170px">
                <template #body="{ data }">
                  <p class="text-sm font-semibold text-ink">{{ data.client_name }}</p>
                  <p class="text-xs text-muted">{{ formatDate(data.created_at) }}</p>
                </template>
              </Column>
              <Column field="plan_name" header="Forfait" sortable style="min-width: 130px">
                <template #body="{ data }">
                  <span class="text-sm text-ink">{{ data.plan_name ?? "—" }}</span>
                </template>
              </Column>
              <Column field="sale_amount" header="Encaissé" sortable style="min-width: 100px">
                <template #body="{ data }">
                  <span class="text-sm tabular-nums">{{ fcfa(data.sale_amount) }}</span>
                </template>
              </Column>
              <Column field="commission" header="Commission" sortable style="min-width: 100px">
                <template #body="{ data }">
                  <span class="text-sm text-emerald-600 tabular-nums dark:text-emerald-400">{{ fcfa(data.commission) }}</span>
                </template>
              </Column>
              <Column field="amount_due" header="Dû" sortable style="min-width: 90px">
                <template #body="{ data }">
                  <span class="text-sm font-semibold tabular-nums">{{ fcfa(data.amount_due) }}</span>
                </template>
              </Column>
              <Column field="status" header="Statut" style="min-width: 150px">
                <template #body="{ data }">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="statusStyle(data).class"
                  >
                    <span class="size-1.5 rounded-full" :class="statusStyle(data).dot" />
                    {{ statusStyle(data).label }}
                  </span>
                  <p v-if="data.status !== 'settled'" class="mt-1 text-[0.6875rem] text-muted">
                    Limite : {{ formatDate(data.deadline_at) }}
                  </p>
                </template>
              </Column>
            </DataTable>
          </div>
        </section>

        <!-- Colonne latérale -->
        <aside class="space-y-6">
          <!-- Contrat -->
          <section>
            <h2 class="mb-3 font-heading text-lg font-bold text-ink">Contrat</h2>
            <div v-if="detail.contract" class="rounded-card border border-line bg-card p-5 shadow-soft">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-mono text-sm font-semibold text-ink">{{ detail.contract.numero }}</p>
                  <p v-if="detail.contract.date_signature" class="text-xs text-muted">
                    Signé le {{ formatDay(detail.contract.date_signature) }}
                  </p>
                </div>
                <Button
                  icon="pi pi-file-pdf"
                  text
                  rounded
                  aria-label="Voir le contrat"
                  :loading="openingPdf"
                  @click="openContract"
                />
              </div>
              <dl class="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                <div class="flex justify-between">
                  <dt class="text-muted">Commission</dt>
                  <dd class="font-semibold text-emerald-600 dark:text-emerald-400">{{ detail.contract.taux_commission }} %</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-muted">Délai de reversement</dt>
                  <dd class="font-semibold text-ink">{{ detail.contract.delai_reversement_heures }} h</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-muted">Durée</dt>
                  <dd class="font-semibold text-ink">{{ detail.contract.duree_mois }} mois</dd>
                </div>
              </dl>
            </div>
            <div
              v-else
              class="rounded-card border border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
            >
              Aucun contrat signé : ses activations sont bloquées.
              <NuxtLink to="/admin/contrats-ambassadeurs" class="mt-2 block font-semibold underline underline-offset-4">
                Créer son contrat
              </NuxtLink>
            </div>
          </section>

          <!-- Reversements -->
          <section>
            <h2 class="mb-3 font-heading text-lg font-bold text-ink">Reversements reçus</h2>
            <div
              v-if="!detail.remittances.length"
              class="rounded-card border border-dashed border-line px-4 py-8 text-center text-sm text-muted"
            >
              Aucun reversement enregistré.
            </div>
            <ul v-else class="divide-y divide-line overflow-hidden rounded-card border border-line bg-card shadow-soft">
              <li v-for="r in detail.remittances" :key="r.id" class="px-4 py-3">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-ink">{{ METHOD_LABEL[r.method] ?? r.method }}</p>
                  <span class="font-heading text-sm font-bold text-ink tabular-nums">{{ fcfa(r.amount) }} FCFA</span>
                </div>
                <p class="mt-0.5 truncate text-xs text-muted">
                  {{ formatDay(r.paid_at) }}
                  <template v-if="r.reference"> · Réf. {{ r.reference }}</template>
                </p>
                <p v-if="r.note" class="mt-0.5 text-xs text-faint">{{ r.note }}</p>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </template>

    <!-- Formulaire reversement -->
    <Dialog
      v-model:visible="remittanceOpen"
      modal
      header="Enregistrer un reversement"
      :draggable="false"
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '94vw' }"
    >
      <form class="flex flex-col gap-4" @submit.prevent="submitRemittance">
        <div class="flex flex-col gap-1.5">
          <label for="rem-amount" class="text-sm font-semibold text-ink">Montant reçu</label>
          <InputNumber
            v-model="remittance.amount"
            input-id="rem-amount"
            :min="1"
            suffix=" FCFA"
            locale="fr-FR"
            fluid
          />
          <small v-if="detail" class="text-xs text-muted">
            Reste dû actuel : {{ fcfa(detail.totals.balance_due) }} FCFA
          </small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="rem-method" class="text-sm font-semibold text-ink">Moyen</label>
          <Select
            v-model="remittance.method"
            input-id="rem-method"
            :options="METHOD_OPTIONS"
            option-label="label"
            option-value="value"
            fluid
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="rem-date" class="text-sm font-semibold text-ink">Date de réception</label>
            <InputText id="rem-date" v-model="remittance.paid_at" type="date" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="rem-ref" class="text-sm font-semibold text-ink">
              Référence <span class="font-normal text-faint">(optionnel)</span>
            </label>
            <InputText id="rem-ref" v-model="remittance.reference" placeholder="ID transaction" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="rem-note" class="text-sm font-semibold text-ink">
            Note <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <Textarea id="rem-note" v-model="remittance.note" rows="2" auto-resize fluid />
        </div>

        <div class="flex justify-end gap-2 pt-1">
          <Button label="Annuler" text type="button" @click="remittanceOpen = false" />
          <Button
            label="Enregistrer"
            icon="pi pi-check"
            type="submit"
            :loading="savingRemittance"
            :disabled="!remittance.amount || !remittance.paid_at"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type {
  AmbassadorContractSummary,
  AmbassadorSaleItem,
  AmbassadorTotals,
  RemittanceItem,
} from "~/stores/referrals";

definePageMeta({ layout: "admin", middleware: "admin" });

interface AmbassadorDetail {
  user_id: string;
  name: string;
  email: string;
  referral_code: string;
  totals: AmbassadorTotals;
  sales: AmbassadorSaleItem[];
  remittances: RemittanceItem[];
  contract: AmbassadorContractSummary | null;
}

const METHOD_OPTIONS = [
  { label: "Mobile Money", value: "mobile_money" },
  { label: "Espèces", value: "cash" },
  { label: "Virement", value: "bank_transfer" },
];
const METHOD_LABEL: Record<string, string> = Object.fromEntries(
  METHOD_OPTIONS.map((o) => [o.value, o.label]),
);

const route = useRoute();
const userId = computed(() => String(route.params.id));

const { get, post } = useApi();
const toast = useToast();
const pdf = usePdf();

const detail = ref<AmbassadorDetail | null>(null);
const loading = ref(true);
const openingPdf = ref(false);

const fcfa = (n: number) => Number(n ?? 0).toLocaleString("fr-FR");

const balanceTone = computed(() => {
  const t = detail.value?.totals;
  if (t?.is_suspended) {
    return {
      card: "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-300",
    };
  }
  if ((t?.balance_due ?? 0) > 0) {
    return {
      card: "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
    };
  }
  return {
    card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  };
});

function statusStyle(sale: AmbassadorSaleItem) {
  if (sale.status === "settled") {
    return {
      label: "Reversé",
      class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      dot: "bg-emerald-500",
    };
  }
  if (sale.is_overdue) {
    return {
      label: "En retard",
      class: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
      dot: "bg-red-500",
    };
  }
  if (sale.status === "partial") {
    return {
      label: "Partiel",
      class: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      dot: "bg-sky-500",
    };
  }
  return {
    label: "À reverser",
    class: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  };
}

async function load() {
  loading.value = true;
  try {
    const res = await get<any>(`/v1/referrals/admin/ambassadors/${userId.value}`);
    detail.value = res.data ?? null;
  } catch {
    toast.add({ severity: "error", summary: "Ambassadeur introuvable", life: 3000 });
    navigateTo("/admin/referrals");
  } finally {
    loading.value = false;
  }
}

async function openContract() {
  if (!detail.value?.contract) return;
  openingPdf.value = true;
  try {
    await pdf.open(`/v1/ambassador-contracts/${detail.value.contract.id}/pdf`);
  } catch {
    toast.add({ severity: "error", summary: "Impossible d'ouvrir le contrat", life: 3000 });
  } finally {
    openingPdf.value = false;
  }
}

// ── Reversement ──
const remittanceOpen = ref(false);
const savingRemittance = ref(false);
const remittance = ref({
  amount: null as number | null,
  method: "mobile_money",
  paid_at: "",
  reference: "",
  note: "",
});

function openRemittanceForm() {
  remittance.value = {
    amount: detail.value?.totals.balance_due || null,
    method: "mobile_money",
    paid_at: new Date().toISOString().slice(0, 10),
    reference: "",
    note: "",
  };
  remittanceOpen.value = true;
}

async function submitRemittance() {
  if (!remittance.value.amount || !remittance.value.paid_at) return;
  savingRemittance.value = true;
  try {
    await post<any>(`/v1/referrals/admin/ambassadors/${userId.value}/remittances`, {
      amount: remittance.value.amount,
      method: remittance.value.method,
      paid_at: remittance.value.paid_at,
      reference: remittance.value.reference || null,
      note: remittance.value.note || null,
    });
    toast.add({ severity: "success", summary: "Reversement enregistré", life: 3000 });
    remittanceOpen.value = false;
    await load();
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Échec de l'enregistrement",
      detail: err?.data?.message || err?.data?.detail,
      life: 4000,
    });
  } finally {
    savingRemittance.value = false;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

onMounted(load);

useHead({ title: () => (detail.value ? `${detail.value.name} | Ambassadeurs` : "Ambassadeur | Admin") });
</script>