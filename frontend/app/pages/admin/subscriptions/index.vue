<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Abonnements</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          Activer manuellement un abonnement après paiement reçu
        </p>
      </div>
      <Button
        label="Activer un abonnement"
        icon="pi pi-plus"
        class="bg-gradient-primary border-none font-bold"
        @click="formVisible = true"
      />
    </div>

    <!-- Info banner -->
    <Message severity="warn" :closable="false" class="mb-6">
      <span>
        Cette page permet d'activer manuellement un abonnement pour un client
        ayant payé hors plateforme (virement, espèces, etc.).
      </span>
    </Message>

    <!-- Dialog activation manuelle -->
    <Dialog
      v-model:visible="formVisible"
      header="Activer un abonnement manuellement"
      modal
      :style="{ width: '520px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4 pt-2">
        <!-- Recherche user -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Utilisateur</label
          >
          <Select
            v-model="form.user_id"
            :options="users"
            option-label="label"
            option-value="value"
            placeholder="Sélectionner un utilisateur"
            filter
            fluid
          />
          <small v-if="form.user_id" class="text-green-600">
            <i class="pi pi-check" /> Utilisateur sélectionné
          </small>
        </div>

        <!-- Plan -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Plan</label
          >
          <Select
            v-model="form.plan_id"
            :options="planOptions"
            option-label="label"
            option-value="value"
            placeholder="Sélectionner un plan"
            fluid
          />
          <!-- Détails plan sélectionné -->
          <div
            v-if="selectedPlan"
            class="bg-(--bg-ground) rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-semibold text-(--text-primary)">
                {{ selectedPlan.name }}
              </p>
              <p class="text-xs text-(--text-tertiary)">
                {{ selectedPlan.duration_days }} jours ·
                {{ selectedPlan.ai_credits }} crédits IA
              </p>
            </div>
            <p class="text-lg font-bold text-primary-600">
              {{ selectedPlan.price.toLocaleString("fr-FR") }} FCFA
            </p>
          </div>
        </div>

        <!-- Note -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Note interne (optionnel)</label
          >
          <Textarea
            v-model="form.note"
            rows="2"
            fluid
            placeholder="Ex: Paiement reçu par virement le 02/05/2026..."
          />
        </div>

        <!-- Confirmation -->
        <div
          v-if="form.user_id && form.plan_id"
          class="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <p class="text-sm font-semibold text-green-800 mb-1">Récapitulatif</p>
          <p class="text-sm text-green-700">
            L'abonnement <strong>{{ selectedPlan?.name }}</strong> sera activé
            immédiatement pour cet utilisateur. Il expirera dans
            <strong>{{ selectedPlan?.duration_days }} jours</strong>.
          </p>
        </div>
      </div>

      <template #footer>
        <Button label="Annuler" text @click="formVisible = false" />
        <Button
          label="Activer l'abonnement"
          icon="pi pi-check"
          :loading="saving"
          :disabled="!form.user_id || !form.plan_id"
          class="bg-gradient-primary border-none font-bold"
          @click="onActivate"
        />
      </template>
    </Dialog>

    <!-- Historique activations récentes -->
    <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
      <h2 class="text-base font-bold text-(--text-primary) mb-4">
        Activations récentes
      </h2>
      <p class="text-sm text-(--text-tertiary)">
        Les activations manuelles apparaîtront ici. Pour voir tous les
        abonnements, un endpoint admin dédié est nécessaire.
      </p>
      <div class="mt-4 space-y-3">
        <div
          v-for="sub in recentActivations"
          :key="sub.id"
          class="flex items-center justify-between p-4 bg-(--bg-ground) rounded-xl"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center"
            >
              <i class="pi pi-crown text-green-600 text-sm" />
            </div>
            <div>
              <p class="text-sm font-semibold text-(--text-primary)">
                {{ sub.userName }}
              </p>
              <p class="text-xs text-(--text-tertiary)">
                {{ sub.planName }} · Expire le {{ sub.endDate }}
              </p>
            </div>
          </div>
          <Tag value="Actif" severity="success" />
        </div>
        <p
          v-if="!recentActivations.length"
          class="text-sm text-(--text-tertiary) text-center py-4"
        >
          Aucune activation cette session.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserListResponse } from "#shared/api/models/UserListResponse";
import type { PlanListResponse } from "#shared/api/models/PlanListResponse";
import type { SuccessResponse_list_UserListResponse__ } from "#shared/api/models/SuccessResponse_list_UserListResponse__";
import type { SuccessResponse_list_PlanListResponse__ } from "#shared/api/models/SuccessResponse_list_PlanListResponse__";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get, post } = useApi();
const toast = useToast();

const formVisible = ref(false);
const saving = ref(false);

// ── Data ──────────────────────────────────────────────────────
const users = ref<{ label: string; value: string }[]>([]);
const plans = ref<PlanListResponse[]>([]);

const planOptions = computed(() =>
  plans.value.map((p) => ({
    label: `${p.name} — ${p.price.toLocaleString("fr-FR")} FCFA (${p.duration_days}j)`,
    value: p.id,
  })),
);

const selectedPlan = computed(
  () => plans.value.find((p) => p.id === form.plan_id) ?? null,
);

onMounted(async () => {
  const [usersRes, plansRes] = await Promise.all([
    get<SuccessResponse_list_UserListResponse__>("/v1/users?limit=100"),
    get<SuccessResponse_list_PlanListResponse__>("/v1/plans?active_only=true"),
  ]);
  users.value = (usersRes.data ?? []).map((u) => ({
    label: `${u.first_name} ${u.last_name} (${u.email})`,
    value: u.id,
  }));
  plans.value = plansRes.data ?? [];
});

// ── Formulaire ────────────────────────────────────────────────
const form = reactive({
  user_id: "",
  plan_id: "",
  note: "",
});

// ── Historique session ────────────────────────────────────────
const recentActivations = ref<
  {
    id: string;
    userName: string;
    planName: string;
    endDate: string;
  }[]
>([]);

// ── Activer ───────────────────────────────────────────────────
async function onActivate() {
  saving.value = true;
  try {
    await post("/v1/subscriptions/admin/activate", {
      user_id: form.user_id,
      plan_id: form.plan_id,
      note: form.note || null,
    });

    // Ajouter à l'historique session
    const user = users.value.find((u) => u.value === form.user_id);
    const plan = plans.value.find((p) => p.id === form.plan_id);
    const end = new Date();
    end.setDate(end.getDate() + (plan?.duration_days ?? 0));

    recentActivations.value.unshift({
      id: Math.random().toString(),
      userName: user ? (user.label.split("(")[0] ?? user.label).trim() : "",
      planName: plan?.name ?? "",
      endDate: end.toLocaleDateString("fr-FR"),
    });

    toast.add({
      severity: "success",
      summary: "Abonnement activé avec succès",
      life: 4000,
    });
    formVisible.value = false;
    form.user_id = "";
    form.plan_id = "";
    form.note = "";
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: err?.data?.message ?? "Impossible d'activer l'abonnement",
      life: 4000,
    });
  } finally {
    saving.value = false;
  }
}

useHead({ title: "Abonnements | Admin Lumina" });
</script>
