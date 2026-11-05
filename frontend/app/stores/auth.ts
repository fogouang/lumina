import { defineStore } from "pinia";
import type { LoginRequest } from "#shared/api/models/LoginRequest";
import type { RegisterRequest } from "#shared/api/models/RegisterRequest";
import type { SuccessResponse_dict_ } from "#shared/api/models/SuccessResponse_dict_";
import type { app__modules__auth__schemas__UserResponse as UserResponse } from "#shared/api/models/app__modules__auth__schemas__UserResponse";

export const useAuthStore = defineStore("auth", () => {
  // ── State ─────────────────────────────────────────────────────
  const user = ref<UserResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ── Getters ───────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "platform_admin");
  const isStudent = computed(() => user.value?.role === "student");
  const fullName = computed(() =>
    user.value ? `${user.value.first_name} ${user.value.last_name}` : "",
  );
  // Compte sans téléphone (anciens comptes) : modale obligatoire
  const needsPhone = computed(
    () => !!user.value && !isAdmin.value && !user.value.phone,
  );
  // Invitation au groupe WhatsApp (calculée par le backend)
  const needsWhatsappInvite = computed(
    () => !!user.value?.phone && !!user.value?.should_show_whatsapp_invite,
  );

  // ── Actions ───────────────────────────────────────────────────
  async function login(credentials: LoginRequest): Promise<void> {
    const { post } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await post<any>("/v1/auth/login", credentials);
      user.value = res.data?.user ?? res.data ?? null;
      if (user.value?.role === "platform_admin") {
        navigateTo("/admin");
      } else if (user.value?.is_ambassador) {
        navigateTo("/ambassadeur");
      } else {
        navigateTo("/mon-compte");
      }
    } catch (err: unknown) {
      error.value = extractError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: RegisterRequest): Promise<void> {
    const { post } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await post<any>("/v1/auth/register", payload);
      user.value = res.data?.user ?? res.data ?? null;
      navigateTo("/mon-compte");
    } catch (err: unknown) {
      error.value = extractError(err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe(): Promise<void> {
    const { get } = useApi();
    try {
      const res = await get<any>("/v1/auth/me");
      user.value = res.data ?? null;
    } catch {
      user.value = null;
    }
  }

  async function updatePhone(phone: string): Promise<void> {
    const { patch } = useApi();
    const res = await patch<any>("/v1/auth/me/phone", { phone });
    user.value = res.data ?? user.value;
  }

  async function respondWhatsappInvite(
    action: "clicked" | "dismissed",
  ): Promise<void> {
    const { post } = useApi();
    try {
      const res = await post<any>("/v1/auth/me/whatsapp-invite", { action });
      user.value = res.data ?? user.value;
    } catch {
      // Non bloquant : au pire la modale réapparaîtra plus tard
    }
  }

  async function logout(): Promise<void> {
    const { post } = useApi();
    try {
      await post<SuccessResponse_dict_>("/v1/auth/logout");
    } finally {
      user.value = null;
      navigateTo("/");
    }
  }

  function clearError(): void {
    error.value = null;
  }

  // ── Helper ────────────────────────────────────────────────────
  function extractError(err: unknown): string {
    const e = err as {
      data?: { message?: string; detail?: unknown };
      statusCode?: number;
      status?: number;
    };
    const data = e?.data;
    if (data?.message) return data.message;
    if (typeof data?.detail === "string") return data.detail;

    const status = e?.statusCode ?? e?.status;
    if (!status) {
      return "Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.";
    }
    if (status >= 500) {
      return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
    }
    return "Une erreur est survenue. Réessayez.";
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isStudent,
    fullName,
    needsPhone,
    needsWhatsappInvite,
    login,
    register,
    fetchMe,
    updatePhone,
    respondWhatsappInvite,
    logout,
    clearError,
  };
});
