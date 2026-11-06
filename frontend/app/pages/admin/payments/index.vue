<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Paiements</h1>
        <p class="mt-0.5 text-sm text-muted">Historique de tous les paiements</p>
      </div>
      <AppButton
        icon="pi pi-refresh"
        variant="ghost"
        aria-label="Actualiser"
        :loading="loading"
        @click="fetchData"
      />
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
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <IconField class="w-full sm:w-80">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Référence, nom, email ou téléphone..."
          aria-label="Rechercher un paiement"
          fluid
        />
      </IconField>
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        aria-label="Filtrer par statut"
        class="w-full sm:w-44"
      />
      <Select
        v-model="methodFilter"
        :options="methodOptions"
        option-label="label"
        option-value="value"
        aria-label="Filtrer par méthode"
        class="w-full sm:w-44"
      />
      <p class="text-sm text-muted sm:ml-auto">
        <span class="font-semibold tabular-nums text-ink">{{ filteredPayments.length }}</span>
        résultat{{ filteredPayments.length > 1 ? "s" : "" }}
      </p>
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

        <Column field="invoice_number" header="Facture" style="min-width: 150px">
          <template #body="{ data }">
            <span class="font-mono text-xs font-semibold text-ink">{{ data.invoice_number }}</span>
          </template>
        </Column>

        <Column header="Utilisateur" style="min-width: 220px">
          <template #body="{ data }">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">{{ data.user_name ?? "Inconnu" }}</p>
              <a
                v-if="data.user_phone"
                :href="`https://wa.me/${data.user_phone.replace('+', '')}`"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 text-xs text-green-700 hover:underline dark:text-green-400"
              >
                <i class="pi pi-whatsapp text-[0.7rem]" />
                {{ data.user_phone }}
              </a>
              <p v-else-if="data.user_email" class="truncate text-xs text-faint">{{ data.user_email }}</p>
            </div>
          </template>
        </Column>

        <Column header="Montant" style="min-width: 110px">
          <template #body="{ data }">
            <span class="text-sm tabular-nums text-muted">
              {{ data.amount?.toLocaleString("fr-FR") }} FCFA
            </span>
          </template>
        </Column>

        <Column header="Payé" style="min-width: 110px">
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

        <Column header="Méthode" style="min-width: 150px">
          <template #body="{ data }">
            <span
              class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card-2 px-2 py-0.5 text-xs font-semibold text-muted"
            >
              <i :class="[methodIcon(data.payment_method), 'text-[0.7rem]']" />
              {{ methodLabel(data) }}
            </span>
          </template>
        </Column>

        <Column header="Statut" style="min-width: 110px">
          <template #body="{ data }">
            <Tag
              :value="statusLabel(data.payment_status)"
              :severity="statusSeverity(data.payment_status)"
              rounded
            />
          </template>
        </Column>

        <Column header="Date" style="min-width: 150px">
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
import { site } from "~/config/site";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get } = useApi();
const toast = useToast();

const loading = ref(true);
const payments = ref<any[]>([]);
const stats = ref<any>(null);
const search = ref("");
const statusFilter = ref("all");
const methodFilter = ref("all");

// Valeurs identiques à celles renvoyées par le backend (minuscules)
const STATUS: Record<string, { label: string; severity: string }> = {
  completed: { label: "Payé", severity: "success" },
  pending: { label: "En attente", severity: "warn" },
  failed: { label: "Échoué", severity: "danger" },
};

const METHOD: Record<string, { label: string; icon: string }> = {
  mobile_money: { label: "Mobile Money", icon: "pi pi-mobile" },
  bank_transfer: { label: "Virement", icon: "pi pi-building-columns" },
  card: { label: "Carte", icon: "pi pi-credit-card" },
};

const statusOptions = [
  { label: "Tous les statuts", value: "all" },
  { label: "Payés", value: "completed" },
  { label: "En attente", value: "pending" },
  { label: "Échoués", value: "failed" },
];

const methodOptions = [
  { label: "Toutes méthodes", value: "all" },
  { label: "Mobile Money", value: "mobile_money" },
  { label: "Virement", value: "bank_transfer" },
  { label: "Carte", value: "card" },
];

const filteredPayments = computed(() => {
  const q = search.value.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");

  return payments.value.filter((p) => {
    const status = String(p.payment_status ?? "").toLowerCase();
    const method = String(p.payment_method ?? "").toLowerCase();

    if (statusFilter.value !== "all" && status !== statusFilter.value) return false;
    if (methodFilter.value !== "all" && method !== methodFilter.value) return false;
    if (!q) return true;

    const matchText = [p.invoice_number, p.user_name, p.user_email]
      .filter(Boolean)
      .some((v: string) => v.toLowerCase().includes(q));
    const matchPhone =
      qDigits.length >= 3 && String(p.user_phone ?? "").replace(/\D/g, "").includes(qDigits);

    return matchText || matchPhone;
  });
});

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

function statusLabel(status: string): string {
  return STATUS[String(status).toLowerCase()]?.label ?? status;
}

function statusSeverity(status: string): string {
  return STATUS[String(status).toLowerCase()]?.severity ?? "secondary";
}

function methodIcon(method: string): string {
  return METHOD[String(method).toLowerCase()]?.icon ?? "pi pi-wallet";
}

function methodLabel(p: any): string {
  const base = METHOD[String(p.payment_method).toLowerCase()]?.label ?? p.payment_method;
  if (p.payment_method === "mobile_money" && p.operator) {
    return `${base} · ${p.operator === "ORANGE" ? "Orange" : p.operator}`;
  }
  return base;
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

useHead({ title: `Paiements | Admin ${site.name}` });
</script>