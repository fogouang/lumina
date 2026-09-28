<template>
  <div>
    <!-- En-tête -->
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1
          class="font-heading text-2xl font-extrabold tracking-tight text-ink"
        >
          Gestion des séries
        </h1>
        <p class="mt-0.5 text-sm text-muted">
          Créer et gérer les séries d'examens TCF Canada
        </p>
      </div>
      <AppButton
        label="Nouvelle série"
        icon="pi pi-plus"
        variant="gradient"
        @click="openCreate"
      />
    </div>

    <!-- Chargement -->
    <div
      v-if="loading"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <Skeleton
        v-for="i in 6"
        :key="i"
        height="150px"
        border-radius="1.25rem"
      />
    </div>

    <!-- Grille -->
    <div
      v-else-if="series.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="serie in series"
        :key="serie.id"
        class="flex flex-col gap-4 rounded-card border border-line bg-card p-5 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:shadow-lift"
      >
        <!-- En-tête carte -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="grid size-12 shrink-0 place-items-center rounded-leaf font-heading text-sm font-extrabold tabular-nums"
              :class="
                serie.is_active
                  ? 'brand-gradient text-white shadow-brand'
                  : 'bg-card-2 text-faint'
              "
            >
              {{ serie.number }}
            </span>
            <div class="min-w-0">
              <p class="font-heading text-base font-bold text-ink">
                Série #{{ serie.number }}
              </p>
              <p v-if="serie.title" class="truncate text-sm text-muted">
                {{ serie.title }}
              </p>
              <span
                class="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
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
          <Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            size="small"
            severity="secondary"
            aria-label="Plus d'actions"
            @click="(e) => toggleMenu(e, serie)"
          />
        </div>

        <!-- Actions -->
        <div class="mt-auto flex gap-2 border-t border-line pt-4">
          <AppButton
            label="Voir"
            icon="pi pi-eye"
            variant="secondary"
            size="small"
            class="flex-1"
            @click="goTo(`/admin/series/${serie.id}`)"
          />
          <AppButton
            label="Questions"
            icon="pi pi-list"
            variant="gradient"
            size="small"
            class="flex-1"
            @click="goTo(`/admin/series/${serie.id}/questions`)"
          />
        </div>
      </article>
    </div>

    <!-- Vide -->
    <div
      v-else
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <span
        class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint"
      >
        <i class="pi pi-folder-open text-2xl" />
      </span>
      <p class="mb-4 text-sm font-medium text-muted">
        Aucune série pour le moment.
      </p>
      <AppButton
        label="Nouvelle série"
        icon="pi pi-plus"
        variant="gradient"
        @click="openCreate"
      />
    </div>

    <!-- Menu contextuel -->
    <Menu ref="menuRef" :model="menuItems" popup />

    <!-- Dialog créer série -->
    <Dialog
      v-model:visible="createVisible"
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
            <i class="pi pi-plus" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">
            Nouvelle série
          </h3>
        </div>
      </template>

      <div class="flex flex-col gap-4 pt-1">
        <div class="flex flex-col gap-1.5">
          <label for="serie-number" class="text-sm font-semibold text-ink"
            >Numéro de série</label
          >
          <InputNumber
            v-model="form.number"
            input-id="serie-number"
            placeholder="Ex : 150"
            fluid
            :min="1"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="serie-title" class="text-sm font-semibold text-ink">
            Titre <span class="font-normal text-faint">(optionnel)</span>
          </label>
          <InputText
            id="serie-title"
            v-model="form.title"
            placeholder="Titre de la série"
            fluid
          />
        </div>
        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-line bg-card-2/50 px-4 py-3"
        >
          <label for="active" class="text-sm font-semibold text-ink"
            >Série active</label
          >
          <ToggleSwitch v-model="form.is_active" input-id="active" />
        </div>
      </div>

      <template #footer>
        <AppButton
          label="Annuler"
          variant="ghost"
          @click="createVisible = false"
        />
        <AppButton
          label="Créer"
          icon="pi pi-check"
          variant="gradient"
          :loading="saving"
          @click="onCreate"
        />
      </template>
    </Dialog>

    <!-- Dialog modifier série -->
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
        Êtes-vous sûr de vouloir supprimer la
        <strong class="text-ink">Série #{{ selectedSerie?.number }}</strong> ?
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
import type { SeriesListResponse } from "#shared/api/models/SeriesListResponse";
import type { SuccessResponse_list_SeriesListResponse__ } from "#shared/api/models/SuccessResponse_list_SeriesListResponse__";
import type { SuccessResponse_SeriesResponse_ } from "#shared/api/models/SuccessResponse_SeriesResponse_";

