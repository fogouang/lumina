<template>
  <div>
    <!-- Chargement -->
    <div v-if="loading" class="flex flex-col gap-4">
      <Skeleton height="2.5rem" width="18rem" />
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton
          v-for="i in 3"
          :key="i"
          height="130px"
          border-radius="1.25rem"
        />
      </div>
      <Skeleton height="220px" border-radius="1.25rem" />
    </div>

    <template v-else-if="serie">
      <!-- En-tête -->
      <div
        class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="min-w-0">
          <NuxtLink
            to="/admin/series"
            class="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-primary"
          >
            <i class="pi pi-arrow-left text-xs" /> Retour aux séries
          </NuxtLink>
          <div class="flex items-center gap-3">
            <span
              class="grid size-14 shrink-0 place-items-center rounded-leaf font-heading text-lg font-extrabold tabular-nums"
              :class="
                serie.is_active
                  ? 'brand-gradient text-white shadow-brand'
                  : 'bg-card-2 text-faint'
              "
            >
              {{ serie.number }}
            </span>
            <div class="min-w-0">
              <h1
                class="font-heading text-2xl font-extrabold tracking-tight text-ink"
              >
                Série #{{ serie.number }}
              </h1>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <p class="truncate text-sm text-muted">
                  {{ serie.title ?? "Série d'examen TCF Canada" }}
                </p>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="
                    serie.is_active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-card-2 text-muted'
                  "
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="serie.is_active ? 'bg-emerald-500' : 'bg-faint'"
                  />
                  {{ serie.is_active ? "Activée" : "Désactivée" }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 gap-2">
          <AppButton
            label="Modifier"
            icon="pi pi-pencil"
            variant="secondary"
            @click="openEdit"
          />
          <AppButton
            label="Supprimer"
            icon="pi pi-trash"
            variant="danger"
            @click="deleteVisible = true"
          />
        </div>
      </div>

      <!-- Complétion -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="stat in [
            {
              label: 'Questions orales',
              icon: 'pi pi-headphones',
              value: oralCount,
              max: 39,
            },
            {
              label: 'Questions écrites',
              icon: 'pi pi-book',
              value: writtenCount,
              max: 39,
            },
            {
              label: 'Tâches d\'expression',
              icon: 'pi pi-pencil',
              value: tasksCount,
              max: 6,
            },
          ]"
          :key="stat.label"
          class="rounded-card border border-line bg-card p-5 shadow-soft"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-muted">{{ stat.label }}</p>
            <span
              class="grid size-9 place-items-center rounded-leaf bg-primary/10 text-primary"
            >
              <i :class="[stat.icon, 'text-sm']" />
            </span>
          </div>
          <p class="font-heading text-3xl font-extrabold tabular-nums text-ink">
            {{ stat.value }}
            <span class="text-base font-semibold text-faint"
              >/ {{ stat.max }}</span
            >
          </p>
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

      <!-- Actions rapides -->
      <section
        class="rounded-card border border-line bg-card p-5 shadow-soft sm:p-6"
      >
        <h2
          class="mb-4 border-b border-line pb-3.5 font-heading text-base font-bold text-ink"
        >
          Actions rapides
        </h2>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <NuxtLink
            :to="`/admin/series/${seriesId}/questions`"
            class="group flex items-center gap-3 rounded-2xl p-4 text-white shadow-brand transition-all duration-300 ease-spring brand-gradient hover:-translate-y-0.5 hover:shadow-brand-hover"
          >
            <span
              class="grid size-10 shrink-0 place-items-center rounded-leaf bg-white/15"
            >
              <i class="pi pi-list" />
            </span>
            <span class="flex-1 text-sm font-bold">Gérer les questions</span>
            <i
              class="pi pi-arrow-right text-xs transition-transform group-hover:translate-x-0.5"
            />
          </NuxtLink>

          <NuxtLink
            :to="`/admin/series/${seriesId}/questions/import`"
            class="group flex items-center gap-3 rounded-2xl border border-line bg-card-2/50 p-4 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lift"
          >
            <span
              class="grid size-10 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary"
            >
              <i class="pi pi-upload" />
            </span>
            <span class="flex-1 text-sm font-semibold text-ink"
              >Importer des questions (JSON)</span
            >
            <i
              class="pi pi-arrow-right text-xs text-faint transition-all group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </NuxtLink>

          <NuxtLink
            :to="`/admin/series/${seriesId}/tasks`"
            class="group flex items-center gap-3 rounded-2xl border border-line bg-card-2/50 p-4 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lift"
          >
            <span
              class="grid size-10 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary"
            >
              <i class="pi pi-file" />
            </span>
            <span class="flex-1 text-sm font-semibold text-ink"
              >Gérer les tâches d'expression</span
            >
            <i
              class="pi pi-arrow-right text-xs text-faint transition-all group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </NuxtLink>
        </div>
      </section>
    </template>

    <!-- Dialog modifier -->
    <Dialog
      v-model:visible="editVisible"
      modal
      :draggable="false"
      :style="{ width: '26rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span
            class="grid size-10 place-items-center rounded-leaf bg-primary/10 text-primary"
          >
            <i class="pi pi-pencil" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            Modifier la série
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="edit-title" class="text-sm font-semibold text-ink"
            >Titre</label
          >
          <InputText
            id="edit-title"
            v-model="editForm.title"
            placeholder="Titre de la série"
            fluid
          />
        </div>
        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2/50 px-4 py-3"
        >
          <label for="edit-active" class="text-sm font-semibold text-ink"
            >Série active</label
          >
          <ToggleSwitch v-model="editForm.is_active" input-id="edit-active" />
        </div>
      </div>

      <template #footer>
        <AppButton
          label="Annuler"
          variant="ghost"
          @click="editVisible = false"
        />
        <AppButton
          label="Enregistrer"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          @click="onEdit"
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
          <span
            class="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
          >
            <i class="pi pi-trash" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            Supprimer la série
          </h3>
        </div>
      </template>

      <p class="leading-relaxed text-muted">
        Supprimer la
        <strong class="text-ink">Série #{{ serie?.number }}</strong> ?
      </p>
      <div
        class="mt-3 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300"
      >
        <i class="pi pi-exclamation-triangle mt-0.5 shrink-0" />
        Toutes les questions seront supprimées.
      </div>

      <template #footer>
        <AppButton
          label="Annuler"
          variant="ghost"
          @click="deleteVisible = false"
        />
        <AppButton
          label="Supprimer"
          icon="pi pi-trash"
          variant="danger"
          :loading="saving"
          @click="onDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { SeriesResponse } from "#shared/api/models/SeriesResponse";
