export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image?: string; // ex. "/images/testimonials/aline.jpg"
}

export const testimonials: Testimonial[] = [
  {
    name: "Aline M.",
    role: "Directrice · Mbarga Consulting",
    quote: "L'équipe a compris notre métier dès le premier atelier. Notre plateforme était en ligne en six semaines, sans mauvaise surprise.",
  },
  {
    name: "Paul N.",
    role: "Fondateur · Nkem Logistique",
    quote: "Le suivi hebdomadaire change tout : on sait toujours où en est le projet et on décide ensemble des priorités.",
  },
  {
    name: "Sandrine T.",
    role: "Designer · Tchoumi Design",
    quote: "Un vrai souci du détail. Le design system qu'ils ont créé nous fait gagner du temps sur chaque nouvelle page.",
  },
  {
    name: "Hervé K.",
    role: "Gérant · Kamdem BTP",
    quote: "Notre application mobile est simple à utiliser, même pour nos équipes sur le terrain. Le paiement Mobile Money marche parfaitement.",
  },
  {
    name: "Estelle D.",
    role: "Responsable · EduPlus",
    quote: "Chaque matin, nos enseignants retrouvent leurs outils au même endroit. Ce petit confort a changé notre façon de travailler.",
  },
];