definePageMeta({ layout: "admin", middleware: "admin" });

const { get, post, patch, del } = useApi();
const toast = useToast();
const menuRef = ref();

const loading = ref(true);
const saving = ref(false);
const series = ref<SeriesListResponse[]>([]);

// ── Fetch ─────────────────────────────────────────────────────
async function fetchSeries() {
  loading.value = true;
  try {
    const res = await get<SuccessResponse_list_SeriesListResponse__>(
      "/v1/series?active_only=false&limit=100",
    );
    series.value = (res.data ?? []).sort((a, b) => a.number - b.number);
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de chargement",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
}

function goTo(path: string) {
  navigateTo(path);
}

onMounted(fetchSeries);

// ── Menu contextuel ───────────────────────────────────────────
const selectedSerie = ref<SeriesListResponse | null>(null);

const menuItems = computed(() => [
  {
    label: "Modifier",
    icon: "pi pi-pencil",
    command: () => openEdit(),
  },
  {
    label: "Voir les questions",
    icon: "pi pi-list",
    command: () =>
      navigateTo(`/admin/series/${selectedSerie.value?.id}/questions`),
  },
  {
    label: "Importer questions",
    icon: "pi pi-upload",
    command: () =>
      navigateTo(`/admin/series/${selectedSerie.value?.id}/questions/import`),
  },
  { separator: true },
  {
    label: "Supprimer",
    icon: "pi pi-trash",
    class: "text-red-500",
    command: () => {
      deleteVisible.value = true;
    },
  },
]);

function toggleMenu(event: MouseEvent, serie: SeriesListResponse) {
  selectedSerie.value = serie;
  menuRef.value?.toggle(event);
}

// ── Créer ─────────────────────────────────────────────────────
const createVisible = ref(false);
const form = reactive({
  number: null as number | null,
  title: "",
  is_active: true,
});

function openCreate() {
  form.number = null;
  form.title = "";
  form.is_active = true;
  createVisible.value = true;
}

async function onCreate() {
  if (!form.number) return;
  saving.value = true;
  try {
    await post<SuccessResponse_SeriesResponse_>("/v1/series", {
      number: form.number,
      title: form.title || null,
      is_active: form.is_active,
    });
    toast.add({ severity: "success", summary: "Série créée", life: 3000 });
    createVisible.value = false;
    await fetchSeries();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

// ── Modifier ──────────────────────────────────────────────────
const editVisible = ref(false);
const editForm = reactive({ title: "", is_active: true });

function openEdit() {
  if (!selectedSerie.value) return;
  editForm.title = selectedSerie.value.title ?? "";
  editForm.is_active = selectedSerie.value.is_active;
  editVisible.value = true;
}

async function onEdit() {
  if (!selectedSerie.value) return;
  saving.value = true;
  try {
    await patch(`/v1/series/${selectedSerie.value.id}`, {
      title: editForm.title || null,
      is_active: editForm.is_active,
    });
    toast.add({ severity: "success", summary: "Série modifiée", life: 3000 });
    editVisible.value = false;
    await fetchSeries();
  } catch {
    toast.add({ severity: "error", summary: "Erreur", life: 3000 });
  } finally {
    saving.value = false;
  }
}

// ── Supprimer ─────────────────────────────────────────────────
const deleteVisible = ref(false);

async function onDelete() {
  if (!selectedSerie.value) return;
  saving.value = true;
  try {
    await del(`/v1/series/${selectedSerie.value.id}`);
    toast.add({ severity: "success", summary: "Série supprimée", life: 3000 });
    deleteVisible.value = false;
    await fetchSeries();
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de suppression",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
}

useHead({ title: "Séries | Admin Lumina" });
</script>
