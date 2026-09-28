import { mainNav } from "~/config/navigation";

export const site = {
  name: "OCanada",
  tagline: "Préparation TCF Canada",
  description:
    "Entraînez-vous aux 4 épreuves du TCF Canada avec des sujets réels, une correction par IA et un suivi de votre niveau NCLC.",
  links: mainNav.map(({ label, to }) => ({ label, to })),
  resources: [
    { label: "Tarifs", to: "/tarifs" },
    { label: "Mon compte", to: "/mon-compte" },
    { label: "Contact", to: "/contact" },
  ],
  company: {
    name: "Fogouang Corp",
    url: "https://fogouang-corp.online/",
  },
  contact: {
    email: "contact@lumina.online",
    phone: "+237 691 850 913",
    whatsapp: "237691850913",
    address: "Dschang, Cameroun",
    responseTime: "24h",
  },
  socials: [
    { label: "Facebook", icon: "pi pi-facebook", href: "#" },
    {
      label: "WhatsApp",
      icon: "pi pi-whatsapp",
      href: "https://wa.me/237691850913",
    },
    { label: "YouTube", icon: "pi pi-youtube", href: "#" },
  ],
};
