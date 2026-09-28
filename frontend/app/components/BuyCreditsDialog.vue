<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    :draggable="false"
    :style="{ width: '32rem' }"
    :breakpoints="{ '640px': '94vw' }"
    :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    @hide="onHide"
  >
    <!-- En-tête -->
    <template #header>
      <div class="flex w-full flex-col gap-4">
        <div class="flex items-center gap-3">
          <span class="brand-gradient grid size-11 place-items-center rounded-leaf text-white shadow-brand">
            <i class="pi pi-sparkles" />
          </span>
          <div>
            <h3 class="font-heading text-lg font-bold text-ink">Acheter des crédits IA</h3>
            <p class="text-xs text-faint">Paiement sécurisé par Mobile Money</p>
          </div>
        </div>

        <!-- Étapes -->
        <ol class="flex items-center gap-2">
          <li
            v-for="(s, i) in stepsList"
            :key="s.label"
            class="flex flex-1 items-center gap-2"
          >
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-bold transition-all duration-300"
              :class="stepClass(i + 1)"
            >
              <i v-if="stepDone(i + 1)" class="pi pi-check text-[0.6rem]" />
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span class="hidden text-xs font-medium text-muted sm:inline">{{ s.label }}</span>
            <span v-if="i < stepsList.length - 1" class="h-px flex-1 bg-line" />
          </li>
        </ol>
      </div>
    </template>

    <div class="flex flex-col gap-5 pt-1">
      <!-- Étape 1 : quantité + opérateur -->
      <div v-if="step === 1" class="flex flex-col gap-5">
        <div class="flex items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 dark:border-accent-900 dark:bg-accent-950">
          <i class="pi pi-info-circle mt-0.5 text-accent-700 dark:text-accent-300" />
          <p class="text-sm leading-relaxed text-accent-900 dark:text-accent-200">
            <strong class="font-bold">50 FCFA</strong> par crédit. 1 crédit = 1 correction complète des 3 tâches
            EE. Minimum 10, maximum 1000 crédits par achat.
          </p>
        </div>

        <!-- Quantité -->
        <div class="flex flex-col gap-2">
          <label for="credits-qty" class="text-sm font-semibold text-ink">Nombre de crédits</label>
          <InputNumber
            v-model="credits"
            input-id="credits-qty"
            :min="10"
            :max="1000"
            fluid
            show-buttons
            button-layout="horizontal"
            :step="1"
          >
            <template #decrementbuttonicon><i class="pi pi-minus" /></template>
            <template #incrementbuttonicon><i class="pi pi-plus" /></template>
          </InputNumber>

          <div class="flex flex-wrap gap-2 pt-1">
            <button
              v-for="qty in [10, 20, 50, 100]"
              :key="qty"
              type="button"
              class="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200"
              :class="
                credits === qty
                  ? 'border-transparent brand-gradient text-white shadow-brand'
                  : 'border-line bg-card text-muted hover:border-primary-200 hover:text-ink'
              "
              @click="credits = qty"
            >
              {{ qty }} crédits
            </button>
          </div>
        </div>

        <!-- Total -->
        <div class="featured-panel flex items-center justify-between rounded-[1.5rem_0.4rem] p-5 text-white">
          <div>
            <p class="text-xs font-semibold uppercase tracking-widest text-white/60">Total à payer</p>
            <p class="mt-1 font-heading text-3xl font-extrabold">
              {{ totalAmount.toLocaleString("fr-FR") }}
              <span class="text-base font-semibold text-white/80">FCFA</span>
            </p>
          </div>
          <div class="text-right text-xs text-white/70">
            <p class="font-semibold text-white">{{ credits }} crédit{{ credits > 1 ? "s" : "" }}</p>
            <p>50 FCFA / crédit</p>
          </div>
        </div>

        <!-- Opérateur -->
        <div class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-ink">Opérateur Mobile Money</span>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="op in operators"
              :key="op.value"
              type="button"
              :aria-pressed="operator === op.value"
              class="relative flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-200"
              :class="
                operator === op.value
                  ? 'border-primary bg-primary-50 dark:bg-primary-950'
                  : 'border-line bg-card hover:border-primary-200'
              "
              @click="operator = op.value"
            >
              <img :src="op.logo" :alt="op.label" class="size-9 rounded-lg object-contain" />
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-ink">{{ op.label }}</p>
                <p class="truncate text-xs text-faint">{{ op.desc }}</p>
              </div>
              <span
                v-if="operator === op.value"
                class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-primary text-white"
              >
                <i class="pi pi-check text-[0.55rem]" />
              </span>
            </button>
          </div>
        </div>

        <!-- Téléphone -->
        <div class="flex flex-col gap-2">
          <label for="credits-phone" class="text-sm font-semibold text-ink">Numéro de téléphone</label>
          <IconField>
            <InputIcon class="pi pi-phone" />
            <InputText
              id="credits-phone"
              v-model="phone"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="6XX XX XX XX"
              fluid
            />
          </IconField>
          <p class="text-xs text-faint">Le numéro qui recevra la demande de paiement.</p>
        </div>
      </div>

      <!-- Étape 2 : confirmation sur le téléphone -->
      <div v-else-if="step === 2" class="flex flex-col items-center gap-5 py-6 text-center">
        <span class="relative grid size-20 place-items-center">
          <span class="absolute inset-0 animate-ping rounded-full bg-primary-200/60 dark:bg-primary-800/40" />
          <span class="brand-gradient relative grid size-20 place-items-center rounded-full text-white shadow-brand">
            <i class="pi pi-mobile text-3xl" />
          </span>
        </span>
        <div>
          <p class="font-heading text-lg font-bold text-ink">Confirmez sur votre téléphone</p>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            Une demande a été envoyée au <strong class="font-semibold text-ink">{{ phone }}</strong> pour
            <strong class="font-semibold text-ink">{{ purchaseResult?.total_amount.toLocaleString("fr-FR") }} FCFA</strong>.
          </p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-full bg-card-2 px-4 py-2 text-sm text-muted">
          <i class="pi pi-spin pi-spinner text-primary" />
          En attente de confirmation...
        </div>
      </div>

      <!-- Étape 3 : succès -->
      <div v-else-if="step === 3" class="flex flex-col items-center gap-4 py-6 text-center">
        <span class="grid size-20 place-items-center rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
          <i class="pi pi-check-circle text-4xl" />
        </span>
        <div>
          <p class="font-heading text-xl font-bold text-ink">Crédits ajoutés !</p>
          <p class="mt-1 text-sm text-muted">
            <strong class="font-semibold text-ink">{{ purchaseResult?.credits }} crédits</strong>
            ont été ajoutés à votre compte.
          </p>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="step === 'error'" class="flex flex-col items-center gap-4 py-6 text-center">
        <span class="grid size-20 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <i class="pi pi-times-circle text-4xl" />
        </span>
        <div>
          <p class="font-heading text-xl font-bold text-ink">Erreur de paiement</p>
          <p class="mt-1 max-w-sm text-sm leading-relaxed text-muted">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <AppButton v-if="step !== 2" label="Fermer" variant="ghost" @click="close" />
        <AppButton
          v-if="step === 1"
          label="Payer"
          icon="pi pi-arrow-right"
          icon-pos="right"
          variant="gradient"
          :loading="purchasing"
          :disabled="!canProceed"
          @click="purchase"
        />
        <AppButton
          v-else-if="step === 3"
          label="Terminé"
          icon="pi pi-check"
          variant="gradient"
          @click="close"
        />
        <AppButton
          v-else-if="step === 'error'"
          label="Réessayer"
          icon="pi pi-refresh"
          variant="secondary"
          @click="step = 1"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { PurchaseResponse } from "#shared/api/models/PurchaseResponse";
