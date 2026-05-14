<template>
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :style="{ width: '480px' }"
    header="Acheter des crédits IA"
  >
    <!-- Loading pricing -->
    <div v-if="loadingPricing" class="flex justify-center py-8">
      <ProgressSpinner style="width: 36px; height: 36px" />
    </div>

    <template v-else-if="pricing">
      <div class="flex flex-col gap-5 pt-2">
        <!-- Info pricing -->
        <div
          class="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3"
        >
          <i class="pi pi-sparkles text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-purple-800 text-sm mb-1">
              Crédits IA Lumina
            </p>
            <p class="text-sm text-purple-700 leading-relaxed">
              <strong>{{ pricing.price_per_credit }} FCFA</strong> par crédit. 1
              crédit = 1 correction complète des 3 tâches EE.
            </p>
            <p class="text-xs text-purple-600 mt-1">
              Min {{ pricing.min_purchase }} — Max
              {{ pricing.max_purchase }} crédits par achat.
            </p>
          </div>
        </div>

        <!-- Step 1 : Quantité -->
        <div v-if="step === 1" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-[var(--text-secondary)]">
              Nombre de crédits
            </label>
            <InputNumber
              v-model="credits"
              :min="pricing.min_purchase"
              :max="pricing.max_purchase"
              fluid
              show-buttons
              button-layout="horizontal"
              :step="1"
            >
              <template #decrementbuttonicon>
                <i class="pi pi-minus" />
              </template>
              <template #incrementbuttonicon>
                <i class="pi pi-plus" />
              </template>
            </InputNumber>
          </div>

          <!-- Exemples rapides -->
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="qty in [5, 10, 20, 50]"
              :key="qty"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer"
              :class="
                credits === qty
                  ? 'bg-gradient-primary text-white border-transparent'
                  : 'bg-[var(--bg-ground)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-primary-400)]'
              "
              @click="credits = qty"
            >
              {{ qty }} crédits
            </button>
          </div>

          <!-- Total -->
          <div
            class="bg-[var(--bg-ground)] rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p class="text-sm text-[var(--text-secondary)]">Total à payer</p>
              <p
                class="text-2xl font-extrabold text-[var(--color-primary-600)]"
              >
                {{ totalAmount.toLocaleString("fr-FR") }} FCFA
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-[var(--text-tertiary)]">
                {{ credits }} crédit{{ credits > 1 ? "s" : "" }}
              </p>
              <p class="text-xs text-[var(--text-tertiary)]">
                {{ pricing.price_per_credit }} FCFA/crédit
              </p>
            </div>
          </div>

          <!-- Méthode -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-[var(--text-secondary)]"
              >Méthode de paiement</label
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer font-inherit text-left"
                :class="
                  method === 'mobile_money'
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--color-primary-300)]'
                "
                @click="method = 'mobile_money'"
              >
                <i
                  class="pi pi-mobile text-lg"
                  :class="
                    method === 'mobile_money'
                      ? 'text-[var(--color-primary-600)]'
                      : 'text-[var(--text-tertiary)]'
                  "
                />
                <div>
                  <p
                    class="text-sm font-semibold"
                    :class="
                      method === 'mobile_money'
                        ? 'text-[var(--color-primary-700)]'
                        : 'text-[var(--text-primary)]'
                    "
                  >
                    Mobile Money
                  </p>
                  <p class="text-xs text-[var(--text-tertiary)]">Orange, MTN</p>
                </div>
              </button>
              <button
                class="flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer font-inherit text-left"
                :class="
                  method === 'paylink'
                    ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--color-primary-300)]'
                "
                @click="method = 'paylink'"
              >
                <i
                  class="pi pi-credit-card text-lg"
                  :class="
                    method === 'paylink'
                      ? 'text-[var(--color-primary-600)]'
                      : 'text-[var(--text-tertiary)]'
                  "
                />
                <div>
                  <p
                    class="text-sm font-semibold"
                    :class="
                      method === 'paylink'
                        ? 'text-[var(--color-primary-700)]'
                        : 'text-[var(--text-primary)]'
                    "
                  >
                    Lien de paiement
                  </p>
                  <p class="text-xs text-[var(--text-tertiary)]">
                    Carte, virement
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Téléphone si mobile money -->
          <div v-if="method === 'mobile_money'" class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-[var(--text-secondary)]"
              >Numéro de téléphone</label
            >
            <InputText v-model="phone" placeholder="ex: 691850913" fluid />
          </div>
        </div>

        <!-- Step 2 : USSD -->
        <div
          v-else-if="step === 2 && purchaseResult"
          class="flex flex-col gap-4"
        >
          <div
            class="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
          >
            <i class="pi pi-mobile text-3xl text-green-500 mb-2 block" />
            <p class="font-bold text-green-800 mb-1">Composez le code USSD</p>
            <p
              class="text-3xl font-extrabold text-green-700 my-3 tracking-widest"
            >
              {{ purchaseResult.ussd }}
            </p>
            <p class="text-sm text-green-700 leading-relaxed">
              Composez ce code sur votre téléphone et suivez les instructions
              pour valider le paiement de
              <strong
                >{{
                  purchaseResult.total_amount.toLocaleString("fr-FR")
                }}
                FCFA</strong
              >.
            </p>
          </div>
          <div
            class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
          >
            <i class="pi pi-info-circle text-amber-500 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-amber-800 leading-relaxed">
              Après validation, vos crédits seront ajoutés automatiquement à
              votre compte. Fermez ce dialog et rafraîchissez la page si
              nécessaire.
            </p>
          </div>
        </div>

        <!-- Step 2 : Paylink -->
        <div
          v-else-if="step === 2 && purchaseResult?.redirect_url"
          class="flex flex-col gap-4"
        >
          <div
            class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
          >
            <i class="pi pi-external-link text-3xl text-blue-500 mb-2 block" />
            <p class="font-bold text-blue-800 mb-1">Lien de paiement prêt</p>
            <p class="text-sm text-blue-700 leading-relaxed mb-3">
              Cliquez sur le bouton ci-dessous pour finaliser votre paiement de
              <strong
                >{{
                  purchaseResult.total_amount.toLocaleString("fr-FR")
                }}
                FCFA</strong
              >.
            </p>
            <a :href="purchaseResult.redirect_url" target="_blank">
              <Button
                label="Payer maintenant"
                icon="pi pi-external-link"
                class="bg-gradient-primary border-none font-bold"
              />
            </a>
          </div>
          <div
            class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
          >
            <i class="pi pi-info-circle text-amber-500 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-amber-800 leading-relaxed">
              Après paiement, vos crédits seront ajoutés automatiquement. Fermez
              ce dialog et rafraîchissez la page.
            </p>
          </div>
        </div>
      </div>
    </template>

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
        <Button
          v-else-if="step === 2"
          label="Terminé"
          icon="pi pi-check"
          severity="success"
          @click="close"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { CreditPricingResponse } from "#shared/api/models/CreditPricingResponse";
