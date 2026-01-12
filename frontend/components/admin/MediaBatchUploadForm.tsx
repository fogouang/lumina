"use client";

import { useState } from "react";
import {
  Upload,
  FileAudio,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  useUploadMultipleAudios,
  useUploadMultipleImages,
} from "@/hooks/mutations/useUploadMutations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MediaBatchUploadFormProps {
  onAudiosUploaded?: (urls: Record<number, string>) => void;
  onImagesUploaded?: (urls: Record<number, string>) => void;
}

export default function MediaBatchUploadForm({
  onAudiosUploaded,
  onImagesUploaded,
}: MediaBatchUploadFormProps) {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedAudios, setUploadedAudios] = useState<Record<number, string>>(
    {}
  );
  const [uploadedImages, setUploadedImages] = useState<Record<number, string>>(
    {}
  );

  const { mutate: uploadAudios, isPending: isUploadingAudios } =
    useUploadMultipleAudios();
  const { mutate: uploadImages, isPending: isUploadingImages } =
    useUploadMultipleImages();

  // Extraire le numéro de question depuis le nom du fichier
  // Format attendu: "Q1.mp3", "CO-100-Q1.mp3", "question-1.mp3", "1.mp3", etc.
  const extractQuestionNumber = (filename: string): number | null => {
    // Essayer plusieurs patterns
    const patterns = [
      /[Qq](\d+)/, // Q1, q1
      /question[_-]?(\d+)/i, // question_1, question-1
      /^(\d+)\./, // 1.mp3
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return null;
  };

  const handleAudioUpload = () => {
    if (audioFiles.length === 0) return;

    uploadAudios(audioFiles, {
      onSuccess: (data) => {
        if (!data?.uploaded) return;

        const mapping: Record<number, string> = {};

        data.uploaded.forEach((file: any, index: number) => {
          const originalFile = audioFiles[index];
          const questionNumber = extractQuestionNumber(originalFile.name);

          if (questionNumber) {
            mapping[questionNumber] = file.url;
          }
        });

        setUploadedAudios(mapping);
        onAudiosUploaded?.(mapping);
        setAudioFiles([]); // Clear après upload
      },
    });
  };

  const handleImageUpload = () => {
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
        onImagesUploaded?.(mapping);
        setImageFiles([]); // Clear après upload
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Audio Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Fichiers audio
          </CardTitle>
          <CardDescription>
            Nommez vos fichiers: Q1.mp3, Q2.mp3, Q3.mp3, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={(e) => setAudioFiles(Array.from(e.target.files || []))}
              disabled={isUploadingAudios}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {audioFiles.length > 0 && (
            <>
              <Alert>
                <AlertDescription>
                  {audioFiles.length} fichier(s) sélectionné(s)
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-48 rounded-md border p-4">
                <div className="space-y-2">
                  {audioFiles.map((file, index) => {
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

              <Button
                onClick={handleAudioUpload}
                disabled={isUploadingAudios}
                className="w-full"
              >
                {isUploadingAudios ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Uploader {audioFiles.length} audio(s)
                  </>
                )}
              </Button>
            </>
          )}

          {Object.keys(uploadedAudios).length > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>{Object.keys(uploadedAudios).length} audio(s)</strong>{" "}
                uploadé(s)
                <div className="mt-2 text-xs space-y-1">
                  {Object.entries(uploadedAudios)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .slice(0, 5)
                    .map(([num, url]) => (
                      <div key={num}>
                        Q{num}: {url.split("/").pop()}
                      </div>
                    ))}
                  {Object.keys(uploadedAudios).length > 5 && (
                    <div className="text-muted-foreground">
                      ... et {Object.keys(uploadedAudios).length - 5} autre(s)
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images
          </CardTitle>
          <CardDescription>
            Nommez vos images: Q1.jpg, Q40.png, Q41.jpg, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
              disabled={isUploadingImages}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

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

              <Button
                onClick={handleImageUpload}
                disabled={isUploadingImages}
                className="w-full"
              >
                {isUploadingImages ? (
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
            </>
          )}

          {Object.keys(uploadedImages).length > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>{Object.keys(uploadedImages).length} image(s)</strong>{" "}
                uploadée(s)
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
        </CardContent>
      </Card>
    </div>
  );
}
