<template>
  <div>
    <!-- Hero -->
    <section class="featured-panel px-4 pb-44 pt-32 sm:px-6 lg:px-8 lg:pt-40">
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />

      <div class="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <span
          v-reveal
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md"
        >
          <span class="size-1.5 rounded-full bg-accent-400" />
          Tarifs
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="mt-6 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          Choisissez votre <span class="text-accent-400">formule</span>
        </h1>
        <p v-reveal="{ delay: 200 }" class="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
          Sans engagement. Accès immédiat après paiement via Mobile Money.
        </p>
      </div>
    </section>

    <!-- Plans : chevauchent le bas du hero -->
    <section class="relative z-10 -mt-28 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-6xl">
        <!-- Chargement -->
        <div v-if="loading" class="grid items-start gap-6 md:grid-cols-3">
          <div
            v-for="n in 3"
            :key="n"
            class="rounded-[2rem_0.5rem] border border-line bg-card p-8 shadow-lift"
          >
            <Skeleton width="50%" height="1.5rem" />
            <Skeleton width="70%" height="3rem" class="mt-4" />
            <div class="mt-8 space-y-4">
              <Skeleton v-for="i in 5" :key="i" height="1rem" />
            </div>
            <Skeleton height="3.5rem" class="mt-8" border-radius="1.8rem 0.6rem" />
          </div>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="mx-auto max-w-md rounded-card border border-line bg-card p-8 text-center shadow-lift">
          <span class="mx-auto grid size-12 place-items-center rounded-leaf bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300">
            <i class="pi pi-exclamation-triangle text-lg" />
          </span>
          <p class="mt-4 font-medium text-ink">{{ error }}</p>
          <p class="mt-1 text-sm text-faint">Actualisez la page ou réessayez dans quelques instants.</p>
        </div>

        <!-- Cartes -->
        <div v-else class="grid items-center gap-6 md:grid-cols-3">
          <div
            v-for="(plan, idx) in b2cPlans"
            :key="plan.id"
            v-reveal="{ delay: 200 + idx * 120 }"
            :class="isFeatured(plan) ? 'md:-my-4 md:scale-[1.04]' : ''"
          >
            <article
              class="relative flex h-full flex-col rounded-[2rem_0.5rem] p-8 transition-all duration-300 ease-spring hover:-translate-y-1.5"
              :class="
                isFeatured(plan)
                  ? 'featured-panel text-white shadow-brand ring-2 ring-accent-400/60'
                  : 'border border-line bg-card shadow-lift hover:border-primary-200 dark:hover:border-primary-800'
              "
            >
              <!-- Badge -->
              <span
                v-if="isFeatured(plan)"
                class="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-accent-950"
              >
                <i class="pi pi-star-fill text-[0.65rem]" />
                Le plus choisi
              </span>

              <!-- En-tête -->
              <h3
                class="font-heading text-xl font-bold"
                :class="isFeatured(plan) ? 'text-white' : 'text-ink'"
              >
                {{ plan.name }}
              </h3>

              <div class="mt-4 flex items-baseline gap-2">
                <span
                  class="font-heading text-5xl font-extrabold leading-none tracking-tight"
                  :class="isFeatured(plan) ? 'text-white' : 'text-ink'"
                >
                  {{ formatPrice(plan.price) }}
                </span>
                <span
                  class="text-sm font-semibold"
                  :class="isFeatured(plan) ? 'text-white/70' : 'text-faint'"
                >
                  FCFA
                </span>
              </div>

              <div
                class="mt-4 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  isFeatured(plan)
                    ? 'bg-white/10 text-white'
                    : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                "
              >
                <i class="pi pi-clock text-[0.7rem]" />
                Accès : {{ formatDuration(plan.duration_days) }}
              </div>

              <!-- Fonctionnalités -->
              <ul
                class="mt-7 flex flex-1 flex-col gap-3 border-t pt-7"
                :class="isFeatured(plan) ? 'border-white/15' : 'border-line'"
              >
                <li
                  v-for="feat in getPlanFeatures(plan)"
                  :key="feat"
                  class="flex items-start gap-3 text-sm leading-relaxed"
                  :class="isFeatured(plan) ? 'text-white/85' : 'text-muted'"
                >
                  <i
                    class="pi pi-check-circle mt-0.5 shrink-0"
                    :class="isFeatured(plan) ? 'text-accent-400' : 'text-primary'"
                  />
                  {{ feat }}
                </li>
              </ul>

              <!-- Bonus IA -->
              <div
                class="mt-7 rounded-2xl border p-4"
                :class="
                  isFeatured(plan)
                    ? 'border-white/20 bg-white/10'
                    : 'border-accent-200 bg-accent-50 dark:border-accent-900 dark:bg-accent-950'
                "
              >
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-accent-400 px-2.5 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wider text-accent-950"
                >
                  <i class="pi pi-sparkles text-[0.65rem]" />
                  Bonus
                </span>
                <p
                  class="mt-2 text-sm leading-relaxed"
                  :class="isFeatured(plan) ? 'text-white/85' : 'text-accent-900 dark:text-accent-200'"
                >
                  Accès au simulateur d'expression écrite :
                  <strong class="font-extrabold">{{ plan.ai_credits }} essais inclus</strong>
                </p>
              </div>

              <!-- Actions -->
              <div class="mt-8 flex flex-col items-center gap-3">
                <AppCta
                  label="S'abonner"
                  icon="pi pi-arrow-right"
                  :variant="isFeatured(plan) ? 'light' : 'gradient'"
                  class="w-full"
                  @click="onChoosePlan(plan)"
                />
                <button
                  type="button"
                  class="text-sm font-medium underline-offset-4 transition-colors hover:underline"
                  :class="isFeatured(plan) ? 'text-white/75 hover:text-white' : 'text-primary'"
                >
                  En savoir plus
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Paiement et garanties -->
    <section class="px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      <div v-reveal class="mx-auto max-w-5xl rounded-card border border-line bg-card p-8 shadow-soft">
        <p class="text-center text-xs font-semibold uppercase tracking-widest text-faint">
          Moyens de paiement acceptés
        </p>
        <div class="mt-5 flex flex-wrap items-center justify-center gap-4">
          <img
            v-for="logo in paymentLogos"
            :key="logo.alt"
            :src="logo.src"
            :alt="logo.alt"
            class="h-10 rounded-lg border border-line bg-white object-contain px-2 py-1 grayscale-40 transition-all duration-300 hover:grayscale-0"
          />
        </div>

        <div class="mt-8 flex flex-wrap justify-center gap-3 border-t border-line pt-8">
          <span
            v-for="g in guarantees"
            :key="g.label"
            class="inline-flex items-center gap-2 rounded-full bg-card-2 px-4 py-2 text-sm font-medium text-muted"
          >
            <i :class="[g.icon, 'text-primary']" />
            {{ g.label }}
          </span>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="border-t border-line bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div class="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div class="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Questions sur les tarifs"
            subtitle="Paiement, formules, remboursement : l'essentiel avant de vous abonner."
          />
        </div>

        <div v-reveal="{ delay: 150 }">
          <Accordion value="0" class="flex flex-col gap-3">
            <AccordionPanel
              v-for="(faq, i) in faqs"
              :key="faq.q"
              :value="String(i)"
              class="overflow-hidden rounded-card border border-line bg-canvas transition-all duration-300 ease-spring [&.p-accordionpanel-active]:border-primary-200 [&.p-accordionpanel-active]:bg-card [&.p-accordionpanel-active]:shadow-lift dark:[&.p-accordionpanel-active]:border-primary-800"
            >
              <AccordionHeader
                class="bg-transparent px-6 py-5 text-left font-heading text-[0.9375rem] font-semibold text-ink hover:bg-card-2 [&_.p-accordionheader-toggle-icon]:text-primary"
              >
                {{ faq.q }}
              </AccordionHeader>
              <AccordionContent>
                <p class="border-t border-line px-6 py-5 text-[0.9375rem] leading-relaxed text-muted">
                  {{ faq.a }}
                </p>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </div>
      </div>
    </section>
  </div>

  <PaymentDialog v-model="paymentVisible" :plan="paymentPlan" />
</template>

<script setup lang="ts">
import type { PlanListResponse } from "#shared/api/models/PlanListResponse";
import type { SuccessResponse_list_PlanListResponse__ } from "#shared/api/models/SuccessResponse_list_PlanListResponse__";
import { PlanType } from "#shared/api/models/PlanType";
import { site } from "~/config/site";

definePageMeta({ navbarOverlay: true });

const { get } = useApi();
const auth = useAuthStore();
const { openLogin } = useAuthModal();
const toast = useToast();

const loading = ref(true);
const error = ref<string | null>(null);
const plans = ref<PlanListResponse[]>([]);

const paymentPlan = ref<PlanListResponse | null>(null);
const paymentVisible = ref(false);

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
  paymentPlan.value = plan;
  paymentVisible.value = true;
}

const paymentLogos = [
  { src: "/images/orange.jpg", alt: "Orange Money" },
  { src: "/images/momo.jpg", alt: "MTN MoMo" },
  { src: "/images/visa.png", alt: "Visa" },
  { src: "/images/master.png", alt: "Mastercard" },
  { src: "/images/paypal.png", alt: "PayPal" },
];

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

useHead({ title: `Tarifs | ${site.name}` });
</script>