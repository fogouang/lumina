<template>
  <Dialog
    v-model:visible="isOpen"
    modal
    :draggable="false"
    :style="{ width: '480px' }"
    header="Acheter des crédits IA"
    @hide="onHide"
  >
    <div class="flex flex-col gap-5 pt-2">
      <!-- Step 1 : Choix quantité + opérateur -->
      <div v-if="step === 1" class="flex flex-col gap-4">
        <div
          class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3"
        >
          <p class="text-sm text-green-700">
            <strong>50 FCFA</strong> par crédit. 1 crédit = 1 correction
            complète des 3 tâches EE. Min 10 - Max 1000 crédits par achat.
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Nombre de crédits</label
          >
          <InputNumber
            v-model="credits"
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
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            v-for="qty in [10, 20, 50, 100]"
            :key="qty"
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer"
            :class="
              credits === qty
                ? 'bg-gradient-primary text-white border-transparent'
                : 'bg-(--bg-ground) border-(--border-color) text-(--text-secondary) hover:border-primary-400'
            "
            @click="credits = qty"
          >
            {{ qty }} crédits
          </button>
        </div>

        <div
          class="bg-(--bg-ground) rounded-xl p-4 flex items-center justify-between"
        >
          <div>
            <p class="text-sm text-(--text-secondary)">Total à payer</p>
            <p class="text-2xl font-extrabold text-primary-600">
              {{ totalAmount.toLocaleString("fr-FR") }} FCFA
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-(--text-tertiary)">
              {{ credits }} crédit{{ credits > 1 ? "s" : "" }}
            </p>
            <p class="text-xs text-(--text-tertiary)">50 FCFA/crédit</p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Opérateur Mobile Money</label
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="op in operators"
              :key="op.value"
              class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer font-inherit text-left"
              :class="
                operator === op.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-(--border-color) bg-(--bg-card) hover:border-primary-300'
              "
              @click="operator = op.value"
            >
              <img
                :src="op.logo"
                :alt="op.label"
                class="h-7 w-7 object-contain rounded"
              />
              <div>
                <p
                  class="text-sm font-semibold"
                  :class="
                    operator === op.value
                      ? 'text-primary-700'
                      : 'text-(--text-primary)'
                  "
                >
                  {{ op.label }}
                </p>
                <p class="text-xs text-(--text-tertiary)">{{ op.desc }}</p>
              </div>
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Numéro de téléphone</label
          >
          <InputText v-model="phone" placeholder="ex: 691850913" fluid />
        </div>
      </div>

      <!-- Step 2 : Confirmation sur téléphone (polling) -->
      <div v-else-if="step === 2" class="flex flex-col gap-4">
        <div
          class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
        >
          <i class="pi pi-mobile text-3xl text-blue-500 mb-2 block" />
          <p class="font-bold text-blue-800 mb-1">
            Confirmez sur votre téléphone
          </p>
          <p class="text-sm text-blue-700">
            Une demande a été envoyée au {{ phone }} pour
            <strong
              >{{
                purchaseResult?.total_amount.toLocaleString("fr-FR")
              }}
              FCFA</strong
            >.
          </p>
        </div>
        <div
          class="flex items-center justify-center gap-2 text-sm text-(--text-tertiary) py-2"
        >
          <ProgressSpinner style="width: 18px; height: 18px" stroke-width="6" />
          En attente de confirmation...
        </div>
      </div>

      <!-- Step 3 : Succès -->
      <div
        v-else-if="step === 3"
        class="flex flex-col items-center gap-3 py-4 text-center"
      >
        <div
          class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center"
        >
          <i class="pi pi-check-circle text-green-500 text-3xl" />
        </div>
        <p class="font-bold text-lg text-(--text-primary)">Crédits ajoutés !</p>
        <p class="text-sm text-(--text-tertiary)">
          {{ purchaseResult?.credits }} crédits ont été ajoutés à votre compte.
        </p>
      </div>

      <!-- Step erreur -->
      <div
        v-else-if="step === 'error'"
        class="flex flex-col items-center gap-3 py-4 text-center"
      >
        <div
          class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center"
        >
          <i class="pi pi-times-circle text-red-500 text-2xl" />
        </div>
        <p class="font-bold text-(--text-primary)">Erreur de paiement</p>
        <p class="text-sm text-(--text-tertiary)">{{ errorMessage }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button v-if="step !== 2" label="Fermer" text @click="close" />
        <Button
          v-if="step === 1"
          label="Payer"
          icon="pi pi-arrow-right"
          icon-pos="right"
          :loading="purchasing"
          :disabled="!canProceed"
          class="bg-gradient-primary border-none font-bold"
          @click="purchase"
        />
        <Button
          v-else-if="step === 3"
          label="Terminé"
          icon="pi pi-check"
          severity="success"
          @click="close"
        />
        <Button
          v-else-if="step === 'error'"
          label="Réessayer"
          icon="pi pi-refresh"
          outlined
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
