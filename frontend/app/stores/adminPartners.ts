import { defineStore } from "pinia";
import type { PartnerDetailResponse } from "#shared/api/models/PartnerDetailResponse";
import type { PartnerCreateRequest } from "#shared/api/models/PartnerCreateRequest";
import type { PartnerUpdateRequest } from "#shared/api/models/PartnerUpdateRequest";
import type { PartnerStatsResponse } from "#shared/api/models/PartnerStatsResponse";
import type { SuccessResponse_list_PartnerDetailResponse__ } from "#shared/api/models/SuccessResponse_list_PartnerDetailResponse__";
import type { SuccessResponse_PartnerDetailResponse_ } from "#shared/api/models/SuccessResponse_PartnerDetailResponse_";
import type { SuccessResponse_PartnerStatsResponse_ } from "#shared/api/models/SuccessResponse_PartnerStatsResponse_";
import type { SuccessResponse_dict_ } from "#shared/api/models/SuccessResponse_dict_";

export const useAdminPartnersStore = defineStore("adminPartners", () => {
  const partners = ref<PartnerDetailResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function extractError(err: unknown): string {
    if (err && typeof err === "object" && "data" in err) {
      const data = (err as { data?: { message?: string } }).data;
      return data?.message ?? "Une erreur est survenue";
    }
    return "Une erreur est survenue";
  }

  async function fetchPartners(): Promise<void> {
    const { get } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await get<SuccessResponse_list_PartnerDetailResponse__>("/v1/partners");
      partners.value = res.data ?? [];
    } catch (err: unknown) {
      error.value = extractError(err);
    } finally {
      loading.value = false;
    }
  }

  async function createPartner(data: PartnerCreateRequest): Promise<{ success: boolean; data?: PartnerDetailResponse; error?: string }> {
    const { post } = useApi();
    try {
      const res = await post<SuccessResponse_PartnerDetailResponse_>("/v1/partners", data);
      const created = res.data!;
      partners.value.unshift(created);
      return { success: true, data: created };
    } catch (err: unknown) {
      return { success: false, error: extractError(err) };
    }
  }

  async function updatePartner(partnerId: string, data: PartnerUpdateRequest): Promise<{ success: boolean; data?: PartnerDetailResponse; error?: string }> {
    const { patch } = useApi();
    try {
      const res = await patch<SuccessResponse_PartnerDetailResponse_>(`/v1/partners/${partnerId}`, data);
      const updated = res.data!;
      const index = partners.value.findIndex((p) => p.id === partnerId);
      if (index !== -1) partners.value[index] = updated;
      return { success: true, data: updated };
    } catch (err: unknown) {
      return { success: false, error: extractError(err) };
    }
  }

  async function deletePartner(partnerId: string): Promise<{ success: boolean; error?: string }> {
    const { del } = useApi();
    try {
      await del<SuccessResponse_dict_>(`/v1/partners/${partnerId}`);
      partners.value = partners.value.filter((p) => p.id !== partnerId);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: extractError(err) };
    }
  }

  async function getStats(partnerId: string): Promise<PartnerStatsResponse | null> {
    const { get } = useApi();
    try {
      const res = await get<SuccessResponse_PartnerStatsResponse_>(`/v1/partners/${partnerId}/stats`);
      return res.data ?? null;
    } catch {
      return null;
    }
  }

  function $reset(): void {
    partners.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    partners,
    loading,
    error,
    fetchPartners,
    createPartner,
    updatePartner,
    deletePartner,
    getStats,
    $reset,
  };
});