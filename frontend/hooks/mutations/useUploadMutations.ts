"use client";

import { useMutation } from "@tanstack/react-query";
import { OpenAPI } from "@/lib/api";
import { useToast } from "@/hooks/useToats";

// ✅ Upload audio - Version corrigée
export const useUploadAudio = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${OpenAPI.BASE}/api/v1/upload/audio`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      if (!data) return;

      toast({
        title: "Upload réussi",
        description: `Audio uploadé: ${data.filename}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader le fichier audio",
        variant: "destructive",
      });
    },
  });
};

// ✅ Upload image - Version corrigée
export const useUploadImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${OpenAPI.BASE}/api/v1/upload/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      if (!data) return;

      toast({
        title: "Upload réussi",
        description: `Image uploadée: ${data.filename}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'image",
        variant: "destructive",
      });
    },
  });
};

// Upload multiple audios (garde l'ancienne version ou adapte aussi)
export const useUploadMultipleAudios = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(`${OpenAPI.BASE}/api/v1/upload/audio/batch`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      if (!data) return;

      const successCount = data.uploaded?.length || 0;
      const errorCount = data.failed?.length || 0;

      if (errorCount > 0) {
        toast({
          title: "Upload partiel",
          description: `${successCount} fichier(s) uploadé(s), ${errorCount} erreur(s)`,
        });
      } else {
        toast({
          title: "Upload réussi",
          description: `${successCount} fichier(s) audio uploadé(s)`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader les fichiers",
        variant: "destructive",
      });
    },
  });
};

// Upload multiple images
export const useUploadMultipleImages = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch(`${OpenAPI.BASE}/api/v1/upload/images/batch`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      if (!data) return;

      const successCount = data.uploaded?.length || 0;
      const errorCount = data.failed?.length || 0;

      if (errorCount > 0) {
        toast({
          title: "Upload partiel",
          description: `${successCount} image(s) uploadée(s), ${errorCount} erreur(s)`,
        });
      } else {
        toast({
          title: "Upload réussi",
          description: `${successCount} image(s) uploadée(s)`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader les images",
        variant: "destructive",
      });
    },
  });
};