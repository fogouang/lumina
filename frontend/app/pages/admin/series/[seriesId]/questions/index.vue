<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <NuxtLink
          :to="`/admin/series/${seriesId}`"
          class="flex items-center gap-1 text-sm text-(--text-tertiary) hover:text-primary-600 mb-2 transition-colors"
        >
          <i class="pi pi-arrow-left text-xs" /> Retour à la série
        </NuxtLink>
        <h1 class="text-xl font-bold text-(--text-primary)">
          Gestion des questions
        </h1>
        <p class="text-sm text-(--text-tertiary) mt-0.5">
          Série #{{ seriesId.slice(0, 8) }}...
        </p>
      </div>
      <div class="flex gap-2 flex-wrap justify-end">
        <NuxtLink :to="`/admin/series/${seriesId}/questions/import`">
          <Button
            label="Importer JSON"
            icon="pi pi-upload"
            outlined
            size="small"
          />
        </NuxtLink>
        <Button
          label="Nouvelle question"
          icon="pi pi-plus"
          size="small"
          class="bg-gradient-primary border-none font-bold"
          @click="openCreate"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div
        class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4 text-center"
      >
        <p class="text-xs text-(--text-tertiary)">Total questions</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ questions.length }}/78
        </p>
      </div>
      <div
        class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4 text-center"
      >
        <p class="text-xs text-(--text-tertiary)">Questions orales</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ oralCount }}/39
        </p>
      </div>
      <div
        class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4 text-center"
      >
        <p class="text-xs text-(--text-tertiary)">Questions écrites</p>
        <p class="text-2xl font-bold text-(--text-primary)">
          {{ writtenCount }}/39
        </p>
      </div>
    </div>

    <!-- Filtre type -->
    <div class="flex gap-2 mb-4">
      <Button
        v-for="f in typeFilters"
        :key="f.value"
        :label="f.label"
        :outlined="activeFilter !== f.value"
        size="small"
        :class="
          activeFilter === f.value
            ? 'bg-gradient-primary border-none font-bold'
            : ''
        "
        @click="activeFilter = f.value as 'all' | 'oral' | 'written'"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton v-for="i in 6" :key="i" height="200px" border-radius="12px" />
    </div>

    <!-- Grid questions -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="q in filteredQuestions"
        :key="q.id"
        class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4 flex flex-col gap-3"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-(--text-primary)"
              >Question #{{ q.question_number }}</span
            >
            <Tag
              :value="q.type === 'oral' ? 'Oral' : 'Écrit'"
              :severity="q.type === 'oral' ? 'info' : 'warning'"
            />
            <span class="text-xs text-(--text-tertiary)"
              >{{ q.points }} pts</span
            >
          </div>
          <div class="flex gap-1">
            <Button
              icon="pi pi-pencil"
              text
              rounded
              size="small"
              severity="secondary"
              @click="openEdit(q)"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="danger"
              @click="openDelete(q)"
            />
          </div>
        </div>

        <!-- Médias -->
        <div class="flex gap-2">
          <Tag
            v-if="q.audio_url"
            value="Audio"
            icon="pi pi-volume-up"
            severity="success"
          />
          <Tag
            v-if="q.image_url"
            value="Image"
            icon="pi pi-image"
            severity="info"
          />
        </div>

        <!-- Options -->
        <div class="flex flex-col gap-1">
          <div
            v-for="opt in getOptions(q)"
            :key="opt.key"
            class="text-sm px-3 py-1.5 rounded-lg"
            :class="
              opt.key === q.correct_answer
                ? 'bg-green-50 text-green-700 font-semibold border border-green-200'
                : 'text-(--text-secondary)'
            "
          >
            {{ opt.key.toUpperCase() }}. {{ opt.text }}
          </div>
        </div>

        <p class="text-xs text-(--text-tertiary)">
          Réponse correcte:
          <strong>{{ q.correct_answer?.toUpperCase() }}</strong>
        </p>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-if="!loading && filteredQuestions.length === 0"
      class="text-center py-16 text-(--text-tertiary)"
    >
      <i class="pi pi-list text-4xl mb-3 block opacity-30" />
      <p>Aucune question trouvée.</p>
      <Button
        label="Importer des questions"
        icon="pi pi-upload"
        outlined
        class="mt-4"
        @click="navigateTo(`/admin/series/${seriesId}/questions/import`)"
      />
    </div>

    <!-- Dialog créer/modifier -->
    <Dialog
      v-model:visible="formVisible"
      :header="editingQ ? 'Modifier la question' : 'Nouvelle question'"
      modal
      :style="{ width: '580px' }"
      :draggable="false"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Numéro</label
            >
            <InputNumber
              v-model="form.question_number"
              :min="1"
              :max="78"
              fluid
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Type</label
            >
            <Select
              v-model="form.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Texte question (optionnel)</label
          >
          <Textarea
            v-model="form.question_text"
            rows="3"
            fluid
            placeholder="Texte du document..."
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Question posée</label
          >
          <InputText
            v-model="form.asked_question"
            fluid
            placeholder="Qu'est-ce que..."
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >URL Audio</label
            >
            <InputText
              v-model="form.audio_url"
              fluid
              placeholder="/uploads/audio/..."
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >URL Image</label
            >
            <InputText
              v-model="form.image_url"
              fluid
              placeholder="/uploads/images/..."
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Option A</label
            >
            <InputText v-model="form.option_a" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Option B</label
            >
            <InputText v-model="form.option_b" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Option C</label
            >
            <InputText v-model="form.option_c" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Option D</label
            >
            <InputText v-model="form.option_d" fluid />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Bonne réponse</label
            >
            <Select
              v-model="form.correct_answer"
              :options="answerOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-(--text-secondary)"
              >Points</label
            >
            <Select
              v-model="form.points"
              :options="[3, 9, 15, 21, 26, 33]"
              fluid
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-(--text-secondary)"
            >Explication (optionnel)</label
          >
          <Textarea v-model="form.explanation" rows="2" fluid />
        </div>
      </div>

      <template #footer>
        <Button label="Annuler" text @click="formVisible = false" />
        <Button
          :label="editingQ ? 'Enregistrer' : 'Créer'"
          :loading="saving"
          class="bg-gradient-primary border-none font-bold"
          @click="onSave"
        />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog
      v-model:visible="deleteVisible"
      header="Supprimer la question"
      modal
      :style="{ width: '380px' }"
      :draggable="false"
    >
      <p class="text-(--text-secondary)">
        Supprimer la
        <strong>Question #{{ deletingQ?.question_number }}</strong> ? Cette
        action est irréversible.
      </p>
      <template #footer>
        <Button label="Annuler" text @click="deleteVisible = false" />
        <Button
          label="Supprimer"
          severity="danger"
          icon="pi pi-trash"
          :loading="saving"
          @click="onDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from "#shared/api/models/QuestionResponse";
