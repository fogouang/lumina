<template>
  <div>
    <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 class="account-page-title mb-1">Expression Écrite</h1>
        <p class="text-sm text-(--text-secondary) max-w-xl">
          Entraînez-vous sur les vrais sujets du mois. Rédigez vos 3 tâches et
          obtenez une correction IA instantanée.
        </p>
      </div>
      <Tag
        v-if="auth.isAuthenticated"
        severity="warn"
        :value="`${sub.aiCreditsRemaining} crédit${sub.aiCreditsRemaining > 1 ? 's' : ''} IA`"
      />
    </div>

    <!-- Non connecté -->
    <div v-if="!auth.isAuthenticated" class="account-section text-center py-12">
      <i
        class="pi pi-lock text-4xl text-(--text-tertiary) mb-3 block opacity-40"
      />
      <h2 class="text-lg font-bold mb-1">Connexion requise</h2>
      <p class="text-(--text-secondary) mb-4">
        Créez un compte gratuit pour accéder aux sujets du mois.
      </p>
      <Button
        label="Se connecter"
        icon="pi pi-sign-in"
        class="bg-gradient-primary border-none"
        @click="openLogin()"
      />
    </div>

    <template v-else>
      <Message v-if="sub.aiCreditsRemaining === 0" severity="warn" class="mb-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <span
            >Aucun crédit IA disponible — vous pouvez lire les sujets mais pas
            lancer de correction.</span
          >
          <Button
            label="Acheter des crédits"
            icon="pi pi-plus"
            size="small"
            severity="warning"
            @click="openBuyCredits()"
          />
        </div>
      </Message>

      <div v-if="loading" class="flex justify-center py-12">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <Message v-else-if="error" severity="error" class="mb-4">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <span>{{ error }}</span>
          <Button
            label="Réessayer"
            icon="pi pi-refresh"
            text
            size="small"
            @click="loadSessions"
          />
        </div>
      </Message>

      <Message v-else-if="!sessions.length" severity="info">
        Aucune session disponible — les sujets du mois apparaîtront ici dès leur
        publication.
      </Message>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="session in sessions" :key="session.id">
          <template #title>
            <div class="flex items-center justify-between gap-2">
              <span>{{ session.name }}</span>
              <Tag
                :value="session.is_active ? 'Actif' : 'Archivé'"
                :severity="session.is_active ? 'success' : 'secondary'"
              />
            </div>
          </template>
          <template #subtitle>{{ formatMonth(session.month) }}</template>
          <template #content>
            <ul class="text-sm text-(--text-secondary) space-y-1.5 mb-4">
              <li class="flex items-center gap-2">
                <i class="pi pi-list text-primary-400" /> Plusieurs combinaisons
                de sujets
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-clock text-primary-400" /> 60 minutes
                recommandées
              </li>
              <li class="flex items-center gap-2">
                <i class="pi pi-sparkles text-primary-400" /> Correction IA
                disponible
              </li>
            </ul>
            <NuxtLink :to="`/simulateur/expression-ecrite/${session.id}`">
              <Button
                :label="
                  sub.aiCreditsRemaining > 0
                    ? 'Voir les sujets'
                    : 'Lire les sujets'
                "
                :icon="sub.aiCreditsRemaining > 0 ? 'pi pi-play' : 'pi pi-eye'"
                class="w-full"
                :class="
                  sub.aiCreditsRemaining > 0
                    ? 'bg-gradient-primary border-none'
                    : ''
                "
                :outlined="sub.aiCreditsRemaining === 0"
              />
            </NuxtLink>
          </template>
        </Card>
      </div>

      <div
        v-if="!loading && !error"
        class="account-section mt-6 flex flex-col md:flex-row items-start md:items-center gap-4"
      >
        <i class="pi pi-sparkles text-2xl text-primary-500" />
        <div class="flex-1">
          <p class="font-bold mb-0.5">Comment fonctionnent les crédits IA ?</p>
          <p class="text-sm text-(--text-secondary)">
            1 crédit = 1 correction IA complète (3 tâches). Chaque simulation
            consomme 1 crédit.
          </p>
        </div>
        <Button
          label="Acheter des crédits"
          icon="pi pi-plus"
          outlined
          @click="openBuyCredits()"
        />
      </div>
    </template>

    <BuyCreditsDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";

definePageMeta({ layout: "account", middleware: "auth" });

const { get } = useApi();
const auth = useAuthStore();
const sub = useSubscriptionStore();
const { openLogin } = useAuthModal();

const loading = ref(true);
const error = ref<string | null>(null);
const sessions = ref<MonthlySessionResponse[]>([]);
const { open: openBuyCredits } = useBuyCreditsDialog();

async function loadSessions() {
  loading.value = true;
  error.value = null;
  try {
    const [, res] = await Promise.all([
      sub.fetchMySubscriptions().catch(() => null),
      get<SuccessResponse_list_MonthlySessionResponse__>(
        "/v1/public-expressions/sessions",
        { params: { active_only: false } },
      ),
    ]);
    sessions.value = (res.data ?? []).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime(),
    );
  } catch (err: any) {
    error.value =
      err?.data?.message ??
      err?.message ??
      "Impossible de charger les sessions.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadSessions);

function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

useHead({ title: "Simulateur Expression Écrite | Lumina TCF" });
</script>
