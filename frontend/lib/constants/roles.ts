export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ORG_ADMIN: 'org_admin',
  PLATFORM_ADMIN: 'platform_admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Helper pour vérifier les permissions
export const ROLE_PERMISSIONS = {
  [USER_ROLES.STUDENT]: {
    canTakeExams: true,
    canViewCorrections: true,
    canManageSubscription: true,
  },
  [USER_ROLES.TEACHER]: {
    canCorrect: true,
    canViewStudents: true,
    canManageOrganization: true,
  },
  [USER_ROLES.ORG_ADMIN]: {
    canCorrect: true,
    canViewStudents: true,
    canManageOrganization: true,
    canAddStudents: true,
  },
  [USER_ROLES.PLATFORM_ADMIN]: {
    canManageUsers: true,
    canManageSeries: true,
    canManageQuestions: true,
    canViewPayments: true,
    canViewAnalytics: true,
  },
} as const;