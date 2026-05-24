// app/composables/useBuyCreditsDialog.ts
export function useBuyCreditsDialog() {
  const isOpen = useState<boolean>("buy-credits-dialog-open", () => false);

  function open() {
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  return { isOpen, open, close };
}