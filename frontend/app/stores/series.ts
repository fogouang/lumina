// app/stores/series.ts
import { defineStore } from "pinia";
import type { SeriesListResponse } from "#shared/api/models/SeriesListResponse";
import type { SuccessResponse_list_SeriesListResponse__ } from "#shared/api/models/SuccessResponse_list_SeriesListResponse__";

// Séries gratuites selon le backend
const FREE_SERIES = [100, 148, 149];

export const useSeriesStore = defineStore("series", () => {
  // ── State ────────────────────────────────────────────────────
  const series = ref<SeriesListResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ── Getters ──────────────────────────────────────────────────
  const freeSeries = computed(() =>
    series.value.filter((s) => FREE_SERIES.includes(s.number)),
  );

  const premiumSeries = computed(() =>
    series.value.filter((s) => !FREE_SERIES.includes(s.number)),
  );

  function isAccessible(seriesNumber: number): boolean {
    const { hasActiveSubscription } = useSubscriptionStore();
    return FREE_SERIES.includes(seriesNumber) || hasActiveSubscription;
  }

  // ── Actions ──────────────────────────────────────────────────
  async function fetchSeries(): Promise<void> {
    const { get } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await get<SuccessResponse_list_SeriesListResponse__>(
        "/v1/series?active_only=true",
      );
      series.value = res.data ?? [];
    } catch (err: unknown) {
      error.value = extractError(err);
    } finally {
      loading.value = false;
    }
  }

  function $reset(): void {
    series.value = [];
    loading.value = false;
    error.value = null;
  }

  function extractError(err: unknown): string {
    if (err && typeof err === "object" && "data" in err) {
      const data = (err as { data?: { message?: string } }).data;
      return data?.message ?? "Une erreur est survenue";
    }
    return "Une erreur est survenue";
  }

  return {
    series,
    loading,
    error,
    freeSeries,
    premiumSeries,
    isAccessible,
    fetchSeries,
    $reset,
  };
});
