<template>
  <div
    class="flex flex-col gap-4 rounded-[2rem_0.5rem] border border-line bg-card p-4 shadow-lift sm:p-6 lg:gap-3 lg:p-5"
  >
    <!-- En-tête (mobile / tablette ; sur desktop il passe dans la barre du bas) -->
    <div class="flex items-center justify-between gap-3 lg:hidden">
      <span
        class="brand-gradient inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-sm font-bold text-white shadow-brand"
      >
        Question {{ question.question_number }}
      </span>
      <span
        class="rounded-full bg-accent-100 px-3 py-1 text-xs font-bold text-accent-800 dark:bg-accent-950 dark:text-accent-300"
      >
        {{ question.points }} pts
      </span>
    </div>

    <!-- Contenu -->
    <div class="flex flex-col gap-3">
      <!-- Image (oral et écrit) -->
      <figure v-if="question.image_url" class="-mx-4 sm:mx-0">
        <button
          type="button"
          class="group relative mx-auto block w-full cursor-zoom-in overflow-hidden sm:rounded-xl lg:w-fit"
          aria-label="Agrandir le document"
          @click="openZoom(mediaUrl(question.image_url) ?? '')"
        >
          <img
            :src="mediaUrl(question.image_url) ?? ''"
            class="mx-auto block h-auto w-full object-contain sm:rounded-xl lg:max-h-[calc(100dvh-19rem)] lg:w-auto lg:max-w-full"
            alt="Document"
          />
          <!-- Survol (desktop) -->
          <span
            class="pointer-events-none absolute right-3 top-3 hidden size-10 place-items-center rounded-full bg-primary-950/50 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 lg:grid"
          >
            <i class="pi pi-search-plus" />
          </span>
        </button>

        <!-- Agrandir (mobile / tablette) -->
        <div class="mt-2 flex justify-end px-4 sm:px-0 lg:hidden">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-line bg-card-2 px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink"
            @click="openZoom(mediaUrl(question.image_url) ?? '')"
          >
            <i class="pi pi-expand text-[0.7rem]" />
            Agrandir
          </button>
        </div>
      </figure>

      <!-- Texte (écrit, sans image) -->
      <div
        v-else-if="question.type !== 'oral' && question.question_text"
        class="whitespace-pre-wrap rounded-2xl border-l-4 border-primary bg-canvas p-5 text-base leading-relaxed text-ink sm:text-lg"
      >
        {{ question.question_text }}
      </div>

      <!-- Question posée -->
      <p
        v-if="question.asked_question"
        class="font-heading text-base font-bold leading-snug text-ink sm:text-lg lg:text-center"
      >
        {{ question.asked_question }}
      </p>

      <!-- Audio (oral) -->
      <ExamAudioPlayer
        v-if="question.type === 'oral' && question.audio_url"
        :src="mediaUrl(question.audio_url) ?? ''"
      />
    </div>

    <!-- Réponses -->
    <ExamOptions
      :question="question"
      :selected="selected"
      :disabled="submitting"
      @select="emit('select', $event)"
    />

    <!-- Navigation (desktop) -->
    <div
      class="hidden items-center justify-between gap-3 border-t border-line pt-3 lg:flex"
    >
      <AppButton
        label="Précédent"
        icon="pi pi-arrow-left"
        variant="ghost"
        :disabled="isFirst"
        @click="emit('prev')"
      />

      <div class="flex items-center gap-2">
        <span
          class="brand-gradient inline-flex items-center rounded-full px-3.5 py-1 text-sm font-bold text-white shadow-brand"
        >
          Question {{ question.question_number }}
        </span>
        <span
          class="rounded-full bg-accent-100 px-3 py-1 text-xs font-bold text-accent-800 dark:bg-accent-950 dark:text-accent-300"
        >
          {{ question.points }} pts
        </span>
        <span class="ml-1 font-heading text-sm font-bold tabular-nums text-muted">
          {{ currentIndex + 1 }} <span class="text-faint">/ {{ total }}</span>
        </span>
      </div>

      <AppButton
        v-if="!isLast"
        label="Suivant"
        icon="pi pi-arrow-right"
        icon-pos="right"
        variant="gradient"
        :loading="submitting"
        :disabled="!selected"
        @click="emit('next')"
      />
      <AppButton
        v-else
        label="Terminer"
        icon="pi pi-check"
        icon-pos="right"
        variant="gradient"
        :loading="submitting"
        :disabled="!selected"
        @click="emit('finish')"
      />
    </div>

    <!-- Visionneuse plein écran -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="zoomVisible"
          class="fixed inset-0 z-1200 flex flex-col"
          style="background-color: rgb(0 0 0 / 0.97)"
          role="dialog"
          aria-modal="true"
          aria-label="Document agrandi"
        >
          <!-- Barre d'outils -->
          <div
            class="flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 text-white sm:px-5"
          >
            <div class="flex items-center gap-1 rounded-full bg-white/10 p-1">
              <button
                type="button"
                class="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/15 disabled:opacity-40"
                aria-label="Dézoomer"
                :disabled="zoomIndex === 0"
                @click="zoomOut"
              >
                <i class="pi pi-search-minus" />
              </button>
              <span
                class="min-w-12 text-center text-xs font-semibold tabular-nums"
              >
                {{ Math.round(zoomScale * 100) }}%
              </span>
              <button
                type="button"
                class="grid size-9 place-items-center rounded-full transition-colors hover:bg-white/15 disabled:opacity-40"
                aria-label="Zoomer"
                :disabled="zoomIndex === ZOOM_STEPS.length - 1"
                @click="zoomIn"
              >
                <i class="pi pi-search-plus" />
              </button>
            </div>

            <button
              type="button"
              class="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Fermer"
              @click="closeZoom"
            >
              <i class="pi pi-times" />
            </button>
          </div>

          <!-- Image -->
          <div
            ref="viewport"
            class="flex min-h-0 flex-1 overflow-auto overscroll-contain"
            :class="
              zoomScale > 1
                ? 'cursor-grab active:cursor-grabbing'
                : 'cursor-zoom-in'
            "
            @click.self="closeZoom"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <img
              :src="zoomSrc"
              alt="Document agrandi"
              draggable="false"
              class="m-auto block shrink-0 select-none"
              :class="
                zoomScale === 1
                  ? 'max-h-full max-w-full object-contain'
                  : 'h-auto max-w-none'
              "
              :style="
                zoomScale > 1 ? { width: `${zoomScale * 100}%` } : undefined
              "
              @dblclick="toggleZoom"
            />
          </div>

          <p class="shrink-0 pb-3 text-center text-[0.7rem] text-white/50">
            Double-clic pour zoomer · Échap pour fermer
          </p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from "#shared/api/models/QuestionResponse";

