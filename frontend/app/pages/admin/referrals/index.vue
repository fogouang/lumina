<template>
  <div>
    <!-- Ambassadeurs -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Ambassadeurs</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          {{ ambassadors.length }} ambassadeur(s) actif(s)
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        outlined
        size="small"
        :loading="loadingAmbassadors"
        @click="fetchAmbassadors"
      />
    </div>

    <DataTable
      :value="ambassadors"
      :loading="loadingAmbassadors"
      paginator
      :rows="10"
      striped-rows
      class="p-datatable-sm mb-8"
    >
      <template #empty>
        <div class="text-center py-10 text-(--text-tertiary)">
          <i class="pi pi-star text-4xl mb-3 block opacity-30" />
          <p>Aucun ambassadeur pour l'instant.</p>
        </div>
      </template>

      <Column field="name" header="Ambassadeur" sortable style="min-width: 200px">
        <template #body="{ data }">
          <div>
            <p class="text-sm font-semibold text-(--text-primary) leading-tight">
              {{ data.name }}
            </p>
            <p class="text-xs text-(--text-tertiary)">{{ data.email }}</p>
          </div>
        </template>
      </Column>

      <Column field="referral_code" header="Code" style="min-width: 110px">
        <template #body="{ data }">
          <span class="text-xs font-mono bg-(--bg-ground) px-2 py-1 rounded">
            {{ data.referral_code }}
          </span>
        </template>
      </Column>

      <Column field="referred_count" header="Filleuls" sortable style="min-width: 100px" />

      <Column field="total_earnings" header="Gains cumulés" sortable style="min-width: 140px">
        <template #body="{ data }">
          <span class="font-semibold text-primary-700">
            {{ data.total_earnings }} FCFA
          </span>
        </template>
      </Column>
    </DataTable>

    <!-- Historique des gains -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-bold text-(--text-primary)">Historique des gains</h2>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          Activations et paiements ayant généré une commission
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        outlined
        size="small"
        :loading="loadingEarnings"
        @click="fetchEarnings"
      />
    </div>

    <DataTable
      :value="earnings"
      :loading="loadingEarnings"
      paginator
      :rows="20"
      striped-rows
      class="p-datatable-sm"
    >
      <template #empty>
        <div class="text-center py-10 text-(--text-tertiary)">
          <i class="pi pi-wallet text-4xl mb-3 block opacity-30" />
          <p>Aucun gain enregistré pour l'instant.</p>
        </div>
      </template>

      <Column field="referrer_name" header="Ambassadeur" sortable style="min-width: 180px" />
      <Column field="referred_name" header="Filleul" sortable style="min-width: 180px" />
      <Column field="amount" header="Montant" sortable style="min-width: 120px">
        <template #body="{ data }">
          <span class="font-semibold text-primary-700">
            {{ data.amount }} FCFA
          </span>
        </template>
      </Column>
      <Column field="created_at" header="Date" sortable style="min-width: 150px">
        <template #body="{ data }">
          {{ formatDate(data.created_at) }}
        </template>
      </Column>
    </DataTable>
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