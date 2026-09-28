<script setup lang="ts">
import type { LegalSection } from "~/types/legal";
import { site } from "~/config/site";

definePageMeta({ navbarOverlay: true });

const sections: LegalSection[] = [
  {
    title: "1. Introduction",
    intro: `La présente Politique de confidentialité décrit la manière dont ${site.name} collecte, utilise, protège et traite les données personnelles des utilisateurs lorsqu'ils accèdent à notre plateforme de formation en ligne. En utilisant notre site et nos services, vous acceptez les pratiques décrites dans la présente politique.`,
  },
  {
    title: "2. Définitions",
    items: [
      `<strong>Plateforme / Société :</strong> désigne ${site.name}.`,
      `<strong>Service :</strong> désigne ${site.name} accessible via le site web.`,
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
    outro: "Toute demande peut être adressée via les coordonnées indiquées ci-dessous.",
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

useHead({ title: `Politique de confidentialité | ${site.name}` });
</script>

<template>
  <LegalDocument
    title="Politique de"
    highlight="confidentialité"
    subtitle="Dernière mise à jour : Janvier 2026"
    :sections="sections"
    contact-intro="Pour toute question relative à cette Politique de confidentialité ou à vos données personnelles, vous pouvez nous contacter :"
  />
</template>