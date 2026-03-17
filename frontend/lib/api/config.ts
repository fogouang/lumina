import { OpenAPI } from "./core/OpenAPI";
import type { ApiError } from "./core/ApiError";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Configuration de l'API client
export const configureAPI = () => {
  // URL de base (backend FastAPI)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl && process.env.NODE_ENV === "production") {
    console.error(
      "ERREUR: NEXT_PUBLIC_API_URL n'est pas définie en production !"
    );
  }

  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  console.log("yo la config:", OpenAPI.BASE);
  
  // CRUCIAL : Envoyer les cookies automatiquement
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = "include";

  // Headers
  OpenAPI.HEADERS = async () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    return headers;
  };
};

// ✅ Fonction pour rafraîchir le token
export const refreshToken = async (): Promise<void> => {
  try {
    const response = await fetch(`${OpenAPI.BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    // En cas d'erreur, rediriger vers login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw error;
  }
};

// Intercepteur pour gérer les erreurs 401
export const handleApiError = async (error: unknown): Promise<never> => {
  const apiError = error as ApiError;

  if (apiError.status === 401 && !isRefreshing) {
    isRefreshing = true;

    try {
      await refreshToken();
      isRefreshing = false;
      processQueue(null, null);

      throw new Error("Token refreshed, please retry");
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError as Error, null);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw refreshError;
    }
  }

  throw error;
};
