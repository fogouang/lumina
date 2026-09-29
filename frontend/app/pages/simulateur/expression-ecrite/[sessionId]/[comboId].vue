<template>
  <div>
    <!-- Chargement -->
    <div v-if="loading" class="flex flex-col items-center justify-center gap-4 py-24">
      <span class="grid size-14 place-items-center rounded-leaf brand-gradient text-white shadow-brand">
        <i class="pi pi-spin pi-spinner text-xl" />
      </span>
      <p class="text-sm font-medium text-muted">Chargement des sujets…</p>
    </div>

    <template v-else-if="session && combo">
      <!-- ── MODE LECTURE ───────────────────────────────────── -->
      <template v-if="!simulating">
        <!-- En-tête -->
        <header class="featured-panel relative mb-6 overflow-hidden rounded-card p-6 text-white shadow-brand sm:p-8">
          <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0">
              <NuxtLink
                :to="`/simulateur/expression-ecrite/${sessionId}`"
                class="mb-3 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
              >
                <i class="pi pi-arrow-left text-xs" />
                {{ session.name }}
              </NuxtLink>
              <h1 class="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">{{ combo.title }}</h1>
              <p class="mt-1.5 max-w-xl text-sm leading-relaxed text-white/75">
                <template v-if="sub.aiCreditsRemaining > 0">
                  Lisez les 3 sujets puis cliquez sur <strong class="text-white">Démarrer</strong> pour lancer le chrono.
                  <strong class="text-white">1 crédit IA</strong> sera utilisé à la soumission.
                </template>
                <template v-else>Mode lecture : vous pouvez lire les sujets mais pas obtenir de correction IA.</template>
              </p>
              <div class="mt-5">
                <button
                  v-if="sub.aiCreditsRemaining > 0"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary-900 shadow-lift transition-all duration-300 ease-spring hover:-translate-y-0.5"
                  @click="startSimulation"
                >
                  <i class="pi pi-play text-xs" />
                  Démarrer le simulateur
                </button>
                <button
                  v-else
                  type="button"
                  class="inline-flex items-center gap-2 rounded-xl bg-accent-400 px-5 py-3 text-sm font-bold text-primary-950 shadow-lift transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-accent-300"
                  @click="openBuyCredits()"
                >
                  <i class="pi pi-bolt text-xs" />
                  Acheter des crédits
                </button>
              </div>
            </div>

            <dl class="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-104">
              <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
                <dt class="sr-only">Nombre de tâches</dt>
                <i class="pi pi-list text-sm text-accent-400" aria-hidden="true" />
                <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">3 tâches</dd>
              </div>
              <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
                <dt class="sr-only">Durée recommandée</dt>
                <i class="pi pi-clock text-sm text-accent-400" aria-hidden="true" />
                <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">60 min</dd>
              </div>
              <button
                type="button"
                class="rounded-xl border px-3 py-3 text-left backdrop-blur transition-colors sm:px-4"
                :class="
                  sub.aiCreditsRemaining > 0
                    ? 'border-white/15 bg-white/10 hover:bg-white/15'
                    : 'border-accent-400/60 bg-accent-400/20 hover:bg-accent-400/30'
                "
                aria-label="Acheter des crédits IA"
                @click="openBuyCredits()"
              >
                <i class="pi pi-bolt text-sm text-accent-400" aria-hidden="true" />
                <span class="mt-1.5 block font-heading text-sm font-bold sm:text-base">
                  {{ sub.aiCreditsRemaining }} crédit{{ sub.aiCreditsRemaining > 1 ? "s" : "" }}
                </span>
              </button>
            </dl>
          </div>
        </header>

        <!-- Tâches 1 et 2 -->
        <div class="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TaskReadCard
            number="1"
            label="Tâche 1 - Message"
            type-label="Message court"
            :instruction="combo.task1_instruction"
            :word-min="combo.task1_word_min"
            :word-max="combo.task1_word_max"
            description="Rédigez un message, un courriel ou une annonce adressé à un ou plusieurs destinataires."
            :correction="combo.task1_correction"
          />
          <TaskReadCard
            number="2"
            label="Tâche 2 - Narration / Blog"
            type-label="Narration / Blog"
            :instruction="combo.task2_instruction"
            :word-min="combo.task2_word_min"
            :word-max="combo.task2_word_max"
            description="Rédigez un article, un billet de blog ou un récit à partir de la consigne donnée."
            :correction="combo.task2_correction"
          />
        </div>

        <!-- Tâche 3 -->
        <section class="mb-8 overflow-hidden rounded-card border border-line bg-card shadow-soft">
          <div class="flex items-center justify-between gap-3 border-b border-line bg-card-2/50 px-5 py-4">
            <div class="flex items-center gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-leaf brand-gradient text-sm font-bold text-white shadow-brand">
                3
              </span>
              <div>
                <p class="text-[0.65rem] font-bold uppercase tracking-wider text-faint">Argumentation</p>
                <p class="text-sm font-bold text-ink">Tâche 3 - Argumentation</p>
              </div>
            </div>
            <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-bold tabular-nums text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
              <i class="pi pi-align-left text-[0.6rem]" />
              {{ combo.task3_word_min }}–{{ combo.task3_word_max }} mots
            </span>
          </div>

          <div class="flex flex-col gap-4 px-5 py-5">
            <p class="text-xs italic text-muted">
              Rédigez un article argumentatif comparant deux points de vue opposés.
            </p>
            <h3 class="font-heading text-lg font-bold text-ink">{{ combo.task3_title }}</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-2xl border border-accent-200 bg-accent-50 p-5 dark:border-accent-500/25 dark:bg-accent-500/10">
                <p class="mb-2 text-xs font-bold uppercase tracking-wider text-accent-800 dark:text-accent-300">Document 1</p>
                <p class="text-[0.9375rem] leading-relaxed text-ink">{{ combo.task3_document_1 }}</p>
              </div>
              <div class="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <p class="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Document 2</p>
                <p class="text-[0.9375rem] leading-relaxed text-ink">{{ combo.task3_document_2 }}</p>
              </div>
            </div>
          </div>

          <!-- Proposition de correction -->
          <div v-if="combo.task3_correction" class="border-t border-line">
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-card-2/60"
              :aria-expanded="showTask3Correction"
              @click="showTask3Correction = !showTask3Correction"
            >
              <span class="flex items-center gap-2 text-sm font-semibold text-primary">
                <i class="pi pi-eye text-xs" />
                Voir la proposition de correction
              </span>
              <i
                class="pi pi-chevron-down text-xs text-faint transition-transform duration-200"
                :class="showTask3Correction ? 'rotate-180' : ''"
              />
            </button>
            <div v-if="showTask3Correction" class="px-5 pb-5">
              <p class="whitespace-pre-wrap rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-relaxed text-ink">
                {{ combo.task3_correction }}
              </p>
            </div>
          </div>
        </section>

        <!-- CTA bas -->
        <div class="flex justify-center pb-8">
          <AppButton
            v-if="sub.aiCreditsRemaining > 0"
            label="Démarrer le simulateur"
            icon="pi pi-play"
            variant="gradient"
            size="large"
            @click="startSimulation"
          />
          <AppButton
            v-else
            label="Acheter des crédits"
            icon="pi pi-bolt"
            variant="accent"
            size="large"
            @click="openBuyCredits()"
          />
        </div>
      </template>

      <!-- ── MODE SIMULATION ────────────────────────────────── -->
      <template v-else>
        <!-- Barre sticky (chrono) -->
        <header class="sticky top-0 z-50 -mx-5 mb-0 border-b border-line bg-card/90 backdrop-blur-md sm:-mx-8 xl:-mx-10 2xl:-mx-12">
          <div class="flex h-14 items-center justify-between gap-3 px-4 sm:px-5">
            <div class="flex min-w-0 items-center gap-3">
              <NuxtLink
                :to="`/simulateur/expression-ecrite/${sessionId}`"
                aria-label="Retour aux sujets"
                class="grid size-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-card-2 hover:text-primary"
              >
                <i class="pi pi-arrow-left text-sm" />
              </NuxtLink>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold leading-tight text-ink">{{ session.name }}</p>
                <p class="truncate text-xs text-muted">{{ combo.title }}</p>
              </div>
            </div>

            <div v-if="!combinedCorrection" class="flex flex-1 justify-center">
              <div
                class="flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm font-bold tabular-nums"
                :class="{
                  'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300':
                    timeLeft > 20 * 60,
                  'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300':
                    timeLeft <= 20 * 60 && timeLeft > 10 * 60,
                  'animate-pulse border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300':
                    timeLeft <= 10 * 60,
                }"
              >
                <i class="pi pi-clock" />
                {{ formattedTime }}
              </div>
            </div>
            <div v-else class="flex-1" />

            <button
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold transition-colors"
              :class="
                sub.aiCreditsRemaining > 0
                  ? 'bg-accent-100 text-accent-800 hover:bg-accent-200 dark:bg-accent-500/15 dark:text-accent-300'
                  : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300'
              "
              aria-label="Acheter des crédits IA"
              @click="openBuyCredits()"
            >
              <i class="pi pi-bolt text-xs" />
              {{ sub.aiCreditsRemaining }} crédit{{ sub.aiCreditsRemaining > 1 ? "s" : "" }}
            </button>
          </div>
        </header>

        <div class="-mx-5 flex min-h-[calc(100vh-3.5rem)] sm:-mx-8 xl:-mx-10 2xl:-mx-12">
          <!-- Sidebar gauche -->
          <aside
            class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-card lg:flex"
          >
            <p class="px-4 pb-2 pt-4 text-[0.65rem] font-bold uppercase tracking-widest text-faint">Navigation</p>
            <div class="flex flex-col gap-1 px-2">
              <button
                v-for="(t, i) in tasks"
                :key="t.key"
                type="button"
                class="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all"
                :class="activeTask === i ? 'border-primary/30 bg-primary/5' : 'border-transparent hover:bg-card-2'"
                @click="activeTask = i"
              >
                <span
                  class="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                  :class="
                    isTaskDone(t.key)
                      ? 'bg-linear-to-b from-emerald-400 to-emerald-600 shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)]'
                      : 'brand-gradient shadow-[inset_0_-2px_0_rgb(0_0_0/0.2)]'
                  "
                >
                  <i v-if="isTaskDone(t.key)" class="pi pi-check text-[0.65rem]" />
                  <span v-else>{{ i + 1 }}</span>
                </span>
                <div class="min-w-0">
                  <p class="truncate text-xs font-semibold text-ink">{{ t.shortLabel }}</p>
                  <p class="font-mono text-[0.65rem] tabular-nums text-faint">
                    {{ wordCount(answers[t.key]) }}/{{ t.max }}
                  </p>
                </div>
              </button>
            </div>

            <div v-if="!combinedCorrection" class="mt-auto border-t border-line p-3">
              <AppButton
                label="Soumettre"
                icon="pi pi-bolt"
                icon-pos="right"
                variant="gradient"
                block
                :loading="submitting"
                :disabled="!allAnswered || sub.aiCreditsRemaining === 0"
                @click="submitAll"
              />
              <p class="mt-1.5 text-center text-[0.65rem] leading-snug text-faint">
                <span v-if="!allAnswered">Complétez les 3 tâches</span>
                <span v-else>Prêt · <strong class="text-ink">1 crédit IA</strong></span>
              </p>
            </div>
          </aside>

          <!-- Zone centrale -->
          <main class="flex min-w-0 flex-1 flex-col gap-4 px-4 py-5 lg:px-6">
            <!-- Plus de crédits -->
            <div
              v-if="sub.aiCreditsRemaining === 0 && !combinedCorrection"
              class="flex flex-col gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 sm:flex-row sm:items-center dark:border-accent-500/25 dark:bg-accent-500/10"
            >
              <i class="pi pi-exclamation-triangle shrink-0 text-accent-700 dark:text-accent-300" />
              <div class="flex-1 text-sm">
                <p class="font-bold text-ink">Plus de crédits IA</p>
                <p class="text-muted">
                  Vous pouvez continuer à rédiger mais la soumission nécessite au moins 1 crédit.
                </p>
              </div>
              <AppButton
                label="Acheter"
                icon="pi pi-plus"
                variant="accent"
                size="small"
                class="shrink-0"
                @click="openBuyCredits()"
              />
            </div>

            <!-- Tâche active -->
            <template v-if="!combinedCorrection">
              <section class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
                <div class="flex items-center gap-3 border-b border-line bg-card-2/50 px-5 py-3.5">
                  <span class="grid size-9 shrink-0 place-items-center rounded-leaf brand-gradient text-sm font-bold text-white shadow-brand">
                    {{ activeTask + 1 }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-bold text-ink">{{ currentTask.label }}</p>
                    <p class="text-xs text-muted">{{ currentTask.min }}–{{ currentTask.max }} mots recommandés</p>
                  </div>
                  <span class="shrink-0 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-bold text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
                    {{ currentTask.typeLabel }}
                  </span>
                </div>

                <!-- Consigne -->
                <div class="border-b border-line px-5 py-4">
                  <p v-if="activeTask === 0" class="text-sm leading-relaxed text-ink">
                    {{ combo.task1_instruction }}
                  </p>
                  <p v-else-if="activeTask === 1" class="text-sm leading-relaxed text-ink">
                    {{ combo.task2_instruction }}
                  </p>
                  <template v-else>
                    <h3 class="mb-3 font-heading text-base font-bold text-ink">{{ combo.task3_title }}</h3>
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div class="rounded-2xl border border-accent-200 bg-accent-50 p-3.5 dark:border-accent-500/25 dark:bg-accent-500/10">
                        <p class="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-accent-800 dark:text-accent-300">Document 1</p>
                        <p class="text-sm leading-relaxed text-ink">{{ combo.task3_document_1 }}</p>
                      </div>
                      <div class="rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
                        <p class="mb-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary">Document 2</p>
                        <p class="text-sm leading-relaxed text-ink">{{ combo.task3_document_2 }}</p>
                      </div>
                    </div>
                  </template>
                </div>

                <Textarea
                  v-model="answers[currentTask.key]"
                  :rows="11"
                  fluid
                  :aria-label="`Votre réponse, ${currentTask.label}`"
                  :placeholder="`Rédigez votre ${currentTask.typeLabel.toLowerCase()} ici…`"
                  class="rounded-none border-x-0 border-b-0 text-[0.9375rem] leading-relaxed"
                  :disabled="!!combinedCorrection"
                />

                <div class="flex items-center justify-between gap-3 border-t border-line bg-card-2/50 px-5 py-2.5">
                  <span
                    class="font-mono text-xs font-semibold tabular-nums"
                    :class="wordCountClass(wordCount(answers[currentTask.key]), currentTask.min, currentTask.max)"
                  >
                    {{ wordCount(answers[currentTask.key]) }} / {{ currentTask.max }} mots
                  </span>
                  <span
                    v-if="wordCount(answers[currentTask.key]) >= currentTask.min"
                    class="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    <i class="pi pi-check-circle" /> Minimum atteint
                  </span>
                </div>
              </section>

              <!-- Navigation mobile -->
              <div class="flex items-center justify-between gap-3 lg:hidden">
                <AppButton
                  label="Précédent"
                  icon="pi pi-chevron-left"
                  variant="secondary"
                  :disabled="activeTask === 0"
                  @click="activeTask--"
                />
                <span class="font-heading text-sm font-bold tabular-nums text-muted">
                  Tâche {{ activeTask + 1 }} / 3
                </span>
                <AppButton
                  v-if="activeTask < 2"
                  label="Suivant"
                  icon="pi pi-chevron-right"
                  icon-pos="right"
                  variant="secondary"
                  @click="activeTask++"
                />
                <AppButton
                  v-else
                  label="Soumettre"
                  icon="pi pi-bolt"
                  icon-pos="right"
                  variant="gradient"
                  :loading="submitting"
                  :disabled="!allAnswered || sub.aiCreditsRemaining === 0"
                  @click="submitAll"
                />
              </div>
            </template>

            <!-- ── Résultats ─────────────────────────────────── -->
            <template v-else>
              <!-- Score -->
              <div class="featured-panel relative overflow-hidden rounded-card p-8 text-center text-white shadow-brand">
                <div class="relative z-10 flex flex-col items-center gap-2">
                  <span class="mb-1 grid size-14 place-items-center rounded-full bg-white/15 backdrop-blur">
                    <i class="pi pi-check-circle text-2xl" />
                  </span>
                  <p class="font-heading text-6xl font-extrabold leading-none tabular-nums">
                    {{ combinedCorrection.global_assessment.overall_score }}<span class="text-2xl opacity-60">/20</span>
                  </p>
                  <span class="mt-1 rounded-full bg-accent-400 px-3 py-1 font-heading text-sm font-extrabold text-primary-950">
                    Niveau {{ combinedCorrection.global_assessment.cecrl_level }}
                  </span>
                  <p class="mt-1 max-w-md text-sm leading-relaxed text-white/80">
                    {{ combinedCorrection.global_assessment.appreciation }}
                  </p>
                </div>
              </div>

              <!-- Scores par critère -->
              <section class="rounded-card border border-line bg-card p-5 shadow-soft">
                <h3 class="mb-4 flex items-center gap-2 border-b border-line pb-3.5 font-heading text-sm font-bold text-ink">
                  <i class="pi pi-chart-bar text-primary" /> Scores par critère
                </h3>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    v-for="item in criteriaItems"
                    :key="item.label"
                    class="rounded-2xl border border-line bg-card-2/50 p-4"
                  >
                    <div class="mb-1 flex items-baseline justify-between gap-2">
                      <p class="text-xs font-semibold text-muted">{{ item.label }}</p>
                      <p class="font-heading text-xl font-extrabold tabular-nums text-primary">
                        {{ item.score }}<span class="text-sm font-semibold text-faint">/{{ item.max }}</span>
                      </p>
                    </div>
                    <div class="mb-2 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        class="h-full rounded-full bg-linear-to-r from-primary-400 to-primary-700"
                        :style="{ width: `${Math.min(100, (item.score / item.max) * 100)}%` }"
                      />
                    </div>
                    <p class="text-xs leading-relaxed text-ink">{{ item.feedback }}</p>
                  </div>
                </div>
              </section>

              <!-- Versions corrigées -->
              <section
                v-if="combinedCorrection.task_feedbacks"
                class="rounded-card border border-line bg-card p-5 shadow-soft"
              >
                <h3 class="mb-4 flex items-center gap-2 border-b border-line pb-3.5 font-heading text-sm font-bold text-ink">
                  <i class="pi pi-file-edit text-primary" /> Versions corrigées par tâche
                </h3>
                <div class="flex flex-col gap-4">
                  <template v-for="(taskKey, idx) in ['task1', 'task2', 'task3']" :key="taskKey">
                    <div
                      v-if="combinedCorrection.task_feedbacks[taskKey]"
                      class="overflow-hidden rounded-2xl border border-line"
                    >
                      <div class="flex items-center gap-2.5 border-b border-line bg-card-2/50 px-4 py-3">
                        <span class="grid size-7 shrink-0 place-items-center rounded-full brand-gradient text-xs font-bold text-white">
                          {{ idx + 1 }}
                        </span>
                        <span class="text-sm font-semibold text-ink">
                          {{ ["Tâche 1 - Message", "Tâche 2 - Narration", "Tâche 3 - Argumentation"][idx] }}
                        </span>
                      </div>

                      <div class="grid grid-cols-1 gap-3 border-b border-line px-4 py-3 md:grid-cols-2">
                        <div v-if="combinedCorrection.task_feedbacks[taskKey].main_strengths?.length">
                          <p class="mb-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">Points forts</p>
                          <ul class="flex flex-col gap-1">
                            <li
                              v-for="s in combinedCorrection.task_feedbacks[taskKey].main_strengths"
                              :key="s"
                              class="flex items-start gap-1.5 text-xs text-emerald-700 dark:text-emerald-300"
                            >
                              <i class="pi pi-check mt-0.5 shrink-0 text-[0.65rem]" />{{ s }}
                            </li>
                          </ul>
                        </div>
                        <div v-if="combinedCorrection.task_feedbacks[taskKey].main_weaknesses?.length">
                          <p class="mb-1.5 text-xs font-bold text-red-700 dark:text-red-400">Points à améliorer</p>
                          <ul class="flex flex-col gap-1">
                            <li
                              v-for="w in combinedCorrection.task_feedbacks[taskKey].main_weaknesses"
                              :key="w"
                              class="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-300"
                            >
                              <i class="pi pi-times mt-0.5 shrink-0 text-[0.65rem]" />{{ w }}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div v-if="combinedCorrection.task_feedbacks[taskKey].corrected_text" class="px-4 py-4">
                        <p class="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                          Proposition de correction
                        </p>
                        <p class="whitespace-pre-wrap rounded-xl bg-card-2 p-3.5 text-sm leading-relaxed text-ink">
                          {{ combinedCorrection.task_feedbacks[taskKey].corrected_text }}
                        </p>
                      </div>
                    </div>
                  </template>
                </div>
              </section>

              <!-- Erreurs -->
              <section
                v-if="combinedCorrection.corrections?.length"
                class="rounded-card border border-line bg-card p-5 shadow-soft"
              >
                <h3 class="mb-4 flex items-center gap-2 border-b border-line pb-3.5 font-heading text-sm font-bold text-ink">
                  <i class="pi pi-pencil text-primary" /> Erreurs identifiées
                </h3>
                <div class="flex flex-col gap-3">
                  <div
                    v-for="(c, i) in combinedCorrection.corrections"
                    :key="i"
                    class="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-500/20 dark:bg-red-500/5"
                  >
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        v-if="c.task"
                        class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                      >
                        Tâche {{ c.task }}
                      </span>
                      <span class="text-sm font-bold text-red-700 line-through dark:text-red-400">{{ c.error }}</span>
                      <i class="pi pi-arrow-right text-xs text-faint" />
                      <span class="text-sm font-bold text-emerald-700 dark:text-emerald-400">{{ c.correction }}</span>
                    </div>
                    <p class="text-xs leading-relaxed text-muted">{{ c.explanation }}</p>
                  </div>
                </div>
              </section>

              <!-- Conseils -->
              <section
                v-if="combinedCorrection.suggestions?.length"
                class="rounded-card border border-line bg-card p-5 shadow-soft"
              >
                <h3 class="mb-4 flex items-center gap-2 border-b border-line pb-3.5 font-heading text-sm font-bold text-ink">
                  <i class="pi pi-lightbulb text-accent-600 dark:text-accent-400" /> Conseils pour progresser
                </h3>
                <ol class="flex flex-col gap-2">
                  <li
                    v-for="(s, i) in combinedCorrection.suggestions"
                    :key="i"
                    class="flex items-start gap-3 rounded-2xl bg-card-2/60 p-3"
                  >
                    <span class="grid size-6 shrink-0 place-items-center rounded-full brand-gradient text-xs font-bold text-white">
                      {{ i + 1 }}
                    </span>
                    <p class="text-sm leading-relaxed text-ink">{{ s }}</p>
                  </li>
                </ol>
              </section>

              <!-- Actions -->
              <div class="flex flex-col justify-center gap-3 pb-8 sm:flex-row">
                <AppButton
                  label="Refaire une simulation"
                  icon="pi pi-refresh"
                  variant="gradient"
                  @click="resetSimulation"
                />
                <NuxtLink
                  :to="`/simulateur/expression-ecrite/${sessionId}`"
                  class="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <i class="pi pi-arrow-left text-xs" />
                  Autres sujets
                </NuxtLink>
              </div>
            </template>
          </main>

          <!-- Panneau droit -->
          <aside
            class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col gap-5 overflow-y-auto border-l border-line bg-card p-4 xl:flex"
          >
            <p class="text-[0.65rem] font-bold uppercase tracking-widest text-faint">Outils</p>

            <div class="flex flex-col gap-2">
              <p class="text-xs font-semibold text-muted">Caractères spéciaux</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="ch in specialChars"
                  :key="ch"
                  type="button"
                  :aria-label="`Insérer ${ch}`"
                  class="grid size-8 place-items-center rounded-lg border border-line bg-card-2 text-sm font-medium text-ink shadow-[inset_0_-2px_0_rgb(15_23_42/0.06)] transition-all hover:-translate-y-px hover:border-primary/40 hover:text-primary active:translate-y-px"
                  @click="insertChar(ch)"
                >
                  {{ ch }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <p class="text-xs font-semibold text-muted">Progression</p>
              <div v-for="(t, i) in tasks" :key="t.key" class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted">Tâche {{ i + 1 }}</span>
                  <span
                    class="font-mono text-[0.65rem] font-semibold tabular-nums"
                    :class="wordCountClass(wordCount(answers[t.key]), t.min, t.max)"
                  >
                    {{ wordCount(answers[t.key]) }}/{{ t.max }}
                  </span>
                </div>
                <div class="h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="{
                      'bg-red-400': wordCount(answers[t.key]) < t.min,
                      'bg-emerald-500': wordCount(answers[t.key]) >= t.min && wordCount(answers[t.key]) <= t.max,
                      'bg-amber-400': wordCount(answers[t.key]) > t.max,
                    }"
                    :style="{ width: Math.min(100, (wordCount(answers[t.key]) / t.max) * 100) + '%' }"
                  />
                </div>
              </div>
            </div>

            <div class="mt-auto flex gap-2 rounded-2xl border border-accent-200 bg-accent-50 p-3 dark:border-accent-500/25 dark:bg-accent-500/10">
              <i class="pi pi-info-circle mt-0.5 shrink-0 text-xs text-accent-700 dark:text-accent-300" />
              <p class="text-[0.65rem] leading-snug text-ink">
                Laisser une tâche vide entraîne automatiquement une note éliminatoire de 0/20.
              </p>
            </div>
          </aside>
        </div>
      </template>
    </template>

    <!-- Combinaison introuvable -->
    <div
      v-else-if="!loading"
      class="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center"
    >
      <span class="grid size-16 place-items-center rounded-leaf bg-card-2 text-faint">
        <i class="pi pi-exclamation-circle text-3xl" />
      </span>
      <p class="font-heading text-lg font-bold text-ink">Aucun sujet disponible pour cette combinaison.</p>
      <NuxtLink
        :to="`/simulateur/expression-ecrite/${sessionId}`"
        class="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
      >
        <i class="pi pi-arrow-left text-xs" />
        Retour
      </NuxtLink>
    </div>

    <BuyCreditsDialog />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionResponse } from "#shared/api/models/MonthlySessionResponse";
import type { EECombinationResponse } from "#shared/api/models/EECombinationResponse";
import type { SuccessResponse_list_MonthlySessionResponse__ } from "#shared/api/models/SuccessResponse_list_MonthlySessionResponse__";
import type { SuccessResponse_EECombinationResponse_ } from "#shared/api/models/SuccessResponse_EECombinationResponse_";

definePageMeta({ layout: "account", middleware: "auth" });

const route = useRoute();
const sessionId = route.params.sessionId as string;
const comboId = route.params.comboId as string;
const { get, post } = useApi();
const sub = useSubscriptionStore();
const toast = useToast();

const loading = ref(true);
const session = ref<MonthlySessionResponse | null>(null);
const combo = ref<EECombinationResponse | null>(null);
const simulating = ref(false);
const submitting = ref(false);
const activeTask = ref(0);
const { open: openBuyCredits } = useBuyCreditsDialog();

const specialChars = [
  "é",
  "è",
  "ê",
  "ë",
  "à",
  "â",
  "ù",
  "û",
  "ü",
  "ç",
  "ô",
  "œ",
  "æ",
  "·",
  "»",
  "«",
];

const combinedCorrection = ref<{
  global_assessment: {
    overall_score: number;
    cecrl_level: string;
    appreciation: string;
  };
  criteria_scores: {
    structure_score: number;
    structure_feedback: string;
    cohesion_score: number;
    cohesion_feedback: string;
    vocabulary_score: number;
    vocabulary_feedback: string;
    grammar_score: number;
    grammar_feedback: string;
    task_score: number;
    task_feedback: string;
  };
  task_feedbacks: Record<
    string,
    {
      corrected_text: string;
      main_strengths: string[];
      main_weaknesses: string[];
    }
  >;
  corrections: Array<{
    error: string;
    correction: string;
    explanation: string;
    task?: string;
  }>;
  suggestions: string[];
} | null>(null);

const tasks = computed(() =>
  combo.value
    ? [
        {
          key: "task1" as const,
          label: "Tâche 1  Message",
          shortLabel: "Message",
          typeLabel: "Message court",
          min: combo.value.task1_word_min,
          max: combo.value.task1_word_max,
        },
        {
          key: "task2" as const,
          label: "Tâche 2  Narration / Blog",
          shortLabel: "Narration",
          typeLabel: "Narration / Blog",
          min: combo.value.task2_word_min,
          max: combo.value.task2_word_max,
        },
        {
          key: "task3" as const,
          label: "Tâche 3 Argumentation",
          shortLabel: "Argumentation",
          typeLabel: "Argumentation",
          min: combo.value.task3_word_min,
          max: combo.value.task3_word_max,
        },
      ]
    : [],
);

const criteriaItems = computed(() => {
  if (!combinedCorrection.value) return [];
  const c = combinedCorrection.value.criteria_scores;
  return [
    {
      label: "Structure",
      score: c.structure_score,
      feedback: c.structure_feedback,
      max: 5,
    },
    {
      label: "Cohésion",
      score: c.cohesion_score,
      feedback: c.cohesion_feedback,
      max: 4,
    },
    {
      label: "Vocabulaire",
      score: c.vocabulary_score,
      feedback: c.vocabulary_feedback,
      max: 4,
    },
    {
      label: "Grammaire",
      score: c.grammar_score,
      feedback: c.grammar_feedback,
      max: 3,
    },
    { label: "Tâches", score: c.task_score, feedback: c.task_feedback, max: 4 },
  ];
});

const timeLeft = ref(60 * 60);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60);
  const s = timeLeft.value % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

