<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Dashboard</h1>
        <p class="mt-0.5 text-sm text-muted">Vue d'ensemble de la plateforme</p>
      </div>
      <Button
        icon="pi pi-refresh"
        outlined
        rounded
        aria-label="Actualiser"
        :loading="loading"
        @click="fetchAll"
      />
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" height="104px" border-radius="1.25rem" />
    </div>

    <template v-else-if="stats">
      <!-- ── KPIs ──────────────────────────────────────────── -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="flex items-center gap-4 rounded-card border border-line bg-card p-5 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span
            class="grid size-12 shrink-0 place-items-center rounded-leaf"
            :class="kpi.iconBg"
          >
            <i :class="[kpi.icon, kpi.iconColor, 'text-xl']" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-xs font-semibold uppercase tracking-wider text-faint">
              {{ kpi.label }}
            </p>
            <p class="font-heading text-2xl font-extrabold tabular-nums text-ink">
              {{ kpi.value }}
            </p>
            <p v-if="kpi.sub" class="truncate text-xs text-muted">
              {{ kpi.sub }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Graphiques analytics ──────────────────────────── -->
      <div v-if="analytics" class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Nouveaux users par mois -->
        <section class="rounded-card border border-line bg-card p-5 shadow-soft">
          <header class="mb-4 flex items-center gap-2.5 border-b border-line pb-3.5">
            <span class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <i class="pi pi-users text-sm" />
            </span>
            <h2 class="font-heading text-sm font-bold text-ink">
              Nouveaux utilisateurs <span class="font-medium text-faint">(6 mois)</span>
            </h2>
          </header>
          <Chart type="bar" :data="usersChartData" :options="chartOptions" class="h-56" />
        </section>

        <!-- Revenus par mois -->
        <section class="rounded-card border border-line bg-card p-5 shadow-soft">
          <header class="mb-4 flex items-center gap-2.5 border-b border-line pb-3.5">
            <span class="grid size-8 place-items-center rounded-lg bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
              <i class="pi pi-wallet text-sm" />
            </span>
            <h2 class="font-heading text-sm font-bold text-ink">
              Revenus FCFA <span class="font-medium text-faint">(6 mois)</span>
            </h2>
          </header>
          <Chart type="line" :data="revenueChartData" :options="chartOptions" class="h-56" />
        </section>

        <!-- Tentatives par mois -->
        <section class="rounded-card border border-line bg-card p-5 shadow-soft">
          <header class="mb-4 flex items-center gap-2.5 border-b border-line pb-3.5">
            <span class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <i class="pi pi-file-edit text-sm" />
            </span>
            <h2 class="font-heading text-sm font-bold text-ink">
              Tentatives d'examen <span class="font-medium text-faint">(6 mois)</span>
            </h2>
          </header>
          <Chart type="bar" :data="attemptsChartData" :options="chartOptions" class="h-56" />
        </section>

        <!-- Abonnements par mois -->
        <section class="rounded-card border border-line bg-card p-5 shadow-soft">
          <header class="mb-4 flex items-center gap-2.5 border-b border-line pb-3.5">
            <span class="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <i class="pi pi-star text-sm" />
            </span>
            <h2 class="font-heading text-sm font-bold text-ink">
              Nouveaux abonnements <span class="font-medium text-faint">(6 mois)</span>
            </h2>
          </header>
          <Chart type="line" :data="subscriptionsChartData" :options="chartOptions" class="h-56" />
        </section>
      </div>

      <!-- ── Accès rapides ──────────────────────────────────── -->
      <section class="rounded-card border border-line bg-card p-5 shadow-soft">
        <h2 class="mb-4 border-b border-line pb-3.5 font-heading text-sm font-bold text-ink">
          Accès rapides
        </h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="group flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-card-2/50 p-4 text-center transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lift"
          >
            <span
              class="grid size-11 place-items-center rounded-leaf bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-contrast"
            >
              <i :class="[link.icon, 'text-lg']" />
            </span>
            <span class="text-xs font-semibold text-muted group-hover:text-ink">
              {{ link.label }}
            </span>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });

const { get } = useApi();
const auth = useAuthStore();

const loading = ref(true);
const stats = ref<Record<string, any> | null>(null);
const analytics = ref<Record<string, any> | null>(null);

