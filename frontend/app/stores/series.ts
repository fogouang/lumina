import { defineStore } from "pinia";
import type { SeriesListResponse } from "#shared/api/models/SeriesListResponse";
import type { SuccessResponse_list_SeriesListResponse__ } from "#shared/api/models/SuccessResponse_list_SeriesListResponse__";

const FREE_SERIES = [100, 148, 149];

export const useSeriesStore = defineStore("series", () => {
  // ── State ────────────────────────────────────────────────────
  const series = ref<SeriesListResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasPremiumAccess = ref(false);

  // ── Getters ──────────────────────────────────────────────────
  const freeSeries = computed(() =>
    series.value.filter((s) => FREE_SERIES.includes(s.number)),
  );

  const premiumSeries = computed(() =>
    series.value.filter((s) => !FREE_SERIES.includes(s.number)),
  );

  function isAccessible(seriesNumber: number): boolean {
    if (hasPremiumAccess.value) return true;
    return FREE_SERIES.includes(seriesNumber);
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

  async function fetchMyAccess(): Promise<void> {
    const { get } = useApi();
    try {
      const res = await get<{ data: { has_premium_access: boolean } }>(
        "/v1/series/my-access",
      );
      hasPremiumAccess.value = res.data?.has_premium_access ?? false;
    } catch {
      hasPremiumAccess.value = false;
    }
  }

  function $reset(): void {
    series.value = [];
    loading.value = false;
    error.value = null;
    hasPremiumAccess.value = false;
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
    hasPremiumAccess,
    freeSeries,
    premiumSeries,
    isAccessible,
    fetchSeries,
    fetchMyAccess,
    $reset,
  };
});
