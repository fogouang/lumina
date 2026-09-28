<template>
  <div>
    <!-- Retour + en-tête -->
    <div class="mb-6">
      <NuxtLink
        to="/admin/expressions"
        class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
      >
        <i class="pi pi-arrow-left text-xs" /> Retour aux sessions
      </NuxtLink>

      <div v-if="session" class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span
            class="grid size-12 shrink-0 place-items-center rounded-leaf"
            :class="session.is_active ? 'brand-gradient text-white shadow-brand' : 'bg-card-2 text-faint'"
          >
            <i class="pi pi-calendar" />
          </span>
          <div>
            <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">{{ session.name }}</h1>
            <p class="text-sm capitalize text-muted">{{ formatMonth(session.month) }}</p>
          </div>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          :class="
            session.is_active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-card-2 text-muted'
          "
        >
          <span class="size-1.5 rounded-full" :class="session.is_active ? 'bg-emerald-500' : 'bg-faint'" />
          {{ session.is_active ? "Active" : "Inactive" }}
        </span>
      </div>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-card bg-card" />
      </div>
      <div class="h-80 animate-pulse rounded-card bg-card" />
    </div>

    <template v-else-if="session">
      <!-- Stats -->
      <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-card border border-line bg-card p-4 text-center shadow-soft"
        >
          <p class="font-heading text-3xl font-extrabold tabular-nums text-primary">{{ stat.val }}</p>
          <p class="mt-1 text-xs font-semibold uppercase tracking-wider text-faint">{{ stat.label }}</p>
        </div>
      </div>

      <!-- Onglets EE / EO Tâche 2 / EO Tâche 3 -->
      <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
        <Tabs value="0">
          <TabList>
            <Tab value="0">
              <span class="flex items-center gap-2">
                <i class="pi pi-pen-to-square" />
                Expression Écrite
                <span class="rounded-full bg-card-2 px-2 py-0.5 text-xs tabular-nums text-muted">{{ eeCombinations.length }}</span>
              </span>
            </Tab>
            <Tab value="1">
              <span class="flex items-center gap-2">
                <i class="pi pi-microphone" />
                EO · Tâche 2
                <span class="rounded-full bg-card-2 px-2 py-0.5 text-xs tabular-nums text-muted">{{ eoTask2Pool.length }}</span>
              </span>
            </Tab>
            <Tab value="2">
              <span class="flex items-center gap-2">
                <i class="pi pi-comments" />
                EO · Tâche 3
                <span class="rounded-full bg-card-2 px-2 py-0.5 text-xs tabular-nums text-muted">{{ eoTask3Pool.length }}</span>
              </span>
            </Tab>
          </TabList>

          <TabPanels>
            <!-- ── EE ─────────────────────────────────────────── -->
            <TabPanel value="0">
              <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-muted">Chaque combinaison contient les 3 tâches EE.</p>
                <AppButton
                  label="Nouvelle combinaison"
                  icon="pi pi-plus"
                  variant="gradient"
                  size="small"
                  @click="eeFormVisible = true; editingEE = null"
                />
              </div>

              <div
                v-if="!eeCombinations.length"
                class="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card-2/40 px-6 py-12 text-center"
              >
                <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                  <i class="pi pi-pen-to-square text-2xl" />
                </span>
                <p class="mb-1 font-heading font-bold text-ink">Aucune combinaison EE</p>
                <p class="mb-4 text-sm text-muted">Créez votre première combinaison d'expression écrite</p>
                <AppButton
                  label="Créer une combinaison"
                  icon="pi pi-plus"
                  variant="secondary"
                  @click="eeFormVisible = true; editingEE = null"
                />
              </div>

              <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <article
                  v-for="combo in eeCombinations"
                  :key="combo.id"
                  class="overflow-hidden rounded-2xl border border-line bg-card transition-shadow hover:shadow-lift"
                >
                  <div class="flex items-center justify-between gap-3 border-b border-line bg-card-2/60 px-4 py-3">
                    <div class="flex min-w-0 items-center gap-2.5">
                      <span class="grid size-7 shrink-0 place-items-center rounded-lg brand-gradient text-xs font-bold text-white">
                        {{ combo.order + 1 }}
                      </span>
                      <p class="truncate text-sm font-semibold text-ink">{{ combo.title }}</p>
                    </div>
                    <div class="flex shrink-0 gap-1">
                      <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" aria-label="Modifier" @click="openEditEE(combo)" />
                      <Button icon="pi pi-trash" text rounded size="small" severity="danger" aria-label="Supprimer" @click="deleteEE(combo.id)" />
                    </div>
                  </div>
                  <ol class="flex flex-col gap-2.5 px-4 py-3.5">
                    <li
                      v-for="(line, i) in [combo.task1_instruction, combo.task2_instruction, combo.task3_title]"
                      :key="i"
                      class="flex items-start gap-2.5"
                    >
                      <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[0.65rem] font-bold text-primary">
                        {{ i + 1 }}
                      </span>
                      <p class="line-clamp-2 text-xs leading-relaxed text-muted">{{ line }}</p>
                    </li>
                  </ol>
                </article>
              </div>
            </TabPanel>

            <!-- ── EO Tâche 2 ─────────────────────────────────── -->
            <TabPanel value="1">
              <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-muted">Exercice en interaction (5 min 30).</p>
                <AppButton
                  label="Nouveau sujet"
                  icon="pi pi-plus"
                  variant="gradient"
                  size="small"
                  @click="task2FormVisible = true; editingTask2 = null"
                />
              </div>

              <div
                v-if="!eoTask2Pool.length"
                class="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card-2/40 px-6 py-12 text-center"
              >
                <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                  <i class="pi pi-microphone text-2xl" />
                </span>
                <p class="mb-4 font-heading font-bold text-ink">Aucun sujet Tâche 2</p>
                <AppButton
                  label="Créer un sujet"
                  icon="pi pi-plus"
                  variant="secondary"
                  @click="task2FormVisible = true; editingTask2 = null"
                />
              </div>

              <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article
                  v-for="task in eoTask2Pool"
                  :key="task.id"
                  class="rounded-2xl border border-line bg-card p-4 transition-shadow hover:shadow-lift"
                >
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {{ task.order + 1 }}
                    </span>
                    <div class="flex shrink-0 gap-1">
                      <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" aria-label="Modifier" @click="openEditTask2(task)" />
                      <Button icon="pi pi-trash" text rounded size="small" severity="danger" aria-label="Supprimer" @click="deleteTask2(task.id)" />
                    </div>
                  </div>
                  <p class="text-sm leading-relaxed text-ink">{{ task.subject }}</p>
                </article>
              </div>
            </TabPanel>

            <!-- ── EO Tâche 3 ─────────────────────────────────── -->
            <TabPanel value="2">
              <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-sm text-muted">Expression d'un point de vue (4 min 30).</p>
                <AppButton
                  label="Nouveau sujet"
                  icon="pi pi-plus"
                  variant="gradient"
                  size="small"
                  @click="task3FormVisible = true; editingTask3 = null"
                />
              </div>

              <div
                v-if="!eoTask3Pool.length"
                class="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card-2/40 px-6 py-12 text-center"
              >
                <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
                  <i class="pi pi-comments text-2xl" />
                </span>
                <p class="mb-4 font-heading font-bold text-ink">Aucun sujet Tâche 3</p>
                <AppButton
                  label="Créer un sujet"
                  icon="pi pi-plus"
                  variant="secondary"
                  @click="task3FormVisible = true; editingTask3 = null"
                />
              </div>

              <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article
                  v-for="task in eoTask3Pool"
                  :key="task.id"
                  class="rounded-2xl border border-line bg-card p-4 transition-shadow hover:shadow-lift"
                >
                  <div class="mb-3 flex items-center justify-between gap-2">
                    <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-100 text-xs font-bold text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
                      {{ task.order + 1 }}
                    </span>
                    <div class="flex shrink-0 gap-1">
                      <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" aria-label="Modifier" @click="openEditTask3(task)" />
                      <Button icon="pi pi-trash" text rounded size="small" severity="danger" aria-label="Supprimer" @click="deleteTask3(task.id)" />
                    </div>
                  </div>
                  <p class="text-sm leading-relaxed text-ink">{{ task.subject }}</p>
                </article>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </template>

    <!-- ── Dialog combinaison EE ─────────────────────────────── -->
    <Dialog
      v-model:visible="eeFormVisible"
      modal
      :draggable="false"
      :style="{ width: '48rem', maxHeight: '90vh' }"
      :breakpoints="{ '820px': '96vw' }"
      :content-style="{ overflowY: 'auto' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i class="pi pi-pen-to-square" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingEE ? "Modifier la combinaison EE" : "Nouvelle combinaison EE" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-5 pt-1">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div class="flex flex-col gap-1.5 md:col-span-3">
            <label for="ee-title" class="text-sm font-semibold text-ink">Titre général</label>
            <InputText id="ee-title" v-model="eeForm.title" placeholder="Ex : La télévision dans l'éducation" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="ee-order" class="text-sm font-semibold text-ink">Ordre</label>
            <InputNumber v-model="eeForm.order" input-id="ee-order" :min="0" fluid />
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-line">
          <Tabs value="0">
            <TabList>
              <Tab value="0">Tâche 1 · Message</Tab>
              <Tab value="1">Tâche 2 · Article</Tab>
              <Tab value="2">Tâche 3 · Argumentation</Tab>
            </TabList>
            <TabPanels>
              <!-- Tâche 1 -->
              <TabPanel value="0">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label for="t1-instruction" class="text-sm font-semibold text-ink">Consigne</label>
                    <Textarea id="t1-instruction" v-model="eeForm.task1_instruction" :rows="4" auto-resize fluid placeholder="Décrivez la consigne..." />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label for="t1-correction" class="text-sm font-semibold text-ink">Correction</label>
                    <Textarea id="t1-correction" v-model="eeForm.task1_correction" :rows="4" auto-resize fluid placeholder="Rédigez la correction..." />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                      <label for="t1-min" class="text-sm font-semibold text-ink">Mots minimum</label>
                      <InputNumber v-model="eeForm.task1_word_min" input-id="t1-min" :min="40" :max="100" fluid />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="t1-max" class="text-sm font-semibold text-ink">Mots maximum</label>
                      <InputNumber v-model="eeForm.task1_word_max" input-id="t1-max" :min="60" :max="120" fluid />
                    </div>
                  </div>
                </div>
              </TabPanel>

              <!-- Tâche 2 -->
              <TabPanel value="1">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label for="t2-instruction" class="text-sm font-semibold text-ink">Consigne</label>
                    <Textarea id="t2-instruction" v-model="eeForm.task2_instruction" :rows="4" auto-resize fluid placeholder="Décrivez la consigne..." />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label for="t2-correction" class="text-sm font-semibold text-ink">Correction</label>
                    <Textarea id="t2-correction" v-model="eeForm.task2_correction" :rows="4" auto-resize fluid placeholder="Rédigez la correction..." />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                      <label for="t2-min" class="text-sm font-semibold text-ink">Mots minimum</label>
                      <InputNumber v-model="eeForm.task2_word_min" input-id="t2-min" :min="100" :max="150" fluid />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="t2-max" class="text-sm font-semibold text-ink">Mots maximum</label>
                      <InputNumber v-model="eeForm.task2_word_max" input-id="t2-max" :min="120" :max="180" fluid />
                    </div>
                  </div>
                </div>
              </TabPanel>

              <!-- Tâche 3 -->
              <TabPanel value="2">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label for="t3-title" class="text-sm font-semibold text-ink">Titre du débat</label>
                    <InputText id="t3-title" v-model="eeForm.task3_title" placeholder="Ex : La chasse aux animaux : Pour ou Contre ?" fluid />
                  </div>
                  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div class="flex flex-col gap-1.5">
                      <label for="t3-doc1" class="text-sm font-semibold text-ink">Document 1</label>
                      <Textarea id="t3-doc1" v-model="eeForm.task3_document_1" :rows="4" auto-resize fluid placeholder="Témoignage ou opinion..." />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="t3-doc2" class="text-sm font-semibold text-ink">Document 2</label>
                      <Textarea id="t3-doc2" v-model="eeForm.task3_document_2" :rows="4" auto-resize fluid placeholder="Témoignage ou opinion..." />
                    </div>
                    <div class="flex flex-col gap-1.5 md:col-span-2">
                      <label for="t3-correction" class="text-sm font-semibold text-ink">Correction</label>
                      <Textarea id="t3-correction" v-model="eeForm.task3_correction" :rows="4" auto-resize fluid placeholder="Rédigez la correction..." />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1.5">
                      <label for="t3-min" class="text-sm font-semibold text-ink">Mots minimum</label>
                      <InputNumber v-model="eeForm.task3_word_min" input-id="t3-min" :min="120" :max="180" fluid />
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label for="t3-max" class="text-sm font-semibold text-ink">Mots maximum</label>
                      <InputNumber v-model="eeForm.task3_word_max" input-id="t3-max" :min="150" :max="200" fluid />
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="eeFormVisible = false" />
        <AppButton
          :label="editingEE ? 'Mettre à jour' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="savingEE"
          @click="saveEE"
        />
      </template>
    </Dialog>

    <!-- ── Dialog EO Tâche 2 ─────────────────────────────────── -->
    <Dialog
      v-model:visible="task2FormVisible"
      modal
      :draggable="false"
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i class="pi pi-microphone" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingTask2 ? "Modifier le sujet Tâche 2" : "Nouveau sujet · Tâche 2 EO" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="eo2-subject" class="text-sm font-semibold text-ink">Sujet</label>
          <Textarea
            id="eo2-subject"
            v-model="task2Form.subject"
            :rows="4"
            auto-resize
            fluid
            placeholder="Ex : Risques liés à l'utilisation des appareils électroniques..."
          />
          <small class="text-xs text-muted">Le candidat devra échanger sur ce sujet pendant 3 min 30.</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="eo2-correction" class="text-sm font-semibold text-ink">Correction</label>
          <Textarea
            id="eo2-correction"
            v-model="task2Form.eo_task2_correction"
            :rows="4"
            auto-resize
            fluid
            placeholder="Rédigez la correction..."
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="eo2-order" class="text-sm font-semibold text-ink">Ordre</label>
          <InputNumber v-model="task2Form.order" input-id="eo2-order" :min="0" fluid />
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="task2FormVisible = false" />
        <AppButton
          :label="editingTask2 ? 'Mettre à jour' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="savingTask2"
          :disabled="!task2Form.subject"
          @click="saveTask2"
        />
      </template>
    </Dialog>

    <!-- ── Dialog EO Tâche 3 ─────────────────────────────────── -->
    <Dialog
      v-model:visible="task3FormVisible"
      modal
      :draggable="false"
      :style="{ width: '32rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
            <i class="pi pi-comments" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingTask3 ? "Modifier le sujet Tâche 3" : "Nouveau sujet · Tâche 3 EO" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="eo3-subject" class="text-sm font-semibold text-ink">Sujet</label>
          <Textarea
            id="eo3-subject"
            v-model="task3Form.subject"
            :rows="4"
            auto-resize
            fluid
            placeholder="Ex : Gouvernements 50/50 hommes-femmes : Qu'en pensez-vous ?"
          />
          <small class="text-xs text-muted">Le candidat défendra son point de vue pendant 4 min 30.</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="eo3-correction" class="text-sm font-semibold text-ink">Correction</label>
          <Textarea
            id="eo3-correction"
            v-model="task3Form.eo_task3_correction"
            :rows="4"
            auto-resize
            fluid
            placeholder="Rédigez la correction..."
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="eo3-order" class="text-sm font-semibold text-ink">Ordre</label>
          <InputNumber v-model="task3Form.order" input-id="eo3-order" :min="0" fluid />
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="task3FormVisible = false" />
        <AppButton
          :label="editingTask3 ? 'Mettre à jour' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="savingTask3"
          :disabled="!task3Form.subject"
          @click="saveTask3"
        />
      </template>
    </Dialog>

    <ConfirmDialog :pt="{ mask: { class: 'backdrop-blur-sm' } }" />
  </div>
