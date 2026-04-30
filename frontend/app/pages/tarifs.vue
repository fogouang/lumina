<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <section class="tarifs-hero">
      <div class="container tarifs-hero__inner">
        <Tag value="Tarifs" severity="warning" />
        <h1 class="tarifs-hero__title">Choisissez votre formule</h1>
        <p class="tarifs-hero__sub">
          Sans engagement. Accès immédiat après paiement via Mobile Money.
        </p>
      </div>
      <div class="tarifs-hero__wave">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L60 72C120 64 240 48 360 42.7C480 37 600 43 720 48C840 53 960 59 1080 58.7C1200 59 1320 53 1380 50.7L1440 48V80H0Z"
            fill="var(--bg-ground)"
          />
        </svg>
      </div>
    </section>

    <!-- ── Plans ─────────────────────────────────────────────── -->
    <section class="section section--light">
      <div class="tarifs-payment">
        <p class="tarifs-payment__title">Moyens de paiement acceptés</p>
        <div class="tarifs-payment__logos">
          <img
            src="/images/orange.jpg"
            alt="Orange Money"
            class="tarifs-payment__logo"
          />
          <img
            src="/images/momo.jpg"
            alt="MTN MoMo"
            class="tarifs-payment__logo"
          />
          <img src="/images/visa.png" alt="Visa" class="tarifs-payment__logo" />
          <img
            src="/images/master.png"
            alt="Mastercard"
            class="tarifs-payment__logo"
          />
          <img
            src="/images/paypal.png"
            alt="PayPal"
            class="tarifs-payment__logo"
          />
        </div>
      </div>

      <div class="container">
        <div v-if="loading" class="tarifs-loading">
          <ProgressSpinner style="width: 40px; height: 40px" />
        </div>

        <div v-else-if="error" class="tarifs-error">
          <p>{{ error }}</p>
        </div>

        <div v-else class="tarifs-grid">
          <div
            v-for="(plan, idx) in b2cPlans"
            :key="plan.id"
            class="plan-card"
            :class="{ 'plan-card--featured': isFeatured(plan) }"
          >
            <!-- Ribbon -->
            <div class="plan-card__ribbon" :class="getRibbonClass(idx)">
              <span>Lumina</span>
            </div>

            <!-- Header -->
            <div class="plan-card__header">
              <h3 class="plan-card__name">{{ plan.name }}</h3>
              <div class="plan-card__price">
                <span class="plan-card__currency">FCFA</span>
                <span class="plan-card__amount">{{
                  formatPrice(plan.price)
                }}</span>
              </div>
            </div>

            <!-- Body -->
            <div class="plan-card__body">
              <ul class="plan-card__features">
                <li v-for="feat in getPlanFeatures(plan)" :key="feat">
                  <i class="pi pi-check-circle" />
                  {{ feat }}
                </li>
              </ul>

              <!-- Bonus IA -->
              <div class="plan-card__bonus">
                <span class="plan-card__bonus-tag">
                  <i class="pi pi-sparkles" /> BONUS
                </span>
                <p class="plan-card__bonus-text">
                  Accès au simulateur d'expression écrite :
                  <strong>{{ plan.ai_credits }} essais inclus</strong>
                </p>
              </div>

              <div class="plan-card__duration-badge">
                <i class="pi pi-clock" />
                Accès : {{ formatDuration(plan.duration_days) }}
              </div>
            </div>

            <!-- Footer -->
            <div class="plan-card__footer">
              <Button
                label="S'ABONNER"
                class="plan-card__btn w-full"
                @click="onChoosePlan(plan)"
              />
              <button class="plan-card__savoir">En savoir plus</button>
            </div>
          </div>
        </div>

        <!-- Garanties -->
        <div class="tarifs-guarantees">
          <div v-for="g in guarantees" :key="g.label" class="tarifs-guarantee">
            <i :class="g.icon" />
            <span>{{ g.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FAQ ───────────────────────────────────────────────── -->
    <section class="section section--white">
      <div class="container--narrow">
        <div class="section-header">
          <h2 class="section-title">Questions sur les tarifs</h2>
        </div>
        <Accordion>
          <AccordionPanel v-for="faq in faqs" :key="faq.q" :value="faq.q">
            <AccordionHeader>{{ faq.q }}</AccordionHeader>
            <AccordionContent>
              <p class="tarifs-faq__answer">{{ faq.a }}</p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PlanListResponse } from "#shared/api/models/PlanListResponse";
import type { SuccessResponse_list_PlanListResponse__ } from "#shared/api/models/SuccessResponse_list_PlanListResponse__";
import { PlanType } from "#shared/api/models/PlanType";

const { get } = useApi();
const auth = useAuthStore();
const { openLogin } = useAuthModal();
const toast = useToast();

const loading = ref(true);
const error = ref<string | null>(null);
const plans = ref<PlanListResponse[]>([]);

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_PlanListResponse__>(
      "/v1/plans?active_only=true",
    );
    plans.value = res.data ?? [];
  } catch {
    error.value = "Impossible de charger les plans.";
  } finally {
    loading.value = false;
  }
});

