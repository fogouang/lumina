<template>
  <section class="section section--white">
    <div class="container">
      <!-- Header -->
      <div class="section-header">
        <Tag value="Les épreuves" severity="success" />
        <h2 class="section-title">Les 4 épreuves du TCF Canada</h2>
        <p class="section-subtitle">
          Entraînez-vous module par module avec nos simulateurs spécialisés en
          conditions réelles.
        </p>
      </div>

      <!-- Grid -->
      <div class="epreuves__grid">
        <NuxtLink
          v-for="epreuve in epreuves"
          :key="epreuve.slug"
          :to="epreuve.path"
          class="epreuve-card"
        >
          <!-- Icône -->
          <div
            class="epreuve-card__icon"
            :style="{ background: epreuve.iconBg }"
          >
            <i :class="epreuve.icon" :style="{ color: epreuve.iconColor }" />
          </div>

          <!-- Contenu -->
          <div class="epreuve-card__body">
            <h3 class="epreuve-card__title">{{ epreuve.title }}</h3>
            <p class="epreuve-card__desc">{{ epreuve.desc }}</p>
            <div class="epreuve-card__meta">
              <span>
                <i class="pi pi-list" />
                {{ epreuve.questions }}
              </span>
              <span>
                <i class="pi pi-clock" />
                {{ epreuve.duration }}
              </span>
            </div>
          </div>

          <!-- CTA -->
          <div class="epreuve-card__footer">
            <span class="epreuve-card__cta">
              Commencer
              <i class="pi pi-arrow-right" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const epreuves = [
  {
    slug: "co",
    title: "Compréhension orale",
    desc: "Écoutez des documents audio variés et répondez aux questions de compréhension.",
    icon: "pi pi-headphones",
    iconColor: "#0d9488",
    iconBg: "#f0fdfa",
    questions: "39 questions",
    duration: "35 minutes",
    path: "/epreuve/comprehension-orale",
  },
  {
    slug: "ce",
    title: "Compréhension écrite",
    desc: "Lisez des textes authentiques et répondez aux questions de compréhension.",
    icon: "pi pi-book",
    iconColor: "#1d4ed8",
    iconBg: "#eff6ff",
    questions: "39 questions",
    duration: "60 minutes",
    path: "/epreuve/comprehension-ecrite",
  },
  {
    slug: "eo",
    title: "Expression orale",
    desc: "Exprimez-vous oralement sur des sujets d'actualité avec nos sujets guidés.",
    icon: "pi pi-microphone",
    iconColor: "#d97706",
    iconBg: "#fffbeb",
    questions: "3 tâches",
    duration: "12 minutes",
    path: "/epreuve/expression-orale",
  },
  {
    slug: "ee",
    title: "Expression écrite",
    desc: "Rédigez des textes de différents types et obtenez une correction IA détaillée.",
    icon: "pi pi-pen-to-square",
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    questions: "3 tâches",
    duration: "60 minutes",
    path: "/epreuve/expression-ecrite",
  },
];
</script>

<style scoped>
.epreuves__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

/* ── Card ──────────────────────────────────────────────────── */
.epreuve-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.25s ease;
}

.epreuve-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-300);
}

/* ── Icône ─────────────────────────────────────────────────── */
.epreuve-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.epreuve-card__icon i {
  font-size: 1.375rem;
}

/* ── Body ──────────────────────────────────────────────────── */
.epreuve-card__body {
  flex: 1;
}

.epreuve-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.375rem;
}

.epreuve-card__desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 0.875rem;
}

.epreuve-card__meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.epreuve-card__meta i {
  margin-right: 0.25rem;
  font-size: 0.75rem;
}

/* ── Footer ────────────────────────────────────────────────── */
.epreuve-card__footer {
  padding-top: 0.875rem;
  border-top: 1px solid var(--border-color);
}

.epreuve-card__cta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-600);
  transition: gap 0.2s ease;
}

.epreuve-card:hover .epreuve-card__cta {
  gap: 0.625rem;
}

.epreuve-card__cta i {
  font-size: 0.75rem;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .epreuves__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .epreuves__grid {
    grid-template-columns: 1fr;
  }
}
</style>
