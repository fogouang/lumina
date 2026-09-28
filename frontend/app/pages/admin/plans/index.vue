<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Plans tarifaires</h1>
        <p class="mt-0.5 text-sm text-muted">Gérer les plans d'abonnement</p>
      </div>
      <AppButton label="Nouveau plan" icon="pi pi-plus" variant="gradient" @click="openCreate" />
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="stat in [
          { label: 'Total plans', value: plans.length, icon: 'pi pi-credit-card', tone: 'bg-primary/10 text-primary' },
          { label: 'Actifs', value: plans.filter((p) => p.is_active).length, icon: 'pi pi-check-circle', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
          { label: 'Plans B2C', value: plans.filter((p) => p.type === 'b2c').length, icon: 'pi pi-user', tone: 'bg-primary/10 text-primary' },
          { label: 'Plans B2B', value: plans.filter((p) => p.type !== 'b2c').length, icon: 'pi pi-building', tone: 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300' },
        ]"
        :key="stat.label"
        class="flex items-center gap-3.5 rounded-card border border-line bg-card p-4 shadow-soft"
      >
        <span class="grid size-11 shrink-0 place-items-center rounded-leaf" :class="stat.tone">
          <i :class="stat.icon" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold uppercase tracking-wider text-faint">{{ stat.label }}</p>
          <p class="font-heading text-2xl font-extrabold tabular-nums text-ink">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row">
      <Select
        v-model="typeFilter"
        :options="typeOptions"
        option-label="label"
        option-value="value"
        placeholder="Tous les types"
        aria-label="Filtrer par type"
        class="w-full sm:w-52"
      />
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Statut"
        aria-label="Filtrer par statut"
        class="w-full sm:w-40"
      />
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton v-for="i in 3" :key="i" height="340px" border-radius="1.25rem" />
    </div>

    <!-- Grille -->
    <div v-else-if="filteredPlans.length" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift"
        :class="{ 'opacity-60': !plan.is_active }"
      >
        <!-- En-tête carte -->
        <div class="border-b border-line p-5">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-heading text-lg font-bold text-ink">{{ plan.name }}</h3>
              <p v-if="plan.description" class="mt-0.5 line-clamp-2 text-sm text-muted">
                {{ plan.description }}
              </p>
            </div>
            <Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              size="small"
              severity="secondary"
              aria-label="Plus d'actions"
              @click="(e) => toggleMenu(e, plan)"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <Tag :value="typeLabel(plan.type)" :severity="typeSeverity(plan.type)" rounded />
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="
                plan.is_active
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-card-2 text-muted'
              "
            >
              <span class="size-1.5 rounded-full" :class="plan.is_active ? 'bg-emerald-500' : 'bg-faint'" />
              {{ plan.is_active ? "Actif" : "Inactif" }}
            </span>
          </div>
        </div>

        <!-- Prix -->
        <div class="bg-linear-to-b from-card-2 to-card px-5 py-6 text-center">
          <p class="font-heading text-4xl font-extrabold tabular-nums tracking-tight text-primary">
            {{ plan.price.toLocaleString("fr-FR") }}
            <span class="text-lg font-bold text-muted">FCFA</span>
          </p>
          <p class="mt-1 text-sm text-muted">pour {{ plan.duration_days }} jours</p>
        </div>

        <!-- Infos -->
        <div class="flex flex-1 flex-col gap-2.5 p-5">
          <div class="flex items-center gap-3 rounded-2xl border border-line bg-card-2/50 px-3.5 py-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary">
              <i class="pi pi-calendar text-sm" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">Durée</p>
              <p class="text-xs text-muted">
                {{ plan.duration_days }} jours
                <span v-if="plan.duration_days >= 30">(~{{ Math.floor(plan.duration_days / 30) }} mois)</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-line bg-card-2/50 px-3.5 py-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
              <i class="pi pi-bolt text-sm" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">Crédits IA</p>
              <p class="text-xs text-muted">{{ plan.ai_credits }} crédits</p>
            </div>
          </div>
        </div>

        <!-- Pied -->
        <div class="px-5 pb-5">
          <AppButton label="Modifier" icon="pi pi-pencil" variant="secondary" block @click="openEdit(plan)" />
        </div>
      </article>
    </div>

    <!-- Vide -->
    <div
      v-else
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
        <i class="pi pi-credit-card text-2xl" />
      </span>
      <p class="text-sm font-medium text-muted">Aucun plan trouvé.</p>
    </div>

    <!-- Menu contextuel -->
    <Menu ref="menuRef" :model="menuItems" popup />

    <!-- Dialog créer / modifier -->
    <Dialog
      v-model:visible="formVisible"
      modal
      :draggable="false"
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i :class="editingPlan ? 'pi pi-pencil' : 'pi pi-plus'" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingPlan ? "Modifier le plan" : "Nouveau plan" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="plan-name" class="text-sm font-semibold text-ink">Nom</label>
            <InputText id="plan-name" v-model="form.name" placeholder="Pack Essentiel" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="plan-type" class="text-sm font-semibold text-ink">Type</label>
            <Select
              v-model="form.type"
              input-id="plan-type"
              :options="typeOptions.filter((t) => t.value !== 'all')"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="plan-description" class="text-sm font-semibold text-ink">Description</label>
          <InputText id="plan-description" v-model="form.description" placeholder="Description du plan..." fluid />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="plan-price" class="text-sm font-semibold text-ink">Prix (FCFA)</label>
            <InputNumber v-model="form.price" input-id="plan-price" :min="0" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="plan-duration" class="text-sm font-semibold text-ink">Durée (jours)</label>
            <InputNumber v-model="form.duration_days" input-id="plan-duration" :min="1" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="plan-credits" class="text-sm font-semibold text-ink">Crédits IA</label>
          <InputNumber v-model="form.ai_credits" input-id="plan-credits" :min="0" fluid />
        </div>

        <div class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2/50 px-4 py-3">
          <label for="plan-active" class="text-sm font-semibold text-ink">Plan actif</label>
          <ToggleSwitch v-model="form.is_active" input-id="plan-active" />
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="formVisible = false" />
        <AppButton
          :label="editingPlan ? 'Enregistrer' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          @click="onSave"
        />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog
      v-model:visible="deleteVisible"
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
          <h3 class="font-heading text-lg font-bold text-ink">Supprimer le plan</h3>
        </div>
      </template>

      <p class="leading-relaxed text-muted">
        Supprimer le plan <strong class="text-ink">{{ selectedPlan?.name }}</strong> ? Cette action est irréversible.
      </p>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="deleteVisible = false" />
        <AppButton label="Supprimer" icon="pi pi-trash" variant="danger" :loading="saving" @click="onDelete" />
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