</template>

<script setup lang="ts">
import type { MonthlySessionDetailResponse } from '#shared/api/models/MonthlySessionDetailResponse'
import type { EECombinationResponse } from '#shared/api/models/EECombinationResponse'
import type { EOTask2Response } from '#shared/api/models/EOTask2Response'
import type { EOTask3Response } from '#shared/api/models/EOTask3Response'
import type { SuccessResponse_MonthlySessionDetailResponse_ } from '#shared/api/models/SuccessResponse_MonthlySessionDetailResponse_'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route     = useRoute()
const { get, post, patch, del } = useApi()
const toast     = useToast()
const confirm   = useConfirm()
const sessionId = route.params.sessionId as string

const loading = ref(true)
const session = ref<MonthlySessionDetailResponse | null>(null)

const eeCombinations = computed(() => session.value?.ee_combinations ?? [])
const eoTask2Pool    = computed(() => session.value?.eo_task2_pool ?? [])
const eoTask3Pool    = computed(() => session.value?.eo_task3_pool ?? [])

const stats = computed(() => [
  { label: 'Combinaisons EE', val: eeCombinations.value.length },
  { label: 'Sujets EO Tâche 2', val: eoTask2Pool.value.length },
  { label: 'Sujets EO Tâche 3', val: eoTask3Pool.value.length },
  { label: 'Statut', val: session.value?.is_active ? 'Active' : 'Inactive' },
])

