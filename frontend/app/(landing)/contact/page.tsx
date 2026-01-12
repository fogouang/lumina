import Contact from "@/components/home/Contact";
import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags({
  title: "Contact - Lumina TCF | Nous Contacter",
  description:
    "Contactez l'équipe Lumina TCF pour toute question sur la préparation au TCF Canada, votre abonnement ou nos services. Support disponible par email, WhatsApp et téléphone.",
  canonicalUrlRelative: "/contact",
  keywords: [
    "contact Lumina TCF",
    "support TCF Canada",
    "aide préparation TCF",
    "contact ITIA Solutions",
  ],
});

export default function ContactPage() {
  return (
    <>
      <Contact />
    </>
  );
}
