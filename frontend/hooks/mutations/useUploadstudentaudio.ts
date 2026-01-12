"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToats";

export const useUploadStudentAudio = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const audioFile = new File([audioBlob], "recording.webm", {
        type: audioBlob.type || "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", audioFile);

      // ✅ Utiliser l'URL complète du backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      
      const response = await fetch(`${apiUrl}/api/v1/upload/student-audio`, {
        method: "POST",
        body: formData,
        credentials: "include", // Pour les cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'upload");
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error(data.message || "Erreur lors de l'upload");
      }

      return data.data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'audio",
        variant: "destructive",
      });
    },
  });
};