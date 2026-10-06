<template>
  <div>
    <h1 class="account-page-title">Programme de parrainage</h1>
    <ReferralIntro />

    <!-- Chargement -->
    <div v-if="store.loading" class="space-y-4">
      <div class="h-40 animate-pulse rounded-card bg-card" />
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded-card bg-card" />
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="store.error" class="account-section">
      <Message severity="error" :closable="false">{{ store.error }}</Message>
    </div>

    <div v-else-if="store.dashboard" class="space-y-6">
      <!-- Activations suspendues -->
      <div
        v-if="store.totals.is_suspended"
        role="alert"
        class="flex flex-col gap-4 rounded-card border border-red-300 bg-red-50 p-5 sm:flex-row sm:items-center dark:border-red-500/40 dark:bg-red-500/10"
      >
        <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
          <i class="pi pi-lock text-lg" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-heading text-base font-bold text-red-800 dark:text-red-200">
            Vos activations sont suspendues
          </p>
          <p class="mt-1 text-sm leading-relaxed text-red-700 dark:text-red-300">
            <span class="font-bold tabular-nums">{{ fcfa(store.totals.overdue_amount) }} FCFA</span>
            n'ont pas été reversés dans le délai de {{ delayHours }} h.
            Déposez ce montant par Mobile Money
            <template v-if="store.contract?.numero_mobile_money_reception">
              au <span class="font-semibold">{{ store.contract.numero_mobile_money_reception }}</span>
            </template>
            pour retrouver l'accès aux activations dès réception.
          </p>
        </div>
      </div>

      <!-- Pas de contrat -->
      <div
        v-else-if="!store.contract"
        class="flex items-start gap-4 rounded-card border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/40 dark:bg-amber-500/10"
      >
        <i class="pi pi-info-circle mt-0.5 text-amber-600 dark:text-amber-300" />
        <p class="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
          Aucun contrat d'ambassadeur signé n'est associé à votre compte. Contactez l'administration
          pour pouvoir activer des abonnements.
        </p>
      </div>

      <!-- Lien de parrainage -->
      <section class="account-section">
        <h2 class="account-section__title">Votre lien de parrainage</h2>

        <div class="flex flex-col gap-2.5 sm:flex-row">
          <div class="relative min-w-0 flex-1">
            <i class="pi pi-link pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-faint" />
            <input
              :value="store.referralLink"
              readonly
              aria-label="Votre lien de parrainage"
              class="w-full truncate rounded-xl border border-line bg-card-2 py-2.5 pr-3 pl-10 font-mono text-sm text-ink outline-none focus:border-primary"
              @focus="($event.target as HTMLInputElement).select()"
            />
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            :class="
              copied
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                : 'border border-line bg-card text-ink hover:border-primary/40 hover:text-primary'
            "
            @click="copyLink"
          >
            <i :class="copied ? 'pi pi-check' : 'pi pi-copy'" />
            {{ copied ? "Copié" : "Copier" }}
          </button>
        </div>

        <a
          :href="whatsappShareUrl"
          target="_blank"
          rel="noopener"
          class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-[#1ebe5a] hover:shadow-lift sm:w-auto"
        >
          <i class="pi pi-whatsapp" />
          Partager sur WhatsApp
        </a>
      </section>

      <!-- Bilan -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div class="rounded-card border border-line bg-card p-4 shadow-soft sm:p-5">
          <p class="text-xs font-semibold tracking-wider text-faint uppercase">Total encaissé</p>
          <p class="mt-1 font-heading text-xl font-extrabold text-ink tabular-nums sm:text-2xl">
            {{ fcfa(store.totals.total_collected) }}
            <span class="text-xs font-bold text-muted">FCFA</span>
          </p>
          <p class="mt-1 text-xs text-muted">{{ store.totals.sales_count }} vente(s)</p>
        </div>

        <div class="rounded-card border border-line bg-card p-4 shadow-soft sm:p-5">
          <p class="text-xs font-semibold tracking-wider text-faint uppercase">Mes gains</p>
          <p class="mt-1 font-heading text-xl font-extrabold text-emerald-600 tabular-nums sm:text-2xl dark:text-emerald-400">
            {{ fcfa(store.totalEarnings) }}
            <span class="text-xs font-bold text-muted">FCFA</span>
          </p>
          <p class="mt-1 text-xs text-muted">{{ store.referredCount }} filleul(s)</p>
        </div>

        <div class="rounded-card border border-line bg-card p-4 shadow-soft sm:p-5">
          <p class="text-xs font-semibold tracking-wider text-faint uppercase">Déjà reversé</p>
          <p class="mt-1 font-heading text-xl font-extrabold text-ink tabular-nums sm:text-2xl">
            {{ fcfa(store.totals.total_remitted) }}
            <span class="text-xs font-bold text-muted">FCFA</span>
          </p>
          <p class="mt-1 text-xs text-muted">{{ store.remittances.length }} reversement(s)</p>
        </div>

        <div class="rounded-card border p-4 shadow-soft sm:p-5" :class="balanceTone.card">
          <p class="text-xs font-semibold tracking-wider uppercase" :class="balanceTone.text">
            Reste à reverser
          </p>
          <p class="mt-1 font-heading text-xl font-extrabold tabular-nums sm:text-2xl" :class="balanceTone.text">
            {{ fcfa(store.totals.balance_due) }}
            <span class="text-xs font-bold opacity-70">FCFA</span>
          </p>
          <p class="mt-1 text-xs opacity-80" :class="balanceTone.text">{{ balanceTone.hint }}</p>
        </div>
      </div>

      <!-- Mon contrat -->
      <section v-if="store.contract" class="account-section">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary">
              <i class="pi pi-file-edit" />
            </span>
            <div class="min-w-0">
              <h2 class="font-heading text-base font-bold text-ink">Mon contrat</h2>
              <p class="text-xs text-muted">
                <span class="font-mono">{{ store.contract.numero }}</span>
                <template v-if="store.contract.date_signature">
                  · signé le {{ formatDay(store.contract.date_signature) }}
                </template>
              </p>
            </div>
          </div>
          <AppButton
            label="Télécharger"
            icon="pi pi-download"
            variant="secondary"
            size="small"
            :loading="downloadingContract"
            @click="downloadContract"
          />
        </div>

        <dl class="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          <div>
            <dt class="text-xs text-faint">Commission</dt>
            <dd class="font-heading text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {{ store.contract.taux_commission }} %
            </dd>
          </div>
          <div>
            <dt class="text-xs text-faint">Délai de reversement</dt>
            <dd class="text-sm font-semibold text-ink">{{ store.contract.delai_reversement_heures }} h</dd>
          </div>
          <div>
            <dt class="text-xs text-faint">Reversement</dt>
            <dd class="text-sm font-semibold text-ink">
              Mobile Money
              <span v-if="store.contract.numero_mobile_money_reception" class="block text-xs font-normal text-muted">
                {{ store.contract.numero_mobile_money_reception }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-xs text-faint">Durée</dt>
            <dd class="text-sm font-semibold text-ink">{{ store.contract.duree_mois }} mois, renouvelable</dd>
          </div>
        </dl>
      </section>

      <!-- Mes ventes -->
      <section class="account-section">
        <h2 class="account-section__title">Mes ventes</h2>

        <div
          v-if="!store.sales.length"
          class="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card-2/40 px-6 py-10 text-center"
        >
          <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
            <i class="pi pi-shopping-bag text-2xl" />
          </span>
          <p class="text-sm font-medium text-muted">Aucune vente pour l'instant.</p>
        </div>

        <ul v-else class="divide-y divide-line">
          <li
            v-for="sale in store.sales"
            :key="sale.earning_id"
            class="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-ink">{{ sale.client_name }}</p>
              <p class="text-xs text-muted">
                {{ sale.plan_name ?? "Forfait" }} · {{ formatDate(sale.created_at) }}
              </p>
              <p
                v-if="sale.status !== 'settled'"
                class="mt-0.5 text-xs font-medium"
                :class="sale.is_overdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'"
              >
                <i class="pi pi-clock mr-1 text-[0.6875rem]" />
                {{ sale.is_overdue ? "En retard depuis le" : "À reverser avant le" }}
                {{ formatDate(sale.deadline_at, true) }}
              </p>
            </div>

            <div class="grid grid-cols-3 gap-3 text-right sm:w-80">
              <div>
                <p class="text-[0.6875rem] text-faint">Encaissé</p>
                <p class="text-sm font-semibold text-ink tabular-nums">{{ fcfa(sale.sale_amount) }}</p>
              </div>
              <div>
                <p class="text-[0.6875rem] text-faint">Mon gain</p>
                <p class="text-sm font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                  {{ fcfa(sale.commission) }}
                </p>
              </div>
              <div>
                <p class="text-[0.6875rem] text-faint">À reverser</p>
                <p class="text-sm font-bold text-ink tabular-nums">{{ fcfa(sale.amount_due) }}</p>
              </div>
            </div>

            <span
              class="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:w-28 sm:justify-center"
              :class="statusStyle(sale).class"
            >
              <span class="size-1.5 rounded-full" :class="statusStyle(sale).dot" />
              {{ statusStyle(sale).label }}
            </span>
          </li>
        </ul>
      </section>

      <!-- Reversements -->
      <section v-if="store.remittances.length" class="account-section">
        <h2 class="account-section__title">Mes reversements</h2>
        <ul class="divide-y divide-line">
          <li
            v-for="r in store.remittances"
            :key="r.id"
            class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">{{ METHOD_LABEL[r.method] ?? r.method }}</p>
              <p class="truncate text-xs text-muted">
                {{ formatDay(r.paid_at) }}<template v-if="r.reference"> · Réf. {{ r.reference }}</template>
              </p>
            </div>
            <span class="font-heading text-sm font-bold text-ink tabular-nums">
              {{ fcfa(r.amount) }} FCFA
            </span>
          </li>
        </ul>
      </section>

      <!-- Filleuls -->
      <section class="account-section">
        <h2 class="account-section__title">Vos filleuls</h2>

        <div
          v-if="!store.referredUsers.length"
          class="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card-2/40 px-6 py-10 text-center"
        >
          <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
            <i class="pi pi-users text-2xl" />
          </span>
          <p class="text-sm font-medium text-muted">Aucun filleul pour l'instant.</p>
        </div>

        <ul v-else class="divide-y divide-line">
          <li
            v-for="ru in store.referredUsers"
            :key="ru.user_id"
            class="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
          >
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <span
                class="grid size-10 shrink-0 place-items-center rounded-leaf font-heading text-sm font-bold"
                :class="
                  ru.has_paid
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-card-2 text-muted'
                "
              >
                {{ ru.name.charAt(0).toUpperCase() }}
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-ink">{{ ru.name }}</p>
                <p class="text-xs text-muted">{{ formatDate(ru.joined_at) }}</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2.5 pl-13 sm:justify-end sm:pl-0">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="
                  ru.has_paid
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                "
              >
                <span class="size-1.5 rounded-full" :class="ru.has_paid ? 'bg-emerald-500' : 'bg-amber-500'" />
                {{ ru.has_paid ? "Payé" : "Pas encore payé" }}
              </span>

              <span
                v-if="ru.has_paid"
                class="font-heading text-sm font-bold text-emerald-600 tabular-nums dark:text-emerald-400"
              >
                +{{ fcfa(ru.total_earned_from_this_user) }} FCFA
              </span>
              <AppButton
                v-else
                label="Activer abonnement"
                :icon="store.canActivate ? 'pi pi-check-circle' : 'pi pi-lock'"
                variant="secondary"
                size="small"
                :disabled="!store.canActivate"
                @click="openActivateDialog(ru)"
              />
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Dialog activation -->
    <Dialog
      v-model:visible="activateDialogOpen"
      modal
      :draggable="false"
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <i class="pi pi-check-circle" />
          </span>
          <div class="min-w-0">
            <h3 class="font-heading text-lg leading-tight font-bold text-ink">Activer un abonnement</h3>
            <p class="truncate text-sm text-muted">{{ selectedReferral?.name ?? "" }}</p>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="referral-plan" class="text-sm font-semibold text-ink">Plan</label>
          <Select
            v-model="selectedPlanId"
            input-id="referral-plan"
            :options="planOptions"
            option-label="label"
            option-value="value"
            placeholder="Choisir un plan"
            fluid
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="referral-promo" class="text-sm font-semibold text-ink">
            Code promo <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <InputText id="referral-promo" v-model="promoCode" placeholder="Ex : PARTNER10" fluid />
        </div>

        <div v-if="selectedPlan" class="rounded-xl border border-line bg-card-2 p-3.5 text-sm">
          <div class="flex justify-between text-muted">
            <span>Prix encaissé</span>
            <span class="font-semibold text-ink tabular-nums">{{ fcfa(selectedPlan.price) }} FCFA</span>
          </div>
          <div class="mt-1 flex justify-between text-muted">
            <span>Votre gain ({{ commissionRate }} %)</span>
            <span class="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
              {{ fcfa(estimatedCommission) }} FCFA
            </span>
          </div>
          <div class="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink">
            <span>À reverser sous {{ delayHours }} h</span>
            <span class="tabular-nums">{{ fcfa(selectedPlan.price - estimatedCommission) }} FCFA</span>
          </div>
          <p class="mt-2 text-xs text-faint">
            En confirmant, vous déclarez avoir encaissé ce montant auprès du client. Montants estimés hors code promo.
          </p>
        </div>

        <Message v-if="store.activateError" severity="error" :closable="false">
          {{ store.activateError }}
        </Message>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="activateDialogOpen = false" />
        <AppButton
          label="Confirmer"
          icon="pi pi-check"
          variant="gradient"
          :loading="store.activating"
          :disabled="!selectedPlanId || !store.canActivate"
          @click="handleActivate"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { AmbassadorSaleItem } from "~/stores/referrals";

definePageMeta({ layout: "ambassador", middleware: "auth" });

const METHOD_LABEL: Record<string, string> = {
  mobile_money: "Mobile Money",
  cash: "Espèces",
  bank_transfer: "Virement",
};

const store = useReferralsStore();
const subscriptionStore = useSubscriptionStore();
const pdf = usePdf();
const toast = useToast();

const copied = ref(false);
const activateDialogOpen = ref(false);
const selectedReferral = ref<{ user_id: string; name: string } | null>(null);
const selectedPlanId = ref("");
const promoCode = ref("");
const downloadingContract = ref(false);

const commissionRate = computed(() => store.contract?.taux_commission ?? 0);
const delayHours = computed(() => store.contract?.delai_reversement_heures ?? 24);

const balanceTone = computed(() => {
  if (store.totals.is_suspended) {
    return {
      card: "border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10",
      text: "text-red-700 dark:text-red-300",
      hint: "Délai dépassé",
    };
  }
  if (store.totals.balance_due > 0) {
    return {
      card: "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      hint: `À déposer sous ${delayHours.value} h`,
    };
  }
  return {
    card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    hint: "Vous êtes à jour",
  };
});

function statusStyle(sale: AmbassadorSaleItem) {
  if (sale.status === "settled") {
    return {
      label: "Reversé",
      class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      dot: "bg-emerald-500",
    };
  }
  if (sale.is_overdue) {
    return {
      label: "En retard",
      class: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
      dot: "bg-red-500",
    };
  }
  if (sale.status === "partial") {
    return {
      label: "Partiel",
      class: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      dot: "bg-sky-500",
    };
  }
  return {
    label: "À reverser",
    class: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  };
}

const whatsappShareUrl = computed(() => {
  const text = `Rejoins OCanada avec mon lien de parrainage : ${store.referralLink}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
});

const planOptions = computed(() =>
  subscriptionStore.plans.map((p) => ({ label: p.name, value: p.id })),
);

const selectedPlan = computed(() => {
  const plan = subscriptionStore.plans.find((p) => p.id === selectedPlanId.value) as any;
  if (!plan) return null;
  return { price: Number(plan.price ?? 0) };
});

const estimatedCommission = computed(() =>
  selectedPlan.value ? Math.floor((selectedPlan.value.price * commissionRate.value) / 100) : 0,
);

const fcfa = (n: number) => Number(n ?? 0).toLocaleString("fr-FR");

const copyLink = async () => {
  await navigator.clipboard.writeText(store.referralLink);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

const formatDate = (d: string, withTime = false) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

const formatDay = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

async function downloadContract() {
  downloadingContract.value = true;
  try {
    await pdf.open("/v1/referrals/me/contract/pdf");
  } catch {
    toast.add({ severity: "error", summary: "Impossible d'ouvrir le contrat", life: 3000 });
  } finally {
    downloadingContract.value = false;
  }
}

const openActivateDialog = (ru: { user_id: string; name: string }) => {
  if (!store.canActivate) return;
  selectedReferral.value = { user_id: ru.user_id, name: ru.name };
  selectedPlanId.value = "";
  promoCode.value = "";
  store.activateError = null;
  activateDialogOpen.value = true;
};

const handleActivate = async () => {
  if (!selectedReferral.value) return;
  const res = await store.activateSubscriptionForReferral(
    selectedReferral.value.user_id,
    selectedPlanId.value,
    promoCode.value,
  );
  if (res.success) activateDialogOpen.value = false;
};

onMounted(async () => {
  await store.fetchDashboard();
  if (!subscriptionStore.plans.length) await subscriptionStore.fetchPlans();
});
</script>