<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="'Abonnement — ' + (plan?.name ?? '')"
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
          {{ plan?.price.toLocaleString("fr-FR") }} FCFA
        </p>
      </div>

      <p class="text-sm font-semibold text-(--text-secondary)">
        Choisissez votre moyen de paiement
      </p>

      <div class="flex flex-col gap-2">
        <button
          v-for="method in paymentMethods"
          :key="method.value"
          class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left"
          :class="
            selectedMethod === method.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-(--border-color) hover:border-primary-300'
          "
          @click="selectedMethod = method.value"
        >
          <img
            :src="method.logo"
            :alt="method.label"
            class="h-8 w-8 object-contain rounded"
          />
          <div>
            <p class="font-semibold text-sm text-(--text-primary)">
              {{ method.label }}
            </p>
            <p class="text-xs text-(--text-tertiary)">{{ method.desc }}</p>
          </div>
          <i
            v-if="selectedMethod === method.value"
            class="pi pi-check-circle text-primary-500 ml-auto text-lg"
          />
        </button>
      </div>

      <div
        v-if="selectedMethod === 'mobile_money'"
        class="flex flex-col gap-1.5"
      >
        <label class="text-sm font-semibold text-(--text-secondary)"
          >Numéro Mobile Money</label
        >
        <InputText v-model="phoneNumber" placeholder="6XXXXXXXX" fluid />
        <small class="text-(--text-tertiary)">Orange Money ou MTN MoMo</small>
      </div>
    </div>

    <!-- Step 2 : Traitement -->
    <div
      v-else-if="step === 'processing'"
      class="flex flex-col items-center gap-4 py-8"
    >
      <ProgressSpinner style="width: 56px; height: 56px" />
      <p class="font-semibold text-(--text-primary)">Traitement en cours...</p>
      <p class="text-sm text-(--text-tertiary) text-center">
        Votre paiement est en cours de traitement. Veuillez patienter.
      </p>
    </div>

    <!-- Step 3 : Redirection -->
    <div
      v-else-if="step === 'redirect'"
      class="flex flex-col items-center gap-4 py-6"
    >
      <div
        class="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center"
      >
        <i class="pi pi-external-link text-blue-500 text-2xl" />
      </div>
      <p class="font-bold text-(--text-primary) text-center">
        Finaliser votre paiement
      </p>
      <p class="text-sm text-(--text-tertiary) text-center">
        Vous allez être redirigé vers la page de paiement sécurisée My-CoolPay.
      </p>
      <div class="bg-(--bg-ground) rounded-xl p-4 w-full text-center">
        <p class="text-xs text-(--text-tertiary) mb-1">Montant à payer</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ paymentResponse?.amount?.toLocaleString("fr-FR") }} FCFA
        </p>
        <p class="text-xs text-(--text-tertiary) mt-1">
          Réf: {{ paymentResponse?.invoice_number }}
        </p>
      </div>
      <Button
        label="Payer maintenant"
        icon="pi pi-external-link"
        icon-pos="right"
        class="bg-gradient-primary border-none font-bold w-full"
        @click="openPaymentUrl"
      />
      <p class="text-xs text-(--text-tertiary) text-center">
        Votre accès sera activé automatiquement après confirmation du paiement.
      </p>
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
          <span class="font-bold text-green-700"
            >{{ paymentResponse?.amount?.toLocaleString("fr-FR") }} FCFA</span
          >
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

    <!-- Footer unique -->
    <template #footer>
      <div v-if="step === 'method'" class="flex gap-2 justify-end">
        <Button label="Annuler" text @click="visible = false" />
        <Button
          label="Continuer"
          icon="pi pi-arrow-right"
          icon-pos="right"
          class="bg-gradient-primary border-none font-bold"
          :disabled="
            !selectedMethod ||
            (selectedMethod === 'mobile_money' && !phoneNumber)
          "
          :loading="processing"
          @click="onPay"
        />
      </div>
      <div v-else-if="step === 'redirect'" class="flex gap-2 justify-end">
        <Button label="Fermer" text @click="visible = false" />
        <Button
          label="Vérifier mon accès"
          icon="pi pi-refresh"
          outlined
          @click="checkAccess"
        />
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
import type { PaymentInitiateResponse } from "#shared/api/models/PaymentInitiateResponse";

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
type Step = "method" | "processing" | "redirect" | "success" | "error";
const step = ref<Step>("method");
const selectedMethod = ref<string>("");
const phoneNumber = ref("");
const processing = ref(false);
const errorMessage = ref("");
const subscriptionId = ref<string | null>(null);
const paymentResponse = ref<PaymentInitiateResponse | null>(null);

// Reset quand on ouvre
watch(visible, (v) => {
  if (v) {
    step.value = "method";
    selectedMethod.value = "";
    phoneNumber.value = "";
    processing.value = false;
    errorMessage.value = "";
    subscriptionId.value = null;
    paymentResponse.value = null;
  }
});

// ── Méthodes paiement ─────────────────────────────────────────
const paymentMethods = [
  {
    value: "mobile_money",
    label: "Mobile Money",
    desc: "Orange Money / MTN MoMo",
    logo: "/images/momo.jpg",
  },
  {
    value: "card",
    label: "Carte bancaire",
    desc: "Visa / Mastercard",
    logo: "/images/visa.png",
  },
];

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

    // 2. Initier le paiement
    const payRes = await post<SuccessResponse_PaymentInitiateResponse_>(
      "/v1/payments/initiate",
      {
        subscription_id: subscriptionId.value,
        payment_method: selectedMethod.value,
        phone_number:
          selectedMethod.value === "mobile_money" ? phoneNumber.value : null,
      },
    );
    paymentResponse.value = payRes.data ?? null;

    step.value = "redirect";
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message ?? "Une erreur est survenue lors du paiement.";
    step.value = "error";
  } finally {
    processing.value = false;
  }
}

// ── Ouvrir URL paiement ───────────────────────────────────────
function openPaymentUrl() {
  const url = paymentResponse.value?.redirect_url;
  if (url) window.open(url, "_blank");
}

// ── Vérifier accès ────────────────────────────────────────────
async function checkAccess() {
  try {
    await auth.fetchMe();
    // Si l'abonnement est confirmé → success
    step.value = "success";
  } catch {
    // pas encore confirmé
  }
}

function goToAccount() {
  visible.value = false;
  navigateTo("/mon-compte/abonnement");
}
</script>
