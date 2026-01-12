export const ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export const CORRECTION_STATUS = {
  PENDING: 'pending',
  CORRECTED_AI: 'corrected_ai',
  CORRECTED_MANUAL: 'corrected_manual',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export const NOTIFICATION_TYPE = {
  CORRECTION_READY: 'correction_ready',
  CREDITS_LOW: 'credits_low',
  EXPIRATION_WARNING: 'expiration_warning',
  NEW_STUDENT: 'new_student',
  PAYMENT_SUCCESS: 'payment_success',
} as const;