async function loadSession() {
  loading.value = true
  try {
    const res = await get<SuccessResponse_MonthlySessionDetailResponse_>(
      `/v1/public-expressions/sessions/${sessionId}`
    )
    session.value = res.data ?? null
  } finally {
    loading.value = false
  }
}

onMounted(loadSession)

// ── EE ────────────────────────────────────────────────────────
const eeFormVisible = ref(false)
const savingEE      = ref(false)
const editingEE     = ref<EECombinationResponse | null>(null)

const eeForm = reactive({
  title: '', order: 0,
  task1_instruction: '',task1_correction:'', task1_word_min: 60, task1_word_max: 120,
  task2_instruction: '',task2_correction:'', task2_word_min: 120, task2_word_max: 150,
  task3_title: '', task3_document_1: '', task3_document_2: '',task3_correction:'',
  task3_word_min: 150, task3_word_max: 180,
})

function openEditEE(combo: EECombinationResponse) {
  editingEE.value = combo
  Object.assign(eeForm, {
    title: combo.title, order: combo.order,
    task1_instruction: combo.task1_instruction,task1_correction:combo.task1_correction, task1_word_min: combo.task1_word_min, task1_word_max: combo.task1_word_max,
    task2_instruction: combo.task2_instruction,task2_correction:combo.task2_correction,  task2_word_min: combo.task2_word_min, task2_word_max: combo.task2_word_max,
    task3_title: combo.task3_title, task3_document_1: combo.task3_document_1, task3_document_2: combo.task3_document_2,task3_correction:combo.task3_correction, 
    task3_word_min: combo.task3_word_min, task3_word_max: combo.task3_word_max,
  })
  eeFormVisible.value = true
}