const showTask3Correction = ref(false);
const answers = reactive({ task1: "", task2: "", task3: "" });
const currentTask = computed(() => tasks.value[activeTask.value]!);

const allAnswered = computed(
  () =>
    combo.value !== null &&
    wordCount(answers.task1) >= combo.value.task1_word_min &&
    wordCount(answers.task2) >= combo.value.task2_word_min &&
    wordCount(answers.task3) >= combo.value.task3_word_min,
);

function isTaskDone(key: "task1" | "task2" | "task3") {
  const t = tasks.value.find((t) => t.key === key);
  return t ? wordCount(answers[key]) >= t.min : false;
}

onMounted(async () => {
  await sub.fetchMySubscriptions();
  try {
    const [sessionsRes, comboRes] = await Promise.all([
      get<SuccessResponse_list_MonthlySessionResponse__>(
        "/v1/public-expressions/sessions?active_only=false",
      ),
      get<SuccessResponse_EECombinationResponse_>(
        `/v1/public-expressions/ee/${comboId}`,
      ),
    ]);
    session.value =
      (sessionsRes.data ?? []).find((s) => s.id === sessionId) ?? null;
    combo.value = comboRes.data ?? null;
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

function startSimulation() {
  simulating.value = true;
  timeLeft.value = 60 * 60;
  timerInterval = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval!);
      toast.add({ severity: "warn", summary: "Temps écoulé !", life: 5000 });
    }
  }, 1000);
}

