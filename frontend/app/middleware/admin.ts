// app/middleware/admin.ts
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.user) {
    await auth.fetchMe()
  }

  if (!auth.isAuthenticated) {
    return navigateTo('/')
  }

  if (!auth.isAdmin) {
    return navigateTo('/')
  }
})