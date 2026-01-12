// src/lib/utils/media-path.ts

/**
 * Convertit un chemin relatif en URL complète pour accéder aux médias
 * stockés sur le serveur Django.
 *
 * @param path - Le chemin relatif du média (peut commencer par '/' ou non)
 * @returns L'URL complète pour accéder au média, ou null si le chemin est null
 */
// src/lib/utils/media-path.ts
export const getMediaUrl = (path: string | null): string | null => {
  if (!path) return null;

  // Si le chemin est déjà une URL complète, le retourner tel quel
  if (path.startsWith("http")) return path;

  // Déterminer l'URL de base selon l'environnement
  const isDevelopment = process.env.NODE_ENV === "development";
  const baseUrl = isDevelopment
    ? "http://localhost:8001"
    : "https://lumina-tcf.com";

  // Gérer les slashes
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;

  return `${baseUrl}/${cleanPath}`;
};