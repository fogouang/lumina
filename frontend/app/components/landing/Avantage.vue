<template>
  <section class="section section--red">
    <div class="container">

      <!-- Header -->
      <div class="section-header">
        <Tag value="Pourquoi Lumina" severity="warning" />
        <h2 class="section-title avantages__title">Tout pour réussir, rien de superflu</h2>
        <p class="section-subtitle avantages__subtitle">
          Des outils pensés pour maximiser votre progression en un minimum de temps.
        </p>
      </div>

      <!-- Grid -->
      <div class="avantages__grid">
        <div
          v-for="item in avantages"
          :key="item.title"
          class="avantage-card"
        >
          <div class="avantage-card__icon">
            <i :class="item.icon" />
          </div>
          <h3 class="avantage-card__title">{{ item.title }}</h3>
          <p class="avantage-card__desc">{{ item.desc }}</p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
const avantages = [
  {
    icon: 'pi pi-chart-line',
    title: 'Suivi de progression',
    desc: 'Analysez vos performances en temps réel et identifiez précisément vos points à améliorer.',
  },
  {
    icon: 'pi pi-sparkles',
    title: 'Simulateur IA',
    desc: 'Correction automatique de vos textes selon les critères officiels du TCF Canada.',
  },
  {
    icon: 'pi pi-refresh',
    title: 'Version 2026',
    desc: "Contenus régulièrement mis à jour conformément aux dernières évolutions de l'examen.",
  },
  {
    icon: 'pi pi-verified',
    title: 'Conditions réelles',
    desc: "Simulez l'examen avec le même format, la même durée et le même niveau de difficulté.",
  },
  {
    icon: 'pi pi-clock',
    title: 'Accès 24h/24',
    desc: "Révisez à votre rythme, depuis n'importe quel appareil, où que vous soyez.",
  },
  {
    icon: 'pi pi-users',
    title: 'Communauté active',
    desc: 'Rejoignez des milliers de candidats et partagez vos expériences de préparation.',
  },
]
</script>

<style scoped>
.avantages__title {
  color: #ffffff !important;
}

.avantages__subtitle {
  color: rgba(255, 255, 255, 0.75) !important;
}

.avantages__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.avantage-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  padding: 1.75rem 1.5rem;
  transition: background 0.25s ease;
}

.avantage-card:hover {
  background: rgba(255, 255, 255, 0.13);
}

.avantage-card__icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.avantage-card__icon i {
  font-size: 1.25rem;
  color: #ffffff;
}

.avantage-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem;
}

.avantage-card__desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.65;
  margin: 0;
}

@media (max-width: 1024px) {
  .avantages__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .avantages__grid { grid-template-columns: 1fr; }
}
</style>