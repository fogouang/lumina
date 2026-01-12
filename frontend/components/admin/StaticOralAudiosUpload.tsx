"use client";

import { useState } from "react";
import { Upload, FileAudio, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useUploadAudio } from "@/hooks/mutations/useUploadMutations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToats";

export default function StaticOralAudiosUpload() {
  const { toast } = useToast();
  const { mutate: uploadAudio, isPending } = useUploadAudio();

  const [uploadedUrls, setUploadedUrls] = useState<Record<number, string>>({});

  const handleUpload = (taskNumber: 1 | 2 | 3, file: File) => {
    uploadAudio(file, {
      onSuccess: (data) => {
        if (data?.url) {
          setUploadedUrls((prev) => ({ ...prev, [taskNumber]: data.url }));
        }
      },
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copié!",
      description: "URL copiée dans le presse-papier",
    });
  };

  const copyAllAsCode = () => {
    const code = `# app/shared/constants.py

STATIC_ORAL_INSTRUCTION_AUDIOS = {
    1: "${uploadedUrls[1] || "/uploads/audio/..."}", 
    2: "${uploadedUrls[2] || "/uploads/audio/..."}",
    3: "${uploadedUrls[3] || "/uploads/audio/..."}",
}`;

    navigator.clipboard.writeText(code);
    toast({
      title: "Code copié!",
      description: "Collez ce code dans votre fichier constants.py",
    });
  };

  const allUploaded = uploadedUrls[1] && uploadedUrls[2] && uploadedUrls[3];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Audios d'instruction statiques (Oral)
        </CardTitle>
        <CardDescription>
          Uploadez les 3 fichiers audio d'instruction pour les tâches orales.
          Ces audios seront réutilisés pour TOUTES les séries.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tâche 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Tâche 1: "Présentez-vous en 2 minutes"
            </label>
            <Input
              type="file"
              accept="audio/*"
              disabled={isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(1, file);
              }}
              className="max-w-50"
            />
          </div>
          {uploadedUrls[1] && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">
                  {uploadedUrls[1]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(uploadedUrls[1])}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tâche 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Tâche 2: Exercice d'interaction
            </label>
            <Input
              type="file"
              accept="audio/*"
              disabled={isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(2, file);
              }}
              className="max-w-50"
            />
          </div>
          {uploadedUrls[2] && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">
                  {uploadedUrls[2]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(uploadedUrls[2])}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tâche 3 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Tâche 3: Expression d'un point de vue
            </label>
            <Input
              type="file"
              accept="audio/*"
              disabled={isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(3, file);
              }}
              className="max-w-50"
            />
          </div>
          {uploadedUrls[3] && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">
                  {uploadedUrls[3]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(uploadedUrls[3])}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Loader */}
        {isPending && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Upload en cours...</AlertDescription>
          </Alert>
        )}

        {/* Copy All */}
        {allUploaded && (
          <div className="pt-4 border-t space-y-2">
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                ✅ Tous les audios sont uploadés! Copiez le code Python
                ci-dessous et collez-le dans{" "}
                <code>app/shared/constants.py</code>
              </AlertDescription>
            </Alert>

            <Button onClick={copyAllAsCode} className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copier le code Python
            </Button>

            <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
              {`# app/shared/constants.py

STATIC_ORAL_INSTRUCTION_AUDIOS = {
    1: "${uploadedUrls[1]}",
    2: "${uploadedUrls[2]}",
    3: "${uploadedUrls[3]}",
}`}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
