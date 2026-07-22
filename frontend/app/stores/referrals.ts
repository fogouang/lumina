// stores/referrals.ts
import { defineStore } from "pinia";

interface ReferredUserItem {
  user_id: string;
  name: string;
  joined_at: string;
  has_paid: boolean;
  total_earned_from_this_user: number;
}

interface ReferralDashboardResponse {
  referral_link: string;
  referral_code: string;
  referred_count: number;
  total_earnings: number;
  referred_users: ReferredUserItem[];
}

export const useReferralsStore = defineStore("referrals", () => {
  const dashboard = ref<ReferralDashboardResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const activating = ref(false);
  const activateError = ref<string | null>(null);

  const referredCount = computed(() => dashboard.value?.referred_count ?? 0);
  const totalEarnings = computed(() => dashboard.value?.total_earnings ?? 0);
  const referralLink = computed(() => dashboard.value?.referral_link ?? "");
  const referredUsers = computed(() => dashboard.value?.referred_users ?? []);

  async function fetchDashboard() {
    const { get } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await get<any>("/v1/referrals/me");
      dashboard.value = res.data ?? res;
    } catch (err: any) {
      error.value = err?.data?.message || "Erreur lors du chargement du tableau de parrainage";
    } finally {
      loading.value = false;
    }
  }

  async function activateSubscriptionForReferral(
    userId: string,
    planId: string,
    promoCode?: string,
  ) {
    const { post } = useApi();
    activating.value = true;
    activateError.value = null;
    try {
      await post<any>("/v1/subscriptions/ambassador/activate", {
        user_id: userId,
        plan_id: planId,
        promo_code: promoCode || null,
      });
      await fetchDashboard();
      return { success: true };
    } catch (err: any) {
      activateError.value = err?.data?.message || "Erreur lors de l'activation de l'abonnement";
      return { success: false, error: activateError.value };
    } finally {
      activating.value = false;
    }
  }

  return {
    dashboard,
    loading,
    error,
    activating,
    activateError,
    referredCount,
    totalEarnings,
    referralLink,
    referredUsers,
    fetchDashboard,
    activateSubscriptionForReferral,
  };
});