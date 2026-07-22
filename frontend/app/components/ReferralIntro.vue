<!-- components/ReferralIntro.vue -->
<template>
  <div class="referral-intro">
    <div class="referral-intro__icon">
      <i class="pi pi-gift" />
    </div>
    <div class="referral-intro__text">
      <p class="referral-intro__title">Comment ça marche ?</p>
      <p class="referral-intro__desc">
        Partagez votre lien unique avec vos proches. Quand quelqu'un s'inscrit
        grâce à ce lien et souscrit à un abonnement, vous touchez une commission
        sur son paiement automatiquement créditée dans votre solde de gains.
      </p>
    </div>
  </div>
</template>

<style scoped>
.referral-intro {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-100);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.referral-intro__icon {
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.referral-intro__icon i {
  font-size: 1.125rem;
  color: #ffffff;
}

.referral-intro__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.375rem;
}

.referral-intro__desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 640px) {
  .referral-intro {
    flex-direction: column;
  }
}
</style>
