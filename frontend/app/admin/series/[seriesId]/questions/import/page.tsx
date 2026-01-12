"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Upload, FileJson, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import QuestionImportForm from "@/components/admin/QuestionImportForm";
import TaskImportForm from "@/components/admin/TaskImportForm";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/lib/constants";
import MediaBatchUploadForm from "@/components/admin/MediaBatchUploadForm";

export default function ImportQuestionsPage() {
  const params = useParams();
  const seriesId = params.seriesId as string;

  const [isQuestionImportOpen, setIsQuestionImportOpen] = useState(false);
  const [isTaskImportOpen, setIsTaskImportOpen] = useState(false);

  // États pour stocker les médias uploadés
  const [uploadedAudios, setUploadedAudios] = useState<Record<number, string>>(
    {}
  );
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>(
    {}
  );

  const hasMedias =
    Object.keys(uploadedAudios).length > 0 ||
    Object.keys(uploadedImages).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href={ROUTES.ADMIN_SERIES_QUESTIONS(seriesId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux questions
          </Link>
        </Button>

        <PageHeader
          title="Importer des questions et tâches"
          description="Workflow: 1. Uploader les médias → 2. Importer le JSON"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="medias" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="medias">
            <Upload className="mr-2 h-4 w-4" />
            1. Médias
          </TabsTrigger>
          <TabsTrigger value="questions" disabled={!hasMedias}>
            <FileJson className="mr-2 h-4 w-4" />
            2. Questions
          </TabsTrigger>
          <TabsTrigger value="tasks" disabled={!hasMedias}>
            <FileJson className="mr-2 h-4 w-4" />
            3. Tâches
          </TabsTrigger>
        </TabsList>

        {/* ONGLET 1: Upload médias */}
        <TabsContent value="medias" className="space-y-4">
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              <strong>Étape 1:</strong> Uploadez d'abord vos fichiers audio et
              images. Nommez-les avec le numéro de question (ex: Q1.mp3,
              Q2.jpg).
            </AlertDescription>
          </Alert>

          <MediaBatchUploadForm
            onAudiosUploaded={setUploadedAudios}
            onImagesUploaded={setUploadedImages}
          />

          {hasMedias && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Médias prêts pour l'import!</p>
                  {Object.keys(uploadedAudios).length > 0 && (
                    <p>
                      ✅ {Object.keys(uploadedAudios).length} audio(s)
                      uploadé(s)
                    </p>
                  )}
                  {Object.keys(uploadedImages).length > 0 && (
                    <p>
                      ✅ {Object.keys(uploadedImages).length} image(s)
                      uploadée(s)
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Passez à l'onglet "Questions" pour importer le JSON
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ONGLET 2: Import questions */}
        <TabsContent value="questions" className="space-y-4">
          <Alert>
            <FileJson className="h-4 w-4" />
            <AlertDescription>
              <strong>Étape 2:</strong> Importez le JSON des questions. Les
              médias uploadés seront automatiquement associés.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Questions orales</CardTitle>
                <CardDescription>
                  Importer les 39 questions de compréhension orale (Q1-Q39)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsQuestionImportOpen(true)}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer questions orales
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions écrites</CardTitle>
                <CardDescription>
                  Importer les 39 questions de compréhension écrite (Q40-Q78)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsQuestionImportOpen(true)}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer questions écrites
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Format JSON exemple */}
          <Card>
            <CardHeader>
              <CardTitle>Format JSON attendu</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                {JSON.stringify(
                  {
                    questions: [
                      {
                        QuestionNumber: 1,
                        bodyText: "Texte de contexte...",
                        askedQuestion: "Quelle est la question?",
                        image: null,
                        audio: null,
                        proposition_1: "Réponse A",
                        proposition_2: "Réponse B",
                        proposition_3: "Réponse C",
                        proposition_4: "Réponse D",
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET 3: Import tâches */}
        <TabsContent value="tasks" className="space-y-4">
          <Alert>
            <FileJson className="h-4 w-4" />
            <AlertDescription>
              <strong>Étape 3:</strong> Importez le JSON des tâches
              d'expression.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tâches expression écrite</CardTitle>
                <CardDescription>
                  Importer les 3 tâches d'expression écrite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsTaskImportOpen(true)}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer tâches écrites
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tâches expression orale</CardTitle>
                <CardDescription>
                  Importer les 3 tâches d'expression orale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsTaskImportOpen(true)}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Importer tâches orales
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <QuestionImportForm
        open={isQuestionImportOpen}
        onOpenChange={setIsQuestionImportOpen}
        seriesId={seriesId}
        uploadedMedias={{ audios: uploadedAudios, images: uploadedImages }}
      />

      <TaskImportForm
        open={isTaskImportOpen}
        onOpenChange={setIsTaskImportOpen}
        seriesId={seriesId}
        // uploadedAudios={uploadedAudios}
      />
    </div>
  );
}
