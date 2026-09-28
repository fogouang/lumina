
<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6">
      <NuxtLink
        :to="`/admin/series/${seriesId}/questions`"
        class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
      >
        <i class="pi pi-arrow-left text-xs" /> Retour aux questions
      </NuxtLink>
      <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">
        Importer des questions et tâches
      </h1>
      <p class="mt-1 text-sm text-muted">
        Workflow : 1. Uploader les médias → 2. Importer le JSON
      </p>
    </div>

    <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
      <Tabs value="0">
        <TabList>
          <Tab v-for="(t, i) in ['Médias', 'Questions', 'Tâches']" :key="t" :value="String(i)">
            <span class="flex items-center gap-2">
              <span class="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {{ i + 1 }}
              </span>
              {{ t }}
            </span>
          </Tab>
        </TabList>

        <TabPanels>
          <!-- ── Étape 1 : Médias ─────────────────────────────── -->
          <TabPanel value="0">
            <div class="space-y-4">
              <div class="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <i class="pi pi-info-circle mt-0.5 text-primary" />
                <p class="text-sm leading-relaxed text-ink">
                  <strong>Étape 1 :</strong> Uploadez vos fichiers audio et images.
                  Nommez-les avec le numéro de question (ex : Q1.mp3, Q2.jpg, Q40.png).
                </p>
              </div>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <!-- Audio -->
                <section class="rounded-2xl border border-line bg-card p-5">
                  <div class="mb-1 flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-leaf bg-primary/10 text-primary">
                      <i class="pi pi-volume-up" />
                    </span>
                    <h3 class="font-heading font-bold text-ink">Fichiers audio</h3>
                  </div>
                  <p class="mb-4 text-sm text-muted">Nommez vos fichiers : Q1.mp3, Q2.mp3, Q3.mp3, etc.</p>

                  <input
                    ref="audioInput"
                    type="file"
                    accept="audio/*"
                    multiple
                    class="hidden"
                    @change="onAudioSelect"
                  />
                  <button
                    type="button"
                    class="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-card-2/40 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                    @click="audioInput?.click()"
                  >
                    <i class="pi pi-folder-open text-xl text-primary" />
                    <span class="text-sm font-semibold text-ink">Parcourir...</span>
                    <span class="text-xs text-faint">Plusieurs fichiers possibles</span>
                  </button>

                  <ul
                    v-if="audioFiles.length"
                    class="mt-4 max-h-48 divide-y divide-line overflow-y-auto rounded-xl border border-line"
                  >
                    <li
                      v-for="f in audioFiles"
                      :key="f.name"
                      class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span class="truncate font-mono text-xs text-muted">{{ f.name }}</span>
                      <span
                        v-if="extractNum(f.name) !== null"
                        class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        <i class="pi pi-check text-[0.6rem]" /> Q{{ extractNum(f.name) }}
                      </span>
                      <span
                        v-else
                        class="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                      >
                        <i class="pi pi-times text-[0.6rem]" /> Non détecté
                      </span>
                    </li>
                  </ul>

                  <AppButton
                    v-if="audioFiles.length"
                    :label="`Uploader ${audioFiles.length} audio(s)`"
                    icon="pi pi-upload"
                    variant="gradient"
                    class="mt-3"
                    :loading="uploadingAudio"
                    @click="uploadAudios"
                  />

                  <p
                    v-if="Object.keys(uploadedAudios).length"
                    class="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  >
                    <i class="pi pi-check-circle" />
                    {{ Object.keys(uploadedAudios).length }} audio(s) uploadé(s)
                  </p>
                </section>

                <!-- Images -->
                <section class="rounded-2xl border border-line bg-card p-5">
                  <div class="mb-1 flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
                      <i class="pi pi-image" />
                    </span>
                    <h3 class="font-heading font-bold text-ink">Images</h3>
                  </div>
                  <p class="mb-4 text-sm text-muted">Nommez vos images : Q1.jpg, Q40.png, Q41.jpg, etc.</p>

                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="onImageSelect"
                  />
                  <button
                    type="button"
                    class="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-card-2/40 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                    @click="imageInput?.click()"
                  >
                    <i class="pi pi-folder-open text-xl text-primary" />
                    <span class="text-sm font-semibold text-ink">Parcourir...</span>
                    <span class="text-xs text-faint">Plusieurs fichiers possibles</span>
                  </button>

                  <ul
                    v-if="imageFiles.length"
                    class="mt-4 max-h-48 divide-y divide-line overflow-y-auto rounded-xl border border-line"
                  >
                    <li
                      v-for="f in imageFiles"
                      :key="f.name"
                      class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span class="truncate font-mono text-xs text-muted">{{ f.name }}</span>
                      <span
                        v-if="extractNum(f.name) !== null"
                        class="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        <i class="pi pi-check text-[0.6rem]" /> Q{{ extractNum(f.name) }}
                      </span>
                      <span
                        v-else
                        class="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300"
                      >
                        <i class="pi pi-times text-[0.6rem]" /> Non détecté
                      </span>
                    </li>
                  </ul>

                  <AppButton
                    v-if="imageFiles.length"
                    :label="`Uploader ${imageFiles.length} image(s)`"
                    icon="pi pi-upload"
                    variant="gradient"
                    class="mt-3"
                    :loading="uploadingImage"
                    @click="uploadImages"
                  />

                  <p
                    v-if="Object.keys(uploadedImages).length"
                    class="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
                  >
                    <i class="pi pi-check-circle" />
                    {{ Object.keys(uploadedImages).length }} image(s) uploadée(s)
                  </p>
                </section>
              </div>

              <!-- Résumé médias -->
              <div
                v-if="hasMedias"
                class="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10"
              >
                <span class="grid size-9 shrink-0 place-items-center rounded-leaf bg-emerald-500 text-white">
                  <i class="pi pi-check" />
                </span>
                <div class="space-y-0.5 text-sm text-emerald-800 dark:text-emerald-200">
                  <p class="font-bold">Médias prêts pour l'import !</p>
                  <p v-if="Object.keys(uploadedAudios).length">
                    {{ Object.keys(uploadedAudios).length }} audio(s)
                  </p>
                  <p v-if="Object.keys(uploadedImages).length">
                    {{ Object.keys(uploadedImages).length }} image(s)
                  </p>
                  <p class="opacity-80">Passez à l'onglet « Questions » pour importer le JSON.</p>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- ── Étape 2 : Questions ──────────────────────────── -->
          <TabPanel value="1">
            <div class="space-y-4">
              <div class="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <i class="pi pi-info-circle mt-0.5 text-primary" />
                <p class="text-sm leading-relaxed text-ink">
                  <strong>Étape 2 :</strong> Importez le JSON des questions.
                  Les médias uploadés seront automatiquement associés.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <!-- CO -->
                <section class="rounded-2xl border border-line bg-card p-5">
                  <div class="mb-1 flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-leaf bg-primary/10 text-primary">
                      <i class="pi pi-headphones" />
                    </span>
                    <h3 class="font-heading font-bold text-ink">Questions orales</h3>
                  </div>
                  <p class="mb-4 text-sm text-muted">Compréhension orale (Q1-Q39)</p>
                  <input
                    ref="jsonOralInput"
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="(e) => onJsonSelect(e, 'oral')"
                  />
                  <AppButton
                    label="Importer questions orales"
                    icon="pi pi-upload"
                    variant="secondary"
                    block
                    @click="jsonOralInput?.click()"
                  />
                  <Message
                    v-if="importResult.oral"
                    :severity="importResult.oral.success ? 'success' : 'error'"
                    :closable="false"
                    class="mt-3"
                  >
                    {{ importResult.oral.message }}
                  </Message>
                </section>

                <!-- CE -->
                <section class="rounded-2xl border border-line bg-card p-5">
                  <div class="mb-1 flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
                      <i class="pi pi-book" />
                    </span>
                    <h3 class="font-heading font-bold text-ink">Questions écrites</h3>
                  </div>
                  <p class="mb-4 text-sm text-muted">Compréhension écrite (Q40-Q78)</p>
                  <input
                    ref="jsonWrittenInput"
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="(e) => onJsonSelect(e, 'written')"
                  />
                  <AppButton
                    label="Importer questions écrites"
                    icon="pi pi-upload"
                    variant="secondary"
                    block
                    @click="jsonWrittenInput?.click()"
                  />
                  <Message
                    v-if="importResult.written"
                    :severity="importResult.written.success ? 'success' : 'error'"
                    :closable="false"
                    class="mt-3"
                  >
                    {{ importResult.written.message }}
                  </Message>
                </section>
              </div>

              <!-- Format JSON -->
              <section class="rounded-2xl border border-line bg-card p-5">
                <h3 class="mb-3 flex items-center gap-2 font-heading font-bold text-ink">
                  <i class="pi pi-code text-sm text-faint" />
                  Format JSON attendu
                </h3>
                <pre class="overflow-x-auto rounded-xl border border-line bg-card-2 p-4 font-mono text-xs leading-relaxed text-muted">{{ exampleQuestionsJson }}</pre>
              </section>
            </div>
          </TabPanel>

          <!-- ── Étape 3 : Tâches ─────────────────────────────── -->
          <TabPanel value="2">
            <div class="space-y-4">
              <div class="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <i class="pi pi-info-circle mt-0.5 text-primary" />
                <p class="text-sm leading-relaxed text-ink">
                  <strong>Étape 3 :</strong> Importez le JSON des tâches d'expression.
                </p>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <!-- EE -->
                <section class="rounded-2xl border border-line bg-card p-5">
                  <div class="mb-1 flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-leaf bg-primary/10 text-primary">
                      <i class="pi pi-pen-to-square" />
                    </span>
                    <h3 class="font-heading font-bold text-ink">Tâches expression écrite</h3>
                  </div>
                  <p class="mb-4 text-sm text-muted">3 tâches d'expression écrite</p>
                  <input
                    ref="jsonWrittenTaskInput"
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="(e) => onTaskJsonSelect(e, 'written')"
                  />
                  <AppButton
                    label="Importer tâches écrites"
                    icon="pi pi-upload"
                    variant="secondary"
                    block
                    @click="jsonWrittenTaskInput?.click()"
                  />
                  <Message
                    v-if="taskResult.written"
                    :severity="taskResult.written.success ? 'success' : 'error'"
                    :closable="false"
                    class="mt-3"
                  >
                    {{ taskResult.written.message }}
                  </Message>
                </section>

                <!-- EO -->
                <section class="rounded-2xl border border-line bg-card p-5">
                  <div class="mb-1 flex items-center gap-2.5">
                    <span class="grid size-9 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
                      <i class="pi pi-microphone" />
                    </span>
                    <h3 class="font-heading font-bold text-ink">Tâches expression orale</h3>
                  </div>
                  <p class="mb-4 text-sm text-muted">3 tâches d'expression orale</p>
                  <input
                    ref="jsonOralTaskInput"
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="(e) => onTaskJsonSelect(e, 'oral')"
                  />
                  <AppButton
                    label="Importer tâches orales"
                    icon="pi pi-upload"
                    variant="secondary"
                    block
                    @click="jsonOralTaskInput?.click()"
                  />
                  <Message
                    v-if="taskResult.oral"
                    :severity="taskResult.oral.success ? 'success' : 'error'"
                    :closable="false"
                    class="mt-3"
                  >
                    {{ taskResult.oral.message }}
                  </Message>
                </section>
              </div>

              <!-- Format JSON tâches -->
              <section class="rounded-2xl border border-line bg-card p-5">
                <h3 class="mb-3 flex items-center gap-2 font-heading font-bold text-ink">
                  <i class="pi pi-code text-sm text-faint" />
                  Format JSON attendu
                </h3>
                <pre class="overflow-x-auto rounded-xl border border-line bg-card-2 p-4 font-mono text-xs leading-relaxed text-muted">{{ exampleTasksJson }}</pre>
              </section>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SuccessResponse_BatchUploadResponse_ } from "#shared/api/models/SuccessResponse_BatchUploadResponse_";
