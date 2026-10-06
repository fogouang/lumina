<template>
  <div class="space-y-8">
    <!-- ── Ambassadeurs ─────────────────────────────────────── -->
    <section>
      <div class="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Ambassadeurs</h1>
          <p class="mt-0.5 text-sm text-muted">
            <span class="font-semibold text-ink tabular-nums">{{ ambassadors.length }}</span>
            ambassadeur(s) actif(s)
            <template v-if="totalBalance > 0">
              · <span class="font-semibold text-amber-600 tabular-nums dark:text-amber-400">{{ fcfa(totalBalance) }} FCFA</span>
              à recouvrer
            </template>
            <template v-if="suspendedCount > 0">
              · <span class="font-semibold text-red-600 dark:text-red-400">{{ suspendedCount }} suspendu(s)</span>
            </template>
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
          row-hover
          class="p-datatable-sm cursor-pointer"
          @row-click="(e) => goToDetail(e.data.user_id)"
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
                  class="grid size-9 shrink-0 place-items-center rounded-leaf bg-accent-100 font-heading text-xs font-bold text-accent-800 uppercase dark:bg-accent-500/15 dark:text-accent-300"
                >
                  {{ data.name?.charAt(0) ?? "?" }}
                </span>
                <div class="min-w-0">
                  <p class="flex items-center gap-2 truncate text-sm leading-tight font-semibold text-ink">
                    {{ data.name }}
                    <span
                      v-if="data.is_suspended"
                      class="rounded-full bg-red-100 px-2 py-0.5 text-[0.6875rem] font-bold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                    >
                      Suspendu
                    </span>
                    <span
                      v-else-if="!data.has_contract"
                      class="rounded-full bg-amber-100 px-2 py-0.5 text-[0.6875rem] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    >
                      Sans contrat
                    </span>
                  </p>
                  <p class="truncate text-xs text-muted">
                    {{ data.email }} · <span class="font-mono">{{ data.referral_code }}</span>
                  </p>
                </div>
              </div>
            </template>
          </Column>

          <Column field="commission_rate" header="Taux" sortable style="min-width: 80px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-ink tabular-nums">
                {{ data.commission_rate != null ? `${data.commission_rate} %` : "—" }}
              </span>
            </template>
          </Column>

          <Column field="sales_count" header="Ventes" sortable style="min-width: 80px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-ink tabular-nums">{{ data.sales_count }}</span>
            </template>
          </Column>

          <Column field="total_collected" header="Encaissé" sortable style="min-width: 120px">
            <template #body="{ data }">
              <span class="text-sm text-ink tabular-nums">{{ fcfa(data.total_collected) }}</span>
            </template>
          </Column>

          <Column field="total_remitted" header="Reversé" sortable style="min-width: 120px">
            <template #body="{ data }">
              <span class="text-sm text-ink tabular-nums">{{ fcfa(data.total_remitted) }}</span>
            </template>
          </Column>

          <Column field="balance_due" header="Reste dû" sortable style="min-width: 140px">
            <template #body="{ data }">
              <span
                class="inline-flex rounded-full px-2.5 py-1 font-heading text-xs font-bold tabular-nums"
                :class="
                  data.is_suspended
                    ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                    : data.balance_due > 0
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                "
              >
                {{ fcfa(data.balance_due) }} FCFA
              </span>
            </template>
          </Column>

          <Column header="" style="width: 1%">
            <template #body="{ data }">
              <NuxtLink
                :to="`/admin/referrals/${data.user_id}`"
                class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
                @click.stop
              >
                Voir
                <i class="pi pi-angle-right text-xs" />
              </NuxtLink>
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

          <Column field="referrer_name" header="Ambassadeur" sortable style="min-width: 160px">
            <template #body="{ data }">
              <span class="text-sm font-semibold text-ink">{{ data.referrer_name }}</span>
            </template>
          </Column>

          <Column field="referred_name" header="Client" sortable style="min-width: 160px">
            <template #body="{ data }">
              <span class="text-sm text-muted">{{ data.referred_name }}</span>
            </template>
          </Column>

          <Column field="plan_name" header="Forfait" sortable style="min-width: 140px">
            <template #body="{ data }">
              <span class="text-sm text-ink">{{ data.plan_name ?? "—" }}</span>
            </template>
          </Column>

          <Column field="collected_by_ambassador" header="Type" sortable style="min-width: 120px">
            <template #body="{ data }">
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="data.collected_by_ambassador ? 'bg-primary/10 text-primary' : 'bg-card-2 text-muted'"
              >
                {{ data.collected_by_ambassador ? "Vente directe" : "Lien" }}
              </span>
            </template>
          </Column>

          <Column field="sale_amount" header="Vente" sortable style="min-width: 120px">
            <template #body="{ data }">
              <span class="text-sm text-ink tabular-nums">{{ fcfa(data.sale_amount) }} FCFA</span>
            </template>
          </Column>

          <Column field="amount" header="Commission" sortable style="min-width: 130px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 tabular-nums dark:bg-emerald-500/15 dark:text-emerald-300"
              >
                +{{ fcfa(data.amount) }} FCFA
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

const totalBalance = computed(() =>
  ambassadors.value.reduce((sum, a) => sum + Number(a.balance_due ?? 0), 0),
);
const suspendedCount = computed(() => ambassadors.value.filter((a) => a.is_suspended).length);

const fcfa = (n: number) => Number(n ?? 0).toLocaleString("fr-FR");

function goToDetail(userId: string) {
  navigateTo(`/admin/referrals/${userId}`);
}

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

useHead({ title: "Ambassadeurs | Admin" });
</script>