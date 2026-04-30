// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // Toujours rehydrater au refresh
  if (!auth.user) {
    await auth.fetchMe()
  }

  // Après fetchMe, si toujours pas connecté → redirect
  if (!auth.isAuthenticated) {
    const { openLogin } = useAuthModal()
    openLogin()
    return navigateTo('/')
  }
})