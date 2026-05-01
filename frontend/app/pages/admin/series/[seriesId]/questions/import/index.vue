<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink
        :to="`/admin/series/${seriesId}/questions`"
        class="flex items-center gap-1 text-sm text-(--text-tertiary) hover:text-primary-600 mb-3 transition-colors w-fit"
      >
        <i class="pi pi-arrow-left text-xs" /> Retour aux questions
      </NuxtLink>
      <h1 class="text-xl font-bold text-(--text-primary)">
        Importer des questions et tâches
      </h1>
      <p class="text-sm text-(--text-tertiary) mt-1">
        Workflow : 1. Uploader les médias → 2. Importer le JSON
      </p>
    </div>

    <!-- Tabs -->
    <TabView>
      <!-- ── Tab 1 : Médias ─────────────────────────────────── -->
      <TabPanel header="1. Médias" value="0">
        <div class="space-y-4 pt-4">
          <Message severity="info" :closable="false">
            <span
              ><strong>Étape 1 :</strong> Uploadez vos fichiers audio et images.
              Nommez-les avec le numéro de question (ex: Q1.mp3, Q2.jpg,
              Q40.png).</span
            >
          </Message>

          <!-- Audio -->
          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
          >
            <div class="flex items-center gap-2 mb-1">
              <i class="pi pi-volume-up text-primary-500" />
              <span class="font-semibold text-(--text-primary)"
                >Fichiers audio</span
              >
            </div>
            <p class="text-sm text-(--text-tertiary) mb-4">
              Nommez vos fichiers : Q1.mp3, Q2.mp3, Q3.mp3, etc.
            </p>

            <input
              ref="audioInput"
              type="file"
              accept="audio/*"
              multiple
              class="hidden"
              @change="onAudioSelect"
            />
            <Button
              label="Browse..."
              icon="pi pi-folder-open"
              outlined
              @click="audioInput?.click()"
            />

            <!-- Liste fichiers sélectionnés -->
            <div
              v-if="audioFiles.length"
              class="mt-4 border border-(--border-color) rounded-lg overflow-hidden max-h-48 overflow-y-auto"
            >
              <div
                v-for="f in audioFiles"
                :key="f.name"
                class="flex items-center justify-between px-3 py-2 text-sm border-b border-(--border-color) last:border-0"
              >
                <span class="truncate text-(--text-secondary)">{{
                  f.name
                }}</span>
                <span
                  v-if="extractNum(f.name) !== null"
                  class="text-green-600 flex items-center gap-1 ml-3 shrink-0"
                >
                  <i class="pi pi-check text-xs" /> Q{{ extractNum(f.name) }}
                </span>
                <span
                  v-else
                  class="text-red-500 flex items-center gap-1 ml-3 shrink-0"
                >
                  <i class="pi pi-times text-xs" /> Non détecté
                </span>
              </div>
            </div>

            <Button
              v-if="audioFiles.length"
              :label="`Uploader ${audioFiles.length} audio(s)`"
              icon="pi pi-upload"
              class="mt-3 bg-gradient-primary border-none font-bold"
              :loading="uploadingAudio"
              @click="uploadAudios"
            />

            <Message
              v-if="Object.keys(uploadedAudios).length"
              severity="success"
              :closable="false"
              class="mt-3"
            >
              <span
                >✅ {{ Object.keys(uploadedAudios).length }} audio(s)
                uploadé(s)</span
              >
            </Message>
          </div>

          <!-- Images -->
          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
          >
            <div class="flex items-center gap-2 mb-1">
              <i class="pi pi-image text-primary-500" />
              <span class="font-semibold text-(--text-primary)">Images</span>
            </div>
            <p class="text-sm text-(--text-tertiary) mb-4">
              Nommez vos images : Q1.jpg, Q40.png, Q41.jpg, etc.
            </p>

            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="onImageSelect"
            />
            <Button
              label="Browse..."
              icon="pi pi-folder-open"
              outlined
              @click="imageInput?.click()"
            />

            <div
              v-if="imageFiles.length"
              class="mt-4 border border-(--border-color) rounded-lg overflow-hidden max-h-48 overflow-y-auto"
            >
              <div
                v-for="f in imageFiles"
                :key="f.name"
                class="flex items-center justify-between px-3 py-2 text-sm border-b border-(--border-color) last:border-0"
              >
                <span class="truncate text-(--text-secondary)">{{
                  f.name
                }}</span>
                <span
                  v-if="extractNum(f.name)"
                  class="text-green-600 flex items-center gap-1 ml-3 shrink-0"
                >
                  <i class="pi pi-check text-xs" /> Q{{ extractNum(f.name) }}
                </span>
                <span
                  v-else
                  class="text-red-500 flex items-center gap-1 ml-3 shrink-0"
                >
                  <i class="pi pi-times text-xs" /> Non détecté
                </span>
              </div>
            </div>

            <Button
              v-if="imageFiles.length"
              :label="`Uploader ${imageFiles.length} image(s)`"
              icon="pi pi-upload"
              class="mt-3 bg-gradient-primary border-none font-bold"
              :loading="uploadingImage"
              @click="uploadImages"
            />

            <Message
              v-if="Object.keys(uploadedImages).length"
              severity="success"
              :closable="false"
              class="mt-3"
            >
              <span
                >✅ {{ Object.keys(uploadedImages).length }} image(s)
                uploadée(s)</span
              >
            </Message>
          </div>

          <!-- Résumé médias -->
          <Message v-if="hasMedias" severity="success" :closable="false">
            <div class="space-y-1">
              <p class="font-semibold">Médias prêts pour l'import !</p>
              <p v-if="Object.keys(uploadedAudios).length">
                ✅ {{ Object.keys(uploadedAudios).length }} audio(s)
              </p>
              <p v-if="Object.keys(uploadedImages).length">
                ✅ {{ Object.keys(uploadedImages).length }} image(s)
              </p>
              <p class="text-sm opacity-75">
                Passez à l'onglet "Questions" pour importer le JSON.
              </p>
            </div>
          </Message>
        </div>
      </TabPanel>

      <!-- ── Tab 2 : Questions ──────────────────────────────── -->
      <TabPanel header="2. Questions" value="1">
        <div class="space-y-4 pt-4">
          <Message severity="info" :closable="false">
            <span
              ><strong>Étape 2 :</strong> Importez le JSON des questions. Les
              médias uploadés seront automatiquement associés.</span
            >
          </Message>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- CO -->
            <div
              class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
            >
              <h3 class="font-bold text-(--text-primary) mb-1">
                Questions orales
              </h3>
              <p class="text-sm text-(--text-tertiary) mb-4">
                Compréhension orale (Q1-Q39)
              </p>
              <input
                ref="jsonOralInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="(e) => onJsonSelect(e, 'oral')"
              />
              <Button
                label="Importer questions orales"
                icon="pi pi-upload"
                outlined
                class="w-full"
                @click="jsonOralInput?.click()"
              />
              <Message
                v-if="importResult.oral"
                :severity="importResult.oral.success ? 'success' : 'error'"
                :closable="false"
                class="mt-3"
              >
                <span>{{ importResult.oral.message }}</span>
              </Message>
            </div>

            <!-- CE -->
            <div
              class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
            >
              <h3 class="font-bold text-(--text-primary) mb-1">
                Questions écrites
              </h3>
              <p class="text-sm text-(--text-tertiary) mb-4">
                Compréhension écrite (Q40-Q78)
              </p>
              <input
                ref="jsonWrittenInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="(e) => onJsonSelect(e, 'written')"
              />
              <Button
                label="Importer questions écrites"
                icon="pi pi-upload"
                outlined
                class="w-full"
                @click="jsonWrittenInput?.click()"
              />
              <Message
                v-if="importResult.written"
                :severity="importResult.written.success ? 'success' : 'error'"
                :closable="false"
                class="mt-3"
              >
                <span>{{ importResult.written.message }}</span>
              </Message>
            </div>
          </div>

          <!-- Format JSON -->
          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
          >
            <h3 class="font-bold text-(--text-primary) mb-3">
              Format JSON attendu
            </h3>
            <pre
              class="bg-(--bg-ground) rounded-lg p-4 text-xs overflow-x-auto text-(--text-secondary)"
              >{{ exampleQuestionsJson }}</pre
            >
          </div>
        </div>
      </TabPanel>

      <!-- ── Tab 3 : Tâches ─────────────────────────────────── -->
      <TabPanel header="3. Tâches" value="2">
        <div class="space-y-4 pt-4">
          <Message severity="info" :closable="false">
            <span
              ><strong>Étape 3 :</strong> Importez le JSON des tâches
              d'expression.</span
            >
          </Message>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- EE -->
            <div
              class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
            >
              <h3 class="font-bold text-(--text-primary) mb-1">
                Tâches expression écrite
              </h3>
              <p class="text-sm text-(--text-tertiary) mb-4">
                3 tâches d'expression écrite
              </p>
              <input
                ref="jsonWrittenTaskInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="(e) => onTaskJsonSelect(e, 'written')"
              />
              <Button
                label="Importer tâches écrites"
                icon="pi pi-upload"
                outlined
                class="w-full"
                @click="jsonWrittenTaskInput?.click()"
              />
              <Message
                v-if="taskResult.written"
                :severity="taskResult.written.success ? 'success' : 'error'"
                :closable="false"
                class="mt-3"
              >
                <span>{{ taskResult.written.message }}</span>
              </Message>
            </div>

            <!-- EO -->
            <div
              class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
            >
              <h3 class="font-bold text-(--text-primary) mb-1">
                Tâches expression orale
              </h3>
              <p class="text-sm text-(--text-tertiary) mb-4">
                3 tâches d'expression orale
              </p>
              <input
                ref="jsonOralTaskInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="(e) => onTaskJsonSelect(e, 'oral')"
              />
              <Button
                label="Importer tâches orales"
                icon="pi pi-upload"
                outlined
                class="w-full"
                @click="jsonOralTaskInput?.click()"
              />
              <Message
                v-if="taskResult.oral"
                :severity="taskResult.oral.success ? 'success' : 'error'"
                :closable="false"
                class="mt-3"
              >
                <span>{{ taskResult.oral.message }}</span>
              </Message>
            </div>
          </div>

          <!-- Format JSON tâches -->
          <div
            class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
          >
            <h3 class="font-bold text-(--text-primary) mb-3">
              Format JSON attendu
            </h3>
            <pre
              class="bg-(--bg-ground) rounded-lg p-4 text-xs overflow-x-auto text-(--text-secondary)"
              >{{ exampleTasksJson }}</pre
            >
          </div>
        </div>
      </TabPanel>
    </TabView>
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
