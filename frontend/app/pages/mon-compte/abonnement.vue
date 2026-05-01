<template>
  <div>
    <h1 class="account-page-title">Mon abonnement</h1>

    <div v-if="loading" class="account-section" style="display:flex;justify-content:center;padding:3rem">
      <ProgressSpinner style="width:40px;height:40px" />
    </div>

    <template v-else>

      <!-- Plan actuel -->
      <div class="account-section" style="margin-bottom:1.5rem">
        <h2 class="account-section__title">Plan actuel</h2>

        <div v-if="sub.hasActiveSubscription" class="abo-plan">
          <div class="abo-plan__header">
            <div class="abo-plan__icon">
              <i class="pi pi-crown" />
            </div>
            <div>
              <p class="abo-plan__name">{{ sub.activePlan?.name ?? 'Premium' }}</p>
              <Tag value="Actif" severity="success" />
            </div>
          </div>

          <div class="abo-plan__details">
            <div class="abo-plan__detail">
              <span class="abo-plan__detail-label">Date de début</span>
              <span class="abo-plan__detail-value">{{ formatDate(sub.activeSubscription!.start_date) }}</span>
            </div>
            <div class="abo-plan__detail">
              <span class="abo-plan__detail-label">Date d'expiration</span>
              <span class="abo-plan__detail-value abo-plan__detail-value--expiry">
                {{ formatDate(sub.activeSubscription!.end_date) }}
              </span>
            </div>
            <div class="abo-plan__detail">
              <span class="abo-plan__detail-label">Jours restants</span>
              <span class="abo-plan__detail-value">{{ daysLeft }} jours</span>
            </div>
            <div class="abo-plan__detail">
              <span class="abo-plan__detail-label">Crédits IA restants</span>
              <span class="abo-plan__detail-value">{{ sub.aiCreditsRemaining }}</span>
            </div>
          </div>

          <!-- Barre expiration -->
          <div class="abo-plan__progress">
            <div class="abo-plan__progress-header">
              <span>Progression de l'abonnement</span>
              <span>{{ daysUsed }} / {{ totalDays }} jours</span>
            </div>
            <ProgressBar :value="daysPercent" class="abo-plan__bar" />
          </div>

        </div>

        <div v-else class="abo-empty">
          <i class="pi pi-crown" />
          <p>Vous n'avez pas d'abonnement actif.</p>
          <NuxtLink to="/tarifs">
            <Button label="Voir les prix" icon="pi pi-arrow-right" icon-pos="right" class="bg-gradient-primary" />
          </NuxtLink>
        </div>
      </div>

      <!-- Crédits IA -->
      <div v-if="sub.hasActiveSubscription" class="account-section">
        <h2 class="account-section__title">Crédits IA</h2>
        <div class="abo-credits">
          <div class="abo-credits__icon">
            <i class="pi pi-sparkles" />
          </div>
          <div class="abo-credits__body">
            <div class="abo-credits__numbers">
              <span class="abo-credits__value">{{ sub.aiCreditsRemaining }}</span>
              <span class="abo-credits__total">/ {{ sub.activePlan?.ai_credits ?? '—' }} crédits</span>
            </div>
            <p class="abo-credits__desc">
              Utilisez vos crédits pour obtenir des corrections IA de vos expressions écrites.
            </p>
            <ProgressBar :value="aiCreditsPercent" class="abo-credits__bar" />
          </div>
        </div>
      </div>

      <!-- CTA upgrade -->
      <div class="account-section abo-upgrade">
        <div class="abo-upgrade__text">
          <h3>{{ sub.hasActiveSubscription ? 'Renouveler ou changer de formule' : 'Passer à un forfait supérieur' }}</h3>
          <p>Accédez à toutes les séries et maximisez vos chances de réussite.</p>
        </div>
        <NuxtLink to="/tarifs">
          <Button
            label="Voir les prix"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="bg-gradient-primary"
          />
        </NuxtLink>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'account', middleware: 'auth' })

const sub     = useSubscriptionStore()
const loading = ref(true)

onMounted(async () => {
  await Promise.all([sub.fetchMySubscriptions(), sub.fetchPlans()])
  loading.value = false
})

const daysLeft = computed(() => {
  if (!sub.activeSubscription) return 0
  const diff = new Date(sub.activeSubscription.end_date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const totalDays = computed(() => sub.activePlan?.duration_days ?? 30)

const daysUsed = computed(() => {
  if (!sub.activeSubscription) return 0
  const start = new Date(sub.activeSubscription.start_date).getTime()
  const diff  = Date.now() - start
  return Math.min(totalDays.value, Math.floor(diff / (1000 * 60 * 60 * 24)))
})

const daysPercent = computed(() =>
  totalDays.value ? Math.round((daysUsed.value / totalDays.value) * 100) : 0
)

const aiCreditsPercent = computed(() => {
  const total = sub.activePlan?.ai_credits
  if (!total) return 0
  return Math.round((sub.aiCreditsRemaining / total) * 100)
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

useHead({ title: 'Abonnement | Lumina TCF' })
</script>

<style scoped>
/* Plan actuel */
.abo-plan { display: flex; flex-direction: column; gap: 1.5rem; }

.abo-plan__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.abo-plan__icon {
  width: 52px; height: 52px;
  background: var(--color-primary-50);
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
}

.abo-plan__icon i { font-size: 1.375rem; color: var(--color-primary-600); }

.abo-plan__name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.abo-plan__details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.abo-plan__detail {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem;
  background: var(--bg-ground);
  border-radius: 0.75rem;
}

.abo-plan__detail-label {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.abo-plan__detail-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.abo-plan__detail-value--expiry { color: var(--color-primary-600); }

.abo-plan__progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

/* Empty */
.abo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  text-align: center;
  color: var(--text-secondary);
}

.abo-empty i { font-size: 2.5rem; color: var(--border-color); }
.abo-empty p { margin: 0; }

/* Crédits */
.abo-credits {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.abo-credits__icon {
  width: 48px; height: 48px;
  background: #f5f3ff;
  border-radius: 0.875rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.abo-credits__icon i { font-size: 1.25rem; color: #7c3aed; }

.abo-credits__body { flex: 1; }

.abo-credits__numbers {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
  margin-bottom: 0.375rem;
}

.abo-credits__value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
}

.abo-credits__total {
  font-size: 0.9rem;
  color: var(--text-tertiary);
}

.abo-credits__desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.abo-credits__bar { margin-top: 0.5rem; }

/* Upgrade */
.abo-upgrade {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: #0f172a !important;
}

.abo-upgrade__text h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.375rem;
}

.abo-upgrade__text p {
  font-size: 0.875rem;
  color: rgba(255,255,255,0.65);
  margin: 0;
}

@media (max-width: 640px) {
  .abo-plan__details { grid-template-columns: 1fr; }
  .abo-upgrade       { flex-direction: column; align-items: flex-start; }
}
</style>