async function saveEE() {
  savingEE.value = true
  try {
    if (editingEE.value) {
      await patch(`/v1/public-expressions/ee/${editingEE.value.id}`, { ...eeForm })
      toast.add({ severity: 'success', summary: 'Combinaison mise à jour', life: 3000 })
    } else {
      await post(`/v1/public-expressions/sessions/${sessionId}/ee`, { ...eeForm })
      toast.add({ severity: 'success', summary: 'Combinaison créée', life: 3000 })
    }
    eeFormVisible.value = false
    loadSession()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    savingEE.value = false
  }
}

function deleteEE(id: string) {
  confirm.require({
    message: 'Cette combinaison EE sera définitivement supprimée.',
    header: 'Supprimer', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler', acceptLabel: 'Supprimer', acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/ee/${id}`)
      toast.add({ severity: 'success', summary: 'Supprimé', life: 3000 })
      loadSession()
    },
  })
}

// ── EO Task 2 ─────────────────────────────────────────────────
const task2FormVisible = ref(false)
const savingTask2      = ref(false)
const editingTask2     = ref<EOTask2Response | null>(null)
const task2Form        = reactive({ subject: '',eo_task2_correction:'', order: 0 })

function openEditTask2(task: EOTask2Response) {
  editingTask2.value = task
  task2Form.subject  = task.subject
  task2Form.eo_task2_correction = task.eo_task2_correction
  task2Form.order    = task.order
  task2FormVisible.value = true
}

