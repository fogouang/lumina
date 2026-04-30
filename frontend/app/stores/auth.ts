// app/stores/auth.ts
import { defineStore } from "pinia";
import type { LoginRequest } from "#shared/api/models/LoginRequest";
import type { RegisterRequest } from "#shared/api/models/RegisterRequest";
import type { SuccessResponse_AuthResponse_ } from "#shared/api/models/SuccessResponse_AuthResponse_";
import type { SuccessResponse_dict_ } from "#shared/api/models/SuccessResponse_dict_";
import type { app__modules__auth__schemas__UserResponse as UserResponse } from "#shared/api/models/app__modules__auth__schemas__UserResponse";

export const useAuthStore = defineStore("auth", () => {
  // ── State ────────────────────────────────────────────────────
  const user = ref<UserResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ── Getters ──────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "platform_admin");
  const isStudent = computed(() => user.value?.role === "student");
  const fullName = computed(() =>
    user.value ? `${user.value.first_name} ${user.value.last_name}` : "",
  );

  // ── Actions ──────────────────────────────────────────────────
  async function login(credentials: LoginRequest): Promise<void> {
    const { post } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await post<SuccessResponse_AuthResponse_>(
        "/v1/auth/login",
        credentials,
      );
      user.value = res.data?.user ?? null;
      navigateTo("/mon-compte");
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
      const res = await post<SuccessResponse_AuthResponse_>(
        "/v1/auth/register",
        payload,
      );
      user.value = res.data?.user ?? null;
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
      const res = await get<SuccessResponse_AuthResponse_>("/v1/auth/me");
      user.value = res.data?.user ?? null;
    } catch {
      user.value = null;
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

  // ── Helper ───────────────────────────────────────────────────
  function extractError(err: unknown): string {
    if (err && typeof err === "object" && "data" in err) {
      const data = (err as { data?: { message?: string } }).data;
      return data?.message ?? "Une erreur est survenue";
    }
    return "Une erreur est survenue";
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isStudent,
    fullName,
    login,
    register,
    fetchMe,
    logout,
    clearError,
  };
});
