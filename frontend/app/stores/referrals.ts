// stores/referrals.ts
import { defineStore } from "pinia";

interface ReferredUserItem {
  user_id: string;
  name: string;
  joined_at: string;
  has_paid: boolean;
  total_earned_from_this_user: number;
}

export interface AmbassadorTotals {
  sales_count: number;
  total_collected: number;
  total_commission: number;
  total_due: number;
  total_remitted: number;
  balance_due: number;
  overdue_amount: number;
  is_suspended: boolean;
}

export type SaleStatus = "due" | "partial" | "settled";

export interface AmbassadorSaleItem {
  earning_id: string;
  client_name: string;
  plan_name: string | null;
  sale_amount: number;
  commission: number;
  amount_due: number;
  amount_remitted: number;
  status: SaleStatus;
  deadline_at: string;
  is_overdue: boolean;
  created_at: string;
}

export interface RemittanceItem {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paid_at: string;
  note: string | null;
  created_at: string;
}

export interface AmbassadorContractSummary {
  id: string;
  numero: string;
  taux_commission: number;
  delai_reversement_heures: number;
  numero_mobile_money_reception: string | null;
  duree_mois: number;
  date_signature: string | null;
}

interface ReferralDashboardResponse {
  referral_link: string;
  referral_code: string;
  referred_count: number;
  total_earnings: number;
  referred_users: ReferredUserItem[];
  totals: AmbassadorTotals;
  sales: AmbassadorSaleItem[];
  remittances: RemittanceItem[];
  contract: AmbassadorContractSummary | null;
}

const EMPTY_TOTALS: AmbassadorTotals = {
  sales_count: 0,
  total_collected: 0,
  total_commission: 0,
  total_due: 0,
  total_remitted: 0,
  balance_due: 0,
  overdue_amount: 0,
  is_suspended: false,
};

function errorMessage(err: any, fallback: string): string {
  return err?.data?.message || err?.data?.detail || fallback;
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
  const totals = computed(() => dashboard.value?.totals ?? EMPTY_TOTALS);
  const sales = computed(() => dashboard.value?.sales ?? []);
  const remittances = computed(() => dashboard.value?.remittances ?? []);
  const contract = computed(() => dashboard.value?.contract ?? null);

  /** L'ambassadeur peut-il activer un abonnement maintenant ? */
  const canActivate = computed(() => !!contract.value && !totals.value.is_suspended);

  async function fetchDashboard() {
    const { get } = useApi();
    loading.value = true;
    error.value = null;
    try {
      const res = await get<any>("/v1/referrals/me");
      dashboard.value = res.data ?? res;
    } catch (err: any) {
      error.value = errorMessage(err, "Erreur lors du chargement du tableau de parrainage");
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
      activateError.value = errorMessage(err, "Erreur lors de l'activation de l'abonnement");
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
    totals,
    sales,
    remittances,
    contract,
    canActivate,
    fetchDashboard,
    activateSubscriptionForReferral,
  };
});