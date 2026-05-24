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
      <!-- Step 1 -->
      <div v-if="step === 1" class="flex flex-col gap-4">
        <div class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <p class="text-sm text-green-700">
            <strong>50 FCFA</strong> par crédit. 1 crédit = 1 correction
            complète des 3 tâches EE. Min 10 - Max 1000 crédits par achat.
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Nombre de crédits</label>
          <InputNumber v-model="credits" :min="10" :max="1000" fluid show-buttons button-layout="horizontal" :step="1">
            <template #decrementbuttonicon><i class="pi pi-minus" /></template>
            <template #incrementbuttonicon><i class="pi pi-plus" /></template>
          </InputNumber>
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            v-for="qty in [10, 20, 50, 100]" :key="qty"
            class="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer"
            :class="credits === qty ? 'bg-gradient-primary text-white border-transparent' : 'bg-(--bg-ground) border-(--border-color) text-(--text-secondary) hover:border-primary-400'"
            @click="credits = qty"
          >{{ qty }} crédits</button>
        </div>

        <div class="bg-(--bg-ground) rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-sm text-(--text-secondary)">Total à payer</p>
            <p class="text-2xl font-extrabold text-primary-600">{{ totalAmount.toLocaleString("fr-FR") }} FCFA</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-(--text-tertiary)">{{ credits }} crédit{{ credits > 1 ? "s" : "" }}</p>
            <p class="text-xs text-(--text-tertiary)">50 FCFA/crédit</p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Méthode de paiement</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer font-inherit text-left"
              :class="method === 'mobile_money' ? 'border-primary-500 bg-primary-50' : 'border-(--border-color) bg-(--bg-card) hover:border-primary-300'"
              @click="method = 'mobile_money'"
            >
              <i class="pi pi-mobile text-lg" :class="method === 'mobile_money' ? 'text-primary-600' : 'text-(--text-tertiary)'" />
              <div>
                <p class="text-sm font-semibold" :class="method === 'mobile_money' ? 'text-primary-700' : 'text-(--text-primary)'">Mobile Money</p>
                <p class="text-xs text-(--text-tertiary)">Orange, MTN</p>
              </div>
            </button>
            <button
              class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer font-inherit text-left"
              :class="method === 'paylink' ? 'border-primary-500 bg-primary-50' : 'border-(--border-color) bg-(--bg-card) hover:border-primary-300'"
              @click="method = 'paylink'"
            >
              <i class="pi pi-credit-card text-lg" :class="method === 'paylink' ? 'text-primary-600' : 'text-(--text-tertiary)'" />
              <div>
                <p class="text-sm font-semibold" :class="method === 'paylink' ? 'text-primary-700' : 'text-(--text-primary)'">Lien de paiement</p>
                <p class="text-xs text-(--text-tertiary)">Carte, virement</p>
              </div>
            </button>
          </div>
        </div>

        <div v-if="method === 'mobile_money'" class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)">Numéro de téléphone</label>
          <InputText v-model="phone" placeholder="ex: 691850913" fluid />
        </div>
      </div>

      <!-- Step 2 : USSD -->
      <div v-else-if="step === 2 && purchaseResult?.ussd" class="flex flex-col gap-4">
        <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <i class="pi pi-mobile text-3xl text-green-500 mb-2 block" />
          <p class="font-bold text-green-800 mb-1">Composez le code USSD</p>
          <p class="text-3xl font-extrabold text-green-700 my-3 tracking-widest">{{ purchaseResult.ussd }}</p>
          <p class="text-sm text-green-700">Paiement de <strong>{{ purchaseResult.total_amount.toLocaleString("fr-FR") }} FCFA</strong>.</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <i class="pi pi-info-circle text-amber-500 shrink-0 mt-0.5" />
          <p class="text-xs text-amber-800 leading-relaxed">Après validation, vos crédits seront ajoutés automatiquement.</p>
        </div>
      </div>

      <!-- Step 2 : Paylink -->
      <div v-else-if="step === 2 && purchaseResult?.redirect_url" class="flex flex-col gap-4">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <i class="pi pi-external-link text-3xl text-blue-500 mb-2 block" />
          <p class="font-bold text-blue-800 mb-3">
            Lien de paiement prêt — <strong>{{ purchaseResult.total_amount.toLocaleString("fr-FR") }} FCFA</strong>
          </p>
          <a :href="purchaseResult.redirect_url" target="_blank">
            <Button label="Payer maintenant" icon="pi pi-external-link" class="bg-gradient-primary border-none font-bold" />
          </a>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <i class="pi pi-info-circle text-amber-500 shrink-0 mt-0.5" />
          <p class="text-xs text-amber-800 leading-relaxed">Après paiement, vos crédits seront ajoutés automatiquement.</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Fermer" text @click="close" />
        <Button
          v-if="step === 1"
          label="Continuer"
          icon="pi pi-arrow-right"
          icon-pos="right"
          :loading="purchasing"
          :disabled="!canProceed"
          class="bg-gradient-primary border-none font-bold"
          @click="purchase"
        />
        <Button v-else-if="step === 2" label="Terminé" icon="pi pi-check" severity="success" @click="close" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { PurchaseResponse } from "#shared/api/models/PurchaseResponse";
import type { SuccessResponse_PurchaseResponse_ } from "#shared/api/models/SuccessResponse_PurchaseResponse_";

const { isOpen, close: closeDialog } = useBuyCreditsDialog();
const { post } = useApi();
const sub = useSubscriptionStore();
const toast = useToast();

const PRICE_PER_CREDIT = 50;

const purchasing = ref(false);
const credits = ref(10);
const method = ref<"mobile_money" | "paylink">("mobile_money");
const phone = ref("");
const step = ref(1);
const purchaseResult = ref<PurchaseResponse | null>(null);

const totalAmount = computed(() => PRICE_PER_CREDIT * credits.value);

const canProceed = computed(() => {
  if (!credits.value || credits.value < 10) return false;
  if (method.value === "mobile_money" && !phone.value.trim()) return false;
  return true;
});

function resetState() {
  step.value = 1;
  purchaseResult.value = null;
  phone.value = "";
  credits.value = 10;
  method.value = "mobile_money";
}

function onHide() {
  resetState();
}

async function purchase() {
  purchasing.value = true;
  try {
    const res = await post<SuccessResponse_PurchaseResponse_>("/v1/ai-credits/purchase", {
      credits: credits.value,
      payment_method: method.value,
      phone_number: method.value === "mobile_money" ? phone.value : null,
    });
    purchaseResult.value = res.data ?? null;
    step.value = 2;
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

function close() {
  closeDialog();
  sub.fetchMySubscriptions();
}
</script>