import type { SuccessResponse_list_QuestionResponse__ } from "#shared/api/models/SuccessResponse_list_QuestionResponse__";
import type { SuccessResponse_QuestionResponse_ } from "#shared/api/models/SuccessResponse_QuestionResponse_";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const { get, post, patch, del } = useApi();
const toast = useToast();
const seriesId = route.params.seriesId as string;

const loading = ref(true);
const saving = ref(false);
const questions = ref<QuestionResponse[]>([]);
const activeFilter = ref<"all" | "oral" | "written">("all");

const typeFilters = [
  { label: "Toutes", value: "all" },
  { label: "Compréhension Orale", value: "oral" },
  { label: "Compréhension Écrite", value: "written" },
];

const typeOptions = [
  { label: "Oral", value: "oral" },
  { label: "Écrit", value: "written" },
];
const answerOptions = [
  { label: "A", value: "a" },
  { label: "B", value: "b" },
  { label: "C", value: "c" },
  { label: "D", value: "d" },
];

const oralCount = computed(
  () => questions.value.filter((q) => q.type === "oral").length,
);
const writtenCount = computed(
  () => questions.value.filter((q) => q.type === "written").length,
);
const filteredQuestions = computed(() => {
  if (activeFilter.value === "all") return questions.value;
  return questions.value.filter((q) => q.type === activeFilter.value);
});

