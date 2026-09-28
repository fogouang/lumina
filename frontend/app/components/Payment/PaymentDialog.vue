<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '32rem' }"
    :breakpoints="{ '640px': '94vw' }"
    :pt="{ mask: { class: 'backdrop-blur-sm' } }"
  >
    <!-- En-tête -->
    <template #header>
      <div class="flex w-full flex-col gap-4">
        <div class="flex items-center gap-3">
          <span
            class="brand-gradient grid size-11 place-items-center rounded-leaf text-white shadow-brand"
          >
            <i class="pi pi-crown" />
          </span>
          <div class="min-w-0">
            <h3 class="truncate font-heading text-lg font-bold text-ink">
              Abonnement {{ plan?.name ?? "" }}
            </h3>
            <p class="text-xs text-faint">Paiement sécurisé par Mobile Money</p>
          </div>
        </div>

        <!-- Étapes -->
        <ol class="flex items-center gap-2">
          <li
            v-for="(label, i) in stepsList"
            :key="label"
            class="flex flex-1 items-center gap-2"
          >
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold transition-all duration-300"
              :class="
                step === 'error' && i + 1 === 3
                  ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                  : stepIndex > i + 1 || step === 'success'
                    ? 'bg-green-500 text-white'
                    : stepIndex === i + 1
                      ? 'brand-gradient text-white shadow-brand'
                      : 'bg-card-2 text-faint'
              "
            >
              <i
                v-if="stepIndex > i + 1 || step === 'success'"
                class="pi pi-check text-[0.6rem]"
              />
              <i
                v-else-if="step === 'error' && i + 1 === 3"
                class="pi pi-times text-[0.6rem]"
              />
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span class="hidden text-xs font-medium text-muted sm:inline">{{
              label
            }}</span>
            <span v-if="i < stepsList.length - 1" class="h-px flex-1 bg-line" />
          </li>
        </ol>
      </div>
    </template>

    <!-- Étape 1 : méthode de paiement -->
    <div v-if="step === 'method'" class="flex flex-col gap-5 pt-1">
      <!-- Récapitulatif -->
      <div
        class="featured-panel flex items-center justify-between gap-4 rounded-[1.5rem_0.4rem] p-5 text-white"
      >
        <div class="min-w-0">
          <p class="truncate font-heading text-lg font-bold">
            {{ plan?.name }}
          </p>
          <p
            class="mt-0.5 inline-flex items-center gap-1.5 text-sm text-white/75"
          >
            <i class="pi pi-clock text-xs" />
            {{ plan?.duration_days }} jours d'accès
          </p>
        </div>
        <div class="shrink-0 text-right">
          <p
            v-if="promoValidation?.is_valid"
            class="text-xs text-white/60 line-through"
          >
            {{ plan?.price.toLocaleString("fr-FR") }} FCFA
          </p>
          <p class="font-heading text-2xl font-extrabold">
            {{ finalPrice.toLocaleString("fr-FR") }}
            <span class="text-sm font-semibold text-white/80">FCFA</span>
          </p>
        </div>
      </div>

      <!-- Opérateur -->
      <div class="flex flex-col gap-2">
        <span class="text-sm font-semibold text-ink"
          >Opérateur Mobile Money</span
        >
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="op in operators"
            :key="op.value"
            type="button"
            :aria-pressed="selectedOperator === op.value"
            class="relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-200"
            :class="
              selectedOperator === op.value
                ? 'border-primary bg-primary-50 dark:bg-primary-950'
                : 'border-line bg-card hover:border-primary-200'
            "
            @click="selectedOperator = op.value"
          >
            <img
              :src="op.logo"
              :alt="op.label"
              class="size-9 rounded-lg object-contain"
            />
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">
                {{ op.label }}
              </p>
              <p class="truncate text-xs text-faint">{{ op.desc }}</p>
            </div>
            <span
              v-if="selectedOperator === op.value"
              class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-white"
            >
              <i class="pi pi-check text-[0.55rem]" />
            </span>
          </button>
        </div>
      </div>

      <!-- Téléphone -->
      <div class="flex flex-col gap-2">
        <label for="payment-phone" class="text-sm font-semibold text-ink"
          >Numéro Mobile Money</label
        >
        <IconField>
          <InputIcon class="pi pi-phone" />
          <InputText
            id="payment-phone"
            v-model="phoneNumber"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="6XX XX XX XX"
            fluid
          />
        </IconField>
        <p class="text-xs text-faint">
          Le numéro qui recevra la demande de paiement.
        </p>
      </div>

      <!-- Code partenaire -->
      <div class="flex flex-col gap-2">
        <label for="payment-promo" class="text-sm font-semibold text-ink">
          Code partenaire
          <span class="font-normal text-faint">(optionnel)</span>
        </label>
        <div class="flex gap-2">
          <IconField class="flex-1">
            <InputIcon class="pi pi-ticket" />
            <InputText
              id="payment-promo"
              v-model="promoCode"
              placeholder="Ex. PARTNER2026"
              fluid
              class="uppercase placeholder:normal-case"
              :class="promoValidation?.is_valid ? 'border-green-400' : ''"
            />
          </IconField>
          <AppButton
            label="Appliquer"
            variant="secondary"
            :loading="validatingPromo"
            :disabled="!promoCode"
            @click="validatePromo"
          />
        </div>

        <div
          v-if="promoValidation"
          class="flex items-start gap-2 rounded-xl p-3 text-sm"
          :class="
            promoValidation.is_valid
              ? 'border border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300'
              : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
          "
        >
          <i
            :class="[
              promoValidation.is_valid
                ? 'pi pi-check-circle'
                : 'pi pi-times-circle',
              'mt-0.5',
            ]"
          />
          <p>
            {{ promoValidation.message }}
            <template v-if="promoValidation.is_valid">
              : réduction de
              <strong class="font-bold"
                >{{
                  promoValidation.discount_amount?.toLocaleString("fr-FR")
                }}
                FCFA</strong
              >
            </template>
          </p>
        </div>
      </div>
    </div>

    <!-- Étape 2 : traitement -->
    <div
      v-else-if="step === 'processing'"
      class="flex flex-col items-center gap-4 py-10 text-center"
    >
      <span class="grid size-20 place-items-center rounded-full bg-card-2">
        <i class="pi pi-spin pi-spinner text-3xl text-primary" />
      </span>
      <div>
        <p class="font-heading text-lg font-bold text-ink">
          Envoi de la demande...
        </p>
        <p class="mt-1 text-sm text-muted">
          Un instant, nous initions votre paiement.
        </p>
      </div>
    </div>

    <!-- Étape 3 : confirmation sur le téléphone -->
    <div
      v-else-if="step === 'confirm'"
      class="flex flex-col items-center gap-5 py-6 text-center"
    >
      <span class="relative grid size-20 place-items-center">
        <span
          class="absolute inset-0 animate-ping rounded-full bg-primary-200/60 dark:bg-primary-800/40"
        />
        <span
          class="brand-gradient relative grid size-20 place-items-center rounded-full text-white shadow-brand"
        >
          <i class="pi pi-mobile text-3xl" />
        </span>
      </span>
      <div>
        <p class="font-heading text-lg font-bold text-ink">
          Confirmez sur votre téléphone
        </p>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Une demande a été envoyée au
          <strong class="font-semibold text-ink">{{ phoneNumber }}</strong
          >. Composez votre code Mobile Money pour valider la transaction.
        </p>
      </div>

      <div class="w-full rounded-2xl border border-line bg-canvas p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-faint">
          Montant à payer
        </p>
        <p class="mt-1 font-heading text-3xl font-extrabold text-ink">
          {{ paymentResponse?.amount_paid?.toLocaleString("fr-FR") }}
          <span class="text-base font-semibold text-faint">FCFA</span>
        </p>
        <p class="mt-1 font-mono text-xs text-faint">
          Réf. {{ paymentResponse?.invoice_number }}
        </p>
      </div>

      <div
        class="inline-flex items-center gap-2 rounded-full bg-card-2 px-4 py-2 text-sm text-muted"
      >
        <i class="pi pi-spin pi-spinner text-primary" />
        En attente de confirmation...
      </div>
    </div>

    <!-- Étape 4 : succès -->
    <div
      v-else-if="step === 'success'"
      class="flex flex-col items-center gap-5 py-6 text-center"
    >
      <span
        class="grid size-20 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
      >
        <i class="pi pi-check-circle text-4xl" />
      </span>
      <div>
        <p class="font-heading text-xl font-bold text-ink">
          Paiement confirmé !
        </p>
        <p class="mt-1 text-sm text-muted">
          Votre abonnement
          <strong class="font-semibold text-ink">{{ plan?.name }}</strong> est
          maintenant actif.
        </p>
      </div>

      <dl
        class="w-full divide-y divide-line rounded-2xl border border-line bg-canvas text-sm"
      >
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-muted">Référence</dt>
          <dd class="font-mono font-semibold text-ink">
            {{ paymentResponse?.invoice_number }}
          </dd>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <dt class="text-muted">Montant payé</dt>
          <dd class="font-heading font-bold text-green-600 dark:text-green-400">
            {{ paymentResponse?.amount_paid?.toLocaleString("fr-FR") }} FCFA
          </dd>
        </div>
      </dl>
    </div>

    <!-- Erreur -->
    <div
      v-else-if="step === 'error'"
      class="flex flex-col items-center gap-4 py-6 text-center"
    >
      <span
        class="grid size-20 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
      >
        <i class="pi pi-times-circle text-4xl" />
      </span>
      <div>
        <p class="font-heading text-xl font-bold text-ink">
          Erreur de paiement
        </p>
        <p class="mt-1 max-w-sm text-sm leading-relaxed text-muted">
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- Pied -->
    <template #footer>
      <div v-if="step === 'method'" class="flex w-full justify-end gap-2">
        <AppButton label="Annuler" variant="ghost" @click="visible = false" />
        <AppButton
          label="Payer"
          icon="pi pi-arrow-right"
          icon-pos="right"
          variant="gradient"
          :disabled="!selectedOperator || !phoneNumber"
          :loading="processing"
          @click="onPay"
        />
      </div>
      <div v-else-if="step === 'confirm'" class="flex w-full justify-end">
        <AppButton label="Fermer" variant="ghost" @click="visible = false" />
      </div>
      <div v-else-if="step === 'success'" class="flex w-full justify-end">
        <AppButton
          label="Voir mon compte"
          icon="pi pi-user"
          variant="gradient"
          @click="goToAccount"
        />
      </div>
      <div v-else-if="step === 'error'" class="flex w-full justify-end gap-2">
        <AppButton label="Fermer" variant="ghost" @click="visible = false" />
        <AppButton
          label="Réessayer"
          icon="pi pi-refresh"
          variant="secondary"
          @click="step = 'method'"
        />
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
// Indicateur d'étapes (affichage uniquement)
const stepsList = ["Choix", "Confirmation", "Terminé"];
const stepIndex = computed(() => {
  if (step.value === "method") return 1;
  if (step.value === "processing" || step.value === "confirm") return 2;
  return 3;
});

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
