// app/composables/useAuthModal.ts

export function useAuthModal() {
  const isOpen = useState<boolean>("auth-modal-open", () => false);
  const activeTab = useState<"login" | "register">(
    "auth-modal-tab",
    () => "login",
  );

  function openLogin() {
    activeTab.value = "login";
    isOpen.value = true;
  }

  function openRegister() {
    activeTab.value = "register";
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
  }

  function switchTab(tab: "login" | "register") {
    activeTab.value = tab;
  }

  return { isOpen, activeTab, openLogin, openRegister, close, switchTab };
}
