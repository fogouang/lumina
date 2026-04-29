// app/plugins/auth.init.ts
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()

  // Rehydrater l'user au démarrage si un cookie est présent
  await auth.fetchMe()
})