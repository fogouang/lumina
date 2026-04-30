// app/composables/useMedia.ts
export function useMedia() {
  const { public: { apiBaseUrl } } = useRuntimeConfig()
  const base = apiBaseUrl || 'https://lumina-tcf.online'

  function mediaUrl(path: string | null | undefined): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${base}/${path.replace(/^\//, '')}`
  }

  return { mediaUrl }
}