<template>
  <div class="min-h-screen bg-canvas">
    <!-- Hero -->
    <section class="featured-panel px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pt-40">
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />
      <div class="relative mx-auto max-w-5xl">
        <nav aria-label="Fil d'Ariane" class="flex items-center gap-2 text-sm text-white/70">
          <NuxtLink
            to="/epreuve/expression-orale/sujets-actualites"
            class="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <i class="pi pi-arrow-left text-xs" />
            Expression orale
          </NuxtLink>
          <i class="pi pi-angle-right text-xs text-white/40" />
          <span class="font-semibold text-white">{{ session ? session.name : "Chargement…" }}</span>
        </nav>

        <div class="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <span class="grid size-14 place-items-center rounded-[1.2rem_0.4rem] bg-accent-400 text-accent-950 shadow-soft">
              <i class="pi pi-microphone text-xl" />
            </span>
            <div>
              <h1 class="font-heading text-3xl font-extrabold tracking-tight text-white">{{ session?.name ?? "…" }}</h1>
              <p class="mt-1 text-sm text-white/70">
                {{ session ? formatMonth(session.month) : "" }} · 3 tâches · environ 12 minutes
              </p>
            </div>
          </div>
          <span
            v-if="session"
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            :class="session.is_active ? 'bg-green-400/20 text-green-200' : 'bg-white/15 text-white/70'"
          >
            <span class="size-1.5 rounded-full" :class="session.is_active ? 'bg-green-300' : 'bg-white/50'" />
            {{ session.is_active ? "Actif" : "Archivé" }}
          </span>
        </div>
      </div>
    </section>

    <!-- Contenu -->
    <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Chargement -->
      <div v-if="loading" class="flex flex-col gap-6">
        <Skeleton height="12rem" border-radius="1rem" />
        <Skeleton height="15rem" border-radius="1rem" />
        <Skeleton height="15rem" border-radius="1rem" />
      </div>

      <div v-else class="flex flex-col gap-14">
        <!-- Tâche 1 : entretien dirigé -->
        <section v-reveal>
          <div class="mb-5 flex items-center gap-4">
            <span class="brand-gradient grid size-12 shrink-0 place-items-center rounded-leaf font-heading text-lg font-extrabold text-white shadow-brand">1</span>
            <div>
              <h2 class="font-heading text-xl font-bold text-ink">Tâche 1 : entretien dirigé</h2>
              <p class="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
                <i class="pi pi-clock text-xs" />
                2 minutes · sans préparation
              </p>
            </div>
          </div>

          <div class="overflow-hidden rounded-[2rem_0.5rem] border border-line bg-card shadow-soft">
            <!-- Consigne -->
            <div class="border-b border-line px-6 py-5">
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">Consigne</p>
              <p class="leading-relaxed text-ink">
                Parlez de vous naturellement. L'examinateur engage une conversation avec vous. Il peut vous
                poser des questions sur votre vie, vos goûts, vos projets.
                <span class="text-muted">Ne récitez pas, soyez naturel comme dans une vraie conversation.</span>
              </p>
            </div>

            <!-- Structure -->
            <div class="border-b border-line px-6 py-5">
              <p class="mb-4 text-[11px] font-semibold uppercase tracking-wider text-faint">Structure recommandée</p>
              <div class="grid gap-4 md:grid-cols-2">
                <div v-for="step in task1Steps" :key="step.num" class="flex items-start gap-3">
                  <span class="grid size-7 shrink-0 place-items-center rounded-[0.7rem_0.2rem] bg-primary-50 text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    {{ step.num }}
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-ink">{{ step.title }}</p>
                    <p class="mt-0.5 text-sm leading-relaxed text-muted">{{ step.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phrases d'amorce -->
            <div class="border-b border-line bg-primary-50/50 px-6 py-5 dark:bg-primary-950/30">
              <p class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">Phrases d'amorce</p>
              <div class="flex flex-col gap-2">
                <p v-for="phrase in task1Phrases" :key="phrase" class="flex items-start gap-2 text-sm italic text-ink">
                  <i class="pi pi-angle-right mt-1 shrink-0 text-xs text-primary" />
                  {{ phrase }}
                </p>
              </div>
            </div>

            <div class="grid border-b border-line md:grid-cols-2">
              <!-- Thèmes -->
              <div class="border-b border-line px-6 py-5 md:border-b-0 md:border-r">
                <p class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
                  Thèmes que l'examinateur peut aborder
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="theme in task1Themes"
                    :key="theme"
                    class="rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted"
                  >
                    {{ theme }}
                  </span>
                </div>
              </div>

              <!-- Questions -->
              <div class="px-6 py-5">
                <p class="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">
                  Questions types de l'examinateur
                </p>
                <ul class="flex flex-col gap-2">
                  <li v-for="q in task1Questions" :key="q" class="flex items-start gap-2 text-sm text-muted">
                    <i class="pi pi-question-circle mt-0.5 shrink-0 text-xs text-primary" />
                    {{ q }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Conseil -->
            <div class="flex items-start gap-3 bg-accent-50 px-6 py-4 dark:bg-accent-950">
              <i class="pi pi-exclamation-triangle mt-0.5 shrink-0 text-sm text-accent-700 dark:text-accent-300" />
              <p class="text-sm leading-relaxed text-accent-900 dark:text-accent-200">
                Visez <strong class="font-bold">au minimum 1 minute 50 secondes</strong>. En deçà, vous perdez
                des points. Terminez par <em>« Je vous remercie. »</em>
              </p>
            </div>
          </div>
        </section>

        <!-- Tâche 2 -->
        <section v-reveal>
          <div class="mb-5 flex items-center gap-4">
            <span class="brand-gradient grid size-12 shrink-0 place-items-center rounded-leaf font-heading text-lg font-extrabold text-white shadow-brand">2</span>
            <div>
              <h2 class="font-heading text-xl font-bold text-ink">Tâche 2 : exercice en interaction</h2>
              <p class="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
                <i class="pi pi-clock text-xs" />
                3 min 30 · préparation 2 minutes
              </p>
            </div>
          </div>

          <div
            v-if="!task2List.length"
            class="flex flex-col items-center gap-3 rounded-card border border-line bg-card p-10 text-center"
          >
            <span class="grid size-12 place-items-center rounded-leaf bg-card-2 text-faint">
              <i class="pi pi-inbox text-lg" />
            </span>
            <p class="text-sm text-muted">Aucun sujet de tâche 2 pour cette session.</p>
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

        <!-- Tâche 3 -->
        <section v-reveal class="mb-8">
          <div class="mb-5 flex items-center gap-4">
            <span class="brand-gradient grid size-12 shrink-0 place-items-center rounded-leaf font-heading text-lg font-extrabold text-white shadow-brand">3</span>
            <div>
              <h2 class="font-heading text-xl font-bold text-ink">Tâche 3 : expression d'un point de vue</h2>
              <p class="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
                <i class="pi pi-clock text-xs" />
                4 min 30 · sans préparation
              </p>
            </div>
          </div>

          <div
            v-if="!task3List.length"
            class="flex flex-col items-center gap-3 rounded-card border border-line bg-card p-10 text-center"
          >
            <span class="grid size-12 place-items-center rounded-leaf bg-card-2 text-faint">
              <i class="pi pi-inbox text-lg" />
            </span>
            <p class="text-sm text-muted">Aucun sujet de tâche 3 pour cette session.</p>
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
