import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import StaticOralAudiosUpload from "@/components/admin/StaticOralAudiosUpload";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Audios d'instruction Oral | Admin TCF Canada",
  description: "Gérer les audios d'instruction statiques pour l'expression orale",
};

export default function OralAudiosSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={ROUTES.ADMIN_DASHBOARD}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dashboard
          </Link>
        </Button>

        <PageHeader
          title="Configuration des audios d'instruction"
          description="Uploadez les 3 fichiers audio d'instruction pour les tâches d'expression orale"
        />
      </div>

      <StaticOralAudiosUpload />
    </div>
  );
}