import type { SuccessResponse_dict_ } from "#shared/api/models/SuccessResponse_dict_";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const toast = useToast();
const seriesId = route.params.seriesId as string;

// ── Refs DOM ──────────────────────────────────────────────────
const audioInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const jsonOralInput = ref<HTMLInputElement | null>(null);
const jsonWrittenInput = ref<HTMLInputElement | null>(null);
const jsonOralTaskInput = ref<HTMLInputElement | null>(null);
const jsonWrittenTaskInput = ref<HTMLInputElement | null>(null);

// ── State médias ──────────────────────────────────────────────
const audioFiles = ref<File[]>([]);
const imageFiles = ref<File[]>([]);
const uploadingAudio = ref(false);
const uploadingImage = ref(false);
const uploadedAudios = ref<Record<number, string>>({});
const uploadedImages = ref<Record<number, string>>({});

const hasMedias = computed(
  () =>
    Object.keys(uploadedAudios.value).length > 0 ||
    Object.keys(uploadedImages.value).length > 0,
);

// ── State import ──────────────────────────────────────────────
const importResult = ref<Record<string, { success: boolean; message: string }>>(
  {},
);
const taskResult = ref<Record<string, { success: boolean; message: string }>>(
  {},
);
const importing = ref(false);

// ── Helpers ───────────────────────────────────────────────────
function extractNum(filename: string | undefined | null): number | null {
  if (!filename) return null
  const patterns = [/[Qq](\d+)/, /question[_-]?(\d+)/i, /^(\d+)\./]
  for (const p of patterns) {
    const m = filename.match(p)
    if (m && m[1]) return parseInt(m[1])
  }
  return null
}
// ── Sélection fichiers ────────────────────────────────────────
function onAudioSelect(e: Event) {
  audioFiles.value = Array.from((e.target as HTMLInputElement).files ?? []);
}

