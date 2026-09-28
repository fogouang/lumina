<template>
  <div>
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <NuxtLink
          :to="`/admin/series/${seriesId}`"
          class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <i class="pi pi-arrow-left text-xs" /> Retour à la série
        </NuxtLink>
        <h1 class="font-heading text-2xl font-extrabold tracking-tight text-ink">Gestion des questions</h1>
        <p class="mt-0.5 font-mono text-xs text-faint">Série #{{ seriesId.slice(0, 8) }}...</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink
          :to="`/admin/series/${seriesId}/questions/import`"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
        >
          <i class="pi pi-upload text-xs" />
          Importer JSON
        </NuxtLink>
        <AppButton
          label="Nouvelle question"
          icon="pi pi-plus"
          variant="gradient"
          size="small"
          @click="openCreate"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div
        v-for="stat in [
          { label: 'Total questions', icon: 'pi pi-list', value: questions.length, max: 78 },
          { label: 'Questions orales', icon: 'pi pi-headphones', value: oralCount, max: 39 },
          { label: 'Questions écrites', icon: 'pi pi-book', value: writtenCount, max: 39 },
        ]"
        :key="stat.label"
        class="rounded-card border border-line bg-card p-4 shadow-soft"
      >
        <div class="flex items-center gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i :class="stat.icon" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-xs font-semibold uppercase tracking-wider text-faint">{{ stat.label }}</p>
            <p class="font-heading text-2xl font-extrabold tabular-nums text-ink">
              {{ stat.value }}<span class="text-base font-semibold text-faint">/{{ stat.max }}</span>
            </p>
          </div>
        </div>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="
              stat.value >= stat.max
                ? 'bg-linear-to-r from-emerald-400 to-emerald-600'
                : 'bg-linear-to-r from-primary-400 to-primary-700'
            "
            :style="{ width: `${percent(stat.value, stat.max)}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Filtre type -->
    <div
      role="tablist"
      aria-label="Filtrer par type"
      class="mb-5 inline-flex rounded-xl border border-line bg-card p-1 shadow-soft"
    >
      <button
        v-for="f in typeFilters"
        :key="f.value"
        type="button"
        role="tab"
        :aria-selected="activeFilter === f.value"
        class="rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors"
        :class="
          activeFilter === f.value
            ? 'bg-primary text-primary-contrast shadow-sm'
            : 'text-muted hover:bg-card-2 hover:text-ink'
        "
        @click="activeFilter = f.value as 'all' | 'oral' | 'written'"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton v-for="i in 6" :key="i" height="220px" border-radius="1.25rem" />
    </div>

    <!-- Grille -->
    <div v-else-if="filteredQuestions.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article
        v-for="q in filteredQuestions"
        :key="q.id"
        class="flex flex-col gap-3.5 rounded-card border border-line bg-card p-4 shadow-soft transition-shadow hover:shadow-lift"
      >
        <!-- En-tête carte -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <span
              class="grid size-9 shrink-0 place-items-center rounded-leaf font-heading text-xs font-extrabold tabular-nums"
              :class="
                q.type === 'oral'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300'
              "
            >
              {{ q.question_number }}
            </span>
            <span class="inline-flex items-center gap-1 rounded-full bg-card-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
              <i class="pi text-[0.65rem]" :class="q.type === 'oral' ? 'pi-headphones' : 'pi-book'" />
              {{ q.type === "oral" ? "Oral" : "Écrit" }}
            </span>
            <span class="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-bold text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
              {{ q.points }} pts
            </span>
            <span v-if="q.audio_url" class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <i class="pi pi-volume-up text-[0.65rem]" /> Audio
            </span>
            <span v-if="q.image_url" class="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              <i class="pi pi-image text-[0.65rem]" /> Image
            </span>
          </div>
          <div class="flex shrink-0 gap-1">
            <Button icon="pi pi-pencil" text rounded size="small" severity="secondary" aria-label="Modifier" @click="openEdit(q)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" aria-label="Supprimer" @click="openDelete(q)" />
          </div>
        </div>

        <!-- Question posée -->
        <p v-if="q.asked_question" class="text-sm font-semibold leading-snug text-ink">
          {{ q.asked_question }}
        </p>

        <!-- Options -->
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="opt in getOptions(q)"
            :key="opt.key"
            class="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm"
            :class="
              opt.key === q.correct_answer
                ? 'border-emerald-300 bg-emerald-50 font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-line text-muted'
            "
          >
            <span
              class="grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold"
              :class="opt.key === q.correct_answer ? 'bg-emerald-500 text-white' : 'bg-card-2 text-muted'"
            >
              {{ opt.key.toUpperCase() }}
            </span>
            <span class="flex-1">{{ opt.text }}</span>
            <i v-if="opt.key === q.correct_answer" class="pi pi-check-circle shrink-0 text-emerald-600 dark:text-emerald-400" />
          </li>
        </ul>
      </article>
    </div>

    <!-- Vide -->
    <div
      v-else
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
        <i class="pi pi-list text-2xl" />
      </span>
      <p class="mb-4 text-sm font-medium text-muted">Aucune question trouvée.</p>
      <NuxtLink
        :to="`/admin/series/${seriesId}/questions/import`"
        class="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary"
      >
        <i class="pi pi-upload text-xs" />
        Importer des questions
      </NuxtLink>
    </div>

    <!-- Dialog créer / modifier -->
    <Dialog
      v-model:visible="formVisible"
      modal
      :draggable="false"
      :style="{ width: '36rem' }"
      :breakpoints="{ '640px': '96vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary">
            <i :class="editingQ ? 'pi pi-pencil' : 'pi pi-plus'" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            {{ editingQ ? "Modifier la question" : "Nouvelle question" }}
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="q-number" class="text-sm font-semibold text-ink">Numéro</label>
            <InputNumber v-model="form.question_number" input-id="q-number" :min="1" :max="78" fluid />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="q-type" class="text-sm font-semibold text-ink">Type</label>
            <Select
              v-model="form.type"
              input-id="q-type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="q-text" class="text-sm font-semibold text-ink">
            Texte question <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <Textarea id="q-text" v-model="form.question_text" :rows="3" auto-resize fluid placeholder="Texte du document..." />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="q-asked" class="text-sm font-semibold text-ink">Question posée</label>
          <InputText id="q-asked" v-model="form.asked_question" fluid placeholder="Qu'est-ce que..." />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="q-audio" class="text-sm font-semibold text-ink">URL Audio</label>
            <InputText id="q-audio" v-model="form.audio_url" class="font-mono text-sm" fluid placeholder="/uploads/audio/..." />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="q-image" class="text-sm font-semibold text-ink">URL Image</label>
            <InputText id="q-image" v-model="form.image_url" class="font-mono text-sm" fluid placeholder="/uploads/images/..." />
          </div>
        </div>

        <div class="rounded-2xl border border-line bg-card-2/40 p-3.5">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-faint">Options de réponse</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="q-opt-a" class="text-sm font-semibold text-ink">Option A</label>
              <InputText id="q-opt-a" v-model="form.option_a" fluid />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="q-opt-b" class="text-sm font-semibold text-ink">Option B</label>
              <InputText id="q-opt-b" v-model="form.option_b" fluid />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="q-opt-c" class="text-sm font-semibold text-ink">Option C</label>
              <InputText id="q-opt-c" v-model="form.option_c" fluid />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="q-opt-d" class="text-sm font-semibold text-ink">Option D</label>
              <InputText id="q-opt-d" v-model="form.option_d" fluid />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label for="q-correct" class="text-sm font-semibold text-ink">Bonne réponse</label>
            <Select
              v-model="form.correct_answer"
              input-id="q-correct"
              :options="answerOptions"
              option-label="label"
              option-value="value"
              fluid
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label for="q-points" class="text-sm font-semibold text-ink">Points</label>
            <Select v-model="form.points" input-id="q-points" :options="[3, 9, 15, 21, 26, 33]" fluid />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="q-explanation" class="text-sm font-semibold text-ink">
            Explication <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <Textarea id="q-explanation" v-model="form.explanation" :rows="2" auto-resize fluid />
        </div>
      </div>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="formVisible = false" />
        <AppButton
          :label="editingQ ? 'Enregistrer' : 'Créer'"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          @click="onSave"
        />
      </template>
    </Dialog>

    <!-- Dialog supprimer -->
    <Dialog
      v-model:visible="deleteVisible"
      modal
      :draggable="false"
      :style="{ width: '26rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-trash" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Supprimer la question</h3>
        </div>
      </template>

      <p class="leading-relaxed text-muted">
        Supprimer la <strong class="text-ink">Question #{{ deletingQ?.question_number }}</strong> ?
        Cette action est irréversible.
      </p>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="deleteVisible = false" />
        <AppButton label="Supprimer" icon="pi pi-trash" variant="danger" :loading="saving" @click="onDelete" />
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

function percent(value: number, max: number) {
  return max ? Math.min(100, Math.round((value / max) * 100)) : 0
}

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