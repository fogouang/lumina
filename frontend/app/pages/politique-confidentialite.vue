<script setup lang="ts">
import type { LegalSection } from "~/types/legal";
import { site } from "~/config/site";

definePageMeta({ navbarOverlay: true });

const sections: LegalSection[] = [
  {
    title: "1. Objet",
    intro: `Les présentes Conditions Générales régissent l'accès et l'utilisation de la plateforme ${site.name}, ainsi que les modalités de souscription aux services proposés. Toute utilisation du Service implique l'acceptation sans réserve des présentes conditions.`,
  },
  {
    title: "2. Définitions",
    items: [
      `<strong>Plateforme / Société :</strong> ${site.name}`,
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
    intro: "La plateforme propose des contenus pédagogiques numériques accessibles :",
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
      "Toute violation peut entraîner la suspension ou la suppression du compte, sans remboursement.",
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
    intro: "La Société se réserve le droit de suspendre ou résilier un compte :",
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

useHead({ title: `Conditions Générales | ${site.name}` });
</script>

<template>
  <LegalDocument
    title="Conditions Générales d'Utilisation"
    highlight="et de Vente"
    :subtitle="`Plateforme ${site.name}`"
    :sections="sections"
    contact-intro="Pour toute question relative aux présentes Conditions, vous pouvez nous contacter :"
  />
</template>