function onImageSelect(e: Event) {
  imageFiles.value = Array.from((e.target as HTMLInputElement).files ?? []);
}

// ── Upload audio batch ────────────────────────────────────────
async function uploadAudios() {
  uploadingAudio.value = true;
  try {
    const formData = new FormData();
    audioFiles.value.forEach((f) => formData.append("files", f));

    const res = await $fetch<SuccessResponse_BatchUploadResponse_>(
      "/api/v1/upload/audio/batch",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      },
    );

    const uploaded = (res.data as any)?.uploaded ?? [];
    const mapping: Record<number, string> = {};
    uploaded.forEach((item: any, idx: number) => {
      const num = extractNum(audioFiles.value[idx]?.name ?? "");
      if (num) mapping[num] = item.url;
    });
    uploadedAudios.value = mapping;
    toast.add({
      severity: "success",
      summary: `${uploaded.length} audio(s) uploadé(s)`,
      life: 3000,
    });
    audioFiles.value = [];
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur upload audio",
      life: 3000,
    });
  } finally {
    uploadingAudio.value = false;
  }
}

// ── Upload image batch ────────────────────────────────────────
async function uploadImages() {
  uploadingImage.value = true;
  try {
    const formData = new FormData();
    imageFiles.value.forEach((f) => formData.append("files", f));

    const res = await $fetch<any>("/api/v1/upload/images/batch", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const uploaded = res.data?.uploaded ?? [];
    const mapping: Record<number, string> = {};
    uploaded.forEach((item: any, idx: number) => {
      const num = extractNum(imageFiles.value[idx]?.name ?? "");
      if (num) mapping[num] = item.url;
    });
    uploadedImages.value = mapping;
    toast.add({
      severity: "success",
      summary: `${uploaded.length} image(s) uploadée(s)`,
      life: 3000,
    });
    imageFiles.value = [];
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur upload images",
      life: 3000,
    });
  } finally {
    uploadingImage.value = false;
  }
}

