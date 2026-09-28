<template>
  <div>
    <h1 class="account-page-title">Programme de parrainage</h1>
    <ReferralIntro />

    <!-- Chargement -->
    <div v-if="store.loading" class="space-y-4">
      <div class="h-40 animate-pulse rounded-card bg-card" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="h-28 animate-pulse rounded-card bg-card" />
        <div class="h-28 animate-pulse rounded-card bg-card" />
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="store.error" class="account-section">
      <Message severity="error" :closable="false">{{ store.error }}</Message>
    </div>

    <div v-else-if="store.dashboard" class="space-y-6">
      <!-- Lien de parrainage -->
      <section class="account-section">
        <h2 class="account-section__title">Votre lien de parrainage</h2>

        <div class="flex flex-col gap-2.5 sm:flex-row">
          <div class="relative min-w-0 flex-1">
            <i class="pi pi-link pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-faint" />
            <input
              :value="store.referralLink"
              readonly
              aria-label="Votre lien de parrainage"
              class="w-full truncate rounded-xl border border-line bg-card-2 py-2.5 pl-10 pr-3 font-mono text-sm text-ink outline-none focus:border-primary"
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

        
        <a  :href="whatsappShareUrl"
          target="_blank"
          rel="noopener"
          class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-[#1ebe5a] hover:shadow-lift sm:w-auto"
        >
          <i class="pi pi-whatsapp" />
          Partager sur WhatsApp
        </a>
      </section>

      <!-- Stats -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex items-center gap-4 rounded-card border border-line bg-card p-5 shadow-soft">
          <span class="grid size-12 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i class="pi pi-users text-lg" />
          </span>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-faint">Personnes parrainées</p>
            <p class="font-heading text-3xl font-extrabold tabular-nums text-ink">{{ store.referredCount }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4 rounded-card border border-line bg-card p-5 shadow-soft">
          <span class="grid size-12 shrink-0 place-items-center rounded-leaf bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <i class="pi pi-wallet text-lg" />
          </span>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wider text-faint">Gains cumulés</p>
            <p class="font-heading text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
              {{ Number(store.totalEarnings).toLocaleString("fr-FR") }}
              <span class="text-base font-bold text-muted">FCFA</span>
            </p>
          </div>
        </div>
      </div>

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
                class="font-heading text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
              >
                +{{ Number(ru.total_earned_from_this_user).toLocaleString("fr-FR") }} FCFA
              </span>
              <AppButton
                v-else
                label="Activer abonnement"
                icon="pi pi-check-circle"
                variant="secondary"
                size="small"
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
            <h3 class="font-heading text-lg font-bold leading-tight text-ink">Activer un abonnement</h3>
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
          :disabled="!selectedPlanId"
          @click="handleActivate"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "ambassador", middleware: "auth" });

const store = useReferralsStore();
const subscriptionStore = useSubscriptionStore();

const copied = ref(false);
const activateDialogOpen = ref(false);
const selectedReferral = ref<{ user_id: string; name: string } | null>(null);
const selectedPlanId = ref("");
const promoCode = ref("");

const whatsappShareUrl = computed(() => {
  const text = `Rejoins Lumina TCF avec mon lien de parrainage : ${store.referralLink}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
});

const planOptions = computed(() =>
  subscriptionStore.plans.map((p) => ({ label: p.name, value: p.id })),
);

const copyLink = async () => {
  await navigator.clipboard.writeText(store.referralLink);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const openActivateDialog = (ru: { user_id: string; name: string }) => {
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

<style scoped>
.parrainage-loading {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.parrainage-link-section {
  margin-bottom: 1.25rem;
}

.parrainage-link-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.parrainage-link-input {
  flex: 1;
  font-size: 0.875rem;
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--text-secondary);
}

.parrainage-whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  transition: background 0.2s ease;
}

.parrainage-whatsapp-btn:hover {
  background: #dcfce7;
}

.parrainage-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.parrainage-stat__label {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0 0 0.375rem;
}

.parrainage-stat__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.parrainage-stat__value--money {
  color: var(--color-primary-700);
}

.parrainage-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--text-tertiary);
}

.parrainage-empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

.parrainage-referral-list {
  display: flex;
  flex-direction: column;
}

.parrainage-referral-row {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-color);
}

.parrainage-referral-row:last-child {
  border-bottom: none;
}

.parrainage-referral-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  background: var(--bg-ground);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.parrainage-referral-avatar--paid {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
}

.parrainage-referral-info {
  flex: 1;
  min-width: 0;
}

.parrainage-referral-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.parrainage-referral-date {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
}

.parrainage-referral-right {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
}

.parrainage-referral-earned {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary-700);
  margin: 0.25rem 0 0;
  text-align: right;
}

.parrainage-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}
</style>
