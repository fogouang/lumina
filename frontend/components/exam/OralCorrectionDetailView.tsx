"use client";

import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOralExpressions } from "@/hooks/queries/useExpressionsQueries";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMediaUrl } from "@/lib/media-path";

export default function OralCorrectionDetailView() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const { data: expressions, isLoading } = useOralExpressions(attemptId);

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement..." />;
  }

  if (!expressions || expressions.length === 0) {
    return <ErrorState message="Aucune expression orale trouvée" />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="task-1" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {expressions.map((_, index) => (
            <TabsTrigger key={index} value={`task-${index + 1}`}>
              Tâche {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {expressions.map((expression, index) => (
          <TabsContent key={expression.id} value={`task-${index + 1}`}>
            <OralTaskCard expression={expression} taskNumber={index + 1} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function OralTaskCard({
  expression,
  taskNumber,
}: {
  expression: any;
  taskNumber: number;
}) {
  const audioUrl = getMediaUrl(expression.audio_url);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tâche {taskNumber}</CardTitle>
          <Badge variant="secondary">{expression.correction_status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lecteur audio */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Votre enregistrement :</h4>
          <audio controls className="w-full">
            <source src={audioUrl ?? ""} type="audio/mpeg" />
            Votre navigateur ne supporte pas le lecteur audio.
          </audio>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Durée</p>
            <p className="font-semibold">{expression.duration_seconds}s</p>
          </div>
          <div>
            <p className="text-muted-foreground">Taille</p>
            <p className="font-semibold">{expression.file_size_mb} MB</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Soumis le</p>
            <p className="font-semibold">
              {new Date(expression.submitted_at).toLocaleString("fr-FR")}
            </p>
          </div>
        </div>

        {/* TODO: Zone de correction à ajouter plus tard */}
        {expression.correction_status === "corrected_ai" && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Correction disponible (à implémenter)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