// ── Import questions JSON ─────────────────────────────────────
async function onJsonSelect(e: Event, type: "oral" | "written") {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const text = await file.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    importResult.value[type] = { success: false, message: "JSON invalide" };
    return;
  }

  // Injecter les médias automatiquement
  const questions = json.questions.map((q: any) => ({
    ...q,
    audio: q.audio || uploadedAudios.value[q.QuestionNumber] || null,
    image: q.image || uploadedImages.value[q.QuestionNumber] || null,
  }));

  importing.value = true;
  try {
    const endpoint =
      type === "oral"
        ? `/v1/series/${seriesId}/import/comprehension-oral`
        : `/v1/series/${seriesId}/import/comprehension-written`;

    await $fetch(`/api${endpoint}`, {
      method: "POST",
      body: { questions },
      credentials: "include",
    });

    importResult.value[type] = {
      success: true,
      message: `✅ ${questions.length} question(s) importée(s) avec succès`,
    };
  } catch (err: any) {
    importResult.value[type] = {
      success: false,
      message: err?.data?.message ?? "Erreur lors de l'import",
    };
  } finally {
    importing.value = false;
  }
}

// ── Import tâches JSON ────────────────────────────────────────
async function onTaskJsonSelect(e: Event, type: "oral" | "written") {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const text = await file.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    taskResult.value[type] = { success: false, message: "JSON invalide" };
    return;
  }

  importing.value = true;
  try {
    const endpoint =
      type === "oral"
        ? `/v1/expression-tasks/series/${seriesId}/import/oral`
        : `/v1/expression-tasks/series/${seriesId}/import/written`;

    await $fetch(`/api${endpoint}`, {
      method: "POST",
      body: json,
      credentials: "include",
    });

    taskResult.value[type] = {
      success: true,
      message: `✅ ${json.tasks?.length ?? 0} tâche(s) importée(s)`,
    };
  } catch (err: any) {
    taskResult.value[type] = {
      success: false,
      message: err?.data?.message ?? "Erreur lors de l'import des tâches",
    };
  } finally {
    importing.value = false;
  }
}

// ── Exemples JSON ─────────────────────────────────────────────
const exampleQuestionsJson = JSON.stringify(
  {
    questions: [
      {
        QuestionNumber: 1,
        bodyText: "Texte de contexte...",
        askedQuestion: "Quelle est la bonne réponse ?",
        image: null,
        audio: null,
        proposition_1: "Réponse A",
        proposition_2: "Réponse B",
        proposition_3: "Réponse C",
        proposition_4: "Réponse D",
        correct_answer: "b",
      },
    ],
  },
  null,
  2,
);

const exampleTasksJson = JSON.stringify(
  {
    tasks: [
      {
        TaskNumber: 1,
        InstructionText: "Rédigez un message...",
        WordCountMin: 60,
        WordCountMax: 80,
      },
      {
        TaskNumber: 2,
        Title: "Sujet de débat",
        Document1: "Texte 1...",
        Document2: "Texte 2...",
        WordCountMin: 40,
        WordCountMax: 180,
      },
    ],
  },
  null,
  2,
);

useHead({ title: "Import | Admin Lumina" });
</script>
