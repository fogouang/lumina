<template>
  <section class="hero">
    <!-- Background -->
    <div class="hero__bg">
      <img src="/images/hero-bg1.jpg" alt="" class="hero__bg-img" />
      <div class="hero__bg-grid" />
      <div class="hero__bg-overlay" />
    </div>

    <!-- Content -->
    <div class="container hero__inner">
      <div class="hero__grid">
        <!-- Colonne gauche -->
        <div class="hero__content">
          <!-- Badge -->
          <div class="hero__badge anim-fade-up">
            <i class="pi pi-verified" />
            <span>Plateforme #1 de préparation au TCF Canada</span>
          </div>

          <!-- Titre -->
          <div class="hero__headline anim-fade-up anim-delay-200">
            <h1 class="hero__title">
              Réussissez votre
              <span class="hero__title-accent">TCF Canada</span>
              avec confiance
            </h1>
            <p class="hero__subtitle">
              Simulations en conditions réelles, correction IA instantanée et
              suivi de progression personnalisé. Tout ce dont vous avez besoin
              pour obtenir le score visé.
            </p>
          </div>

          <!-- CTAs -->
          <div class="hero__actions anim-fade-up anim-delay-300">
            <NuxtLink to="/tarifs">
              <Button
                label="Voir les formules"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="large"
                class="hero__btn-primary"
              />
            </NuxtLink>
            <NuxtLink to="/expression-ecrite">
              <Button
                label="Voir les sujets"
                icon="pi pi-book"
                outlined
                size="large"
                class="hero__btn-outline"
              />
            </NuxtLink>
          </div>

          <!-- Stats -->
          <div class="hero__stats anim-fade-up anim-delay-300">
            <p class="hero__stats-label">
              Utilisé par des milliers de candidats
            </p>
            <div class="hero__stats-grid">
              <div class="hero__stat anim-scale-in anim-delay-300">
                <span class="hero__stat-value">3K+</span>
                <span class="hero__stat-label">Candidats</span>
              </div>
              <div class="hero__stat anim-scale-in anim-delay-300">
                <span class="hero__stat-value">4</span>
                <span class="hero__stat-label">Modules</span>
              </div>
              <div class="hero__stat anim-scale-in anim-delay-300">
                <span class="hero__stat-value">10K+</span>
                <span class="hero__stat-label">Tests réalisés</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite — image flottante -->
        <div class="hero__visual anim-fade-right">
          <img
            src="/images/hero2.jpg"
            alt="Candidat TCF Canada"
            class="hero__visual-img"
          />
        </div>
      </div>
    </div>

    <!-- Wave bas -->
    <div class="hero__wave">
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
          fill="var(--bg-section)"
        />
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────── */
.hero {
  position: relative;
  overflow: hidden;
  min-height: 600px;
  display: flex;
  align-items: center;
}

/* ── Background ────────────────────────────────────────────── */
.hero__bg {
  position: absolute;
  inset: 0;
}

.hero__bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 30px 30px;
}

.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(227, 24, 55, 0.9) 0%,
    rgba(168, 13, 38, 0.85) 50%,
    rgba(10, 10, 20, 0.8) 100%
  );
}

/* ── Inner ─────────────────────────────────────────────────── */
.hero__inner {
  position: relative;
  z-index: 2;
  padding-top: 5rem;
  padding-bottom: 7rem;
  width: 100%;
}

.hero__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

/* ── Contenu ───────────────────────────────────────────────── */
.hero__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Badge */
.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  width: fit-content;
}

.hero__badge i {
  font-size: 0.875rem;
}

/* Titre */
.hero__title {
  font-size: clamp(2rem, 4vw, 3.25rem);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.15;
  margin: 0 0 1rem;
}

.hero__title-accent {
  display: block;
  background: linear-gradient(
    to right,
    var(--color-secondary-400),
    var(--color-secondary-600)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__subtitle {
  font-size: 1.0625rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.75;
  margin: 0;
}

/* Boutons */
.hero__actions {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.hero__btn-primary {
  background: #ffffff !important;
  color: var(--color-primary-800) !important;
  border: none !important;
  font-weight: 700 !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.25s ease !important;
}

.hero__btn-primary:hover {
  background: var(--color-primary-50) !important;
  transform: translateY(-2px) !important;
}

.hero__btn-outline {
  border: 2px solid rgba(255, 255, 255, 0.7) !important;
  color: #ffffff !important;
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
  backdrop-filter: blur(4px) !important;
  transition: all 0.25s ease !important;
}

.hero__btn-outline:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px) !important;
}

/* Stats */
.hero__stats {
  padding-top: 1.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.hero__stats-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 1rem;
}

.hero__stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hero__stat-value {
  font-size: 1.875rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}

.hero__stat-label {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.65);
}

/* ── Visual ────────────────────────────────────────────────── */
.hero__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero__visual-img {
  width: 100%;
  max-width: 480px;
  object-fit: cover;
  border-radius: 24px;
  animation: float 4s ease-in-out infinite;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.15),
    0 24px 48px rgba(0,0,0,0.25),
    0 48px 80px rgba(0,0,0,0.2);
  transform-style: preserve-3d;
  perspective: 1000px;
  transform: perspective(1000px) rotateY(-8deg) rotateX(4deg);
  transition: transform 0.4s ease;
}

.hero__visual-img:hover {
  transform: perspective(1000px) rotateY(-4deg) rotateX(2deg) scale(1.02);
}

.hero__visual {
  perspective: 1200px;
  transform-style: preserve-3d;
}

.hero__visual-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.5;
  pointer-events: none;
}

.hero__visual-glow--amber {
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, var(--color-secondary-400), transparent);
  top: -1rem;
  right: -1rem;
  animation: pulse 3s ease-in-out infinite;
}

.hero__visual-glow--teal {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, var(--color-primary-400), transparent);
  bottom: -1rem;
  left: -1rem;
  animation: pulse 3s ease-in-out infinite 1.5s;
}

/* ── Wave ──────────────────────────────────────────────────── */
.hero__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.hero__wave svg {
  width: 100%;
  display: block;
}

/* ── Animations ────────────────────────────────────────────── */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

.anim-fade-right {
  animation: fadeInRight 1s ease-out both;
  animation-delay: 0.5s;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .hero__visual {
    display: none;
  }
  .hero__grid {
    grid-template-columns: 1fr;
  }
  .hero__content {
    text-align: center;
  }
  .hero__badge {
    margin: 0 auto;
  }
  .hero__actions {
    justify-content: center;
  }
  .hero__stats {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero__stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .hero__stat-value {
    font-size: 1.5rem;
  }
}
</style>
