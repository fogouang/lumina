// src/lib/utils/media-path.ts

/**
 * Convertit un chemin relatif en URL complète pour accéder aux médias
 * stockés sur le serveur FastApi.
 */
export const getMediaUrl = (path: string | null): string | null => {
  if (!path) return null;

  // Si le chemin est déjà une URL complète, le retourner tel quel
  if (path.startsWith("http")) return path;

  // Utiliser la variable d'environnement NEXT_PUBLIC pour le côté client
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://lumina-tcf.com";

  // Gérer les slashes
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  return `${baseUrl}/${cleanPath}`;
};