import type { PurchaseResponse } from "#shared/api/models/PurchaseResponse";
import type { SuccessResponse_CreditPricingResponse_ } from "#shared/api/models/SuccessResponse_CreditPricingResponse_";
import type { SuccessResponse_PurchaseResponse_ } from "#shared/api/models/SuccessResponse_PurchaseResponse_";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [boolean] }>();

const { get, post } = useApi();
const sub = useSubscriptionStore();
const toast = useToast();

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const loadingPricing = ref(false);
const purchasing = ref(false);
const pricing = ref<CreditPricingResponse | null>(null);
const credits = ref(5);
const method = ref<"mobile_money" | "paylink">("mobile_money");
const phone = ref("");
const step = ref(1);
const purchaseResult = ref<PurchaseResponse | null>(null);

const totalAmount = computed(
  () => (pricing.value?.price_per_credit ?? 0) * credits.value,
);

const canProceed = computed(() => {
  if (!credits.value || credits.value < (pricing.value?.min_purchase ?? 1))
    return false;
  if (method.value === "mobile_money" && !phone.value.trim()) return false;
  return true;
});

watch(
  () => props.modelValue,
  async (val) => {
    if (val && !pricing.value) {
      loadingPricing.value = true;
      try {
        const res = await get<SuccessResponse_CreditPricingResponse_>(
          "/v1/ai-credits/pricing",
        );
        pricing.value = res.data ?? null;
        if (pricing.value) credits.value = pricing.value.min_purchase;
      } finally {
        loadingPricing.value = false;
      }
    }
  },
);

async function purchase() {
  purchasing.value = true;
  try {
    const res = await post<SuccessResponse_PurchaseResponse_>(
      "/v1/ai-credits/purchase",
      {
        credits: credits.value,
        payment_method: method.value,
        phone_number: method.value === "mobile_money" ? phone.value : null,
      },
    );
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
  visible.value = false;
  setTimeout(() => {
    step.value = 1;
    purchaseResult.value = null;
    phone.value = "";
  }, 300);
  sub.fetchMySubscriptions();
}
</script>
