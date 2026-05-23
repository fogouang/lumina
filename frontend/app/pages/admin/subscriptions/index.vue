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
            <div class="text-right">
              <p class="text-lg font-bold text-primary-600">
                {{ finalPrice.toLocaleString("fr-FR") }} FCFA
              </p>
              <p
                v-if="promoValidation?.is_valid"
                class="text-xs text-green-600 line-through"
              >
                {{ selectedPlan.price.toLocaleString("fr-FR") }} FCFA
              </p>
            </div>
          </div>
        </div>

        <!-- Code promo -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">
            Code partenaire (optionnel)
          </label>
          <!-- Remplacer le bloc "Code partenaire" par -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)">
              Partenaire (optionnel)
            </label>
            <div class="flex gap-2">
              <Select
                v-model="form.partner_id"
                :options="partnerOptions"
                option-label="label"
                option-value="value"
                placeholder="Sélectionner un partenaire"
                filter
                fluid
                :disabled="!form.plan_id"
                @change="onPartnerSelect"
              />
              <Button
                label="Valider"
                :loading="validatingPromo"
                :disabled="!form.promo_code || !form.plan_id"
                outlined
                @click="onValidatePromo"
              />
            </div>
            <!-- Code détecté -->
            <small v-if="form.promo_code" class="text-(--text-tertiary)">
              Code : <strong>{{ form.promo_code }}</strong>
            </small>
            <!-- Résultat validation -->
            <div v-if="promoValidation" class="mt-1">
              <small
                v-if="promoValidation.is_valid"
                class="text-green-600 flex items-center gap-1"
              >
                <i class="pi pi-check-circle" />
                {{ promoValidation.message }} — réduction de
                {{ promoValidation.discount_amount?.toLocaleString("fr-FR") }}
                FCFA
              </small>
              <small v-else class="text-red-500 flex items-center gap-1">
                <i class="pi pi-times-circle" />
                {{ promoValidation.message }}
              </small>
            </div>
          </div>

          <!-- Résultat validation -->
          <div v-if="promoValidation" class="mt-1">
            <small
              v-if="promoValidation.is_valid"
              class="text-green-600 flex items-center gap-1"
            >
              <i class="pi pi-check-circle" />
              {{ promoValidation.message }} — réduction de
              {{ promoValidation.discount_amount?.toLocaleString("fr-FR") }}
              FCFA
            </small>
            <small v-else class="text-red-500 flex items-center gap-1">
              <i class="pi pi-times-circle" />
              {{ promoValidation.message }}
            </small>
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

        <!-- Récapitulatif -->
        <div
          v-if="form.user_id && form.plan_id"
          class="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <p class="text-sm font-semibold text-green-800 mb-1">Récapitulatif</p>
          <p class="text-sm text-green-700">
            L'abonnement <strong>{{ selectedPlan?.name }}</strong> sera activé
            immédiatement. Il expirera dans
            <strong>{{ selectedPlan?.duration_days }} jours</strong>.
          </p>
          <p
            v-if="promoValidation?.is_valid"
            class="text-sm text-green-700 mt-1"
          >
            Montant payé :
            <strong>{{ finalPrice.toLocaleString("fr-FR") }} FCFA</strong> (au
            lieu de {{ selectedPlan?.price.toLocaleString("fr-FR") }} FCFA)
          </p>
        </div>
      </div>

      <template #footer>
        <Button label="Annuler" text @click="onCloseForm" />
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

    <!-- Liste des abonnements actifs -->
    <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-(--text-primary)">
          Abonnements actifs
        </h2>
        <Button
          icon="pi pi-refresh"
          text
          rounded
          :loading="loadingSubs"
          @click="fetchSubscriptions"
        />
      </div>

      <!-- Loading -->
      <div v-if="loadingSubs" class="flex justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl text-(--text-tertiary)" />
      </div>

      <!-- Liste -->
      <div v-else class="space-y-3">
        <div
          v-for="sub in subscriptions"
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
                {{ sub.user_email ?? sub.user_id }}
              </p>
              <p class="text-xs text-(--text-tertiary)">
                Expire le {{ formatDate(sub.end_date) }} ·
                {{ sub.ai_credits_remaining }} crédits IA
              </p>
            </div>
          </div>
          <Tag
            :value="sub.is_active ? 'Actif' : 'Inactif'"
            :severity="sub.is_active ? 'success' : 'secondary'"
          />
        </div>

        <p
          v-if="!subscriptions.length"
          class="text-sm text-(--text-tertiary) text-center py-4"
        >
          Aucun abonnement actif trouvé.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlanListResponse } from "#shared/api/models/PlanListResponse";
import type { SuccessResponse_list_UserListResponse__ } from "#shared/api/models/SuccessResponse_list_UserListResponse__";
import type { SuccessResponse_list_PlanListResponse__ } from "#shared/api/models/SuccessResponse_list_PlanListResponse__";
import type { PromoCodeValidateResponse } from "#shared/api/models/PromoCodeValidateResponse";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get, post } = useApi();
const toast = useToast();
const promoStore = useAdminPromoCodesStore();

const formVisible = ref(false);
const saving = ref(false);
const validatingPromo = ref(false);
const loadingSubs = ref(false);
const promoValidation = ref<PromoCodeValidateResponse | null>(null);

