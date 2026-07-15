<template>
  <div class="min-h-screen bg-(--bg-ground)">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center min-h-screen gap-4 text-(--text-secondary)"
    >
      <ProgressSpinner style="width: 48px; height: 48px" />
      <p class="text-sm">Chargement des sujets…</p>
    </div>

    <template v-else-if="session && combo">
      <!-- Header sticky -->
      <header
        class="sticky top-0 z-50 bg-(--bg-card) border-b border-(--border-color)"
      >
        <div class="flex items-center justify-between gap-3 px-5 h-14">
          <!-- Gauche -->
          <div class="flex items-center gap-3 min-w-0">
            <NuxtLink
              :to="`/simulateur/expression-ecrite/${sessionId}`"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-(--text-tertiary) hover:bg-(--bg-hover) hover:text-primary-700 transition-colors shrink-0"
            >
              <i class="pi pi-arrow-left text-sm" />
            </NuxtLink>
            <div class="min-w-0">
              <p
                class="text-sm font-bold text-(--text-primary) truncate leading-tight"
              >
                {{ session.name }}
              </p>
              <p class="text-xs text-(--text-tertiary) truncate">
                {{ combo.title }}
              </p>
            </div>
          </div>

          <!-- Centre : timer -->
          <div
            v-if="simulating && !combinedCorrection"
            class="flex-1 flex justify-center"
          >
            <div
              class="flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded-full border-1.5"
              :class="{
                'text-green-600 border-green-200 bg-green-50':
                  timeLeft > 20 * 60,
                'text-amber-600 border-amber-200 bg-amber-50':
                  timeLeft <= 20 * 60 && timeLeft > 10 * 60,
                'text-red-600 border-red-200 bg-red-50 animate-pulse':
                  timeLeft <= 10 * 60,
              }"
            >
              <i class="pi pi-clock" />
              {{ formattedTime }}
            </div>
          </div>
          <div v-else class="flex-1" />

          <!-- Crédits -->
          <div
            class="flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border"
            :class="
              sub.aiCreditsRemaining > 0
                ? 'text-purple-600 border-purple-200 bg-purple-50'
                : 'text-amber-600 border-amber-200 bg-amber-50'
            "
          >
            <i class="pi pi-sparkles text-xs" />
            <span
              >{{ sub.aiCreditsRemaining }} crédit{{
                sub.aiCreditsRemaining > 1 ? "s" : ""
              }}</span
            >
          </div>
        </div>
      </header>

      <!-- MODE LECTURE -->
      <template v-if="!simulating">
        <div class="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
          <!-- Bannière -->
          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
          >
            <div class="flex-1">
              <h2 class="text-base font-bold text-(--text-primary) mb-1">
                {{
                  sub.aiCreditsRemaining > 0
                    ? "Prêt à simuler ?"
                    : "Mode lecture"
                }}
              </h2>
              <p class="text-sm text-(--text-secondary) leading-relaxed">
                <span v-if="sub.aiCreditsRemaining > 0">
                  Lisez les 3 sujets puis cliquez sur
                  <strong>Démarrer</strong> pour lancer le chrono.
                  <strong>1 crédit IA</strong> sera utilisé à la soumission.
                </span>
                <span v-else
                  >Vous pouvez lire les sujets mais pas obtenir de correction
                  IA.</span
                >
              </p>
            </div>
            <div class="shrink-0">
              <Button
                v-if="sub.aiCreditsRemaining > 0"
                label="Démarrer le simulateur"
                icon="pi pi-play"
                class="bg-gradient-primary border-none font-bold"
                @click="startSimulation"
              />
              <Button
                v-else
                label="Acheter des crédits"
                icon="pi pi-sparkles"
                severity="warning"
                @click="buyCreditsVisible = true"
              />
            </div>
          </div>

          <!-- Tâche 1 -->
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
          <!-- Tâche 2 -->
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

          <!-- Tâche 3 -->
          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden"
          >
            <div
              class="px-5 py-4 border-b border-(--border-color) flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0"
                >
                  3
                </div>
                <div>
                  <p class="text-sm font-bold text-(--text-primary)">
                    Tâche 3 - Argumentation
                  </p>
                  <p class="text-xs text-(--text-tertiary)">
                    {{ combo.task3_word_min }}–{{ combo.task3_word_max }} mots
                    recommandés
                  </p>
                </div>
              </div>
              <Tag
                :value="`${combo.task3_word_min}–${combo.task3_word_max} mots`"
                severity="warning"
              />
            </div>
            <div class="px-5 py-4 flex flex-col gap-3">
              <p class="text-xs text-(--text-tertiary) italic">
                Rédigez un article argumentatif comparant deux points de vue
                opposés.
              </p>
              <h3 class="text-base font-bold text-(--text-primary)">
                {{ combo.task3_title }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p
                    class="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2"
                  >
                    Document 1
                  </p>
                  <p class="text-sm text-(--text-primary) leading-relaxed">
                    {{ combo.task3_document_1 }}
                  </p>
                </div>
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p
                    class="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2"
                  >
                    Document 2
                  </p>
                  <p class="text-sm text-(--text-primary) leading-relaxed">
                    {{ combo.task3_document_2 }}
                  </p>
                </div>
              </div>
              <!-- après le grid Document 1 / Document 2 -->
              <div
                v-if="combo.task3_correction"
                class="border-t border-(--border-color) -mx-5 mt-3"
              >
                <button
                  class="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-(--bg-hover) transition-colors"
                  @click="showTask3Correction = !showTask3Correction"
                >
                  <span
                    class="flex items-center gap-2 text-sm font-semibold text-primary-600"
                  >
                    <i class="pi pi-eye text-xs" />
                    Voir la proposition de correction
                  </span>
                  <i
                    class="pi text-xs text-(--text-tertiary) transition-transform duration-200"
                    :class="
                      showTask3Correction ? 'pi-chevron-up' : 'pi-chevron-down'
                    "
                  />
                </button>
                <div v-if="showTask3Correction" class="px-5 pb-4">
                  <p
                    class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap bg-primary-50 border border-primary-100 rounded-xl p-4"
                  >
                    {{ combo.task3_correction }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA bas -->
          <div class="flex justify-center pt-2 pb-8">
            <Button
              v-if="sub.aiCreditsRemaining > 0"
              label="Démarrer le simulateur"
              icon="pi pi-play"
              size="large"
              class="bg-gradient-primary border-none font-bold px-8"
              @click="startSimulation"
            />
            <Button
              v-else
              label="Acheter des crédits"
              icon="pi pi-sparkles"
              severity="warning"
              @click="buyCreditsVisible = true"
            />
          </div>
        </div>
      </template>

      <!-- MODE SIMULATION -->
      <template v-else>
        <div class="flex min-h-[calc(100vh-56px)]">
          <!-- Sidebar gauche -->
          <aside
            class="hidden lg:flex flex-col w-56 bg-(--bg-card) border-r border-(--border-color) sticky top-14 h-[calc(100vh-56px)] overflow-y-auto shrink-0"
          >
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-(--text-tertiary) px-4 pt-4 pb-2"
            >
              Navigation
            </p>
            <button
              v-for="(t, i) in tasks"
              :key="t.key"
              class="flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-xl border text-left transition-all"
              :class="
                activeTask === i
                  ? 'bg-primary-50 border-primary-200'
                  : 'border-transparent hover:bg-(--bg-hover)'
              "
              @click="activeTask = i"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                :class="
                  isTaskDone(t.key) ? 'bg-green-500' : 'bg-gradient-primary'
                "
              >
                <i v-if="isTaskDone(t.key)" class="pi pi-check text-[10px]" />
                <span v-else>{{ i + 1 }}</span>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-(--text-primary) truncate">
                  {{ t.shortLabel }}
                </p>
                <p class="text-[10px] text-(--text-tertiary) font-mono">
                  {{ wordCount(answers[t.key]) }}/{{ t.max }}
                </p>
              </div>
            </button>

            <div
              v-if="!combinedCorrection"
              class="mt-auto p-3 border-t border-(--border-color)"
            >
              <Button
                label="Soumettre"
                icon="pi pi-sparkles"
                icon-pos="right"
                :loading="submitting"
                :disabled="!allAnswered || sub.aiCreditsRemaining === 0"
                class="bg-gradient-primary border-none font-bold w-full text-sm"
                @click="submitAll"
              />
              <p
                class="text-[10px] text-(--text-tertiary) text-center mt-1.5 leading-snug"
              >
                <span v-if="!allAnswered">Complétez les 3 tâches</span>
                <span v-else>Prêt · <strong>1 crédit IA</strong></span>
              </p>
            </div>
          </aside>

          <!-- Zone centrale -->
          <main class="flex-1 min-w-0 px-4 lg:px-6 py-5 flex flex-col gap-4">
            <div
              v-if="sub.aiCreditsRemaining === 0 && !combinedCorrection"
              class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
            >
              <i
                class="pi pi-exclamation-triangle text-amber-500 shrink-0 mt-0.5"
              />
              <div class="flex-1">
                <p class="font-bold text-amber-800 text-sm mb-0.5">
                  Plus de crédits IA
                </p>
                <p class="text-sm text-amber-700">
                  Vous pouvez continuer à rédiger mais la soumission nécessite
                  au moins 1 crédit.
                </p>
              </div>
              <Button
                label="Acheter"
                icon="pi pi-plus"
                severity="warning"
                size="small"
                @click="buyCreditsVisible = true"
              />
            </div>

            <!-- Tâche active -->
            <template v-if="!combinedCorrection">
              <div
                class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden"
              >
                <div
                  class="flex items-center gap-3 px-5 py-3.5 border-b border-(--border-color) bg-(--bg-ground)"
                >
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0"
                  >
                    {{ activeTask + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-(--text-primary)">
                      {{ currentTask.label }}
                    </p>
                    <p class="text-xs text-(--text-tertiary)">
                      {{ currentTask.min }}–{{ currentTask.max }} mots
                      recommandés
                    </p>
                  </div>
                  <Tag
                    :value="currentTask.typeLabel"
                    severity="warning"
                    class="shrink-0"
                  />
                </div>

                <!-- Consigne -->
                <div class="px-5 py-4 border-b border-(--border-color)">
                  <p
                    v-if="activeTask === 0"
                    class="text-sm text-(--text-primary) leading-relaxed"
                  >
                    {{ combo.task1_instruction }}
                  </p>
                  <p
                    v-else-if="activeTask === 1"
                    class="text-sm text-(--text-primary) leading-relaxed"
                  >
                    {{ combo.task2_instruction }}
                  </p>
                  <template v-else>
                    <h3 class="text-base font-bold text-(--text-primary) mb-3">
                      {{ combo.task3_title }}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        class="bg-amber-50 border border-amber-200 rounded-xl p-3.5"
                      >
                        <p
                          class="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1.5"
                        >
                          Document 1
                        </p>
                        <p
                          class="text-sm text-(--text-primary) leading-relaxed"
                        >
                          {{ combo.task3_document_1 }}
                        </p>
                      </div>
                      <div
                        class="bg-blue-50 border border-blue-200 rounded-xl p-3.5"
                      >
                        <p
                          class="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1.5"
                        >
                          Document 2
                        </p>
                        <p
                          class="text-sm text-(--text-primary) leading-relaxed"
                        >
                          {{ combo.task3_document_2 }}
                        </p>
                      </div>
                    </div>
                  </template>
                </div>

                <Textarea
                  v-model="answers[currentTask.key]"
                  :rows="11"
                  fluid
                  :placeholder="`Rédigez votre ${currentTask.typeLabel.toLowerCase()} ici…`"
                  class="text-sm leading-relaxed rounded-none border-x-0 border-b-0"
                  :disabled="!!combinedCorrection"
                />

                <div
                  class="flex items-center justify-between px-5 py-2.5 border-t border-(--border-color) bg-(--bg-ground)"
                >
                  <span
                    class="text-xs font-mono font-semibold"
                    :class="
                      wordCountClass(
                        wordCount(answers[currentTask.key]),
                        currentTask.min,
                        currentTask.max,
                      )
                    "
                  >
                    {{ wordCount(answers[currentTask.key]) }} /
                    {{ currentTask.max }} mots
                  </span>
                  <span
                    v-if="
                      wordCount(answers[currentTask.key]) >= currentTask.min
                    "
                    class="text-xs text-green-600 flex items-center gap-1"
                  >
                    <i class="pi pi-check-circle" /> Minimum atteint
                  </span>
                </div>
              </div>

              <!-- Navigation mobile -->
              <div class="flex items-center justify-between gap-3 lg:hidden">
                <Button
                  icon="pi pi-chevron-left"
                  outlined
                  :disabled="activeTask === 0"
                  @click="activeTask--"
                />
                <span class="text-sm font-semibold text-(--text-secondary)"
                  >Tâche {{ activeTask + 1 }} / 3</span
                >
                <Button
                  v-if="activeTask < 2"
                  label="Suivant"
                  icon="pi pi-chevron-right"
                  icon-pos="right"
                  outlined
                  @click="activeTask++"
                />
                <Button
                  v-else
                  label="Soumettre"
                  icon="pi pi-sparkles"
                  icon-pos="right"
                  :loading="submitting"
                  :disabled="!allAnswered || sub.aiCreditsRemaining === 0"
                  class="bg-gradient-primary border-none font-bold"
                  @click="submitAll"
                />
              </div>
            </template>

            <!-- Résultats -->
            <template v-else>
              <div
                class="bg-gradient-primary rounded-2xl p-8 text-center text-white flex flex-col items-center gap-2"
              >
                <i class="pi pi-check-circle text-5xl opacity-90" />
                <p class="text-6xl font-extrabold leading-none">
                  {{ combinedCorrection.global_assessment.overall_score
                  }}<span class="text-2xl opacity-60">/20</span>
                </p>
                <p class="text-lg font-semibold opacity-80">
                  Niveau {{ combinedCorrection.global_assessment.cecrl_level }}
                </p>
                <p class="text-sm opacity-70 max-w-sm leading-relaxed">
                  {{ combinedCorrection.global_assessment.appreciation }}
                </p>
              </div>

              <div
                class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
              >
                <h3
                  class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
                >
                  <i class="pi pi-chart-bar text-primary-500" /> Scores par
                  critère
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div
                    v-for="item in criteriaItems"
                    :key="item.label"
                    class="bg-(--bg-ground) rounded-xl p-3 text-center"
                  >
                    <p class="text-xl font-extrabold text-primary-600 mb-0.5">
                      {{ item.score
                      }}<span class="text-sm opacity-60">/{{ item.max }}</span>
                    </p>
                    <p
                      class="text-xs font-semibold text-(--text-secondary) mb-1"
                    >
                      {{ item.label }}
                    </p>
                    <p class="text-xs text-(--text-primary) leading-relaxed">
                      {{ item.feedback }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="combinedCorrection.task_feedbacks"
                class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
              >
                <h3
                  class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
                >
                  <i class="pi pi-file-edit text-primary-500" /> Versions
                  corrigées par tâche
                </h3>
                <div class="flex flex-col gap-4">
                  <div
                    v-for="(taskKey, idx) in ['task1', 'task2', 'task3']"
                    :key="taskKey"
                  >
                    <div
                      v-if="combinedCorrection.task_feedbacks[taskKey]"
                      class="border border-(--border-color) rounded-xl overflow-hidden"
                    >
                      <div
                        class="flex items-center gap-2 px-4 py-3 bg-(--bg-ground) border-b border-(--border-color)"
                      >
                        <div
                          class="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0"
                        >
                          {{ idx + 1 }}
                        </div>
                        <span
                          class="font-semibold text-sm text-(--text-primary)"
                          >{{
                            [
                              "Tâche 1 - Message",
                              "Tâche 2 - Narration",
                              "Tâche 3 - Argumentation",
                            ][idx]
                          }}</span
                        >
                      </div>
                      <div
                        class="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-(--border-color)"
                      >
                        <div
                          v-if="
                            combinedCorrection.task_feedbacks[taskKey]
                              .main_strengths?.length
                          "
                        >
                          <p class="text-xs font-semibold text-green-700 mb-1">
                            Points forts
                          </p>
                          <ul class="flex flex-col gap-1">
                            <li
                              v-for="s in combinedCorrection.task_feedbacks[
                                taskKey
                              ].main_strengths"
                              :key="s"
                              class="text-xs text-green-700 flex items-start gap-1"
                            >
                              <i class="pi pi-check shrink-0 mt-0.5" />{{ s }}
                            </li>
                          </ul>
                        </div>
                        <div
                          v-if="
                            combinedCorrection.task_feedbacks[taskKey]
                              .main_weaknesses?.length
                          "
                        >
                          <p class="text-xs font-semibold text-red-700 mb-1">
                            Points à améliorer
                          </p>
                          <ul class="flex flex-col gap-1">
                            <li
                              v-for="w in combinedCorrection.task_feedbacks[
                                taskKey
                              ].main_weaknesses"
                              :key="w"
                              class="text-xs text-red-700 flex items-start gap-1"
                            >
                              <i class="pi pi-times shrink-0 mt-0.5" />{{ w }}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div
                        v-if="
                          combinedCorrection.task_feedbacks[taskKey]
                            .corrected_text
                        "
                        class="px-4 py-4"
                      >
                        <p
                          class="text-[10px] font-bold text-primary-600 uppercase tracking-wide mb-2"
                        >
                          Proposition de correction
                        </p>
                        <p
                          class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap bg-(--bg-ground) rounded-lg p-3"
                        >
                          {{
                            combinedCorrection.task_feedbacks[taskKey]
                              .corrected_text
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="combinedCorrection.corrections?.length"
                class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
              >
                <h3
                  class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
                >
                  <i class="pi pi-pencil text-primary-500" /> Erreurs
                  identifiées
                </h3>
                <div class="flex flex-col gap-3">
                  <div
                    v-for="(c, i) in combinedCorrection.corrections"
                    :key="i"
                    class="bg-red-50 border border-red-100 rounded-xl p-4"
                  >
                    <div class="flex items-center gap-2 flex-wrap mb-2">
                      <Tag
                        v-if="c.task"
                        :value="`Tâche ${c.task}`"
                        severity="danger"
                      />
                      <span
                        class="text-sm font-bold text-red-700 line-through"
                        >{{ c.error }}</span
                      >
                      <i class="pi pi-arrow-right text-red-400 text-xs" />
                      <span class="text-sm font-bold text-green-700">{{
                        c.correction
                      }}</span>
                    </div>
                    <p class="text-xs text-(--text-secondary) leading-relaxed">
                      {{ c.explanation }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="combinedCorrection.suggestions?.length"
                class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
              >
                <h3
                  class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
                >
                  <i class="pi pi-lightbulb text-primary-500" /> Conseils pour
                  progresser
                </h3>
                <div class="flex flex-col gap-2">
                  <div
                    v-for="(s, i) in combinedCorrection.suggestions"
                    :key="i"
                    class="flex items-start gap-3 bg-(--bg-ground) rounded-xl p-3"
                  >
                    <div
                      class="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0"
                    >
                      {{ i + 1 }}
                    </div>
                    <p class="text-sm text-(--text-secondary) leading-relaxed">
                      {{ s }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 justify-center pb-8">
                <Button
                  label="Refaire une simulation"
                  icon="pi pi-refresh"
                  outlined
                  @click="resetSimulation"
                />
                <NuxtLink :to="`/simulateur/expression-ecrite/${sessionId}`">
                  <Button label="Autres sujets" icon="pi pi-arrow-left" text />
                </NuxtLink>
              </div>
            </template>
          </main>

          <!-- Panel droit -->
          <aside
            class="hidden xl:flex flex-col w-52 bg-(--bg-card) border-l border-(--border-color) sticky top-14 h-[calc(100vh-56px)] overflow-y-auto shrink-0 p-4 gap-5"
          >
            <p
              class="text-[10px] font-bold uppercase tracking-widest text-(--text-tertiary)"
            >
              Outils
            </p>
            <div class="flex flex-col gap-2">
              <p class="text-xs font-semibold text-(--text-secondary)">
                Caractères spéciaux
              </p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="ch in specialChars"
                  :key="ch"
                  class="w-8 h-8 text-sm flex items-center justify-center bg-(--bg-ground) border border-(--border-color) rounded-md text-(--text-primary) hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors font-medium"
                  @click="insertChar(ch)"
                >
                  {{ ch }}
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-3">
              <p class="text-xs font-semibold text-(--text-secondary)">
                Progression
              </p>
              <div
                v-for="(t, i) in tasks"
                :key="t.key"
                class="flex flex-col gap-1"
              >
                <div class="flex justify-between items-center">
                  <span class="text-xs text-(--text-secondary)"
                    >Tâche {{ i + 1 }}</span
                  >
                  <span
                    class="text-[10px] font-mono font-semibold"
                    :class="
                      wordCountClass(wordCount(answers[t.key]), t.min, t.max)
                    "
                  >
                    {{ wordCount(answers[t.key]) }}/{{ t.max }}
                  </span>
                </div>
                <div
                  class="h-1.5 rounded-full bg-(--bg-ground) border border-(--border-color) overflow-hidden"
                >
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="{
                      'bg-red-400': wordCount(answers[t.key]) < t.min,
                      'bg-green-500':
                        wordCount(answers[t.key]) >= t.min &&
                        wordCount(answers[t.key]) <= t.max,
                      'bg-amber-400': wordCount(answers[t.key]) > t.max,
                    }"
                    :style="{
                      width:
                        Math.min(
                          100,
                          (wordCount(answers[t.key]) / t.max) * 100,
                        ) + '%',
                    }"
                  />
                </div>
              </div>
            </div>
            <div
              class="mt-auto flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3"
            >
              <i
                class="pi pi-info-circle text-amber-500 text-xs shrink-0 mt-0.5"
              />
              <p class="text-[10px] text-amber-800 leading-snug">
                Laisser une tâche vide entraîne automatiquement une note
                éliminatoire de 0/20.
              </p>
            </div>
          </aside>
        </div>
      </template>
    </template>

    <!-- Session/combo introuvable -->
    <div
      v-else-if="!loading"
      class="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-(--text-tertiary)"
    >
      <i class="pi pi-exclamation-circle text-5xl opacity-30" />
      <p class="text-lg font-semibold">
        Aucun sujet disponible pour cette combinaison.
      </p>
      <NuxtLink :to="`/simulateur/expression-ecrite/${sessionId}`">
        <Button label="Retour" icon="pi pi-arrow-left" outlined />
      </NuxtLink>
    </div>

    <BuyCreditsDialog v-model="buyCreditsVisible" />
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
const buyCreditsVisible = ref(false);
const activeTask = ref(0);

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
