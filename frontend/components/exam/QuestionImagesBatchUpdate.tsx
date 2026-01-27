"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { QuestionType } from "@/lib/api";
import { useBatchUpdateQuestionImages } from "@/hooks/mutations/useQuestionsMutations";
import { useUploadMultipleImages } from "@/hooks/mutations/useUploadMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface QuestionImagesBatchUpdateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  questionType: QuestionType;
}

export default function QuestionImagesBatchUpdate({
  open,
  onOpenChange,
  seriesId,
  questionType,
}: QuestionImagesBatchUpdateProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>(
    {},
  );

  const { mutate: uploadImages, isPending: isUploading } =
    useUploadMultipleImages();
  const { mutate: batchUpdate, isPending: isUpdating } =
    useBatchUpdateQuestionImages();

  // Extraire le numéro de question depuis le nom du fichier
  const extractQuestionNumber = (filename: string): number | null => {
    const patterns = [
      /[Qq](\d+)/, // Q1, q1
      /question[_-]?(\d+)/i, // question_1, question-1
      /^(\d+)\./, // 1.jpg
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return null;
  };

  const handleUpload = () => {
    if (imageFiles.length === 0) return;

    uploadImages(imageFiles, {
      onSuccess: (data) => {
        if (!data?.uploaded) return;

        const mapping: Record<number, string> = {};

        data.uploaded.forEach((file: any, index: number) => {
          const originalFile = imageFiles[index];
          const questionNumber = extractQuestionNumber(originalFile.name);

          if (questionNumber) {
            mapping[questionNumber] = file.url;
          }
        });

        setUploadedImages(mapping);
      },
    });
  };

  const handleSubmit = () => {
    if (Object.keys(uploadedImages).length === 0) return;

    batchUpdate(
      {
        series_id: seriesId,
        question_type: questionType,
        images: uploadedImages,
      },
      {
        onSuccess: () => {
          setImageFiles([]);
          setUploadedImages({});
          onOpenChange(false);
        },
      },
    );
    console.log("Les image",uploadedImages);
    
  };

  const isPending = isUploading || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Mettre à jour les images -{" "}
            {questionType === QuestionType.ORAL
              ? "Compréhension Orale"
              : "Compréhension Écrite"}
          </DialogTitle>
          <DialogDescription>
            Nommez vos images: Q1.jpg, Q40.png, Q41.jpg, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              disabled={isPending}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {/* Files Preview */}
          {imageFiles.length > 0 && (
            <>
              <Alert>
                <AlertDescription>
                  {imageFiles.length} image(s) sélectionnée(s)
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-48 rounded-md border p-4">
                <div className="space-y-2">
                  {imageFiles.map((file, index) => {
                    const questionNumber = extractQuestionNumber(file.name);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        {questionNumber ? (
                          <span className="text-green-600 flex items-center gap-1 ml-2">
                            <CheckCircle2 className="h-4 w-4" />Q
                            {questionNumber}
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1 ml-2">
                            <XCircle className="h-4 w-4" />
                            Non détecté
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {Object.keys(uploadedImages).length === 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Uploader {imageFiles.length} image(s)
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {/* Uploaded Success */}
          {Object.keys(uploadedImages).length > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>{Object.keys(uploadedImages).length} image(s)</strong>{" "}
                uploadée(s) avec succès
                <div className="mt-2 text-xs space-y-1">
                  {Object.entries(uploadedImages)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .slice(0, 5)
                    .map(([num, url]) => (
                      <div key={num}>
                        Q{num}: {url.split("/").pop()}
                      </div>
                    ))}
                  {Object.keys(uploadedImages).length > 5 && (
                    <div className="text-muted-foreground">
                      ... et {Object.keys(uploadedImages).length - 5} autre(s)
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || Object.keys(uploadedImages).length === 0}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mettre à jour {Object.keys(uploadedImages).length} question(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