defineProps<{
  question: QuestionResponse;
  selected: string | null;
  currentIndex: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  select: [key: string];
  prev: [];
  next: [];
  finish: [];
}>();

const { mediaUrl } = useMedia();

// ── Visionneuse ───────────────────────────────────────────────
const ZOOM_STEPS = [1, 1.5, 2, 3] as const;

const zoomVisible = ref(false);
const zoomSrc = ref("");
const zoomIndex = ref(0);
const zoomScale = computed<number>(() => ZOOM_STEPS[zoomIndex.value] ?? 1);
const viewport = ref<HTMLElement | null>(null);

function openZoom(src: string) {
  zoomSrc.value = src;
  zoomIndex.value = 0;
  zoomVisible.value = true;
}

function closeZoom() {
  zoomVisible.value = false;
}

function zoomIn() {
  if (zoomIndex.value < ZOOM_STEPS.length - 1) zoomIndex.value++;
}

function zoomOut() {
  if (zoomIndex.value > 0) zoomIndex.value--;
}

function toggleZoom() {
  zoomIndex.value = zoomIndex.value === 0 ? 2 : 0;
}

// Déplacement à la souris une fois zoomé (le tactile scrolle nativement)
let dragging = false;
let startX = 0;
let startY = 0;
let startLeft = 0;
let startTop = 0;

function onPointerDown(e: PointerEvent) {
  if (e.pointerType !== "mouse" || zoomScale.value === 1 || !viewport.value)
    return;
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startLeft = viewport.value.scrollLeft;
  startTop = viewport.value.scrollTop;
}

function onPointerMove(e: PointerEvent) {
  if (!dragging || !viewport.value) return;
  viewport.value.scrollLeft = startLeft - (e.clientX - startX);
  viewport.value.scrollTop = startTop - (e.clientY - startY);
}

function onPointerUp() {
  dragging = false;
}

// Échap + blocage du scroll de la page
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") closeZoom();
  if (e.key === "+" || e.key === "=") zoomIn();
  if (e.key === "-") zoomOut();
}

watch(zoomVisible, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
  if (open) window.addEventListener("keydown", onKeydown);
  else window.removeEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKeydown);
});
</script>
