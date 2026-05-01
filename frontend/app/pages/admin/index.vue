<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-(--text-primary)">Dashboard</h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          Vue d'ensemble de la plateforme
        </p>
      </div>
      <Button
        icon="pi pi-refresh"
        outlined
        size="small"
        :loading="loading"
        @click="fetchAll"
      />
    </div>

    <!-- Stats globales -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Skeleton v-for="i in 8" :key="i" height="100px" border-radius="12px" />
    </div>

    <template v-else-if="stats">
      <!-- ── KPIs ──────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4 flex items-center gap-4"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="kpi.iconBg"
          >
            <i :class="[kpi.icon, kpi.iconColor, 'text-xl']" />
          </div>
          <div>
            <p class="text-xs text-(--text-tertiary) uppercase tracking-wide">
              {{ kpi.label }}
            </p>
            <p class="text-2xl font-bold text-(--text-primary)">
              {{ kpi.value }}
            </p>
            <p v-if="kpi.sub" class="text-xs text-(--text-tertiary)">
              {{ kpi.sub }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Graphiques analytics ──────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6" v-if="analytics">
        <!-- Nouveaux users par mois -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <h2 class="text-sm font-bold text-(--text-primary) mb-4">
            Nouveaux utilisateurs (6 mois)
          </h2>
          <Chart
            type="bar"
            :data="usersChartData"
            :options="chartOptions"
            style="height: 200px"
          />
        </div>

        <!-- Revenus par mois -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <h2 class="text-sm font-bold text-(--text-primary) mb-4">
            Revenus FCFA (6 mois)
          </h2>
          <Chart
            type="line"
            :data="revenueChartData"
            :options="chartOptions"
            style="height: 200px"
          />
        </div>

        <!-- Tentatives par mois -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <h2 class="text-sm font-bold text-(--text-primary) mb-4">
            Tentatives d'examen (6 mois)
          </h2>
          <Chart
            type="bar"
            :data="attemptsChartData"
            :options="chartOptions"
            style="height: 200px"
          />
        </div>

        <!-- Abonnements par mois -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <h2 class="text-sm font-bold text-(--text-primary) mb-4">
            Nouveaux abonnements (6 mois)
          </h2>
          <Chart
            type="line"
            :data="subscriptionsChartData"
            :options="chartOptions"
            style="height: 200px"
          />
        </div>
      </div>

      <!-- ── Accès rapides ──────────────────────────────────── -->
      <div class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5">
        <h2 class="text-sm font-bold text-(--text-primary) mb-4">
          Accès rapides
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NuxtLink v-for="link in quickLinks" :key="link.to" :to="link.to">
            <div
              class="flex flex-col items-center gap-2 p-4 rounded-xl border border-(--border-color) hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer text-center"
            >
              <i :class="[link.icon, 'text-2xl text-primary-500']" />
              <span class="text-xs font-semibold text-(--text-secondary)">{{
                link.label
              }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
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
