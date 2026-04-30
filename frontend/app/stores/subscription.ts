// app/stores/subscription.ts
import { defineStore } from 'pinia'
import type { SubscriptionResponse } from '#shared/api/models/SubscriptionResponse'
import type { PlanListResponse } from '#shared/api/models/PlanListResponse'
import type { SuccessResponse_list_SubscriptionResponse__ } from '#shared/api/models/SuccessResponse_list_SubscriptionResponse__'
import type { SuccessResponse_list_PlanListResponse__ } from '#shared/api/models/SuccessResponse_list_PlanListResponse__'

export const useSubscriptionStore = defineStore('subscription', () => {
  // ── State ────────────────────────────────────────────────────
  const subscriptions = ref<SubscriptionResponse[]>([])
  const plans         = ref<PlanListResponse[]>([])
  const loading       = ref(false)
  const error         = ref<string | null>(null)

  // ── Getters ──────────────────────────────────────────────────
  const activeSubscription = computed(() =>
    subscriptions.value.find(s => s.is_active) ?? null
  )

  const hasActiveSubscription = computed(() => !!activeSubscription.value)

  const aiCreditsRemaining = computed(() =>
    activeSubscription.value?.ai_credits_remaining ?? 0
  )

  const activePlan = computed(() => {
    if (!activeSubscription.value?.plan_id) return null
    return plans.value.find(p => p.id === activeSubscription.value!.plan_id) ?? null
  })

  // ── Actions ──────────────────────────────────────────────────
  async function fetchMySubscriptions(): Promise<void> {
    const { get } = useApi()
    loading.value = true
    error.value   = null
    try {
      const res = await get<SuccessResponse_list_SubscriptionResponse__>(
        '/v1/subscriptions/me'
      )
      subscriptions.value = res.data ?? []
    } catch (err: unknown) {
      error.value = extractError(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchPlans(): Promise<void> {
    const { get } = useApi()
    try {
      const res = await get<SuccessResponse_list_PlanListResponse__>(
        '/v1/plans?active_only=true'
      )
      plans.value = res.data ?? []
    } catch (err: unknown) {
      error.value = extractError(err)
    }
  }

  function $reset(): void {
    subscriptions.value = []
    plans.value         = []
    loading.value       = false
    error.value         = null
  }

  function extractError(err: unknown): string {
    if (err && typeof err === 'object' && 'data' in err) {
      const data = (err as { data?: { message?: string } }).data
      return data?.message ?? 'Une erreur est survenue'
    }
    return 'Une erreur est survenue'
  }

  return {
    subscriptions, plans, loading, error,
    activeSubscription, hasActiveSubscription, aiCreditsRemaining, activePlan,
    fetchMySubscriptions, fetchPlans, $reset,
  }
})