async function fetchAll() {
  loading.value = true;
  try {
    const [statsRes, analyticsRes] = await Promise.all([
      get<{ data: Record<string, any> }>("/v1/stats/dashboard"),
      get<{ data: Record<string, any> }>("/v1/stats/analytics"),
    ]);
    stats.value = statsRes.data ?? {};
    analytics.value = analyticsRes.data ?? {};
    console.log(stats.value)
  } catch {
    // silencieux
  } finally {
    loading.value = false;
  }
}

onMounted(fetchAll);

// ── KPIs depuis stats ─────────────────────────────────────────
const kpis = computed(() => {
  if (!stats.value) return [];
  return [
    {
      label: "Utilisateurs",
      value: stats.value.total_users ?? 0,
      icon: "pi pi-users",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      sub: null,
    },
    {
      label: "Abonnements actifs",
      value: stats.value.active_subscriptions ?? 0,
      icon: "pi pi-crown",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      sub: null,
    },
    {
      label: "Tentatives",
      value: stats.value.total_attempts ?? 0,
      icon: "pi pi-list",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      sub: null,
    },
    {
      label: "Séries actives",
      value: stats.value.active_series ?? 0,
      icon: "pi pi-book",
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      sub: null,
    },
    {
      label: "Revenus (FCFA)",
      value: (stats.value.total_revenue ?? 0).toLocaleString("fr-FR"),
      icon: "pi pi-credit-card",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      sub: "Total",
    },
    {
      label: "Ce mois",
      value: (stats.value.monthly_revenue ?? 0).toLocaleString("fr-FR"),
      icon: "pi pi-chart-line",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      sub: "Revenus FCFA",
    },
    {
      label: "Paiements",
      value: stats.value.total_payments ?? 0,
      icon: "pi pi-receipt",
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      sub: null,
    },
    {
      label: "Corrections IA",
      value: stats.value.ai_corrections ?? 0,
      icon: "pi pi-sparkles",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      sub: null,
    },
  ];
});

// ── Charts ────────────────────────────────────────────────────
const chartColors = {
  primary: "rgba(227, 24, 55, 0.8)",
  primaryBg: "rgba(227, 24, 55, 0.1)",
  blue: "rgba(59, 130, 246, 0.8)",
  blueBg: "rgba(59, 130, 246, 0.1)",
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: "rgba(0,0,0,0.05)" } },
    x: { grid: { display: false } },
  },
};

const usersChartData = computed(() => {
  const monthly = analytics.value?.monthly_users ?? [];
  return {
    labels: monthly.map((m: any) => m.month),
    datasets: [
      {
        label: "Utilisateurs",
        data: monthly.map((m: any) => m.count),
        backgroundColor: chartColors.primary,
        borderRadius: 6,
      },
    ],
  };
});

const revenueChartData = computed(() => {
  const monthly = analytics.value?.monthly_revenue ?? [];
  return {
    labels: monthly.map((m: any) => m.month),
    datasets: [
      {
        label: "Revenus",
        data: monthly.map((m: any) => m.amount),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primaryBg,
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

const attemptsChartData = computed(() => {
  const monthly = analytics.value?.monthly_attempts ?? [];
  return {
    labels: monthly.map((m: any) => m.month),
    datasets: [
      {
        label: "Tentatives",
        data: monthly.map((m: any) => m.count),
        backgroundColor: chartColors.blue,
        borderRadius: 6,
      },
    ],
  };
});

const subscriptionsChartData = computed(() => {
  const monthly = analytics.value?.monthly_subscriptions ?? [];
  return {
    labels: monthly.map((m: any) => m.month),
    datasets: [
      {
        label: "Abonnements",
        data: monthly.map((m: any) => m.count),
        borderColor: chartColors.blue,
        backgroundColor: chartColors.blueBg,
        tension: 0.4,
        fill: true,
      },
    ],
  };
});

const quickLinks = [
  { to: "/admin/users", label: "Utilisateurs", icon: "pi pi-users" },
  { to: "/admin/series", label: "Séries", icon: "pi pi-list" },
  { to: "/admin/plans", label: "Plans", icon: "pi pi-tag" },
  { to: "/admin/payments", label: "Paiements", icon: "pi pi-credit-card" },
];

useHead({ title: "Dashboard | Admin Lumina" });
</script>
