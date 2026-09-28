<template>
  <div class="space-y-8">
    <!-- ── Ambassadeurs ─────────────────────────────────────── -->
    <section>
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Ambassadeurs</h1>
          <p class="mt-0.5 text-sm text-muted">
            <span class="font-semibold tabular-nums text-ink">{{ ambassadors.length }}</span>
            ambassadeur(s) actif(s)
          </p>
        </div>
        <Button
          icon="pi pi-refresh"
          outlined
          rounded
          aria-label="Actualiser les ambassadeurs"
          :loading="loadingAmbassadors"
          @click="fetchAmbassadors"
        />
      </div>

      <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
        <DataTable
          :value="ambassadors"
          :loading="loadingAmbassadors"
          paginator
          :rows="10"
          striped-rows
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="flex flex-col items-center py-12 text-center">
              <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                <i class="pi pi-star text-2xl" />
              </span>
              <p class="text-sm font-medium text-muted">Aucun ambassadeur pour l'instant.</p>
            </div>
          </template>

          <Column field="name" header="Ambassadeur" sortable style="min-width: 220px">
            <template #body="{ data }">
              <div class="flex items-center gap-3">
                <span
                  class="grid size-9 shrink-0 place-items-center rounded-leaf bg-accent-100 font-heading text-xs font-bold uppercase text-accent-800 dark:bg-accent-500/15 dark:text-accent-300"
                >
                  {{ data.name?.charAt(0) ?? "?" }}
                </span>
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold leading-tight text-ink">{{ data.name }}</p>
                  <p class="truncate text-xs text-muted">{{ data.email }}</p>
                </div>
              </div>
            </template>
          </Column>

          <Column field="referral_code" header="Code" style="min-width: 120px">
            <template #body="{ data }">
              <span
                class="inline-flex rounded-lg border border-line bg-card-2 px-2 py-1 font-mono text-xs font-semibold tracking-wide text-ink"
              >
                {{ data.referral_code }}
              </span>
            </template>
          </Column>

          <Column field="referred_count" header="Filleuls" sortable style="min-width: 100px">
            <template #body="{ data }">
              <span class="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink">
                <i class="pi pi-users text-xs text-faint" />
                {{ data.referred_count }}
              </span>
            </template>
          </Column>

          <Column field="total_earnings" header="Gains cumulés" sortable style="min-width: 150px">
            <template #body="{ data }">
              <span class="font-heading text-sm font-bold tabular-nums text-primary">
                {{ Number(data.total_earnings).toLocaleString("fr-FR") }} FCFA
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </section>

    <!-- ── Historique des gains ─────────────────────────────── -->
    <section>
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 class="font-heading text-lg font-bold text-ink">Historique des gains</h2>
          <p class="mt-0.5 text-sm text-muted">
            Activations et paiements ayant généré une commission
          </p>
        </div>
        <Button
          icon="pi pi-refresh"
          outlined
          rounded
          aria-label="Actualiser l'historique"
          :loading="loadingEarnings"
          @click="fetchEarnings"
        />
      </div>

      <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
        <DataTable
          :value="earnings"
          :loading="loadingEarnings"
          paginator
          :rows="20"
          striped-rows
          class="p-datatable-sm"
        >
          <template #empty>
            <div class="flex flex-col items-center py-12 text-center">
              <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                <i class="pi pi-wallet text-2xl" />
              </span>
              <p class="text-sm font-medium text-muted">Aucun gain enregistré pour l'instant.</p>
            </div>
          </template>

          <Column field="referrer_name" header="Ambassadeur" sortable style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-ink">{{ data.referrer_name }}</span>
            </template>
          </Column>

          <Column field="referred_name" header="Filleul" sortable style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-sm text-muted">{{ data.referred_name }}</span>
            </template>
          </Column>

          <Column field="amount" header="Montant" sortable style="min-width: 130px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              >
                +{{ Number(data.amount).toLocaleString("fr-FR") }} FCFA
              </span>
            </template>
          </Column>

          <Column field="created_at" header="Date" sortable style="min-width: 150px">
            <template #body="{ data }">
              <span class="inline-flex items-center gap-1.5 text-sm text-muted">
                <i class="pi pi-calendar text-xs text-faint" />
                {{ formatDate(data.created_at) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const { get } = useApi();
const toast = useToast();

const ambassadors = ref<any[]>([]);
const earnings = ref<any[]>([]);
const loadingAmbassadors = ref(true);
const loadingEarnings = ref(true);

async function fetchAmbassadors() {
  loadingAmbassadors.value = true;
  try {
    const res = await get<any>("/v1/referrals/admin/ambassadors");
    ambassadors.value = res.data ?? [];
  } catch {
    toast.add({ severity: "error", summary: "Erreur de chargement", life: 3000 });
  } finally {
    loadingAmbassadors.value = false;
  }
}

async function fetchEarnings() {
  loadingEarnings.value = true;
  try {
    const res = await get<any>("/v1/referrals/admin/earnings");
    earnings.value = res.data ?? [];
  } catch {
    toast.add({ severity: "error", summary: "Erreur de chargement", life: 3000 });
  } finally {
    loadingEarnings.value = false;
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

onMounted(() => {
  fetchAmbassadors();
  fetchEarnings();
});

useHead({ title: "Ambassadeurs | Admin Lumina" });
</script>