<template>
  <a
    :href="site.whatsappGroupUrl"
    target="_blank"
    rel="noopener"
    class="group flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-3 transition-colors hover:bg-green-100 dark:border-green-900 dark:bg-green-950 dark:hover:bg-green-900"
    @click="onClick"
  >
    <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-green-500 text-white">
      <i class="pi pi-whatsapp" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-semibold text-green-900 dark:text-green-100">
        Communauté WhatsApp
      </span>
      <span class="block truncate text-xs text-green-700 dark:text-green-300">
        Conseils, sujets et entraide
      </span>
    </span>
    <i class="pi pi-arrow-up-right text-xs text-green-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-green-300" />
  </a>
</template>

<script setup lang="ts">
import { site } from "~/config/site";

const auth = useAuthStore();

function onClick() {
  // S'il rejoint via la carte, on n'affiche plus la modale d'invitation
  if (auth.user?.should_show_whatsapp_invite) {
    auth.respondWhatsappInvite("clicked");
  }
}
</script>