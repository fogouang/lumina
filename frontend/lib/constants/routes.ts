import { ExpressionType } from "../api";

export const ROUTES = {
  // ============================================================
  // PUBLIC ROUTES
  // ============================================================
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",

  // ============================================================
  // STUDENT ROUTES
  // ============================================================
  STUDENT_DASHBOARD: "/student/dashboard",

  // Series
  STUDENT_SERIES: "/student/series",
  STUDENT_SERIES_DETAIL: (seriesId: string) => `/student/series/${seriesId}`,

  // Exam
  STUDENT_EXAM: (attemptId: string) => `/student/exam/${attemptId}`,
  STUDENT_EXAM_COMPREHENSION: (attemptId: string) =>
    `/student/exam/${attemptId}/comprehension`,
  STUDENT_EXAM_WRITTEN: (attemptId: string, taskId: string) =>
    `/student/exam/${attemptId}/written/${taskId}`,
  STUDENT_EXAM_ORAL: (attemptId: string, taskId: string) =>
    `/student/exam/${attemptId}/oral/${taskId}`,

  // Results
  STUDENT_RESULTS: "/student/results",
  STUDENT_RESULT_DETAIL: (attemptId: string) => `/student/results/${attemptId}`,

  // Corrections
  STUDENT_CORRECTIONS: (attemptId: string) =>
    `/student/results/${attemptId}/correction`,
  STUDENT_CORRECTIONS_LIST: "/student/corrections",
  STUDENT_EXPRESSION_CORRECTIONS: (attemptId: string) =>
    `/student/results/${attemptId}/expression-correction`,
  STUDENT_EXPRESSIONS_LIST: (attemptId: string) =>
    `/student/corrections/${attemptId}`,
  STUDENT_CORRECTION_DETAIL: (attemptId: string, expressionId: string) =>
    `/student/corrections/${attemptId}/${expressionId}`,

  // Subscription
  STUDENT_SUBSCRIPTION: "/student/subscription",
   STUDENT_INVOICES: "/student/invoices",

  // Notifications
  STUDENT_NOTIFICATIONS: "/student/notifications",

  // Settings
  STUDENT_SETTINGS: "/student/settings",

  // ============================================================
  // TEACHER ROUTES
  // ============================================================
  TEACHER_DASHBOARD: "/teacher/dashboard",

  // Students
  TEACHER_STUDENTS: "/teacher/students",
  TEACHER_STUDENT_DETAIL: (studentId: string) =>
    `/teacher/students/${studentId}`,

  // Corrections
  TEACHER_CORRECTIONS_PENDING: "/teacher/corrections/pending",
  TEACHER_CORRECTIONS_COMPLETED: "/teacher/corrections/completed",
  TEACHER_CORRECTION_DETAIL: (expressionId: string) =>
    `/teacher/corrections/${expressionId}`,

  // Organization
  TEACHER_ORGANIZATION: "/teacher/organization",

  // ============================================================
  // ADMIN ROUTES
  // ============================================================
  ADMIN_DASHBOARD: "/admin/dashboard",

  // Users
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAIL: (userId: string) => `/admin/users/${userId}`,
  ADMIN_USER_NEW: "/admin/users/new",

  // Organizations
  ADMIN_ORGANIZATIONS: "/admin/organizations",
  ADMIN_ORGANIZATION_NEW: "/admin/organizations/new",
  ADMIN_ORGANIZATION_DETAIL: (orgId: string) => `/admin/organizations/${orgId}`,

  // Series
  ADMIN_SERIES: "/admin/series",
  ADMIN_SERIES_NEW: "/admin/series/new",
  ADMIN_SERIES_DETAIL: (seriesId: string) => `/admin/series/${seriesId}`,
  ADMIN_SERIES_QUESTIONS: (seriesId: string) =>
    `/admin/series/${seriesId}/questions`,
  ADMIN_SERIES_QUESTIONS_IMPORT: (seriesId: string) =>
    `/admin/series/${seriesId}/questions/import`,

  // Expression Tasks
  ADMIN_TASKS: "/admin/tasks",
  ADMIN_TASKS_WRITTEN: (seriesId: string) => `/admin/tasks/${seriesId}/written`,
  ADMIN_TASKS_ORAL: (seriesId: string) => `/admin/tasks/${seriesId}/oral`,
  ADMIN_SERIES_TASKS: (seriesId: string) => `/admin/series/${seriesId}/tasks`,

  // Payments
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_PAYMENT_DETAIL: (paymentId: string) => `/admin/payments/${paymentId}`,
  CHECKOUT_PAYMENTS: (planId: string) => `/checkout?plan=${planId}`,

  // Invoices
  ADMIN_INVOICES: "/admin/invoices",
  ADMIN_INVOICE_DETAIL: (invoiceId: string) => `/admin/invoices/${invoiceId}`,

  // Subscriptions
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_PLANS: "/admin/plans",

  // Analytics (optionnel)
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS_ORAL_AUDIOS: "/admin/settings/oral-audios",
} as const;
