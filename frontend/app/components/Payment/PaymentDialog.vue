<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="'Abonnement - ' + (plan?.name ?? '')"
    :style="{ width: '480px' }"
    :draggable="false"
  >
    <!-- Step 1 : Choix méthode paiement -->
    <div v-if="step === 'method'" class="flex flex-col gap-4 pt-2">
      <div
        class="bg-(--bg-ground) rounded-xl p-4 flex items-center justify-between"
      >
        <div>
          <p class="font-bold text-(--text-primary)">{{ plan?.name }}</p>
          <p class="text-sm text-(--text-tertiary)">
            {{ plan?.duration_days }} jours
          </p>
        </div>
        <p class="text-2xl font-bold text-primary-600">
          {{ finalPrice.toLocaleString("fr-FR") }} FCFA
        </p>
      </div>

      <p class="text-sm font-semibold text-(--text-secondary)">
        Choisissez votre opérateur Mobile Money
      </p>

      <div class="flex flex-col gap-2">
        <button
          v-for="op in operators"
          :key="op.value"
          class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
          :class="
            selectedOperator === op.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-(--border-color) hover:border-primary-300'
          "
          @click="selectedOperator = op.value"
        >
          <img
            :src="op.logo"
            :alt="op.label"
            class="h-8 w-8 object-contain rounded"
          />
          <div>
            <p class="font-semibold text-sm text-(--text-primary)">
              {{ op.label }}
            </p>
            <p class="text-xs text-(--text-tertiary)">{{ op.desc }}</p>
          </div>
          <i
            v-if="selectedOperator === op.value"
            class="pi pi-check-circle text-primary-500 ml-auto text-lg"
          />
        </button>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-(--text-secondary)"
          >Numéro Mobile Money</label
        >
        <InputText v-model="phoneNumber" placeholder="6XXXXXXXX" fluid />
        <small class="text-(--text-tertiary)"
          >Le numéro qui recevra la demande de paiement</small
        >
      </div>

      <!-- Code promo -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-semibold text-(--text-secondary)">
          Code partenaire (optionnel)
        </label>
        <div class="flex gap-2">
          <InputText
            v-model="promoCode"
            placeholder="Ex: PARTNER2026"
            fluid
            :class="promoValidation?.is_valid ? 'border-green-400' : ''"
          />
          <Button
            label="Appliquer"
            outlined
            :loading="validatingPromo"
            :disabled="!promoCode"
            @click="validatePromo"
          />
        </div>
        <div v-if="promoValidation">
          <small
            v-if="promoValidation.is_valid"
            class="text-green-600 flex items-center gap-1"
          >
            <i class="pi pi-check-circle" />
            {{ promoValidation.message }} - réduction de
            {{ promoValidation.discount_amount?.toLocaleString("fr-FR") }} FCFA
          </small>
          <small v-else class="text-red-500 flex items-center gap-1">
            <i class="pi pi-times-circle" />
            {{ promoValidation.message }}
          </small>
        </div>
      </div>

      <!-- Récap prix avec promo -->
      <div
        v-if="promoValidation?.is_valid"
        class="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between"
      >
        <span class="text-sm text-green-700">Prix après réduction</span>
        <div class="text-right">
          <p class="text-lg font-bold text-green-700">
            {{ promoValidation.amount_paid?.toLocaleString("fr-FR") }} FCFA
          </p>
          <p class="text-xs text-green-600 line-through">
            {{ plan?.price.toLocaleString("fr-FR") }} FCFA
          </p>
        </div>
      </div>
    </div>

    <!-- Step 2 : Traitement (création paiement) -->
    <div
      v-else-if="step === 'processing'"
      class="flex flex-col items-center gap-4 py-8"
    >
      <ProgressSpinner style="width: 56px; height: 56px" />
      <p class="font-semibold text-(--text-primary)">Envoi de la demande...</p>
      <p class="text-sm text-(--text-tertiary) text-center">
        Un instant, nous initions votre paiement.
      </p>
    </div>

    <!-- Step 3 : Confirmation sur téléphone (polling) -->
    <div
      v-else-if="step === 'confirm'"
      class="flex flex-col items-center gap-4 py-6"
    >
      <div
        class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center"
      >
        <i class="pi pi-mobile text-blue-500 text-2xl" />
      </div>
      <p class="font-bold text-(--text-primary) text-center">
        Confirmez sur votre téléphone
      </p>
      <p class="text-sm text-(--text-tertiary) text-center">
        Une demande de paiement a été envoyée au {{ phoneNumber }}. Composez
        votre code Mobile Money pour valider la transaction.
      </p>
      <div class="bg-(--bg-ground) rounded-xl p-4 w-full text-center">
        <p class="text-xs text-(--text-tertiary) mb-1">Montant à payer</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ paymentResponse?.amount_paid?.toLocaleString("fr-FR") }} FCFA
        </p>
        <p class="text-xs text-(--text-tertiary) mt-1">
          Réf: {{ paymentResponse?.invoice_number }}
        </p>
      </div>
      <div class="flex items-center gap-2 text-sm text-(--text-tertiary)">
        <ProgressSpinner style="width: 18px; height: 18px" stroke-width="6" />
        En attente de confirmation...
      </div>
    </div>

    <!-- Step 4 : Succès -->
    <div
      v-else-if="step === 'success'"
      class="flex flex-col items-center gap-4 py-6"
    >
      <div
        class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center"
      >
        <i class="pi pi-check-circle text-green-500 text-3xl" />
      </div>
      <p class="font-bold text-xl text-(--text-primary)">Paiement confirmé !</p>
      <p class="text-sm text-(--text-tertiary) text-center">
        Votre abonnement <strong>{{ plan?.name }}</strong> est maintenant actif.
      </p>
      <div class="bg-green-50 border border-green-200 rounded-xl p-4 w-full">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="text-(--text-secondary)">Référence</span>
          <span class="font-mono font-semibold">{{
            paymentResponse?.invoice_number
          }}</span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <span class="text-(--text-secondary)">Montant payé</span>
          <span class="font-bold text-green-700">
            {{ paymentResponse?.amount_paid?.toLocaleString("fr-FR") }} FCFA
          </span>
        </div>
      </div>
    </div>

    <!-- Step erreur -->
    <div
      v-else-if="step === 'error'"
      class="flex flex-col items-center gap-4 py-6"
    >
      <div
        class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center"
      >
        <i class="pi pi-times-circle text-red-500 text-3xl" />
      </div>
      <p class="font-bold text-(--text-primary)">Erreur de paiement</p>
      <p class="text-sm text-(--text-tertiary) text-center">
        {{ errorMessage }}
      </p>
    </div>

    <!-- Footer -->
    <template #footer>
      <div v-if="step === 'method'" class="flex gap-2 justify-end">
        <Button label="Annuler" text @click="visible = false" />
        <Button
          label="Payer"
          icon="pi pi-arrow-right"
          icon-pos="right"
          class="bg-gradient-primary border-none font-bold"
          :disabled="!selectedOperator || !phoneNumber"
          :loading="processing"
          @click="onPay"
        />
      </div>
      <div v-else-if="step === 'confirm'" class="flex justify-end">
        <Button label="Fermer" text @click="visible = false" />
      </div>
      <div v-else-if="step === 'success'" class="flex justify-end">
        <Button
          label="Voir mon compte"
          icon="pi pi-user"
          class="bg-gradient-primary border-none font-bold"
          @click="goToAccount"
        />
      </div>
      <div v-else-if="step === 'error'" class="flex gap-2 justify-end">
        <Button
          label="Réessayer"
          icon="pi pi-refresh"
          outlined
          @click="step = 'method'"
        />
        <Button label="Fermer" text @click="visible = false" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { PlanListResponse } from "#shared/api/models/PlanListResponse";
