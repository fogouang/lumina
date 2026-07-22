<template>
  <div>
    <h1 class="account-page-title">Programme de parrainage</h1>
    <ReferralIntro />

    <div v-if="store.loading" class="parrainage-loading">
      <ProgressSpinner style="width: 42px; height: 42px" />
    </div>

    <div v-else-if="store.error" class="account-section">
      <Message severity="error" :closable="false">{{ store.error }}</Message>
    </div>

    <template v-else-if="store.dashboard">
      <!-- Lien de parrainage -->
      <div class="account-section parrainage-link-section">
        <h2 class="account-section__title">Votre lien de parrainage</h2>
        <div class="parrainage-link-row">
          <input
            :value="store.referralLink"
            readonly
            class="parrainage-link-input"
          />
          <Button
            :label="copied ? 'Copié' : 'Copier'"
            :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
            :severity="copied ? 'success' : 'secondary'"
            @click="copyLink"
          />
        </div>
        <a
          :href="whatsappShareUrl"
          target="_blank"
          rel="noopener"
          class="parrainage-whatsapp-btn"
        >
          <i class="pi pi-whatsapp" />
          Partager sur WhatsApp
        </a>
      </div>

      <!-- Stats -->
      <div class="parrainage-stats-grid">
        <div class="account-section parrainage-stat">
          <p class="parrainage-stat__label">Personnes parrainées</p>
          <p class="parrainage-stat__value">{{ store.referredCount }}</p>
        </div>
        <div class="account-section parrainage-stat">
          <p class="parrainage-stat__label">Gains cumulés</p>
          <p class="parrainage-stat__value parrainage-stat__value--money">
            {{ store.totalEarnings }} FCFA
          </p>
        </div>
      </div>

      <!-- Filleuls -->
      <div class="account-section">
        <h2 class="account-section__title">Vos filleuls</h2>

        <div v-if="!store.referredUsers.length" class="parrainage-empty">
          <i class="pi pi-users" />
          <p>Aucun filleul pour l'instant.</p>
        </div>

        <div v-else class="parrainage-referral-list">
          <div
            v-for="ru in store.referredUsers"
            :key="ru.user_id"
            class="parrainage-referral-row"
          >
            <div
              class="parrainage-referral-avatar"
              :class="{ 'parrainage-referral-avatar--paid': ru.has_paid }"
            >
              {{ ru.name.charAt(0).toUpperCase() }}
            </div>
            <div class="parrainage-referral-info">
              <p class="parrainage-referral-name">{{ ru.name }}</p>
              <p class="parrainage-referral-date">
                {{ formatDate(ru.joined_at) }}
              </p>
            </div>
            <div class="parrainage-referral-right">
              <Tag
                :value="ru.has_paid ? 'Payé' : 'Pas encore payé'"
                :severity="ru.has_paid ? 'success' : 'warning'"
              />
              <p v-if="ru.has_paid" class="parrainage-referral-earned">
                +{{ ru.total_earned_from_this_user }} FCFA
              </p>
              <Button
                v-else
                label="Activer abonnement"
                icon="pi pi-check-circle"
                size="small"
                severity="secondary"
                @click="openActivateDialog(ru)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Dialog activation -->
    <Dialog
      v-model:visible="activateDialogOpen"
      :header="`Activer un abonnement pour ${selectedReferral?.name ?? ''}`"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '440px' }"
    >
      <div class="parrainage-dialog-body">
        <div class="auth-form__field">
          <label class="auth-form__label">Plan</label>
          <Select
            v-model="selectedPlanId"
            :options="planOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir un plan"
            class="w-full"
          />
        </div>
        <div class="auth-form__field">
          <label class="auth-form__label">Code promo (optionnel)</label>
          <InputText
            v-model="promoCode"
            placeholder="Ex: PARTNER10"
            class="w-full"
          />
        </div>
        <Message v-if="store.activateError" severity="error" :closable="false">
          {{ store.activateError }}
        </Message>
      </div>
      <template #footer>
        <Button label="Annuler" text @click="activateDialogOpen = false" />
        <Button
          label="Confirmer"
          icon="pi pi-check"
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
