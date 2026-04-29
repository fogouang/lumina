// app/composables/useEpreuve.ts

interface Cta {
  label: string;
  icon: string;
  to: string;
  outlined: boolean;
}

interface FormatStat {
  label: string;
  value: string;
  icon: string;
}

interface Apprentissage {
  icon: string;
  title: string;
  desc: string;
}

interface ProgrammeItem {
  icon: string;
  title: string;
  desc: string;
}

interface Tache {
  numero: number;
  title: string;
  niveau: string;
  longueur: string;
  temps: string;
  desc: string;
  exemples: string[];
}

interface CtaFinal {
  label: string;
  icon: string;
  to: string;
}

interface Epreuve {
  slug: string;
  title: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  description: string;
  ctas: Cta[];
  format: FormatStat[];
  apprentissages: Apprentissage[];
  programme: ProgrammeItem[];
  taches: Tache[] | null;
  ctaFinal: CtaFinal;
}

const epreuves: Record<string, Epreuve> = {
  "expression-ecrite": {
    slug: "expression-ecrite",
    title: "Expression Écrite",
    icon: "pi pi-pen-to-square",
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    description:
      "Maîtrisez l'art de la rédaction en français avec nos modules complets : méthodologie, sujets d'actualités et astuces pour exceller dans votre examen TCF Canada.",
    ctas: [
      {
        label: "Méthodologie & Astuces",
        icon: "pi pi-lightbulb",
        to: "/epreuve/expression-ecrite/astuces",
        outlined: false,
      },
      {
        label: "Sujets d'actualités",
        icon: "pi pi-calendar",
        to: "/epreuve/expression-ecrite/sujets-actualites",
        outlined: true,
      },
      {
        label: "Tableau de bord",
        icon: "pi pi-chart-bar",
        to: "/epreuve/expression-ecrite/tableau-de-bord",
        outlined: true,
      },
    ],
    format: [
      { label: "Durée totale", value: "60 min", icon: "pi pi-clock" },
      { label: "Tâches", value: "3", icon: "pi pi-list" },
      { label: "Points max", value: "20/20", icon: "pi pi-star" },
    ],
    apprentissages: [
      {
        icon: "pi pi-file-edit",
        title: "Rédaction structurée",
        desc: "Rédigez des textes cohérents avec introduction, développement et conclusion.",
      },
      {
        icon: "pi pi-comments",
        title: "Argumentation convaincante",
        desc: "Développez des arguments solides pour défendre votre point de vue efficacement.",
      },
      {
        icon: "pi pi-book",
        title: "Vocabulaire riche",
        desc: "Enrichissez votre vocabulaire avec des expressions idiomatiques et académiques.",
      },
      {
        icon: "pi pi-stopwatch",
        title: "Gestion du temps",
        desc: "Produisez des textes de qualité dans les délais impartis de l'examen.",
      },
    ],
    programme: [
      {
        icon: "pi pi-desktop",
        title: "Simulateur unique",
        desc: "Conditions identiques à l'examen réel : timing, enchaînement des 3 tâches, enregistrement de vos rédactions.",
      },
      {
        icon: "pi pi-lightbulb",
        title: "Méthodologie",
        desc: "Techniques de rédaction éprouvées et structures de texte gagnantes pour maximiser votre score.",
      },
      {
        icon: "pi pi-calendar",
        title: "Sujets d'actualités",
        desc: "Sujets récents et pertinents organisés par mois pour être parfaitement préparé.",
      },
      {
        icon: "pi pi-bolt",
        title: "Astuces d'experts",
        desc: "Astuces pour maximiser vos points et éviter les pièges les plus courants.",
      },
    ],
    taches: [
      {
        numero: 1,
        title: "Rédaction d'un message court",
        niveau: "A2 – B1",
        longueur: "60–120 mots",
        temps: "10 min",
        desc: "La tâche la plus accessible. Rédiger un message court pour répondre à une situation de la vie quotidienne : email, note de service, remerciement, demande d'information.",
        exemples: [
          "Écrivez un email à un ami pour l'inviter à une fête",
          "Rédigez une note pour excuser votre absence au travail",
          "Envoyez un message pour remercier un collègue de son aide",
        ],
      },
      {
        numero: 2,
        title: "Rédaction d'un article de blog (Narration)",
        niveau: "B1 avancé – B2",
        longueur: "120–150 mots",
        temps: "20 min",
        desc: "L'objectif est de raconter une expérience vécue, décrire une situation personnelle ou un événement. Cette tâche ne sert pas à exprimer une opinion argumentée.",
        exemples: [
          "Racontez une expérience de voyage qui vous a marqué",
          "Décrivez une situation où vous avez pris une décision importante",
          "Racontez un événement mémorable de votre vie professionnelle",
        ],
      },
      {
        numero: 3,
        title: "Texte argumentatif",
        niveau: "C1 – C2",
        longueur: "120–180 mots",
        temps: "30 min",
        desc: "La tâche la plus exigeante. Deux documents contradictoires à lire. Vous rédigez un texte en deux parties : résumé des deux positions + votre point de vue personnel.",
        exemples: [
          'Sujet : "Les jeux vidéo pour les enfants" — Doc 1 (favorable) vs Doc 2 (défavorable)',
          "Résumez les deux positions puis donnez votre avis personnel",
        ],
      },
    ],
    ctaFinal: {
      label: "Lancer le simulateur",
      icon: "pi pi-play",
      to: "/epreuve/expression-ecrite/simulateur",
    },
  },

  "expression-orale": {
    slug: "expression-orale",
    title: "Expression Orale",
    icon: "pi pi-microphone",
    iconColor: "#d97706",
    iconBg: "#fffbeb",
    description:
      "Développez vos compétences à l'oral et maîtrisez les techniques pour vous exprimer avec aisance sur les sujets d'actualité du TCF Canada.",
    ctas: [
      {
        label: "Méthodologie & Astuces",
        icon: "pi pi-lightbulb",
        to: "/epreuve/expression-orale/astuces",
        outlined: false,
      },
      {
        label: "Sujets d'actualités",
        icon: "pi pi-calendar",
        to: "/epreuve/expression-orale/sujets-actualites",
        outlined: true,
      },
      {
        label: "Tableau de bord",
        icon: "pi pi-chart-bar",
        to: "/epreuve/expression-orale/tableau-de-bord",
        outlined: true,
      },
    ],
    format: [
      { label: "Durée totale", value: "12 min", icon: "pi pi-clock" },
      { label: "Tâches", value: "3", icon: "pi pi-list" },
      { label: "Points max", value: "20/20", icon: "pi pi-star" },
    ],
    apprentissages: [
      {
        icon: "pi pi-comments",
        title: "Expression spontanée",
        desc: "Répondez naturellement à des sujets variés de la vie quotidienne et professionnelle.",
      },
      {
        icon: "pi pi-chart-line",
        title: "Argumentation à l'oral",
        desc: "Structurez vos idées et défendez votre point de vue de façon claire et convaincante.",
      },
      {
        icon: "pi pi-volume-up",
        title: "Prononciation et fluidité",
        desc: "Améliorez votre prononciation et votre aisance pour un oral fluide et naturel.",
      },
      {
        icon: "pi pi-stopwatch",
        title: "Gestion du stress",
        desc: "Entraînez-vous à parler sous contrainte de temps pour être serein le jour J.",
      },
    ],
    programme: [
      {
        icon: "pi pi-microphone",
        title: "Sujets d'actualités",
        desc: "Sujets récents classés par mois pour vous entraîner sur les thèmes les plus récents.",
      },
      {
        icon: "pi pi-lightbulb",
        title: "Méthodologie",
        desc: "Techniques et structures pour organiser votre discours et maximiser votre score.",
      },
      {
        icon: "pi pi-bolt",
        title: "Astuces d'experts",
        desc: "Conseils pratiques pour gérer le temps, éviter les hésitations et impressionner l'examinateur.",
      },
      {
        icon: "pi pi-chart-bar",
        title: "Tableau de bord",
        desc: "Suivez votre progression et identifiez les thèmes sur lesquels vous concentrer.",
      },
    ],
    taches: [
      {
        numero: 1,
        title: "Monologue suivi",
        niveau: "B1 – B2",
        longueur: "2–3 min",
        temps: "3 min",
        desc: "Vous présentez un sujet de manière organisée. L'examinateur vous pose ensuite une ou deux questions.",
        exemples: [
          "Parlez d'une expérience personnelle marquante",
          "Décrivez votre vie professionnelle actuelle",
        ],
      },
      {
        numero: 2,
        title: "Exercice en interaction",
        niveau: "B2 – C1",
        longueur: "4–5 min",
        temps: "5 min",
        desc: "Simulation d'une conversation avec l'examinateur autour d'une situation concrète à résoudre ensemble.",
        exemples: [
          "Vous devez convaincre un ami de changer ses habitudes",
          "Négocier un arrangement avec un collègue de travail",
        ],
      },
      {
        numero: 3,
        title: "Point de vue et argumentation",
        niveau: "C1 – C2",
        longueur: "4–5 min",
        temps: "4 min",
        desc: "À partir d'un document écrit, vous dégagez le problème posé et présentez votre opinion argumentée.",
        exemples: [
          "Réagissez à un article sur les réseaux sociaux et la jeunesse",
          "Donnez votre avis sur le télétravail à partir d'un texte",
        ],
      },
    ],
    ctaFinal: {
      label: "Voir les sujets",
      icon: "pi pi-arrow-right",
      to: "/epreuve/expression-orale/sujets-actualites",
    },
  },

  "comprehension-ecrite": {
    slug: "comprehension-ecrite",
    title: "Compréhension Écrite",
    icon: "pi pi-book",
    iconColor: "#1d4ed8",
    iconBg: "#eff6ff",
    description:
      "Entraînez-vous à lire et comprendre des textes authentiques variés grâce à nos séries de tests en conditions réelles du TCF Canada.",
    ctas: [
      {
        label: "Commencer un test",
        icon: "pi pi-play",
        to: "/epreuve/comprehension-ecrite",
        outlined: false,
      },
      {
        label: "Tableau de bord",
        icon: "pi pi-chart-bar",
        to: "/epreuve/comprehension-ecrite/tableau-de-bord",
        outlined: true,
      },
      {
        label: "Astuces",
        icon: "pi pi-lightbulb",
        to: "/epreuve/comprehension-ecrite/astuces",
        outlined: true,
      },
    ],
    format: [
      { label: "Durée totale", value: "60 min", icon: "pi pi-clock" },
      { label: "Questions", value: "39", icon: "pi pi-list" },
      { label: "Points max", value: "699", icon: "pi pi-star" },
    ],
    apprentissages: [
      {
        icon: "pi pi-file-edit",
        title: "Lecture de textes variés",
        desc: "Articles, publicités, lettres officielles, forums — tous les types de textes du TCF.",
      },
      {
        icon: "pi pi-search",
        title: "Repérage d'informations",
        desc: "Identifiez rapidement les informations clés dans un texte dense.",
      },
      {
        icon: "pi pi-book",
        title: "Inférence et implicite",
        desc: "Comprenez le sens implicite et les intentions de l'auteur.",
      },
      {
        icon: "pi pi-stopwatch",
        title: "Lecture rapide",
        desc: "Techniques de lecture efficace pour répondre à 39 questions en 60 minutes.",
      },
    ],
    programme: [
      {
        icon: "pi pi-list",
        title: "Séries de tests",
        desc: "40 séries reproduisant fidèlement les conditions de l'examen officiel.",
      },
      {
        icon: "pi pi-lightbulb",
        title: "Méthodologie",
        desc: "Stratégies de lecture pour aborder chaque type de document avec méthode.",
      },
      {
        icon: "pi pi-bolt",
        title: "Astuces d'experts",
        desc: "Techniques pour gagner du temps et éviter les pièges classiques.",
      },
      {
        icon: "pi pi-chart-bar",
        title: "Tableau de bord",
        desc: "Suivi détaillé de vos performances par série et par type de question.",
      },
    ],
    taches: null,
    ctaFinal: {
      label: "Commencer un test",
      icon: "pi pi-play",
      to: "/epreuve/comprehension-ecrite",
    },
  },

  "comprehension-orale": {
    slug: "comprehension-orale",
    title: "Compréhension Orale",
    icon: "pi pi-headphones",
    iconColor: "#0d9488",
    iconBg: "#f0fdfa",
    description:
      "Maîtrisez les techniques essentielles pour réussir la section compréhension orale avec nos modules interactifs et pratiques en conditions réelles.",
    ctas: [
      {
        label: "Commencer un test",
        icon: "pi pi-play",
        to: "/epreuve/comprehension-orale",
        outlined: false,
      },
      {
        label: "Tableau de bord",
        icon: "pi pi-chart-bar",
        to: "/epreuve/comprehension-orale/tableau-de-bord",
        outlined: true,
      },
      {
        label: "Astuces",
        icon: "pi pi-lightbulb",
        to: "/epreuve/comprehension-orale/astuces",
        outlined: true,
      },
    ],
    format: [
      { label: "Durée totale", value: "35 min", icon: "pi pi-clock" },
      { label: "Questions", value: "39", icon: "pi pi-list" },
      { label: "Points max", value: "699", icon: "pi pi-star" },
    ],
    apprentissages: [
      {
        icon: "pi pi-volume-up",
        title: "Documents audio variés",
        desc: "Annonces, conversations, interviews, bulletins d'information et conférences.",
      },
      {
        icon: "pi pi-bolt",
        title: "Stratégies d'écoute",
        desc: "Techniques pour identifier les informations clés et répondre rapidement.",
      },
      {
        icon: "pi pi-globe",
        title: "Accents francophones",
        desc: "Familiarisez-vous avec les différents accents du monde francophone.",
      },
      {
        icon: "pi pi-desktop",
        title: "Conditions réelles",
        desc: "Tests chronométrés simulant exactement les conditions de l'examen TCF Canada.",
      },
    ],
    programme: [
      {
        icon: "pi pi-list",
        title: "Séries de tests",
        desc: "40 séries reproduisant les conditions réelles de l'examen officiel.",
      },
      {
        icon: "pi pi-lightbulb",
        title: "Modules théoriques",
        desc: "Concepts fondamentaux et stratégies pour exceller en compréhension orale.",
      },
      {
        icon: "pi pi-chart-line",
        title: "Exercices progressifs",
        desc: "Progressez du niveau débutant au niveau avancé avec des exercices adaptés.",
      },
      {
        icon: "pi pi-chart-bar",
        title: "Tableau de bord",
        desc: "Suivi de vos performances pour cibler vos points faibles.",
      },
    ],
    taches: null,
    ctaFinal: {
      label: "Commencer maintenant",
      icon: "pi pi-play",
      to: "/epreuve/comprehension-orale",
    },
  },
};

export function useEpreuve(slug: string): { epreuve: Epreuve | null } {
  const epreuve = epreuves[slug] ?? null;
  return { epreuve };
}
