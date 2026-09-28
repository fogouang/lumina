import type { NavItem, NavSection } from "~/types/navigation";

// Liens principaux de la navbar
export const mainNav: NavItem[] = [
  { label: "Accueil", to: "/", icon: "pi pi-home", exact: true },
  { label: "Expression écrite", to: "/epreuve/expression-ecrite", icon: "pi pi-pencil" },
  { label: "Expression orale", to: "/epreuve/expression-orale", icon: "pi pi-microphone" },
  { label: "Compréhension écrite", to: "/epreuve/comprehension-ecrite", icon: "pi pi-book" },
  { label: "Compréhension orale", to: "/epreuve/comprehension-orale", icon: "pi pi-headphones" },
];

// Lien vers l'espace personnel (affiché à part sur desktop)
export const accountNav: NavItem = {
  label: "Mon compte",
  to: "/mon-compte",
  icon: "pi pi-user",
};

// Liens de pied de sidebar
export const backToSiteLink: NavItem = { label: "Retour au site", to: "/", icon: "pi pi-arrow-left" };
export const studentSpaceLink: NavItem = { label: "Espace étudiant", to: "/mon-compte", icon: "pi pi-arrow-left" };

// Espace compte (étudiant)
export const accountSections: NavSection[] = [
  {
    title: "Préparation",
    items: [
      { label: "Tableau de bord", to: "/mon-compte", icon: "pi pi-home", exact: true },
      { label: "Simulateur écrit", to: "/simulateur/expression-ecrite", icon: "pi pi-pen-to-square" },
      { label: "Simulateur oral", to: "/simulateur-oral", icon: "pi pi-microphone" },
      { label: "Méthodologie", to: "/mon-compte/methodologie", icon: "pi pi-compass" },
      { label: "Mes tentatives", to: "/mon-compte/tentatives", icon: "pi pi-list" },
    ],
  },
  {
    title: "Compte",
    items: [
      { label: "Mon profil", to: "/mon-compte/profil", icon: "pi pi-user" },
      { label: "Sécurité", to: "/mon-compte/securite", icon: "pi pi-shield" },
      { label: "Abonnement", to: "/mon-compte/abonnement", icon: "pi pi-crown" },
      { label: "Factures", to: "/mon-compte/factures", icon: "pi pi-receipt" },
    ],
  },
  {
    title: "Aide",
    items: [{ label: "Support", to: "/contact", icon: "pi pi-envelope" }],
  },
];

// Espace administration
export const adminSections: NavSection[] = [
  {
    title: "Vue d'ensemble",
    items: [{ label: "Dashboard", to: "/admin", icon: "pi pi-home", exact: true }],
  },
  {
    title: "Contenu",
    items: [
      { label: "Séries", to: "/admin/series", icon: "pi pi-list" },
      { label: "Expressions", to: "/admin/expressions", icon: "pi pi-copy" },
      { label: "Plans", to: "/admin/plans", icon: "pi pi-tag" },
    ],
  },
  {
    title: "Utilisateurs",
    items: [
      { label: "Utilisateurs", to: "/admin/users", icon: "pi pi-users" },
      { label: "Abonnements", to: "/admin/subscriptions", icon: "pi pi-crown" },
      { label: "Paiements", to: "/admin/payments", icon: "pi pi-credit-card" },
    ],
  },
  {
    title: "Partenaires",
    items: [
      { label: "Partenaires", to: "/admin/partners", icon: "pi pi-building" },
      { label: "Codes promo", to: "/admin/promo-code", icon: "pi pi-ticket" },
    ],
  },
  {
    title: "Parrainage",
    items: [{ label: "Ambassadeurs", to: "/admin/referrals", icon: "pi pi-star" }],
  },
];

// Espace ambassadeur
export const ambassadorSections: NavSection[] = [
  {
    title: "Parrainage",
    items: [{ label: "Programme de parrainage", to: "/ambassadeur", icon: "pi pi-users", exact: true }],
  },
];