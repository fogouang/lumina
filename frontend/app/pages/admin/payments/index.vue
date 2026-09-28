<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6">
      <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Paiements</h1>
      <p class="mt-0.5 text-sm text-muted">Historique de tous les paiements</p>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="flex items-center gap-3.5 rounded-card border border-line bg-card p-4 shadow-soft">
        <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary">
          <i class="pi pi-receipt" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold uppercase tracking-wider text-faint">Total paiements</p>
          <p class="font-heading text-2xl font-extrabold tabular-nums text-ink">
            {{ stats?.total_payments ?? 0 }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3.5 rounded-card border border-line bg-card p-4 shadow-soft">
        <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <i class="pi pi-wallet" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold uppercase tracking-wider text-faint">Revenus (FCFA)</p>
          <p class="font-heading text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
            {{ stats?.total_revenue?.toLocaleString("fr-FR") ?? 0 }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3.5 rounded-card border border-line bg-card p-4 shadow-soft">
        <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          <i class="pi pi-clock" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold uppercase tracking-wider text-faint">En attente</p>
          <p class="font-heading text-2xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
            {{ stats?.pending_count ?? 0 }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row">
      <IconField class="w-full sm:w-72">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Rechercher une référence..."
          aria-label="Rechercher une référence"
          fluid
        />
      </IconField>
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Statut"
        aria-label="Filtrer par statut"
        class="w-full sm:w-44"
      />
    </div>

    <!-- Tableau -->
    <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
      <DataTable
        :value="filteredPayments"
        :loading="loading"
        striped-rows
        size="small"
        paginator
        :rows="20"
      >
        <template #empty>
          <div class="flex flex-col items-center py-12 text-center">
            <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
              <i class="pi pi-receipt text-2xl" />
            </span>
            <p class="text-sm font-medium text-muted">Aucun paiement trouvé.</p>
          </div>
        </template>

        <Column field="invoice_number" header="Facture" style="min-width: 140px">
          <template #body="{ data }">
            <span class="font-mono text-xs font-semibold text-ink">{{ data.invoice_number }}</span>
          </template>
        </Column>

        <Column header="Utilisateur" style="min-width: 200px">
          <template #body="{ data }">
            <span class="text-sm" :class="data.user_email ? 'text-ink' : 'text-faint'">
              {{ data.user_email ?? "—" }}
            </span>
          </template>
        </Column>

        <Column header="Montant" style="min-width: 120px">
          <template #body="{ data }">
            <span class="text-sm tabular-nums text-muted">
              {{ data.amount?.toLocaleString("fr-FR") }} FCFA
            </span>
          </template>
        </Column>

        <Column header="Payé" style="min-width: 120px">
          <template #body="{ data }">
            <span
              class="font-heading text-sm font-bold tabular-nums"
              :class="
                (data.amount_paid ?? 0) < (data.amount ?? 0)
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-ink'
              "
            >
              {{ data.amount_paid?.toLocaleString("fr-FR") }} FCFA
            </span>
          </template>
        </Column>

        <Column header="Méthode" style="min-width: 110px">
          <template #body="{ data }">
            <span
              class="inline-flex rounded-lg border border-line bg-card-2 px-2 py-0.5 text-xs font-semibold capitalize text-muted"
            >
              {{ data.payment_method }}
            </span>
          </template>
        </Column>

        <Column header="Statut" style="min-width: 110px">
          <template #body="{ data }">
            <Tag :value="data.payment_status" :severity="statusSeverity(data.payment_status)" rounded />
          </template>
        </Column>

        <Column header="Date" style="min-width: 140px">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-1.5 text-sm text-muted">
              <i class="pi pi-calendar text-xs text-faint" />
              {{ formatDate(data.created_at) }}
            </span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const payments = ref<any[]>([]);
const stats = ref<any>(null);
const search = ref("");
const statusFilter = ref("all");

const statusOptions = [
  { label: "Tous", value: "all" },
  { label: "Complétés", value: "COMPLETED" },
  { label: "En attente", value: "PENDING" },
  { label: "Échoués", value: "FAILED" },
];

const filteredPayments = computed(() =>
  payments.value.filter((p) => {
    const matchStatus =
      statusFilter.value === "all" || p.payment_status === statusFilter.value;
    const matchSearch =
      !search.value ||
      p.invoice_number?.toLowerCase().includes(search.value.toLowerCase());
    return matchStatus && matchSearch;
  }),
);

async function fetchData() {
  loading.value = true;
  try {
    const [paymentsRes, statsRes] = await Promise.all([
      get<any>("/v1/payments/admin/all"),
      get<any>("/v1/payments/admin/stats"),
    ]);
    payments.value = paymentsRes.data ?? [];
    stats.value = statsRes.data ?? null;
  } catch {
    toast.add({ severity: "error", summary: "Erreur de chargement", life: 3000 });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);

function statusSeverity(status: string): string {
  return (
    { COMPLETED: "success", PENDING: "warn", FAILED: "danger" }[status] ??
    "secondary"
  );
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

useHead({ title: "Paiements | Admin Lumina" });
</script>