import type { SuccessResponse_SeriesResponse_ } from "#shared/api/models/SuccessResponse_SeriesResponse_";
import type { SuccessResponse_list_QuestionResponse__ } from "#shared/api/models/SuccessResponse_list_QuestionResponse__";
import type { SuccessResponse_list_ExpressionTaskResponse__ } from "#shared/api/models/SuccessResponse_list_ExpressionTaskResponse__";

definePageMeta({ layout: "admin", middleware: "admin" });

const route = useRoute();
const { get, patch, del } = useApi();
const toast = useToast();
const seriesId = route.params.seriesId as string;

const loading = ref(true);
const saving = ref(false);
const serie = ref<SeriesResponse | null>(null);
const oralCount = ref(0);
const writtenCount = ref(0);
const tasksCount = ref(0);

onMounted(async () => {
  try {
    const [serieRes, questionsRes, tasksRes] = await Promise.all([
      get<SuccessResponse_SeriesResponse_>(`/v1/series/${seriesId}`),
      get<SuccessResponse_list_QuestionResponse__>(
        `/v1/series/${seriesId}/questions`,
      ),
      get<SuccessResponse_list_ExpressionTaskResponse__>(
        `/v1/expression-tasks/series/${seriesId}`,
      ),
    ]);
    serie.value = serieRes.data ?? null;
    const questions = questionsRes.data ?? [];
    oralCount.value = questions.filter((q) => q.type === "oral").length;
    writtenCount.value = questions.filter((q) => q.type === "written").length;
    tasksCount.value = (tasksRes.data ?? []).length;
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de chargement",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
});

function percent(value: number, max: number) {
  return max ? Math.min(100, Math.round((value / max) * 100)) : 0;
}

// ── Modifier ──────────────────────────────────────────────────
const editVisible = ref(false);
const editForm = reactive({ title: "", is_active: true });

function openEdit() {
  editForm.title = serie.value?.title ?? "";
  editForm.is_active = serie.value?.is_active ?? true;
  editVisible.value = true;
}

async function onEdit() {
  saving.value = true;
  try {
    const res = await patch<SuccessResponse_SeriesResponse_>(
      `/v1/series/${seriesId}`,
      {
        title: editForm.title || null,
        is_active: editForm.is_active,
      },
    );
    serie.value = res.data ?? serie.value;
    toast.add({ severity: "success", summary: "Série modifiée", life: 3000 });
    editVisible.value = false;
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

// ── Supprimer ─────────────────────────────────────────────────
const deleteVisible = ref(false);

async function onDelete() {
  saving.value = true;
  try {
    await del(`/v1/series/${seriesId}`);
    toast.add({ severity: "success", summary: "Série supprimée", life: 3000 });
    navigateTo("/admin/series");
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

useHead({ title: `Série | Admin Lumina` });
</script>