import type { SuccessResponse_SubscriptionResponse_ } from "#shared/api/models/SuccessResponse_SubscriptionResponse_";
import type { SuccessResponse_PaymentInitiateResponse_ } from "#shared/api/models/SuccessResponse_PaymentInitiateResponse_";
import type { SuccessResponse_PaymentResponse_ } from "#shared/api/models/SuccessResponse_PaymentResponse_";
import type { PaymentInitiateResponse } from "#shared/api/models/PaymentInitiateResponse";
import type { PromoCodeValidateResponse } from "#shared/api/models/PromoCodeValidateResponse";

const props = defineProps<{
  modelValue: boolean;
  plan: PlanListResponse | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [val: boolean];
}>();

const { post, get } = useApi();
const auth = useAuthStore();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// ── State ─────────────────────────────────────────────────────
type Step = "method" | "processing" | "confirm" | "success" | "error";
const step = ref<Step>("method");
const selectedOperator = ref<string>("");
const phoneNumber = ref("");
const processing = ref(false);
const errorMessage = ref("");
const subscriptionId = ref<string | null>(null);
const paymentResponse = ref<PaymentInitiateResponse | null>(null);
const promoCode = ref("");
const validatingPromo = ref(false);
const promoValidation = ref<PromoCodeValidateResponse | null>(null);
let pollInterval: ReturnType<typeof setInterval> | null = null;

