export const AVAILABLE_FEATURES = [
  // Accès de base
  { key: "serie_100", label: "41 séries  complet", category: "base" },
  { key: "sujets_actualite", label: "Sujets d'actualité", category: "base" },

  // Suivi et corrections
  {
    key: "tableau_suivi",
    label: "Tableau de bord pour revoir ses anciennes corrections",
    category: "suivi",
  },
  { key: "niveau_garanti", label: "C1/C2 garanti", category: "suivi" },
  {
    key: "sujets_recents",
    label: "Sujets récents TCF",
    category: "contenu",
  },
  {
    key: "corrections_instantanees",
    label: "Sujets de compréhension avec correction détaillée instantanée",
    category: "correction",
  },

  // Compréhension
  {
    key: "ce_complete",
    label: "CE, avec + 1500 questions et corrections",
    category: "comprehension",
  },
  {
    key: "co_complete",
    label: "CO, avec + 1500 questions et corrections",
    category: "comprehension",
  },

  // Méthodologie
  {
    key: "methodologie_complete",
    label:
      "Méthodologie approfondie des sujets d'expression et de compréhension",
    category: "methodologie",
  },

  // Communauté
  {
    key: "groupe_whatsapp",
    label: "Groupe WhatsApp privé avec un examinateur",
    category: "communaute",
  },

  // Expression écrite
  {
    key: "expression_ecrite_complete",
    label:
      "Sujets d'expression écrite dans les conditions d'examen avec compteur de mots, sans correcteur de fautes, 3 tâches avec correction personnelle par un examinateur",
    category: "expression_ecrite",
  },
  {
    key: "sujets_ecrits_nombre",
    label: "sujets écrits",
    type: "counter",
    category: "expression_ecrite",
  },

  // Expression orale
  {
    key: "expression_orale_complete",
    label:
      "Sujets d'expression orale dans les conditions d'examen avec examinateur virtuel, correction par un examinateur, 3 tâches",
    category: "expression_orale",
  },
  {
    key: "sujets_oraux_nombre",
    label: "sujets oraux",
    type: "counter",
    category: "expression_orale",
  },
];
