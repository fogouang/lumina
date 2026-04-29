<template>
  <div v-if="epreuve">

    <!-- ── Hero ─────────────────────────────────────────────── -->
    <section class="epreuve-hero">
      <div class="container epreuve-hero__inner">

        <div class="epreuve-hero__icon" :style="{ background: epreuve.iconBg }">
          <i :class="epreuve.icon" :style="{ color: epreuve.iconColor }" />
        </div>

        <h1 class="epreuve-hero__title">{{ epreuve.title }} TCF Canada</h1>
        <p class="epreuve-hero__desc">{{ epreuve.description }}</p>

        <div class="epreuve-hero__ctas">
          <NuxtLink v-for="cta in epreuve.ctas" :key="cta.to" :to="cta.to">
            <Button
              :label="cta.label"
              :icon="cta.icon"
              :outlined="cta.outlined"
              size="large"
              :class="cta.outlined ? 'epreuve-hero__btn--outline' : 'epreuve-hero__btn--primary'"
            />
          </NuxtLink>
        </div>

      </div>

      <!-- Wave -->
      <div class="epreuve-hero__wave">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0 80L60 72C120 64 240 48 360 42.7C480 37 600 43 720 48C840 53 960 59 1080 58.7C1200 59 1320 53 1380 50.7L1440 48V80H0Z"
            fill="var(--bg-ground)"
          />
        </svg>
      </div>
    </section>

    <!-- ── Format ─────────────────────────────────────────────── -->
    <section class="section section--light">
      <div class="container">
        <div class="format-grid">
          <div v-for="stat in epreuve.format" :key="stat.label" class="format-card">
            <div class="format-card__icon">
              <i :class="stat.icon" />
            </div>
            <span class="format-card__value">{{ stat.value }}</span>
            <span class="format-card__label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Ce que vous apprendrez ────────────────────────────── -->
    <section class="section section--white">
      <div class="container">
        <div class="section-header">
          <Tag value="Objectifs" severity="success" />
          <h2 class="section-title">Ce que vous apprendrez</h2>
        </div>
        <div class="apprentissage-grid">
          <div
            v-for="item in epreuve.apprentissages"
            :key="item.title"
            class="apprentissage-card"
          >
            <div class="apprentissage-card__icon">
              <i :class="item.icon" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Structure du programme ────────────────────────────── -->
    <section class="section section--teal">
      <div class="container">
        <div class="section-header">
          <Tag value="Programme" severity="warning" />
          <h2 class="section-title" style="color:#fff;">Structure du programme</h2>
          <p class="section-subtitle" style="color:rgba(255,255,255,0.75);">
            Un programme complet pour vous préparer efficacement à l'épreuve.
          </p>
        </div>
        <div class="programme-grid">
          <div
            v-for="item in epreuve.programme"
            :key="item.title"
            class="programme-card"
          >
            <div class="programme-card__icon">
              <i :class="item.icon" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Tâches détaillées (EE & EO) ──────────────────────── -->
    <section v-if="epreuve.taches" class="section section--light">
      <div class="container">
        <div class="section-header">
          <Tag value="Détail" severity="success" />
          <h2 class="section-title">Les {{ epreuve.taches.length }} tâches de l'épreuve</h2>
          <p class="section-subtitle">
            Découvrez en détail chaque tâche et ce qui est attendu.
          </p>
        </div>

        <div class="taches-list">
          <div
            v-for="tache in epreuve.taches"
            :key="tache.numero"
            class="tache-card"
          >
            <div class="tache-card__numero">{{ tache.numero }}</div>
            <div class="tache-card__body">
              <div class="tache-card__header">
                <h3 class="tache-card__title">{{ tache.title }}</h3>
                <div class="tache-card__meta">
                  <span><i class="pi pi-tag" /> {{ tache.niveau }}</span>
                  <span><i class="pi pi-align-left" /> {{ tache.longueur }}</span>
                  <span><i class="pi pi-clock" /> {{ tache.temps }}</span>
                </div>
              </div>
              <p class="tache-card__desc">{{ tache.desc }}</p>
              <div class="tache-card__exemples">
                <p class="tache-card__exemples-label">Exemples :</p>
                <ul>
                  <li v-for="ex in tache.exemples" :key="ex">{{ ex }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA Final ─────────────────────────────────────────── -->
    <section class="section section--white">
      <div class="container">
        <div class="cta-final">
          <h2 class="cta-final__title">
            Prêt à maîtriser l'{{ epreuve.title.toLowerCase() }} ?
          </h2>
          <p class="cta-final__sub">
            Rejoignez des milliers de candidats qui se préparent avec Lumina TCF.
          </p>
          <div class="cta-final__actions">
            <NuxtLink :to="epreuve.ctaFinal.to">
              <Button
                :label="epreuve.ctaFinal.label"
                :icon="epreuve.ctaFinal.icon"
                size="large"
                class="cta-final__btn"
              />
            </NuxtLink>
            <NuxtLink to="/tarifs">
              <Button
                label="Voir les formules"
                icon="pi pi-dollar"
                size="large"
                outlined
                class="cta-final__btn--outline"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

  </div>

  <!-- 404 -->
  <div v-else class="container" style="padding: 5rem 1.5rem; text-align:center;">
    <h2>Épreuve introuvable.</h2>
    <NuxtLink to="/"><Button label="Retour à l'accueil" icon="pi pi-home" /></NuxtLink>
  </div>
</template>

<script setup>
import { useEpreuve } from '~/composables/useEpreuve'

const route = useRoute()
const { epreuve } = useEpreuve(route.params.slug)

useHead({
  title: epreuve ? `${epreuve.title} TCF Canada | Lumina` : 'Épreuve | Lumina',
  meta: [
    {
      name: 'description',
      content: epreuve?.description ?? '',
    },
  ],
})
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────────── */
.epreuve-hero {
  position: relative;
  background: var(--gradient-primary);
  padding: 4rem 0 6rem;
  text-align: center;
}

.epreuve-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.epreuve-hero__icon {
  width: 72px;
  height: 72px;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.epreuve-hero__icon i {
  font-size: 2rem;
}

.epreuve-hero__title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.epreuve-hero__desc {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.75;
  max-width: 620px;
  margin: 0;
}

.epreuve-hero__ctas {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
  justify-content: center;
}

.epreuve-hero__btn--primary {
  background: #ffffff !important;
  color: var(--color-primary-800) !important;
  border: none !important;
  font-weight: 700 !important;
  border-radius: 0.75rem !important;
}

.epreuve-hero__btn--primary:hover {
  background: var(--color-primary-50) !important;
}

.epreuve-hero__btn--outline {
  border: 2px solid rgba(255, 255, 255, 0.6) !important;
  color: #ffffff !important;
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
}

.epreuve-hero__btn--outline:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.epreuve-hero__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.epreuve-hero__wave svg {
  width: 100%;
  display: block;
}

/* ── Format stats ──────────────────────────────────────────── */
.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  max-width: 640px;
  margin: 0 auto;
}

.format-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.75rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.format-card__icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-50);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.format-card__icon i {
  font-size: 1.125rem;
  color: var(--color-primary-600);
}