const finalPrice = computed(() => {
  if (
    promoValidation.value?.is_valid &&
    promoValidation.value.amount_paid != null
  ) {
    return promoValidation.value.amount_paid;
  }
  return props.plan?.price ?? 0;
});

// Reset quand on ouvre / stop polling quand on ferme
watch(visible, (v) => {
  if (v) {
    step.value = "method";
    selectedOperator.value = "";
    phoneNumber.value = "";
    processing.value = false;
    errorMessage.value = "";
    subscriptionId.value = null;
    paymentResponse.value = null;
    promoCode.value = "";
    promoValidation.value = null;
  } else {
    stopPolling();
  }
});

onUnmounted(() => stopPolling());

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// ── Opérateurs ────────────────────────────────────────────────
const operators = [
  {
    value: "MTN",
    label: "MTN MoMo",
    desc: "Mobile Money MTN",
    logo: "/images/momo.jpg",
  },
  {
    value: "ORANGE",
    label: "Orange Money",
    desc: "Mobile Money Orange",
    logo: "/images/orange.jpg",
  },
];

// ── Valider code promo ────────────────────────────────────────
async function validatePromo() {
  if (!promoCode.value || !props.plan) return;
  validatingPromo.value = true;
  try {
    const res = await post<{ data: PromoCodeValidateResponse }>(
      "/v1/promo-codes/validate",
      { code: promoCode.value.toUpperCase(), plan_id: props.plan.id },
    );
    promoValidation.value = res.data ?? null;
  } catch {
    promoValidation.value = {
      is_valid: false,
      message: "Code invalide ou expiré",
    } as any;
  } finally {
    validatingPromo.value = false;
  }
}

// ── Payer ─────────────────────────────────────────────────────
async function onPay() {
  if (!props.plan) return;
  processing.value = true;
  step.value = "processing";

  try {
    // 1. Créer la souscription
    const subRes = await post<SuccessResponse_SubscriptionResponse_>(
      "/v1/subscriptions/subscribe",
      { plan_id: props.plan.id },
    );
    subscriptionId.value = subRes.data?.id ?? null;
    if (!subscriptionId.value)
      throw new Error("Impossible de créer la souscription.");

    // 2. Initier le paiement pawaPay
    const payRes = await post<SuccessResponse_PaymentInitiateResponse_>(
      "/v1/payments/initiate",
      {
        subscription_id: subscriptionId.value,
        payment_method: "mobile_money",
        phone_number: phoneNumber.value,
        operator: selectedOperator.value,
        promo_code: promoCode.value || null,
      },
    );
    paymentResponse.value = payRes.data ?? null;
    step.value = "confirm";
    startPolling();
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message ?? "Une erreur est survenue lors du paiement.";
    step.value = "error";
  } finally {
    processing.value = false;
  }
}

// ── Polling du statut ─────────────────────────────────────────
function startPolling() {
  const paymentId = paymentResponse.value?.payment_id;
  if (!paymentId) return;

  let attempts = 0;
  const maxAttempts = 40; // ~2 minutes à 3s d'intervalle

  pollInterval = setInterval(async () => {
    attempts++;
    try {
      const res = await get<SuccessResponse_PaymentResponse_>(
        `/v1/payments/${paymentId}`,
      );
      const status = res.data?.payment_status;

      if (status === "completed") {
        stopPolling();
        await auth.fetchMe();
        step.value = "success";
      } else if (status === "failed") {
        stopPolling();
        errorMessage.value = "Le paiement a échoué ou a été annulé.";
        step.value = "error";
      }
    } catch {
      // erreur réseau transitoire, on continue à poller
    }

    if (attempts >= maxAttempts && step.value === "confirm") {
      stopPolling();
      errorMessage.value =
        "Délai dépassé. Si le paiement a été confirmé, vérifiez votre compte dans quelques instants.";
      step.value = "error";
    }
  }, 3000);
}

function goToAccount() {
  visible.value = false;
  navigateTo("/mon-compte/abonnement");
}
</script>
