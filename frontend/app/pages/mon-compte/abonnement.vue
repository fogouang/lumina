<template>
  <div class="flex flex-col gap-6">
    <h1 class="account-page-title mb-0">Mon abonnement</h1>

    <!-- Chargement -->
    <template v-if="loading">
      <Skeleton height="16rem" border-radius="2rem 0.5rem" />
      <div class="grid gap-6 lg:grid-cols-2">
        <Skeleton height="12rem" border-radius="1rem" />
        <Skeleton height="12rem" border-radius="1rem" />
      </div>
    </template>

    <template v-else>
      <!-- Plan actuel -->
      <div v-if="sub.hasActiveSubscription" v-reveal>
        <div class="featured-panel rounded-[2rem_0.5rem] p-6 text-white shadow-brand sm:p-8">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-4">
              <span class="grid size-13 shrink-0 place-items-center rounded-[1.2rem_0.4rem] bg-accent-400 text-accent-950 shadow-soft">
                <i class="pi pi-crown text-xl" />
              </span>
              <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-white/60">Plan actuel</p>
                <p class="mt-1 font-heading text-2xl font-extrabold">{{ sub.activePlan?.name ?? "Premium" }}</p>
              </div>
            </div>
            <span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-400/20 px-3 py-1 text-xs font-bold text-green-200">
              <span class="size-1.5 rounded-full bg-green-300" />
              Actif
            </span>
          </div>

          <dl class="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <dt class="text-xs text-white/65">Date de début</dt>
              <dd class="mt-1 font-semibold">{{ formatDate(sub.activeSubscription!.start_date) }}</dd>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <dt class="text-xs text-white/65">Date d'expiration</dt>
              <dd class="mt-1 font-semibold text-accent-400">{{ formatDate(sub.activeSubscription!.end_date) }}</dd>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <dt class="text-xs text-white/65">Jours restants</dt>
              <dd class="mt-1 font-heading text-xl font-extrabold">{{ daysLeft }} <span class="text-sm font-semibold">jours</span></dd>
            </div>
            <div class="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <dt class="text-xs text-white/65">Crédits IA restants</dt>
              <dd class="mt-1 font-heading text-xl font-extrabold">{{ sub.aiCreditsRemaining }}</dd>
            </div>
          </dl>

          <div class="mt-6">
            <div class="flex items-center justify-between text-xs text-white/70">
              <span>Progression de l'abonnement</span>
              <span class="font-semibold text-white">{{ daysUsed }} / {{ totalDays }} jours</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                class="h-full rounded-full bg-accent-400 transition-[width] duration-700 ease-spring"
                :style="{ width: `${daysPercent}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Pas d'abonnement -->
      <div v-else v-reveal class="account-section flex flex-col items-center gap-4 py-12 text-center">
        <span class="grid size-14 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
          <i class="pi pi-crown text-xl" />
        </span>
        <div>
          <p class="font-heading text-lg font-bold text-ink">Aucun abonnement actif</p>
          <p class="mt-1 text-sm text-muted">Choisissez une formule pour accéder à toutes les séries.</p>
        </div>
        <AppCta to="/tarifs" label="Voir les prix" icon="pi pi-arrow-right" size="md" />
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Crédits IA -->
        <div v-if="sub.hasActiveSubscription" v-reveal="{ delay: 100 }" class="account-section">
          <h2 class="account-section__title">Crédits IA</h2>
          <div class="flex items-start gap-4">
            <span class="brand-gradient grid size-12 shrink-0 place-items-center rounded-leaf text-white shadow-brand">
              <i class="pi pi-sparkles text-lg" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="flex items-baseline gap-1.5">
                <span class="font-heading text-4xl font-extrabold leading-none text-ink">{{ sub.aiCreditsRemaining }}</span>
                <span class="text-sm text-faint">/ {{ sub.activePlan?.ai_credits ?? "—" }} crédits</span>
              </p>
              <p class="mt-2 text-sm leading-relaxed text-muted">
                Utilisez vos crédits pour obtenir des corrections IA de vos expressions écrites.
              </p>
              <div class="mt-4 h-2 overflow-hidden rounded-full bg-card-2">
                <div
                  class="brand-gradient h-full rounded-full transition-[width] duration-700 ease-spring"
                  :style="{ width: `${aiCreditsPercent}%` }"
                />
              </div>
              <AppButton
                label="Acheter des crédits"
                icon="pi pi-plus"
                variant="gradient"
                size="small"
                class="mt-5"
                @click="openBuyCredits()"
              />
            </div>
          </div>
        </div>

        <!-- Renouvellement -->
        <div
          v-reveal="{ delay: 180 }"
          class="account-section flex flex-col justify-between gap-6"
          :class="sub.hasActiveSubscription ? '' : 'lg:col-span-2'"
        >
          <div class="flex items-start gap-4">
            <span class="grid size-12 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              <i class="pi pi-arrow-up-right text-lg" />
            </span>
            <div>
              <h3 class="font-heading text-lg font-bold text-ink">
                {{ sub.hasActiveSubscription ? "Renouveler ou changer de formule" : "Passer à un forfait supérieur" }}
              </h3>
              <p class="mt-1 text-sm leading-relaxed text-muted">
                Accédez à toutes les séries et maximisez vos chances de réussite.
              </p>
            </div>
          </div>
          <AppCta to="/tarifs" label="Voir les prix" icon="pi pi-arrow-right" size="md" class="self-start" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { site } from "~/config/site";

definePageMeta({ layout: "account", middleware: "auth" });

const sub = useSubscriptionStore();
const loading = ref(true);
const { open: openBuyCredits, isOpen: buyCreditsOpen } = useBuyCreditsDialog();

onMounted(async () => {
  buyCreditsOpen.value = false; // reset au montage
  await Promise.all([sub.fetchMySubscriptions(), sub.fetchPlans()]);
  loading.value = false;
});

const daysLeft = computed(() => {
  if (!sub.activeSubscription) return 0;
  const diff = new Date(sub.activeSubscription.end_date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

const totalDays = computed(() => sub.activePlan?.duration_days ?? 30);

const daysUsed = computed(() => {
  if (!sub.activeSubscription) return 0;
  const start = new Date(sub.activeSubscription.start_date).getTime();
  const diff = Date.now() - start;
  return Math.min(totalDays.value, Math.floor(diff / (1000 * 60 * 60 * 24)));
});

const daysPercent = computed(() =>
  totalDays.value ? Math.round((daysUsed.value / totalDays.value) * 100) : 0,
);

const aiCreditsPercent = computed(() => {
  const total = sub.activePlan?.ai_credits;
  if (!total) return 0;
  return Math.round((sub.aiCreditsRemaining / total) * 100);
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

useHead({ title: `Abonnement | ${site.name}` });
</script>