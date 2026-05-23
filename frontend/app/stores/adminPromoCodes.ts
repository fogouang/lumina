import { defineStore } from "pinia";
import type { PromoCodeResponse } from "#shared/api/models/PromoCodeResponse";
import type { PromoCodeCreateRequest } from "#shared/api/models/PromoCodeCreateRequest";
import type { PromoCodeUpdateRequest } from "#shared/api/models/PromoCodeUpdateRequest";
import type { PromoCodeValidateRequest } from "#shared/api/models/PromoCodeValidateRequest";
import type { PromoCodeValidateResponse } from "#shared/api/models/PromoCodeValidateResponse";
import type { SuccessResponse_list_PromoCodeResponse__ } from "#shared/api/models/SuccessResponse_list_PromoCodeResponse__";
import type { SuccessResponse_PromoCodeResponse_ } from "#shared/api/models/SuccessResponse_PromoCodeResponse_";
import type { SuccessResponse_PromoCodeValidateResponse_ } from "#shared/api/models/SuccessResponse_PromoCodeValidateResponse_";
import type { SuccessResponse_dict_ } from "#shared/api/models/SuccessResponse_dict_";

export const useAdminPromoCodesStore = defineStore("adminPromoCodes", () => {
  const codes = ref<PromoCodeResponse[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function extractError(err: unknown): string {
    if (err && typeof err === "object" && "data" in err) {
      const data = (err as { data?: { message?: string } }).data;
      return data?.message ?? "Une erreur est survenue";
    }
    return "Une erreur est survenue";
  }

  async function fetchCodes(): Promise<void> {
    const { get } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res =
        await get<SuccessResponse_list_PromoCodeResponse__>("/v1/promocode");
      codes.value = res.data ?? [];
    } catch (err: unknown) {
      error.value = extractError(err);
    } finally {
      loading.value = false;
    }
  }

  async function createCode(
    data: PromoCodeCreateRequest,
  ): Promise<{ success: boolean; data?: PromoCodeResponse; error?: string }> {
    const { post } = useApi();
    try {
      const res = await post<SuccessResponse_PromoCodeResponse_>(
        "/v1/promocode",
        data,
      );
      const created = res.data!;
      codes.value.unshift(created);
      return { success: true, data: created };
    } catch (err: unknown) {
      return { success: false, error: extractError(err) };
    }
  }

  async function updateCode(
    codeId: string,
    data: PromoCodeUpdateRequest,
  ): Promise<{ success: boolean; data?: PromoCodeResponse; error?: string }> {
    const { patch } = useApi();
    try {
      const res = await patch<SuccessResponse_PromoCodeResponse_>(
        `/v1/promocode/${codeId}`,
        data,
      );
      const updated = res.data!;
      const index = codes.value.findIndex((c) => c.id === codeId);
      if (index !== -1) codes.value[index] = updated;
      return { success: true, data: updated };
    } catch (err: unknown) {
      return { success: false, error: extractError(err) };
    }
  }

  async function deleteCode(
    codeId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const { del } = useApi();
    try {
      await del<SuccessResponse_dict_>(`/v1/promocode/${codeId}`);
      codes.value = codes.value.filter((c) => c.id !== codeId);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: extractError(err) };
    }
  }

  async function validateCode(
    data: PromoCodeValidateRequest,
  ): Promise<PromoCodeValidateResponse | null> {
    const { post } = useApi();
    try {
      const res = await post<SuccessResponse_PromoCodeValidateResponse_>(
        "/v1/promocode/validate",
        data,
      );
      return res.data ?? null;
    } catch {
      return null;
    }
  }

  function $reset(): void {
    codes.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    codes,
    loading,
    error,
    fetchCodes,
    createCode,
    updateCode,
    deleteCode,
    validateCode,
    $reset,
  };
});
