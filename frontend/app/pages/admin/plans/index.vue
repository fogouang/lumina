<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">
          Plans tarifaires
        </h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          Gérer les plans d'abonnement
        </p>
      </div>
      <Button
        label="Nouveau plan"
        icon="pi pi-plus"
        class="bg-gradient-primary border-none font-bold"
        @click="openCreate"
      />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">Total plans</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ plans.length }}
        </p>
      </div>
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">Actifs</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ plans.filter((p) => p.is_active).length }}
        </p>
      </div>
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">Plans B2C</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ plans.filter((p) => p.type === "b2c").length }}
        </p>
      </div>
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
        <p class="text-xs text-(--text-tertiary)">Plans B2B</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ plans.filter((p) => p.type !== "b2c").length }}
        </p>
      </div>
    </div>

    <!-- Filtres -->
    <div class="flex gap-3 mb-6 flex-wrap">
      <Select
        v-model="typeFilter"
        :options="typeOptions"
        option-label="label"
        option-value="value"
        placeholder="Tous les types"
        class="w-48"
      />
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Statut"
        class="w-36"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <Skeleton v-for="i in 3" :key="i" height="320px" border-radius="12px" />
    </div>

    <!-- Grid plans -->
    <div
      v-else-if="filteredPlans.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="bg-(--bg-card) border border-(--border-color) rounded-xl flex flex-col"
        :class="{ 'opacity-60': !plan.is_active }"
      >
        <!-- Header card -->
        <div class="p-5 border-b border-(--border-color)">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="font-bold text-(--text-primary)">{{ plan.name }}</h3>
              <p
                v-if="plan.description"
                class="text-sm text-(--text-tertiary) mt-0.5"
              >
                {{ plan.description }}
              </p>
            </div>
            <Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              size="small"
              severity="secondary"
              @click="(e) => toggleMenu(e, plan)"
            />
          </div>
          <div class="flex gap-2 flex-wrap">
            <Tag
              :value="typeLabel(plan.type)"
              :severity="typeSeverity(plan.type)"
            />
            <Tag
              :value="plan.is_active ? 'Actif' : 'Inactif'"
              :severity="plan.is_active ? 'success' : 'secondary'"
            />
          </div>
        </div>

        <!-- Prix -->
        <div class="p-5 text-center bg-(--bg-ground)">
          <p class="text-3xl font-bold text-(--text-primary)">
            {{ plan.price.toLocaleString("fr-FR") }} F
          </p>
          <p class="text-sm text-(--text-tertiary) mt-1">
            {{ plan.duration_days }} jours
          </p>
        </div>

        <!-- Infos -->
        <div class="p-5 flex flex-col gap-3 flex-1">
          <div class="flex items-center gap-3">
            <i class="pi pi-calendar text-(--text-tertiary) text-sm" />
            <div>
              <p class="text-sm font-medium text-(--text-primary)">Durée</p>
              <p class="text-xs text-(--text-tertiary)">
                {{ plan.duration_days }} jours
                <span v-if="plan.duration_days >= 30"
                  >(~{{ Math.floor(plan.duration_days / 30) }} mois)</span
                >
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <i class="pi pi-sparkles text-purple-500 text-sm" />
            <div>
              <p class="text-sm font-medium text-(--text-primary)">
                Crédits IA
              </p>
              <p class="text-xs text-(--text-tertiary)">
                {{ plan.ai_credits }} crédits
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-5 pt-0">
          <Button
            label="Modifier"
            icon="pi pi-pencil"
            outlined
            class="w-full"
            @click="openEdit(plan)"
          />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-16 text-(--text-tertiary)">
      <i class="pi pi-credit-card text-4xl mb-3 block opacity-30" />
      <p>Aucun plan trouvé.</p>
    </div>

    <!-- Menu contextuel -->
    <Menu ref="menuRef" :model="menuItems" popup />

    <!-- Dialog créer/modifier -->
    <Dialog
      v-model:visible="formVisible"
      :header="editingPlan ? 'Modifier le plan' : 'Nouveau plan'"
      modal
      :style="{ width: '520px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Nom</label
            >
            <InputText v-model="form.name" placeholder="Pack Essentiel" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Type</label
            >
            <Select
              v-model="form.type"
              :options="typeOptions.filter((t) => t.value !== 'all')"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Description</label
          >
          <InputText
            v-model="form.description"
            placeholder="Description du plan..."
            fluid
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Prix (FCFA)</label
            >
            <InputNumber v-model="form.price" :min="0" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Durée (jours)</label
            >
            <InputNumber v-model="form.duration_days" :min="1" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Crédits IA</label
          >
          <InputNumber v-model="form.ai_credits" :min="0" fluid />
        </div>

        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="form.is_active" inputId="plan-active" />
          <label for="plan-active" class="text-sm text-(--text-secondary)"
            >Plan actif</label
          >
        </div>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="formVisible = false" />
        <Button
          :label="editingPlan ? 'Enregistrer' : 'Créer'"
          :loading="saving"
          class="bg-gradient-primary border-none font-bold"
          @click="onSave"
        />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog
      v-model:visible="deleteVisible"
      header="Supprimer le plan"
      modal
      :style="{ width: '400px' }"
      :draggable="false"
    >
      <p class="text-(--text-secondary)">
        Supprimer le plan <strong>{{ selectedPlan?.name }}</strong> ? Cette
        action est irréversible.
      </p>
      <template #footer>
        <Button label="Annuler" text @click="deleteVisible = false" />
        <Button
          label="Supprimer"
          severity="danger"
          icon="pi pi-trash"
          :loading="saving"
          @click="onDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { PlanListResponse } from "#shared/api/models/PlanListResponse";