const b2cPlans = computed(() =>
  plans.value
    .filter((p) => p.type === PlanType.B2C)
    .sort((a, b) => a.price - b.price),
);

function isFeatured(plan: PlanListResponse): boolean {
  const idx = b2cPlans.value.indexOf(plan);
  return idx === Math.floor(b2cPlans.value.length / 2);
}

function getRibbonClass(idx: number): string {
  const classes = [
    "plan-card__ribbon--red",
    "plan-card__ribbon--dark",
    "plan-card__ribbon--amber",
  ];
  return classes[idx % classes.length] ?? "plan-card__ribbon--red";
}

function getPlanFeatures(plan: PlanListResponse): string[] {
  if (plan.features && typeof plan.features === "object") {
    const f = plan.features as Record<string, unknown>;
    if (Array.isArray(f.items)) return f.items as string[];
  }
  return [
    "Compréhension Écrite : 40 tests d'entraînement (simulation réelle)",
    "Compréhension Orale : 40 tests d'entraînement (simulation réelle)",
    "Expression Orale : Sujets d'Actualité et Corrections",
    "Expression Écrite : Sujets d'Actualité et Corrections",
    "Version 2026 : Contenus conformes aux dernières mises à jour",
  ];
}

function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR");
}

function formatDuration(days: number): string {
  if (days <= 7) return `${days} Jours`;
  if (days <= 31) return `${Math.round(days / 30)} Mois`;
  return `${Math.round(days / 30)} Mois`;
}

function onChoosePlan(plan: PlanListResponse) {
  if (!auth.isAuthenticated) {
    openLogin();
    return;
  }
  toast.add({
    severity: "info",
    summary: "Paiement",
    detail: `Redirection vers le paiement pour ${plan.name}...`,
    life: 3000,
  });
}

const guarantees = [
  { icon: "pi pi-shield", label: "Paiement sécurisé" },
  { icon: "pi pi-mobile", label: "Mobile Money (Orange, MTN)" },
  { icon: "pi pi-bolt", label: "Accès immédiat après paiement" },
  { icon: "pi pi-refresh", label: "Contenus mis à jour régulièrement" },
];

const faqs = [
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement est sécurisé via Mobile Money (Orange Money, MTN MoMo). Votre accès est activé immédiatement après confirmation.",
  },
  {
    q: "Puis-je changer de formule ?",
    a: "Oui, vous pouvez passer à une formule supérieure à tout moment.",
  },
  {
    q: "Y a-t-il une politique de remboursement ?",
    a: "Si vous n'êtes pas satisfait dans les 24h suivant l'achat, contactez notre support pour un remboursement complet.",
  },
  {
    q: "Les crédits IA sont-ils renouvelables ?",
    a: "Les crédits IA sont valables pendant toute la durée de votre abonnement. Vous pouvez en acheter des supplémentaires.",
  },
];

useHead({ title: "Tarifs | Lumina TCF" });
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────── */
.tarifs-hero {
  position: relative;
  background: var(--gradient-primary);
  padding: 3.5rem 0 5rem;
  text-align: center;
}

