/**
 * Sujets d'expression écrite déjà faits (par compte, stockés dans le navigateur).
 * comboId -> note /20 obtenue à la dernière correction.
 */
export function useEEProgress() {
  const auth = useAuthStore();
  const done = useState<Record<string, number>>("ee-done", () => ({}));

  const storageKey = computed(() => `ee-done-v1:${auth.user?.id ?? "anon"}`);

  function load() {
    if (import.meta.server) return;
    try {
      done.value = JSON.parse(localStorage.getItem(storageKey.value) || "{}");
    } catch {
      done.value = {};
    }
  }

  function markDone(comboId: string, score: number) {
    done.value = { ...done.value, [comboId]: score };
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(done.value));
    } catch {
      // stockage indisponible (navigation privée) : on garde juste en mémoire
    }
  }

  function isDone(comboId: string) {
    return comboId in done.value;
  }

  return { done, load, markDone, isDone };
}