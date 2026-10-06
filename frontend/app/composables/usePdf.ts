/**
 * Ouvre dans un nouvel onglet un PDF servi par l'API (contrats, factures).
 * Passe par useApi : même base d'URL et même cookie d'authentification.
 *
 * Usage : await usePdf().open("/v1/ambassador-contracts/<id>/pdf")
 */
export function usePdf() {
  const { get } = useApi();

  async function open(endpoint: string) {
    // Onglet ouvert tout de suite pour ne pas être bloqué comme popup
    const tab = window.open("", "_blank");
    try {
      const blob = await get<Blob>(endpoint, { responseType: "blob" });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
    } catch (err) {
      tab?.close();
      throw err;
    }
  }

  return { open };
}