<template>
  <div class="min-h-screen bg-(--bg-ground)">
    <!-- Hero -->
    <div
      class="relative bg-linear-to-br from-primary-700 to-primary-900 py-12 overflow-hidden"
    >
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px);
          background-size: 24px 24px;
        "
      />
      <div class="relative z-10 container mx-auto px-4 max-w-5xl">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-white/60 text-sm mb-6">
          <NuxtLink
            to="/epreuve/expression-orale/sujets-actualites"
            class="hover:text-white transition-colors flex items-center gap-1"
          >
            <i class="pi pi-arrow-left text-xs" />
            Expression Orale
          </NuxtLink>
          <i class="pi pi-angle-right text-xs" />
          <span class="text-white/90 font-medium">{{
            session ? session.name : "Chargement…"
          }}</span>
        </nav>

        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <i class="pi pi-microphone text-white/60 text-2xl" />
              <h1 class="text-3xl font-extrabold text-white">
                {{ session?.name ?? "…" }}
              </h1>
            </div>
            <p class="text-white/70 text-sm">
              {{ session ? formatMonth(session.month) : "" }} · 3 tâches · ~18
              minutes
            </p>
          </div>
          <Tag
            v-if="session"
            :value="session.is_active ? 'Actif' : 'Archivé'"
            :severity="session.is_active ? 'success' : 'secondary'"
            class="mt-1"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 py-10 max-w-5xl">
      <!-- Global loading -->
      <div v-if="loading" class="flex flex-col gap-6">
        <Skeleton height="180px" border-radius="16px" />
        <Skeleton height="240px" border-radius="16px" />
        <Skeleton height="240px" border-radius="16px" />
      </div>

      <div v-else class="flex flex-col gap-8">
        <!-- ═══════════════════════════════════════════
             TÂCHE 1 — Entretien dirigé (statique)
        ═══════════════════════════════════════════ -->
        <section>
          <div class="flex items-center gap-3 mb-5 mt-8">
            <div
              class="w-10 h-10 rounded-xl bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center shadow-sm shrink-0"
            >
              <span class="text-white font-extrabold text-base leading-none"
                >1</span
              >
            </div>
            <div>
              <h2 class="text-lg font-bold text-(--text-primary) leading-tight">
                Tâche 1 — Entretien dirigé
              </h2>
              <p
                class="text-(--text-secondary) text-sm flex items-center gap-1.5 mt-0.5"
              >
                <i class="pi pi-clock text-xs" />
                2 minutes · Sans préparation
              </p>
            </div>
          </div>

          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden"
          >
            <!-- Consigne -->
            <div class="px-6 py-5 border-b border-(--border-color)">
              <p
                class="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide mb-2"
              >
                Consigne
              </p>
              <p class="text-(--text-primary) leading-relaxed">
                Parlez de vous naturellement. L'examinateur engage une
                conversation avec vous. Il peut vous poser des questions sur
                votre vie, vos goûts, vos projets.
                <span class="text-(--text-secondary)">
                  Ne récitez pas, soyez naturel comme dans une vraie
                  conversation.</span
                >
              </p>
            </div>

            <!-- Structure recommandée -->
            <div class="px-6 py-5 border-b border-(--border-color)">
              <p
                class="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide mb-4"
              >
                Structure recommandée
              </p>
              <div class="flex flex-col gap-3">
                <div
                  v-for="step in task1Steps"
                  :key="step.num"
                  class="flex items-start gap-3"
                >
                  <span
                    class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                  >
                    {{ step.num }}
                  </span>
                  <div>
                    <p class="font-semibold text-(--text-primary) text-sm">
                      {{ step.title }}
                    </p>
                    <p class="text-(--text-secondary) text-sm leading-relaxed">
                      {{ step.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phrases d'amorce -->
            <div
              class="px-6 py-5 border-b border-(--border-color) bg-primary-50/40 dark:bg-primary-950/20"
            >
              <p
                class="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide mb-3"
              >
                Phrases d'amorce
              </p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="phrase in task1Phrases"
                  :key="phrase"
                  class="flex items-start gap-2"
                >
                  <i
                    class="pi pi-angle-right text-primary-500 text-xs mt-1 shrink-0"
                  />
                  <p class="text-(--text-primary) text-sm italic">
                    {{ phrase }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Thèmes possibles -->
            <div class="px-6 py-5 border-b border-(--border-color)">
              <p
                class="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide mb-3"
              >
                Thèmes que l'examinateur peut aborder
              </p>
              <div class="flex flex-wrap gap-2">
                <Tag
                  v-for="theme in task1Themes"
                  :key="theme"
                  :value="theme"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
            </div>

            <!-- Questions types -->
            <div class="px-6 py-5 border-b border-(--border-color)">
              <p
                class="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide mb-3"
              >
                Questions types de l'examinateur
              </p>
              <ul class="flex flex-col gap-2">
                <li
                  v-for="q in task1Questions"
                  :key="q"
                  class="flex items-start gap-2 text-sm text-(--text-secondary)"
                >
                  <i
                    class="pi pi-question-circle text-primary-400 text-xs mt-0.5 shrink-0"
                  />
                  {{ q }}
                </li>
              </ul>
            </div>

            <!-- Conseil -->
            <div
              class="px-6 py-4 bg-amber-50/60 dark:bg-amber-950/20 flex items-start gap-3"
            >
              <i
                class="pi pi-exclamation-triangle text-amber-500 text-sm mt-0.5 shrink-0"
              />
              <p class="text-sm text-(--text-secondary) leading-relaxed">
                Visez
                <strong class="text-(--text-primary)"
                  >minimum 1 minute 50 secondes</strong
                >. En deçà, vous perdez des points. Terminez par
                <span class="italic text-(--text-primary)"
                  >"Je vous remercie."</span
                >
              </p>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════
             TÂCHE 2 — Monologue suivi (dynamique)
        ═══════════════════════════════════════════ -->
        <section>
          <div class="flex items-center gap-3 mb-5 ">
            <div
              class="w-10 h-10 rounded-xl bg-linear-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-sm shrink-0"
            >
              <span class="text-white font-extrabold text-base leading-none"
                >2</span
              >
            </div>
            <div>
              <h2 class="text-lg font-bold text-(--text-primary) leading-tight">
                Tâche 2 - Monologue suivi
              </h2>
              <p
                class="text-(--text-secondary) text-sm flex items-center gap-1.5 mt-0.5"
              >
                <i class="pi pi-clock text-xs" />
                3 minutes · Préparation 1 minute
              </p>
            </div>
          </div>

          <div
            v-if="!task2List.length"
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-10 text-center"
          >
            <i
              class="pi pi-inbox text-3xl text-(--text-tertiary) opacity-30 mb-3 block"
            />
            <p class="text-(--text-secondary) text-sm">
              Aucun sujet Tâche 2 pour cette session.
            </p>
          </div>

          <div v-else class="flex flex-col gap-4">
            <EOTaskCard
              v-for="(task, idx) in task2List"
              :key="task.id"
              :index="idx + 1"
              :task="task"
              task-type="task2"
              correction-field="eo_task2_correction"
            />
          </div>
        </section>

        <!-- ═══════════════════════════════════════════
             TÂCHE 3 — Exercice en interaction (dynamique)
        ═══════════════════════════════════════════ -->
        <section class="mb-16">
          <div class="flex items-center gap-3 mb-5">
            <div
              class="w-10 h-10 rounded-xl bg-linear-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-sm shrink-0"
            >
              <span class="text-white font-extrabold text-base leading-none"
                >3</span
              >
            </div>
            <div>
              <h2 class="text-lg font-bold text-(--text-primary) leading-tight">
                Tâche 3 - Exercice en interaction
              </h2>
              <p
                class="text-(--text-secondary) text-sm flex items-center gap-1.5 mt-0.5"
              >
                <i class="pi pi-clock text-xs" />
                4 minutes · Sans préparation
              </p>
            </div>
          </div>

          <div
            v-if="!task3List.length"
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-10 text-center"
          >
            <i
              class="pi pi-inbox text-3xl text-(--text-tertiary) opacity-30 mb-3 block"
            />
            <p class="text-(--text-secondary) text-sm">
              Aucun sujet Tâche 3 pour cette session.
            </p>
          </div>

          <div v-else class="flex flex-col gap-4">
            <EOTaskCard
              v-for="(task, idx) in task3List"
              :key="task.id"
              :index="idx + 1"
              :task="task"
              task-type="task3"
              correction-field="eo_task3_correction"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { EOTask2Response } from "#shared/api/models/EOTask2Response";
import type { EOTask3Response } from "#shared/api/models/EOTask3Response";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";
import type { SuccessResponse_list_EOTask2Response__ } from "#shared/api/models/SuccessResponse_list_EOTask2Response__";
import type { SuccessResponse_list_EOTask3Response__ } from "#shared/api/models/SuccessResponse_list_EOTask3Response__";

definePageMeta({ middleware: "auth" });

const route = useRoute();
const sessionId = route.params.id as string;
const { get } = useApi();

const loading = ref(true);
const session = ref<MonthlySessionResponse | null>(null);
const task2List = ref<EOTask2Response[]>([]);
const task3List = ref<EOTask3Response[]>([]);

// ── Tâche 1 static data ──────────────────────────────────────
const task1Steps = [
  {
    num: 1,
    title: "État civil",
    desc: "Nom, âge, nationalité, lieu de résidence, statut matrimonial, région d'origine.",
  },
  {
    num: 2,
    title: "Formation académique",
    desc: "Mentionnez votre diplôme le plus élevé en lien avec votre profession. Expliquez pourquoi vous avez choisi ce cursus.",
  },
  {
    num: 3,
    title: "Expérience professionnelle",
    desc: "Nom de l'entreprise, localisation, poste occupé, tâches principales.",
  },
  {
    num: 4,
    title: "Loisirs valorisants",
    desc: "Sport, lecture, voyages, dessin... Choisissez des activités qui vous mettent en valeur.",
  },
  {
    num: 5,
    title: "Projets de vie",
    desc: "Que souhaiteriez-vous avoir accompli dans 10 ans ? Soyez précis et ambitieux.",
  },
];

const task1Phrases = [
  "Dans dix ans, j'espère avoir…",
  "Mon objectif principal est de…",
];

const task1Themes = [
  "État civil",
  "Famille",
  "Relations amicales",
  "Formation / études",
  "Vie professionnelle",
  "Loisirs et centres d'intérêt",
  "Voyages",
  "Logement",
  "Projets et souhaits",
  "Événements passés",
];

const task1Questions = [
  "Quel est votre film préféré ? Pourquoi ?",
  "Où êtes-vous allé durant vos dernières vacances ?",
  "Comment imaginez-vous votre vie dans 30 ans ?",
  "Où avez-vous appris le français ?",
  "Qu'est-ce qui vous passionne dans votre métier ?",
];

// ── Data fetching ─────────────────────────────────────────────
onMounted(async () => {
  try {
    const [sessionsRes, t2Res, t3Res] = await Promise.all([
      get<SuccessResponse_list_MonthlySessionResponse__>(
        "/v1/public-expressions/sessions?active_only=false",
      ),
      get<SuccessResponse_list_EOTask2Response__>(
        `/v1/public-expressions/sessions/${sessionId}/eo/task2`,
      ),
      get<SuccessResponse_list_EOTask3Response__>(
        `/v1/public-expressions/sessions/${sessionId}/eo/task3`,
      ),
    ]);

    session.value =
      (sessionsRes.data ?? []).find((s) => s.id === sessionId) ?? null;

    task2List.value = (t2Res.data ?? []).sort((a, b) => a.order - b.order);
    task3List.value = (t3Res.data ?? []).sort((a, b) => a.order - b.order);
  } finally {
    loading.value = false;
  }
});

function formatMonth(month: string): string {
  return new Date(month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

useHead({
  title: computed(
    () => `${session.value?.name ?? "Session"} — Expression Orale | Lumina TCF`,
  ),
});
</script>
