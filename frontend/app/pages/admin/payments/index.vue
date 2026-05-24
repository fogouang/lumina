<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Paiements</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          Historique de tous les paiements
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">Total paiements</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ stats?.total_payments ?? 0 }}
        </p>
      </div>
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">Revenus (FCFA)</p>
        <p class="text-2xl font-bold text-green-600">
          {{ stats?.total_revenue?.toLocaleString("fr-FR") ?? 0 }}
        </p>
      </div>
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">En attente</p>
        <p class="text-2xl font-bold text-amber-500">
          {{ stats?.pending_count ?? 0 }}
        </p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <InputText
        v-model="search"
        placeholder="Rechercher une référence..."
        class="w-64"
      />
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Statut"
        class="w-40"
      />
    </div>

    <!-- Table -->
    <div class="bg-(--bg-card) border border-(--border-color) rounded-xl overflow-hidden">
      <DataTable
        :value="filteredPayments"
        :loading="loading"
        striped-rows
        size="small"
        paginator
        :rows="20"
      >
        <Column field="invoice_number" header="Facture" />
        <Column header="Utilisateur">
          <template #body="{ data }">
            <span>{{ data.user_email ?? "—" }}</span>
          </template>
        </Column>
        <Column header="Montant">
          <template #body="{ data }">
            {{ data.amount?.toLocaleString("fr-FR") }} FCFA
          </template>
        </Column>
        <Column header="Payé">
          <template #body="{ data }">
            {{ data.amount_paid?.toLocaleString("fr-FR") }} FCFA
          </template>
        </Column>
        <Column header="Méthode">
          <template #body="{ data }">
            <Tag
              :value="data.payment_method"
              severity="secondary"
            />
          </template>
        </Column>
        <Column header="Statut">
          <template #body="{ data }">
            <Tag
              :value="data.payment_status"
              :severity="statusSeverity(data.payment_status)"
            />
          </template>
        </Column>
        <Column header="Date">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
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