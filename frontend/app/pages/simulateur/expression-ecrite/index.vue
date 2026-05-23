<template>
  <div class="min-h-screen bg-(--bg-ground)">

    <!-- Hero -->
    <div class="relative bg-linear-to-br from-primary-700 to-primary-900 py-14 text-center overflow-hidden">
      <div class="absolute inset-0 opacity-10"
        style="background-image: linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px); background-size: 24px 24px;" />
      <div class="relative z-10 container mx-auto px-4">
        <div class="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-white/90 text-sm font-medium mb-4">
          <i class="pi pi-pen-to-square" /> Simulateur
        </div>
        <h1 class="text-3xl lg:text-4xl font-extrabold text-white mb-3">Expression Écrite</h1>
        <p class="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
          Entraînez-vous sur les vrais sujets du mois. Rédigez vos 3 tâches et obtenez une correction IA instantanée.
        </p>
        <div v-if="auth.isAuthenticated" class="inline-flex items-center gap-2 mt-5 bg-white/20 rounded-xl px-4 py-2">
          <i class="pi pi-sparkles text-yellow-300" />
          <span class="text-white font-semibold text-sm">
            {{ sub.aiCreditsRemaining }} crédit{{ sub.aiCreditsRemaining > 1 ? 's' : '' }} IA disponible{{ sub.aiCreditsRemaining > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-10 max-w-5xl">

      <!-- Non connecté -->
      <div v-if="!auth.isAuthenticated" class="text-center py-16 bg-(--bg-card) border border-(--border-color) rounded-2xl">
        <i class="pi pi-lock text-5xl text-(--text-tertiary) mb-4 block opacity-40" />
        <h2 class="text-xl font-bold text-(--text-primary) mb-2">Connexion requise</h2>
        <p class="text-(--text-secondary) mb-6">Créez un compte gratuit pour accéder aux sujets du mois.</p>
        <Button label="Se connecter" icon="pi pi-sign-in" class="bg-gradient-primary border-none font-bold" @click="openLogin()" />
      </div>

      <template v-else>

        <!-- Crédits faibles -->
        <div v-if="sub.aiCreditsRemaining === 0" class="mt-8 flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <i class="pi pi-exclamation-triangle text-amber-500 text-xl shrink-0 mt-0.5" />
          <div class="flex-1">
            <p class="font-bold text-amber-800 mb-1">Aucun crédit IA disponible</p>
            <p class="text-sm text-amber-700 leading-relaxed">
              Vous pouvez lire les sujets mais pas lancer le simulateur avec correction. Achetez des crédits pour obtenir une correction en temps réel.
            </p>
          </div>
          <Button label="Acheter des crédits" icon="pi pi-plus" severity="warning" size="small" @click="buyCreditsVisible = true" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton v-for="i in 3" :key="i" height="200px" border-radius="16px" />
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="text-center py-16 bg-(--bg-card) border border-(--border-color) rounded-2xl">
          <i class="pi pi-exclamation-circle text-5xl text-red-300 mb-4 block opacity-60" />
          <h2 class="text-xl font-bold text-(--text-primary) mb-2">Erreur de chargement</h2>
          <p class="text-(--text-secondary) mb-4">{{ error }}</p>
          <Button label="Réessayer" icon="pi pi-refresh" outlined @click="loadSessions" />
        </div>

        <!-- Empty -->
        <div v-else-if="!sessions.length" class="text-center py-16 bg-(--bg-card) border border-(--border-color) rounded-2xl">
          <i class="pi pi-calendar text-5xl text-(--text-tertiary) mb-4 block opacity-30" />
          <h2 class="text-xl font-bold text-(--text-primary) mb-2">Aucune session disponible</h2>
          <p class="text-(--text-secondary)">Les sujets du mois apparaîtront ici dès leur publication.</p>
        </div>

        <!-- Sessions grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
          >
            <div class="bg-linear-to-br from-primary-600 to-primary-800 px-5 py-6">
              <div class="flex items-center justify-between mb-3">
                <Tag :value="session.is_active ? 'Actif' : 'Archivé'" :severity="session.is_active ? 'success' : 'secondary'" />
                <i class="pi pi-pen-to-square text-white/60 text-lg" />
              </div>
              <h3 class="text-xl font-extrabold text-white mb-1">{{ session.name }}</h3>
              <p class="text-white/70 text-sm">{{ formatMonth(session.month) }}</p>
            </div>

            <div class="px-5 py-4 flex-1 flex flex-col gap-4">
              <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
                <i class="pi pi-list text-primary-400" />
                <span>Plusieurs combinaisons de sujets</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
                <i class="pi pi-clock text-primary-400" />
                <span>60 minutes recommandées</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-(--text-secondary)">
                <i class="pi pi-sparkles text-primary-400" />
                <span>Correction IA disponible</span>
              </div>

              <div class="mt-auto pt-2">
                <NuxtLink :to="`/simulateur/expression-ecrite/${session.id}`">
                  <Button
                    :label="sub.aiCreditsRemaining > 0 ? 'Voir les sujets' : 'Lire les sujets'"
                    :icon="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'"
                    class="w-full font-bold"
                    :class="sub.aiCreditsRemaining > 0 ? 'bg-gradient-primary border-none' : ''"
                    :outlined="sub.aiCreditsRemaining === 0"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Info crédits -->
        <div v-if="!loading && !error" class="mb-5 mt-10 bg-(--bg-card) border border-(--border-color) rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div class="flex items-center gap-3 flex-1">
            <div class="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <i class="pi pi-sparkles text-red-500 text-xl" />
            </div>
            <div>
              <p class="font-bold text-(--text-primary) mb-0.5">Comment fonctionnent les crédits IA ?</p>
              <p class="text-sm text-(--text-secondary) leading-relaxed">
                1 crédit = 1 correction IA complète (3 tâches). Chaque simulation consomme 1 crédit.
              </p>
            </div>
          </div>
          <Button label="Acheter des crédits" icon="pi pi-plus" outlined @click="buyCreditsVisible = true" />
        </div>

      </template>
    </div>

    <BuyCreditsDialog v-model="buyCreditsVisible" />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from '#shared/api/models/MonthlySessionResponse'
import type { SuccessResponse_list_MonthlySessionResponse__ } from '#shared/api/models/SuccessResponse_list_MonthlySessionResponse__'

definePageMeta({ middleware: 'auth' })

const { get }           = useApi()
const auth              = useAuthStore()
const sub               = useSubscriptionStore()
const { openLogin }     = useAuthModal()

const loading            = ref(true)
const error              = ref<string | null>(null)
const sessions           = ref<MonthlySessionResponse[]>([])
const buyCreditsVisible  = ref(false)

async function loadSessions() {
  loading.value = true
  error.value   = null
  try {
    // fetch subscriptions + sessions in parallel — both inside try/catch
    const [, res] = await Promise.all([
      sub.fetchMySubscriptions().catch(() => null), // ne bloque pas si ça fail
      get<SuccessResponse_list_MonthlySessionResponse__>(
        '/v1/public-expressions/sessions',
        { params: { active_only: false } }          // query param propre
      ),
    ])
    sessions.value = (res.data ?? []).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
    )
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Impossible de charger les sessions.'
  } finally {
    loading.value = false   // garanti même si tout plante
  }
}

onMounted(loadSessions)

function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

useHead({ title: 'Simulateur Expression Écrite | Lumina TCF' })
</script>