export function useMedia() {
  const {
    public: { apiBaseUrl },
  } = useRuntimeConfig();

  function mediaUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (apiBaseUrl) return `${apiBaseUrl}${cleanPath}`;
    return `http://localhost:8002${cleanPath}`; // dev seulement
  }

  return { mediaUrl };
}
