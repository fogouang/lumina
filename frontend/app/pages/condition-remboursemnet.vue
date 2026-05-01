<template>
  <div class="policy-page">
    <!-- Header -->
    <div class="policy-header">
      <div class="container policy-header__inner">
        <h1 class="policy-header__title">
          Conditions Générales d'Utilisation
          <br />
          <span class="policy-header__highlight">et de Vente</span>
        </h1>
        <p class="policy-header__date">
          Plateforme <strong>Lumina TCF</strong>
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="container policy-body">
      <div class="policy-card">
        <div
          v-for="(section, index) in sections"
          :key="index"
          class="policy-section"
        >
          <h2 class="policy-section__title">{{ section.title }}</h2>

          <p v-if="section.intro" class="policy-section__text">
            {{ section.intro }}
          </p>

          <ul v-if="section.items" class="policy-section__list">
            <li
              v-for="(item, i) in section.items"
              :key="i"
              class="policy-section__item"
            >
              <i class="pi pi-check-circle policy-section__item-icon" />
              <span v-html="item" />
            </li>
          </ul>

          <!-- Warning box -->
          <div v-if="section.warning" class="policy-warning">
            <i class="pi pi-exclamation-triangle policy-warning__icon" />
            <p class="policy-warning__text">{{ section.warning }}</p>
          </div>

          <p v-if="section.outro" class="policy-section__text mt-3">
            {{ section.outro }}
          </p>
        </div>

        <!-- Contact -->
        <div class="policy-contact">
          <Divider />
          <h2 class="policy-section__title">16. Contact</h2>
          <p class="policy-section__text">
            Pour toute question relative aux présentes Conditions, vous pouvez
            nous contacter :
          </p>
          <div class="policy-contact__links">
            <a href="mailto:contact@luminatcf.com" class="policy-contact__link">
              <i class="pi pi-envelope" />
              <span>contact@luminatcf.online</span>
            </a>
            <a href="tel:+237691850913" class="policy-contact__link">
              <i class="pi pi-phone" />
              <span>+237 691 85 09 13</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sections = [
  {
    title: "1. Objet",
    intro:
      "Les présentes Conditions Générales régissent l'accès et l'utilisation de la plateforme Lumina, ainsi que les modalités de souscription aux services proposés. Toute utilisation du Service implique l'acceptation sans réserve des présentes conditions.",
  },
  {
    title: "2. Définitions",
    items: [
      "<strong>Plateforme / Société :</strong> Lumina",
      "<strong>Service :</strong> plateforme de formation en ligne accessible via le site",
      "<strong>Utilisateur :</strong> toute personne accédant au Service",
      "<strong>Abonnement :</strong> accès payant aux contenus et fonctionnalités",
      "<strong>Contenus :</strong> cours, vidéos, exercices, supports pédagogiques",
    ],
  },
  {
    title: "3. Accès au service",
    intro:
      "L'accès au Service est réservé aux utilisateurs disposant d'un compte personnel. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.",
  },
  {
    title: "4. Conditions d'inscription",
    items: [
      "L'inscription est ouverte aux personnes âgées d'au moins 16 ans",
      "Un seul compte par utilisateur est autorisé",
      "Le partage de compte est strictement interdit",
    ],
  },
  {
    title: "5. Description des services",
    intro:
      "La plateforme propose des contenus pédagogiques numériques accessibles :",
    items: [
      "Via une version gratuite (si applicable)",
      "Via des abonnements payants donnant accès à des contenus premium",
    ],
    outro: "Les contenus sont fournis à titre pédagogique et peuvent évoluer.",
  },
  {
    title: "6. Abonnements et paiements",
    items: [
      "Les abonnements sont facturés selon les tarifs affichés",
      "Le paiement est exigible à la souscription",
      "Les moyens de paiement acceptés sont indiqués sur la plateforme",
      "Toute souscription donne accès immédiat au Service",
    ],
  },
  {
    title: "7. Droit de rétractation et remboursement",
    intro:
      "Les conditions de rétractation et de remboursement sont définies dans une page dédiée : Politique de remboursement et d'annulation.",
    outro:
      "En validant le paiement, l'utilisateur reconnaît que l'exécution du service commence immédiatement.",
  },
  {
    title: "8. Utilisation autorisée",
    intro: "L'utilisateur s'engage à :",
    items: [
      "Utiliser le Service à des fins personnelles et légales",
      "Ne pas copier, revendre ou diffuser les contenus",
      "Respecter les règles de bonne conduite sur la plateforme",
    ],
  },
  {
    title: "9. Interdictions",
    intro: "Il est strictement interdit :",
    items: [
      "De partager ou vendre l'accès à son compte",
      "De tenter de contourner les systèmes de sécurité",
      "D'utiliser le Service à des fins frauduleuses",
      "De porter atteinte aux droits de la plateforme ou des autres utilisateurs",
    ],
    warning:
      "⚠️ Toute violation peut entraîner la suspension ou la suppression du compte, sans remboursement.",
  },
  {
    title: "10. Propriété intellectuelle",
    intro:
      "L'ensemble des contenus présents sur la plateforme est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction ou exploitation non autorisée est interdite.",
  },
  {
    title: "11. Responsabilité",
    intro:
      "La plateforme s'efforce d'assurer un accès continu au Service, mais ne garantit pas l'absence d'interruptions ou d'erreurs. La responsabilité de la Société ne saurait être engagée en cas de :",
    items: [
      "Panne technique",
      "Force majeure",
      "Mauvaise utilisation du Service par l'utilisateur",
    ],
  },
  {
    title: "12. Données personnelles",
    intro:
      "Les données personnelles sont traitées conformément à la Politique de confidentialité disponible sur le site.",
  },
  {
    title: "13. Suspension et résiliation",
    intro:
      "La Société se réserve le droit de suspendre ou résilier un compte :",
    items: [
      "En cas de non-respect des présentes conditions",
      "En cas d'activité frauduleuse",
      "Sans préavis si nécessaire",
    ],
  },
  {
    title: "14. Modification des conditions",
    intro:
      "La Société peut modifier les présentes Conditions à tout moment. Les nouvelles versions s'appliquent dès leur publication sur le site.",
  },
  {
    title: "15. Droit applicable et juridiction",
    intro:
      "Les présentes Conditions sont régies par le droit camerounais. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.",
  },
];