import type { SuccessResponse_PurchaseResponse_ } from "#shared/api/models/SuccessResponse_PurchaseResponse_";
import type { SuccessResponse_PaymentResponse_ } from "#shared/api/models/SuccessResponse_PaymentResponse_";

const { isOpen, close: closeDialog } = useBuyCreditsDialog();
const { post, get } = useApi();
const sub = useSubscriptionStore();
const toast = useToast();

const PRICE_PER_CREDIT = 50;

const purchasing = ref(false);
const credits = ref(10);
const operator = ref<"MTN" | "ORANGE">("MTN");
const phone = ref("");
const step = ref<1 | 2 | 3 | "error">(1);
const purchaseResult = ref<PurchaseResponse | null>(null);
const errorMessage = ref("");
let pollInterval: ReturnType<typeof setInterval> | null = null;

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
] as const;

// Indicateur d'étapes (affichage uniquement)
const stepsList = [{ label: "Choix" }, { label: "Confirmation" }, { label: "Terminé" }];

function stepDone(n: number) {
  return typeof step.value === "number" && step.value > n;
}

function stepClass(n: number) {
  if (step.value === "error" && n === 3) return "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400";
  if (stepDone(n)) return "bg-green-500 text-white";
  if (step.value === n) return "brand-gradient text-white shadow-brand";
  return "bg-card-2 text-faint";
}

const totalAmount = computed(() => PRICE_PER_CREDIT * credits.value);

const canProceed = computed(() => {
  if (!credits.value || credits.value < 10) return false;
  if (!phone.value.trim()) return false;
  return true;
});

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function resetState() {
  stopPolling();
  step.value = 1;
  purchaseResult.value = null;
  errorMessage.value = "";
  phone.value = "";
  credits.value = 10;
  operator.value = "MTN";
}

function onHide() {
  resetState();
}

onUnmounted(() => stopPolling());

async function purchase() {
  purchasing.value = true;
  try {
    const res = await post<SuccessResponse_PurchaseResponse_>(
      "/v1/ai-credits/purchase",
      {
        credits: credits.value,
        phone_number: phone.value,
        operator: operator.value,
      },
    );
    purchaseResult.value = res.data ?? null;
    step.value = 2;
    startPolling();
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: err?.data?.message ?? "Impossible d'initier le paiement",
      life: 4000,
    });
  } finally {
    purchasing.value = false;
  }
}

function startPolling() {
  const paymentId = purchaseResult.value?.payment_id;
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
        await sub.fetchMySubscriptions();
        step.value = 3;
      } else if (status === "failed") {
        stopPolling();
        errorMessage.value = "Le paiement a échoué ou a été annulé.";
        step.value = "error";
      }
    } catch {
      // erreur réseau transitoire, on continue à poller
    }

    if (attempts >= maxAttempts && step.value === 2) {
      stopPolling();
      errorMessage.value =
        "Délai dépassé. Si le paiement a été confirmé, vérifiez votre solde dans quelques instants.";
      step.value = "error";
    }
  }, 3000);
}

function close() {
  closeDialog();
  sub.fetchMySubscriptions();
}
</script>