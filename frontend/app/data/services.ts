export interface Service {
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export const services: Service[] = [
  {
    slug: "web",
    title: "Sites et plateformes web",
    description: "Des sites rapides et des plateformes SaaS pensées pour convertir et évoluer avec vous.",
    icon: "pi pi-globe",
    features: ["Sites vitrines et e-commerce", "Plateformes SaaS", "SEO et performance"],
  },
  {
    slug: "mobile",
    title: "Applications mobiles",
    description: "Des applications Android et iOS fluides, connectées à vos outils et à vos paiements.",
    icon: "pi pi-mobile",
    features: ["Android et iOS", "Paiement Mobile Money", "Mode hors ligne"],
  },
  {
    slug: "ia",
    title: "Intelligence artificielle",
    description: "Automatisation, assistants et analyse de données pour gagner du temps et mieux décider.",
    icon: "pi pi-microchip-ai",
    features: ["Chatbots et assistants", "Analyse prédictive", "Automatisation de tâches"],
  },
  {
    slug: "design",
    title: "UI/UX Design",
    description: "Des interfaces claires et un design system cohérent, testés avec de vrais utilisateurs.",
    icon: "pi pi-palette",
    features: ["Maquettes et prototypes", "Design system", "Tests utilisateurs"],
  },
  {
    slug: "cloud",
    title: "Cloud et DevOps",
    description: "Déploiement, sécurité et supervision pour une application disponible en permanence.",
    icon: "pi pi-cloud",
    features: ["Docker et VPS", "CI/CD", "Sauvegardes et monitoring"],
  },
  {
    slug: "support",
    title: "Maintenance et support",
    description: "Un suivi continu : corrections, mises à jour et nouvelles fonctionnalités.",
    icon: "pi pi-wrench",
    features: ["Support réactif", "Mises à jour de sécurité", "Évolutions mensuelles"],
  },
];