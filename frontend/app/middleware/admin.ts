// app/middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo('/connexion')
  }

  if (!auth.isAdmin) {
    return navigateTo('/')
  }
})