// ── Data ──────────────────────────────────────────────────────
const users = ref<{ label: string; value: string }[]>([]);
const plans = ref<PlanListResponse[]>([]);

interface AdminSubscription {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  ai_credits_remaining: number;
}

const subscriptions = ref<AdminSubscription[]>([]);

const planOptions = computed(() =>
  plans.value.map((p) => ({
    label: `${p.name} — ${p.price.toLocaleString("fr-FR")} FCFA (${p.duration_days}j)`,
    value: p.id,
  })),
);

const selectedPlan = computed(
  () => plans.value.find((p) => p.id === form.plan_id) ?? null,
);

const finalPrice = computed(() => {
  if (!selectedPlan.value) return 0;
  if (
    promoValidation.value?.is_valid &&
    promoValidation.value.amount_paid != null
  ) {
    return promoValidation.value.amount_paid;
  }
  return selectedPlan.value.price;
});

// ── Formulaire ────────────────────────────────────────────────
const form = reactive({
  user_id: "",
  plan_id: "",
  partner_id: "",
  promo_code: "",
  note: "",
});

// Partenaires
const partners = ref<any[]>([]);
const partnerOptions = computed(() =>
  partners.value.map((p) => ({
    label: `${p.name} — ${p.contact_email}`,
    value: p.id,
    codes: p.promo_codes ?? [],
  })),
);

// ── Init ──────────────────────────────────────────────────────
onMounted(async () => {
  const [usersRes, plansRes, partnersRes] = await Promise.all([
    get<SuccessResponse_list_UserListResponse__>("/v1/users?limit=100"),
    get<SuccessResponse_list_PlanListResponse__>("/v1/plans?active_only=true"),
    get<any>("/v1/partners"),
  ]);
  users.value = (usersRes.data ?? []).map((u) => ({
    label: `${u.first_name} ${u.last_name} (${u.email})`,
    value: u.id,
  }));
  plans.value = plansRes.data ?? [];
  partners.value = partnersRes.data ?? [];
  await fetchSubscriptions();
});

// Reset promo quand le plan change
watch(
  () => form.plan_id,
  () => {
    promoValidation.value = null;
    form.promo_code = "";
  },
);

// ── Fetch subscriptions ───────────────────────────────────────
async function fetchSubscriptions() {
  loadingSubs.value = true;
  try {
    const res = await get<{ data: AdminSubscription[] }>(
      "/v1/subscriptions/admin/list",
    );
    subscriptions.value = res.data ?? [];
  } catch {
    subscriptions.value = [];
  } finally {
    loadingSubs.value = false;
  }
}

// ── Valider code promo ────────────────────────────────────────
async function onValidatePromo() {
  if (!form.promo_code || !form.plan_id) return;
  validatingPromo.value = true;
  try {
    promoValidation.value = await promoStore.validateCode({
      code: form.promo_code,
      plan_id: form.plan_id,
    });
  } catch {
    promoValidation.value = null;
  } finally {
    validatingPromo.value = false;
  }
}

// ── Activer ───────────────────────────────────────────────────
async function onActivate() {
  saving.value = true;
  try {
    await post("/v1/subscriptions/admin/activate", {
      user_id: form.user_id,
      plan_id: form.plan_id,
      note: form.note || null,
      promo_code: form.promo_code || null,
    });

    toast.add({
      severity: "success",
      summary: "Abonnement activé avec succès",
      life: 4000,
    });

    onCloseForm();
    await fetchSubscriptions();
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

// Charger les partenaires au mount
onMounted(async () => {
  const [usersRes, plansRes, partnersRes] = await Promise.all([
    get<SuccessResponse_list_UserListResponse__>("/v1/users?limit=100"),
    get<SuccessResponse_list_PlanListResponse__>("/v1/plans?active_only=true"),
    get<any>("/v1/partners"),
  ]);
  users.value = (usersRes.data ?? []).map((u) => ({
    label: `${u.first_name} ${u.last_name} (${u.email})`,
    value: u.id,
  }));
  plans.value = plansRes.data ?? [];
  partners.value = partnersRes.data ?? [];
  await fetchSubscriptions();
});

// Quand on sélectionne un partenaire, charger ses codes promo
async function onPartnerSelect() {
  if (!form.partner_id) {
    form.promo_code = "";
    promoValidation.value = null;
    return;
  }
  try {
    await promoStore.fetchCodes();
    const partnerCodes = promoStore.codes.filter(
      (c) => c.partner_id === form.partner_id && c.is_active,
    );
    const firstCode = partnerCodes[0];
    if (firstCode) {
      form.promo_code = firstCode.code;
      await onValidatePromo();
    } else {
      form.promo_code = "";
      promoValidation.value = null;
    }
  } catch {
    form.promo_code = "";
  }
}

// Dans onCloseForm, reset partner_id aussi
function onCloseForm() {
  formVisible.value = false;
  form.user_id = "";
  form.plan_id = "";
  form.partner_id = "";
  form.promo_code = "";
  form.note = "";
  promoValidation.value = null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

useHead({ title: "Abonnements | Admin Lumina" });
</script>