.format-card__value {
  font-size: 1.625rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.format-card__label {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ── Apprentissages ────────────────────────────────────────── */
.apprentissage-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.apprentissage-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
}

.apprentissage-card__icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-50);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.apprentissage-card__icon i {
  font-size: 1.125rem;
  color: var(--color-primary-600);
}

.apprentissage-card h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.apprentissage-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* ── Programme ─────────────────────────────────────────────── */
.programme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.programme-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: background 0.25s ease;
}

.programme-card:hover {
  background: rgba(255, 255, 255, 0.13);
}

.programme-card__icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.programme-card__icon i {
  font-size: 1.125rem;
  color: var(--color-secondary-400);
}

.programme-card h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem;
}

.programme-card p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.6;
  margin: 0;
}

/* ── Tâches ────────────────────────────────────────────────── */
.taches-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.tache-card {
  display: flex;
  gap: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.75rem;
  transition: all 0.25s ease;
}

.tache-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
  border-color: var(--color-primary-300);
}

.tache-card__numero {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: #ffffff;
  font-size: 1.125rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tache-card__body {
  flex: 1;
}

.tache-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.tache-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.tache-card__meta {
  display: flex;
  gap: 0.875rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  flex-wrap: wrap;
}

.tache-card__meta i {
  margin-right: 0.25rem;
  font-size: 0.75rem;
}

.tache-card__desc {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 1rem;
}

.tache-card__exemples-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tache-card__exemples ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.tache-card__exemples ul li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding-left: 1rem;
  position: relative;
}

.tache-card__exemples ul li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-primary-500);
}

/* ── CTA Final ─────────────────────────────────────────────── */
.cta-final {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  max-width: 640px;
  margin: 0 auto;
}

.cta-final__title {
  font-size: clamp(1.375rem, 3vw, 1.875rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.cta-final__sub {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.cta-final__actions {
  display: flex;
  gap: 0.875rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-final__btn {
  background: var(--gradient-primary) !important;
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

.cta-final__btn--outline {
  border-color: var(--color-primary-600) !important;
  color: var(--color-primary-600) !important;
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .apprentissage-grid { grid-template-columns: repeat(2, 1fr); }
  .programme-grid     { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .apprentissage-grid { grid-template-columns: 1fr; }
  .programme-grid     { grid-template-columns: 1fr; }
  .format-grid        { grid-template-columns: repeat(3, 1fr); }
  .tache-card         { flex-direction: column; }
  .tache-card__header { flex-direction: column; }
}
</style>