useHead({ title: "Conditions Générales | Lumina TCF" });
</script>

<style scoped>
.policy-page {
  min-height: 100vh;
  background: var(--bg-ground);
}

.policy-header {
  background: var(--gradient-primary);
  padding: 4rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.policy-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.policy-header__inner {
  position: relative;
  z-index: 1;
}

.policy-header__title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.75rem;
  line-height: 1.2;
}

.policy-header__highlight {
  color: rgba(255, 255, 255, 0.75);
}

.policy-header__date {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

.policy-body {
  padding: 3rem 1.5rem 5rem;
}

.policy-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 3rem;
  max-width: 860px;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.policy-section {
  margin-bottom: 2.5rem;
  animation: fadeUp 0.4s ease both;
}

.policy-section + .policy-section {
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.policy-section:nth-child(1) {
  animation-delay: 0.05s;
}
.policy-section:nth-child(2) {
  animation-delay: 0.1s;
}
.policy-section:nth-child(3) {
  animation-delay: 0.15s;
}
.policy-section:nth-child(4) {
  animation-delay: 0.2s;
}
.policy-section:nth-child(5) {
  animation-delay: 0.25s;
}
.policy-section:nth-child(6) {
  animation-delay: 0.3s;
}
.policy-section:nth-child(7) {
  animation-delay: 0.35s;
}
.policy-section:nth-child(8) {
  animation-delay: 0.4s;
}
.policy-section:nth-child(9) {
  animation-delay: 0.45s;
}
.policy-section:nth-child(10) {
  animation-delay: 0.5s;
}
.policy-section:nth-child(11) {
  animation-delay: 0.55s;
}
.policy-section:nth-child(12) {
  animation-delay: 0.6s;
}
.policy-section:nth-child(13) {
  animation-delay: 0.65s;
}
.policy-section:nth-child(14) {
  animation-delay: 0.7s;
}
.policy-section:nth-child(15) {
  animation-delay: 0.75s;
}

.policy-section__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.policy-section__text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0 0 0.75rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.policy-section__list {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.policy-section__item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.policy-section__item-icon {
  color: var(--color-primary-500);
  font-size: 0.875rem;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

/* Warning */
.policy-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 0 0.5rem 0.5rem 0;
}

.policy-warning__icon {
  color: #d97706;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.policy-warning__text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #92400e;
  margin: 0;
  line-height: 1.6;
}

/* Contact */
.policy-contact {
  margin-top: 2rem;
  animation: fadeUp 0.4s 0.8s ease both;
}

.policy-contact__links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.policy-contact__link {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s ease;
}

.policy-contact__link:hover {
  background: var(--color-primary-100);
}

@media (max-width: 768px) {
  .policy-card {
    padding: 1.5rem;
  }
  .policy-contact__links {
    flex-direction: column;
  }
}
</style>
