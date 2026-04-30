<template>
  <div>
    <!-- Forfait actuel -->
    <div class="account-section">
      <h2 class="account-section__title">Mon forfait</h2>

      <div class="plan-card">
        <div class="plan-card__left">
          <div class="plan-card__icon">
            <i class="pi pi-crown" />
          </div>
          <div>
            <Tag
              :value="
                sub.hasActiveSubscription
                  ? (sub.activePlan?.name ?? 'Premium')
                  : 'Gratuit'
              "
              :severity="sub.hasActiveSubscription ? 'success' : 'secondary'"
            />
            <p class="plan-card__name">
              {{
                sub.hasActiveSubscription
                  ? sub.activePlan?.name
                  : "Forfait Gratuit"
              }}
            </p>
            <p v-if="sub.activeSubscription" class="plan-card__expiry">
              Expire le {{ formatDate(sub.activeSubscription.end_date) }}
            </p>
          </div>
        </div>
        <NuxtLink to="/tarifs">
          <Button
            :label="
              sub.hasActiveSubscription
                ? 'Changer de forfait'
                : 'Passer à un forfait'
            "
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="plan-card__btn bg-gradient-primary"
          />
        </NuxtLink>
      </div>

      <!-- Crédits IA -->
      <div v-if="sub.hasActiveSubscription" class="ai-credits">
        <div class="ai-credits__header">
          <span class="ai-credits__label">
            <i class="pi pi-sparkles" /> Crédits IA restants
          </span>
          <span class="ai-credits__value">{{ sub.aiCreditsRemaining }}</span>
        </div>
        <ProgressBar :value="aiCreditsPercent" class="ai-credits__bar" />
      </div>
    </div>

    <!-- Vos accès -->
    <div class="account-section">
      <h2 class="account-section__title">Vos accès inclus</h2>
      <div class="access-grid">
        <NuxtLink
          v-for="epreuve in epreuves"
          :key="epreuve.slug"
          :to="`/epreuve/${epreuve.slug}/series`"
          class="access-card"
        >
          <div
            class="access-card__icon"
            :style="{ background: epreuve.iconBg }"
          >
            <i :class="epreuve.icon" :style="{ color: epreuve.iconColor }" />
          </div>
          <div class="access-card__body">
            <h3>{{ epreuve.title }}</h3>
            <p>{{ epreuve.sub }}</p>
            <span class="access-card__badge">
              <i class="pi pi-check-circle" />
              {{
                sub.hasActiveSubscription ? "Accès illimité" : "Accès limité"
              }}
            </span>
          </div>
          <i class="pi pi-angle-right access-card__arrow" />
        </NuxtLink>
      </div>
    </div>

    <!-- CTA upgrade -->
    <div v-if="!sub.hasActiveSubscription" class="upgrade-banner">
      <div class="upgrade-banner__text">
        <h3>Passez à un forfait supérieur</h3>
        <p>
          Débloquez toutes les séries, plus de crédits IA et un suivi
          personnalisé.
        </p>
      </div>
      <NuxtLink to="/tarifs">
        <Button
          label="Voir les forfaits"
          icon="pi pi-arrow-right"
          icon-pos="right"
          class="upgrade-banner__btn"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "account", middleware: "auth" });

const sub = useSubscriptionStore();

await Promise.all([sub.fetchMySubscriptions(), sub.fetchPlans()]);

const aiCreditsPercent = computed(() => {
  if (!sub.activePlan) return 0;
  const total = sub.activePlan.ai_credits;
  if (!total) return 0;
  return Math.round((sub.aiCreditsRemaining / total) * 100);
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const epreuves = [
  {
    slug: "expression-ecrite",
    title: "Expression Écrite",
    sub: "Simulateur IA",
    icon: "pi pi-pen-to-square",
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
  },
  {
    slug: "expression-orale",
    title: "Expression Orale",
    sub: "Sujets d'actualités",
    icon: "pi pi-microphone",
    iconColor: "#d97706",
    iconBg: "#fffbeb",
  },
  {
    slug: "comprehension-ecrite",
    title: "Compréhension Écrite",
    sub: "Séries de quiz",
    icon: "pi pi-book",
    iconColor: "#1d4ed8",
    iconBg: "#eff6ff",
  },
  {
    slug: "comprehension-orale",
    title: "Compréhension Orale",
    sub: "Séries d'écoute",
    icon: "pi pi-headphones",
    iconColor: "#0d9488",
    iconBg: "#f0fdfa",
  },
];

useHead({ title: "Mon compte | Lumina TCF" });
</script>

<style scoped>
.plan-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  margin-bottom: 1rem;
}

.plan-card__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.plan-card__icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary-50);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-card__icon i {
  font-size: 1.25rem;
  color: var(--color-primary-600);
}

.plan-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0.25rem 0 0;
}

.plan-card__expiry {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0.125rem 0 0;
}

.plan-card__btn {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
}

.ai-credits {
  padding: 1rem;
  background: var(--bg-ground);
  border-radius: 0.75rem;
}

.ai-credits__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.ai-credits__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.ai-credits__label i {
  color: var(--color-primary-600);
  margin-right: 0.25rem;
}

.ai-credits__value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
}

.access-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.access-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.access-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.access-card__icon i {
  font-size: 1.125rem;
}

.access-card__body {
  flex: 1;
  min-width: 0;
}

.access-card__body h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
}

.access-card__body p {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0 0 0.375rem;
}

.access-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-success-600);
}

.access-card__badge i {
  font-size: 0.75rem;
}

.access-card__arrow {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.upgrade-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #0f172a;
  border-radius: 1rem;
}

.upgrade-banner__text h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.375rem;
}

.upgrade-banner__text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

.upgrade-banner__btn {
  background: #ffffff !important;
  color: #0f172a !important;
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .access-grid {
    grid-template-columns: 1fr;
  }
  .plan-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .upgrade-banner {
    flex-direction: column;
  }
}
</style>
