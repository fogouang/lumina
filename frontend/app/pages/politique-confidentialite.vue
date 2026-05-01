<template>
  <div class="policy-page">
    <!-- Header -->
    <div class="policy-header">
      <div class="container policy-header__inner">
        <h1 class="policy-header__title">
          Politique de
          <span class="policy-header__highlight">confidentialité</span>
        </h1>
        <p class="policy-header__date">Dernière mise à jour : Janvier 2026</p>
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

          <p
            v-if="section.outro"
            class="policy-section__text policy-section__text--bold"
          >
            {{ section.outro }}
          </p>

          <!-- Sous-sections -->
          <div
            v-for="(sub, si) in section.subs"
            :key="si"
            class="policy-subsection"
          >
            <h3 class="policy-subsection__title">{{ sub.title }}</h3>
            <ul class="policy-section__list">
              <li
                v-for="(item, ii) in sub.items"
                :key="ii"
                class="policy-section__item"
              >
                <i class="pi pi-check-circle policy-section__item-icon" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Contact -->
        <div class="policy-contact">
          <Divider />
          <h2 class="policy-section__title">12. Contact</h2>
          <p class="policy-section__text">
            Pour toute question relative à cette Politique de confidentialité ou
            à vos données personnelles, vous pouvez nous contacter :
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
    title: "1. Introduction",
    intro:
      "La présente Politique de confidentialité décrit la manière dont notre Lumina collecte, utilise, protège et traite les données personnelles des utilisateurs lorsqu'ils accèdent à notre plateforme de formation en ligne. En utilisant notre site et nos services, vous acceptez les pratiques décrites dans la présente politique.",
  },
  {
    title: "2. Définitions",
    items: [
      "<strong>Plateforme / Société :</strong> désigne Lumina",
      "<strong>Service :</strong> désigne Lumina accessible via le site web.",
      "<strong>Utilisateur :</strong> désigne toute personne accédant ou utilisant le Service.",
      "<strong>Données personnelles :</strong> toute information permettant d'identifier directement ou indirectement un utilisateur.",
    ],
  },
  {
    title: "3. Données collectées",
    subs: [
      {
        title: "3.1 Données fournies par l'utilisateur",
        items: [
          "Nom et prénom",
          "Adresse e-mail",
          "Numéro de téléphone",
          "Informations de connexion (identifiant, mot de passe chiffré)",
          "Informations liées aux abonnements et paiements",
        ],
      },
      {
        title: "3.2 Données collectées automatiquement",
        items: [
          "Adresse IP",
          "Type d'appareil et de navigateur",
          "Pages visitées",
          "Durée des sessions",
          "Données de navigation et de performance",
        ],
      },
    ],
  },
  {
    title: "4. Utilisation des données",
    intro: "Les données collectées sont utilisées pour :",
    items: [
      "Fournir et maintenir le Service",
      "Gérer les comptes utilisateurs",
      "Traiter les abonnements et paiements",
      "Améliorer l'expérience utilisateur",
      "Assurer la sécurité de la plateforme",
      "Communiquer avec les utilisateurs",
      "Respecter les obligations légales et réglementaires",
    ],
  },
  {
    title: "5. Cookies et technologies similaires",
    intro:
      "La plateforme peut utiliser des cookies et technologies similaires afin de garantir le bon fonctionnement du site, analyser l'utilisation du Service et améliorer les performances et le contenu. L'utilisateur peut configurer son navigateur pour refuser les cookies. Toutefois, certaines fonctionnalités du site peuvent être limitées.",
  },
  {
    title: "6. Partage des données",
    intro: "Les données personnelles peuvent être partagées uniquement avec :",
    items: [
      "Des prestataires techniques (hébergement, paiement, emailing)",
      "Des partenaires strictement nécessaires au fonctionnement du Service",
      "Les autorités compétentes lorsque la loi l'exige",
    ],
    outro: "Aucune donnée personnelle n'est vendue à des tiers.",
  },
  {
    title: "7. Conservation des données",
    intro:
      "Les données personnelles sont conservées uniquement pendant la durée nécessaire à la fourniture du Service, au respect des obligations légales et à la gestion des relations contractuelles.",
  },
  {
    title: "8. Sécurité des données",
    intro:
      "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données personnelles contre l'accès non autorisé, la perte, l'altération ou la divulgation. Cependant, aucun système de transmission ou de stockage électronique n'est totalement sécurisé.",
  },
  {
    title: "9. Droits des utilisateurs",
    intro:
      "Conformément à la législation applicable, l'utilisateur dispose notamment des droits suivants :",
    items: [
      "Droit d'accès à ses données",
      "Droit de rectification",
      "Droit de suppression",
      "Droit d'opposition ou de limitation du traitement",
    ],
    outro:
      "Toute demande peut être adressée via les coordonnées indiquées ci-dessous.",
  },
  {
    title: "10. Confidentialité des mineurs",
    intro:
      "Le Service n'est pas destiné aux personnes âgées de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles concernant des mineurs.",
  },
  {
    title: "11. Modification de la politique",
    intro:
      "Nous nous réservons le droit de modifier la présente Politique de confidentialité à tout moment. Les modifications prennent effet dès leur publication sur le site. La date de mise à jour sera indiquée en haut de la page.",
  },
];

useHead({ title: "Politique de confidentialité | Lumina TCF" });
</script>

<style scoped>
/* ── Page ──────────────────────────────────────────────────── */
.policy-page {
  min-height: 100vh;
  background: var(--bg-ground);
}

/* ── Header ────────────────────────────────────────────────── */
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
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.75rem;
}

.policy-header__highlight {
  color: rgba(255, 255, 255, 0.75);
}

.policy-header__date {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* ── Body ──────────────────────────────────────────────────── */
.policy-body {
  padding: 3rem 1.5rem 5rem;
}

/* ── Card ──────────────────────────────────────────────────── */
.policy-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 3rem;
  max-width: 860px;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* ── Section ───────────────────────────────────────────────── */
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

.policy-section__text--bold {
  font-weight: 600;
  color: var(--text-primary);
}

/* ── List ──────────────────────────────────────────────────── */
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

/* ── Subsection ────────────────────────────────────────────── */
.policy-subsection {
  margin-top: 1.25rem;
}

.policy-subsection__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

/* ── Contact ───────────────────────────────────────────────── */
.policy-contact {
  margin-top: 2rem;
  animation: fadeUp 0.4s 0.6s ease both;
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

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 768px) {
  .policy-card {
    padding: 1.5rem;
  }

  .policy-contact__links {
    flex-direction: column;
  }
}
</style>
