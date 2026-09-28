<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Abonnements</h1>
        <p class="mt-0.5 text-sm text-muted">
          Activer manuellement un abonnement après paiement reçu
        </p>
      </div>
      <AppButton
        label="Activer un abonnement"
        icon="pi pi-plus"
        variant="gradient"
        @click="formVisible = true"
      />
    </div>

    <!-- Info -->
    <div
      class="mb-6 flex items-start gap-3 rounded-card border border-accent-200 bg-accent-50 p-4 dark:border-accent-500/25 dark:bg-accent-500/10"
    >
      <span class="grid size-9 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
        <i class="pi pi-info-circle" />
      </span>
      <p class="pt-1.5 text-sm leading-relaxed text-ink">
        Cette page permet d'activer manuellement un abonnement pour un client
        ayant payé hors plateforme (virement, espèces, etc.).
      </p>
    </div>

    <!-- Abonnements actifs -->
    <section class="rounded-card border border-line bg-card p-5 shadow-soft sm:p-6">
      <header class="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3.5">
        <div class="flex items-center gap-2.5">
          <span class="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <i class="pi pi-crown text-sm" />
          </span>
          <h2 class="font-heading text-base font-bold text-ink">
            Abonnements actifs
            <span v-if="!loadingSubs" class="ml-1 font-medium tabular-nums text-faint">
              ({{ subscriptions.length }})
            </span>
          </h2>
        </div>
        <Button
          icon="pi pi-refresh"
          text
          rounded
          aria-label="Actualiser"
          :loading="loadingSubs"
          @click="fetchSubscriptions"
        />
      </header>

      <!-- Chargement -->
      <div v-if="loadingSubs" class="space-y-2.5">
        <div v-for="n in 4" :key="n" class="h-17 animate-pulse rounded-2xl bg-card-2" />
      </div>

      <!-- Liste -->
      <div v-else-if="subscriptions.length" class="space-y-2.5">
        <div
          v-for="sub in subscriptions"
          :key="sub.id"
          class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2/50 p-4 transition-colors hover:bg-card-2"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-leaf bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <i class="pi pi-crown text-sm" />
            </span>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">
                {{ sub.user_email ?? sub.user_id }}
              </p>
              <p class="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                <span class="inline-flex items-center gap-1">
                  <i class="pi pi-calendar text-[0.65rem]" />
                  Expire le {{ formatDate(sub.end_date) }}
                </span>
                <span class="text-faint">·</span>
                <span class="inline-flex items-center gap-1">
                  <i class="pi pi-sparkles text-[0.65rem]" />
                  {{ sub.ai_credits_remaining }} crédits IA
                </span>
              </p>
            </div>
          </div>
          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              sub.is_active
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'bg-card-2 text-muted'
            "
          >
            <span class="size-1.5 rounded-full" :class="sub.is_active ? 'bg-emerald-500' : 'bg-faint'" />
            {{ sub.is_active ? "Actif" : "Inactif" }}
          </span>
        </div>
      </div>

      <!-- Vide -->
      <div v-else class="flex flex-col items-center py-10 text-center">
        <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
          <i class="pi pi-crown text-2xl" />
        </span>
        <p class="text-sm font-medium text-muted">Aucun abonnement actif trouvé.</p>
      </div>
    </section>

    <!-- Dialog activation manuelle -->
    <Dialog
      v-model:visible="formVisible"
      modal
      :draggable="false"
      :style="{ width: '34rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i class="pi pi-crown" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Activer un abonnement manuellement</h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <!-- Utilisateur -->
        <div class="flex flex-col gap-1.5">
          <label for="sub-user" class="text-sm font-semibold text-ink">Utilisateur</label>
          <Select
            v-model="form.user_id"
            input-id="sub-user"
            :options="users"
            option-label="label"
            option-value="value"
            placeholder="Sélectionner un utilisateur"
            filter
            fluid
          />
          <small v-if="form.user_id" class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <i class="pi pi-check text-xs" /> Utilisateur sélectionné
          </small>
        </div>

        <!-- Plan -->
        <div class="flex flex-col gap-1.5">
          <label for="sub-plan" class="text-sm font-semibold text-ink">Plan</label>
          <Select
            v-model="form.plan_id"
            input-id="sub-plan"
            :options="planOptions"
            option-label="label"
            option-value="value"
            placeholder="Sélectionner un plan"
            fluid
          />
          <div
            v-if="selectedPlan"
            class="mt-1 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2 p-3.5"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">{{ selectedPlan.name }}</p>
              <p class="text-xs text-muted">
                {{ selectedPlan.duration_days }} jours · {{ selectedPlan.ai_credits }} crédits IA
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-heading text-lg font-extrabold tabular-nums text-primary">
                {{ finalPrice.toLocaleString("fr-FR") }} FCFA
              </p>
              <p v-if="promoValidation?.is_valid" class="text-xs tabular-nums text-faint line-through">
                {{ selectedPlan.price.toLocaleString("fr-FR") }} FCFA
              </p>
            </div>
          </div>
        </div>

        <!-- Partenaire -->
        <div class="flex flex-col gap-1.5">
          <label for="sub-partner" class="text-sm font-semibold text-ink">
            Partenaire <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <div class="flex gap-2">
            <Select
              v-model="form.partner_id"
              input-id="sub-partner"
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
              outlined
              class="shrink-0"
              :loading="validatingPromo"
              :disabled="!form.promo_code || !form.plan_id"
              @click="onValidatePromo"
            />
          </div>

          <!-- Code détecté -->
          <small v-if="form.promo_code" class="text-muted">
            Code : <strong class="font-semibold text-ink">{{ form.promo_code }}</strong>
          </small>

          <!-- Résultat validation -->
          <template v-if="promoValidation">
            <small
              v-if="promoValidation.is_valid"
              class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
            >
              <i class="pi pi-check-circle text-xs" />
              {{ promoValidation.message }}, réduction de
              {{ promoValidation.discount_amount?.toLocaleString("fr-FR") }} FCFA
            </small>
            <small v-else class="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <i class="pi pi-times-circle text-xs" />
              {{ promoValidation.message }}
            </small>
          </template>
        </div>

        <!-- Note -->
        <div class="flex flex-col gap-1.5">
          <label for="sub-note" class="text-sm font-semibold text-ink">
            Note interne <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <Textarea
            id="sub-note"
            v-model="form.note"
            rows="2"
            auto-resize
            fluid
            placeholder="Ex : Paiement reçu par virement le 02/05/2026..."
          />
        </div>

        <!-- Récapitulatif -->
        <div
          v-if="form.user_id && form.plan_id"
          class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10"
        >
          <p class="mb-1 flex items-center gap-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-300">
            <i class="pi pi-list-check text-xs" />
            Récapitulatif
          </p>
          <p class="text-sm leading-relaxed text-emerald-700 dark:text-emerald-200">
            L'abonnement <strong>{{ selectedPlan?.name }}</strong> sera activé
            immédiatement. Il expirera dans
            <strong>{{ selectedPlan?.duration_days }} jours</strong>.
          </p>
          <p v-if="promoValidation?.is_valid" class="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
            Montant payé :
            <strong>{{ finalPrice.toLocaleString("fr-FR") }} FCFA</strong>
            (au lieu de {{ selectedPlan?.price.toLocaleString("fr-FR") }} FCFA)
          </p>
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="onCloseForm" />
        <AppButton
          label="Activer l'abonnement"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          :disabled="!form.user_id || !form.plan_id"
          @click="onActivate"
        />
      </template>
    </Dialog>
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