import type { SuccessResponse_list_PlanListResponse__ } from "#shared/api/models/SuccessResponse_list_PlanListResponse__";
import type { SuccessResponse_PlanResponse_ } from "#shared/api/models/SuccessResponse_PlanResponse_";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get, post, patch, del } = useApi();
const toast = useToast();
const menuRef = ref();

const loading = ref(true);
const saving = ref(false);
const plans = ref<PlanListResponse[]>([]);

const typeFilter = ref<string>("all");
const statusFilter = ref<string>("all");

const typeOptions = [
  { label: "Tous les types", value: "all" },
  { label: "B2C - Individuel", value: "b2c" },
  { label: "B2B - Centre", value: "b2b_center" },
  { label: "B2B - Revendeur", value: "b2b_reseller" },
];

const statusOptions = [
  { label: "Tous", value: "all" },
  { label: "Actifs", value: "active" },
  { label: "Inactifs", value: "inactive" },
];

const filteredPlans = computed(() =>
  plans.value.filter((p) => {
    const matchType = typeFilter.value === "all" || p.type === typeFilter.value;
    const matchStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "active" && p.is_active) ||
      (statusFilter.value === "inactive" && !p.is_active);
    return matchType && matchStatus;
  }),
);

async function fetchPlans() {
  loading.value = true;
  try {
    const res = await get<SuccessResponse_list_PlanListResponse__>(
      "/v1/plans?active_only=false",
    );
    plans.value = res.data ?? [];
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

onMounted(fetchPlans);

function typeLabel(type: string): string {
  return (
    { b2c: "B2C", b2b_center: "B2B Centre", b2b_reseller: "B2B Revendeur" }[
      type
    ] ?? type
  );
}

function typeSeverity(type: string): string {
  return (
    { b2c: "info", b2b_center: "warning", b2b_reseller: "secondary" }[type] ??
    "secondary"
  );
}

// ── Menu ─────────────────────────────────────────────────────
const selectedPlan = ref<PlanListResponse | null>(null);

const menuItems = computed(() => [
  {
    label: "Modifier",
    icon: "pi pi-pencil",
    command: () => openEdit(selectedPlan.value!),
  },
  { separator: true },
  {
    label: "Supprimer",
    icon: "pi pi-trash",
    command: () => {
      deleteVisible.value = true;
    },
  },
]);

function toggleMenu(event: MouseEvent, plan: PlanListResponse) {
  selectedPlan.value = plan;
  menuRef.value?.toggle(event);
}

// ── Formulaire ────────────────────────────────────────────────
const formVisible = ref(false);
const editingPlan = ref<PlanListResponse | null>(null);
const form = reactive({
  name: "",
  description: "",
  type: "b2c",
  price: 0,
  duration_days: 30,
  ai_credits: 0,
  is_active: true,
});

function openCreate() {
  editingPlan.value = null;
  Object.assign(form, {
    name: "",
    description: "",
    type: "b2c",
    price: 0,
    duration_days: 30,
    ai_credits: 0,
    is_active: true,
  });
  formVisible.value = true;
}

function openEdit(plan: PlanListResponse) {
  editingPlan.value = plan;
  Object.assign(form, {
    name: plan.name,
    description: plan.description ?? "",
    type: plan.type,
    price: plan.price,
    duration_days: plan.duration_days,
    ai_credits: plan.ai_credits,
    is_active: plan.is_active,
  });
  formVisible.value = true;
}

async function onSave() {
  saving.value = true;
  try {
    if (editingPlan.value) {
      await patch<SuccessResponse_PlanResponse_>(
        `/v1/plans/${editingPlan.value.id}`,
        {
          name: form.name,
          description: form.description || null,
          price: form.price,
          duration_days: form.duration_days,
          ai_credits: form.ai_credits,
          is_active: form.is_active,
        },
      );
      toast.add({ severity: "success", summary: "Plan modifié", life: 3000 });
    } else {
      await post<SuccessResponse_PlanResponse_>("/v1/plans", {
        name: form.name,
        description: form.description || null,
        type: form.type,
        price: form.price,
        duration_days: form.duration_days,
        ai_credits: form.ai_credits,
        is_active: form.is_active,
      });
      toast.add({ severity: "success", summary: "Plan créé", life: 3000 });
    }
    formVisible.value = false;
    await fetchPlans();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

// ── Supprimer ─────────────────────────────────────────────────
const deleteVisible = ref(false);

async function onDelete() {
  if (!selectedPlan.value) return;
  saving.value = true;
  try {
    await del(`/v1/plans/${selectedPlan.value.id}`);
    toast.add({ severity: "success", summary: "Plan supprimé", life: 3000 });
    deleteVisible.value = false;
    await fetchPlans();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

useHead({ title: "Plans | Admin Lumina" });
</script>