async function fetchQuestions() {
  loading.value = true;
  try {
    const res = await get<SuccessResponse_list_QuestionResponse__>(
      `/v1/series/${seriesId}/questions`,
    );
    questions.value = (res.data ?? []).sort(
      (a, b) => a.question_number - b.question_number,
    );
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    loading.value = false;
  }
}

onMounted(fetchQuestions);

function getOptions(q: QuestionResponse) {
  return [
    { key: "a", text: q.option_a },
    { key: "b", text: q.option_b },
    { key: "c", text: q.option_c },
    { key: "d", text: q.option_d },
  ];
}

// ── Formulaire ────────────────────────────────────────────────
const formVisible = ref(false);
const editingQ = ref<QuestionResponse | null>(null);
const form = reactive({
  question_number: 1,
  type: "oral",
  question_text: "",
  asked_question: "",
  audio_url: "",
  image_url: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "a",
  points: 3,
  explanation: "",
});

function openCreate() {
  editingQ.value = null;
  Object.assign(form, {
    question_number: questions.value.length + 1,
    type: "oral",
    question_text: "",
    asked_question: "",
    audio_url: "",
    image_url: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "a",
    points: 3,
    explanation: "",
  });
  formVisible.value = true;
}

function openEdit(q: QuestionResponse) {
  editingQ.value = q;
  Object.assign(form, {
    question_number: q.question_number,
    type: q.type,
    question_text: q.question_text ?? "",
    asked_question: q.asked_question ?? "",
    audio_url: q.audio_url ?? "",
    image_url: q.image_url ?? "",
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_answer: q.correct_answer,
    points: q.points,
    explanation: q.explanation ?? "",
  });
  formVisible.value = true;
}

async function onSave() {
  saving.value = true;
  try {
    if (editingQ.value) {
      await patch<SuccessResponse_QuestionResponse_>(
        `/v1/series/questions/${editingQ.value.id}`,
        {
          question_text: form.question_text || null,
          asked_question: form.asked_question || null,
          audio_url: form.audio_url || null,
          image_url: form.image_url || null,
          option_a: form.option_a,
          option_b: form.option_b,
          option_c: form.option_c,
          option_d: form.option_d,
          correct_answer: form.correct_answer,
          points: form.points,
          explanation: form.explanation || null,
        },
      );
      toast.add({
        severity: "success",
        summary: "Question modifiée",
        life: 3000,
      });
    } else {
      await post<SuccessResponse_QuestionResponse_>(
        `/v1/series/${seriesId}/questions`,
        {
          question_number: form.question_number,
          type: form.type,
          series_id: seriesId,
          question_text: form.question_text || null,
          asked_question: form.asked_question || null,
          audio_url: form.audio_url || null,
          image_url: form.image_url || null,
          option_a: form.option_a,
          option_b: form.option_b,
          option_c: form.option_c,
          option_d: form.option_d,
          correct_answer: form.correct_answer,
          points: form.points,
          explanation: form.explanation || null,
        },
      );
      toast.add({ severity: "success", summary: "Question créée", life: 3000 });
    }
    formVisible.value = false;
    await fetchQuestions();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

// ── Supprimer ─────────────────────────────────────────────────
const deleteVisible = ref(false);
const deletingQ = ref<QuestionResponse | null>(null);

function openDelete(q: QuestionResponse) {
  deletingQ.value = q;
  deleteVisible.value = true;
}

async function onDelete() {
  if (!deletingQ.value) return;
  saving.value = true;
  try {
    await del(`/v1/series/questions/${deletingQ.value.id}`);
    toast.add({
      severity: "success",
      summary: "Question supprimée",
      life: 3000,
    });
    deleteVisible.value = false;
    await fetchQuestions();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

useHead({ title: "Questions | Admin Lumina" });
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .stats-grid    { grid-template-columns: 1fr; }
  .questions-grid { grid-template-columns: 1fr; }
}
</style>