async function saveTask2() {
  savingTask2.value = true
  try {
    if (editingTask2.value) {
      await patch(`/v1/public-expressions/eo/task2/${editingTask2.value.id}`, { ...task2Form })
      toast.add({ severity: 'success', summary: 'Sujet mis à jour', life: 3000 })
    } else {
      await post(`/v1/public-expressions/sessions/${sessionId}/eo/task2`, { ...task2Form })
      toast.add({ severity: 'success', summary: 'Sujet créé', life: 3000 })
    }
    task2FormVisible.value = false
    loadSession()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    savingTask2.value = false
  }
}

function deleteTask2(id: string) {
  confirm.require({
    message: 'Ce sujet EO Tâche 2 sera définitivement supprimé.',
    header: 'Supprimer', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler', acceptLabel: 'Supprimer', acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/eo/task2/${id}`)
      toast.add({ severity: 'success', summary: 'Supprimé', life: 3000 })
      loadSession()
    },
  })
}

// ── EO Task 3 ─────────────────────────────────────────────────
const task3FormVisible = ref(false)
const savingTask3      = ref(false)
const editingTask3     = ref<EOTask3Response | null>(null)
const task3Form        = reactive({ subject: '',eo_task3_correction:'', order: 0 })

function openEditTask3(task: EOTask3Response) {
  editingTask3.value = task
  task3Form.subject  = task.subject
  task3Form.eo_task3_correction = task.eo_task3_correction
  task3Form.order    = task.order
  task3FormVisible.value = true
}

async function saveTask3() {
  savingTask3.value = true
  try {
    if (editingTask3.value) {
      await patch(`/v1/public-expressions/eo/task3/${editingTask3.value.id}`, { ...task3Form })
      toast.add({ severity: 'success', summary: 'Sujet mis à jour', life: 3000 })
    } else {
      await post(`/v1/public-expressions/sessions/${sessionId}/eo/task3`, { ...task3Form })
      toast.add({ severity: 'success', summary: 'Sujet créé', life: 3000 })
    }
    task3FormVisible.value = false
    loadSession()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: err?.data?.message, life: 4000 })
  } finally {
    savingTask3.value = false
  }
}

function deleteTask3(id: string) {
  confirm.require({
    message: 'Ce sujet EO Tâche 3 sera définitivement supprimé.',
    header: 'Supprimer', icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler', acceptLabel: 'Supprimer', acceptClass: 'p-button-danger',
    accept: async () => {
      await del(`/v1/public-expressions/eo/task3/${id}`)
      toast.add({ severity: 'success', summary: 'Supprimé', life: 3000 })
      loadSession()
    },
  })
}

function formatMonth(month: string) {
  return new Date(month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

useHead({ title: `Session EE/EO | Admin Lumina` })
</script>