.tarifs-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.tarifs-hero__title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.tarifs-hero__sub {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  max-width: 520px;
}

.tarifs-hero__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.tarifs-hero__wave svg {
  width: 100%;
  display: block;
}

/* ── Loading ───────────────────────────────────────────────── */
.tarifs-loading,
.tarifs-error {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
  color: var(--text-secondary);
}

/* ── Grid ──────────────────────────────────────────────────── */
.tarifs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
  margin-bottom: 3rem;
}

/* ── Card ──────────────────────────────────────────────────── */
.plan-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  overflow: hidden;
  position: relative;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.plan-card--featured {
  border: 2px solid var(--color-primary-500);
  transform: scale(1.03);
}

.plan-card--featured:hover {
  transform: scale(1.03) translateY(-4px);
}

/* ── Ribbon ────────────────────────────────────────────────── */
.plan-card__ribbon {
  position: absolute;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  overflow: hidden;
  z-index: 2;
}

.plan-card__ribbon span {
  position: absolute;
  top: 18px;
  right: -22px;
  width: 100px;
  text-align: center;
  font-size: 0.625rem;
  font-weight: 800;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 0;
  transform: rotate(45deg);
}

.plan-card__ribbon--red span {
  background: #a80d26;
}
.plan-card__ribbon--dark span {
  background: #475569;
}
.plan-card__ribbon--amber span {
  background: #b45309;
}

/* ── Header ────────────────────────────────────────────────── */
.plan-card__header {
  background: var(--gradient-primary);
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
}

.plan-card__name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.75rem;
}

.plan-card__price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.plan-card__amount {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.plan-card__currency {
  font-size: 0.9375rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  align-self: flex-start;
  margin-top: 0.625rem;
}

/* ── Body ──────────────────────────────────────────────────── */
.plan-card__body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.plan-card__features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.plan-card__features li {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--border-color);
  text-align: left;
}

.plan-card__features li:last-child {
  border-bottom: none;
}

.plan-card__features li i {
  color: var(--color-primary-500);
  font-size: 0.875rem;
  margin-top: 2px;
  flex-shrink: 0;
}

/* Bonus */
.plan-card__bonus {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.plan-card__bonus-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #16a34a;
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  width: fit-content;
}

.plan-card__bonus-text {
  font-size: 0.875rem;
  color: #15803d;
  line-height: 1.5;
  margin: 0;
}

.plan-card__bonus-text strong {
  font-weight: 800;
}

/* Duration */
.plan-card__duration-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
}

.plan-card__duration-badge i {
  color: var(--color-primary-500);
}

/* Footer */
.plan-card__footer {
  padding: 0 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.plan-card__btn {
  background: var(--gradient-primary) !important;
  border: none !important;
  border-radius: 9999px !important;
  font-weight: 800 !important;
  font-size: 1rem !important;
  letter-spacing: 0.06em !important;
  padding: 0.875rem !important;
}

.plan-card__savoir {
  font-size: 0.8125rem;
  color: var(--color-primary-600);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.w-full {
  width: 100% !important;
}

/* ── Garanties ─────────────────────────────────────────────── */
.tarifs-guarantees {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 2rem 0;
  border-top: 1px solid var(--border-color);
}

.tarifs-guarantee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.tarifs-guarantee i {
  color: var(--color-primary-500);
}

/* ── FAQ ───────────────────────────────────────────────────── */
.tarifs-faq__answer {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0;
}

@media (max-width: 768px) {
  .plan-card--featured {
    transform: none;
  }
  .plan-card--featured:hover {
    transform: translateY(-4px);
  }
  .tarifs-guarantees {
    gap: 1rem;
  }
}
.tarifs-payment {
  text-align: center;
  margin-bottom: 2rem;
}

.tarifs-payment__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.tarifs-payment__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.tarifs-payment__logo {
  height: 40px;
  border-radius: 0.5rem;
  object-fit: contain;
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  background: #fff;
}
</style>