function resetSimulation() {
  simulating.value = false;
  combinedCorrection.value = null;
  answers.task1 = "";
  answers.task2 = "";
  answers.task3 = "";
  activeTask.value = 0;
  if (timerInterval) clearInterval(timerInterval);
}

async function submitAll() {
  if (!combo.value) return;
  submitting.value = true;
  try {
    const res = await post<any>("/v1/public-expressions/ai-correct-combined", {
      task1_content: answers.task1,
      task1_instruction: combo.value.task1_instruction,
      task1_word_min: combo.value.task1_word_min,
      task1_word_max: combo.value.task1_word_max,
      task2_content: answers.task2,
      task2_instruction: combo.value.task2_instruction,
      task2_word_min: combo.value.task2_word_min,
      task2_word_max: combo.value.task2_word_max,
      task3_content: answers.task3,
      task3_instruction: `${combo.value.task3_title}\n\nDocument 1:\n${combo.value.task3_document_1}\n\nDocument 2:\n${combo.value.task3_document_2}`,
      task3_word_min: combo.value.task3_word_min,
      task3_word_max: combo.value.task3_word_max,
    });
    combinedCorrection.value = res.data ?? res;
    await sub.fetchMySubscriptions();
    if (timerInterval) clearInterval(timerInterval);
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Erreur de correction",
      detail: err?.data?.message ?? "Impossible d'obtenir la correction IA",
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function wordCountClass(count: number, min: number, max: number): string {
  if (count < min) return "text-red-500";
  if (count > max) return "text-amber-500";
  return "text-green-600";
}

function insertChar(ch: string) {
  const key = tasks.value[activeTask.value]?.key;
  if (key) answers[key] += ch;
}

useHead({
  title: computed(
    () =>
      `${combo.value?.title ?? "Simulateur"} - Expression Écrite | Lumina TCF`,
  ),
});
</script>
