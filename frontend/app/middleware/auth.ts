export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (!auth.user) {
    await auth.fetchMe()
  }

  if (!auth.isAuthenticated) {
    if (import.meta.client) {
      const { openLogin } = useAuthModal()
      openLogin()
    }
    if (to.path !== '/') {
      return navigateTo('/')
    }
  }
})