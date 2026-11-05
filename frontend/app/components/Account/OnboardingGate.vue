<template>
  <!-- 1. Téléphone obligatoire (anciens comptes) -->
  <Dialog
    :visible="auth.needsPhone"
    modal
    :closable="false"
    :draggable="false"
    class="w-[min(28rem,92vw)]"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <i class="pi pi-phone" />
        </span>
        <h2 class="font-heading text-lg font-bold text-ink">Ajoutez votre numéro</h2>
      </div>
    </template>

    <p class="mb-5 text-sm leading-relaxed text-muted">
      Pour continuer, renseignez votre numéro de téléphone. Il vous servira aussi
      à vous connecter et à recevoir notre aide en cas de besoin.
    </p>

    <form class="flex flex-col gap-3" @submit.prevent="savePhone">
      <div class="flex gap-2">
        <Select
          v-model="dialCode"
          :options="DIAL_CODES"
          option-label="label"
          option-value="value"
          class="w-40 shrink-0"
          aria-label="Indicatif pays"
        >
          <template #value="{ value }">{{ value }}</template>
        </Select>
        <InputText
          v-model="phoneNumber"
          type="tel"
          inputmode="tel"
          placeholder="6XX XX XX XX"
          autocomplete="tel-national"
          fluid
          :invalid="!!phoneError"
        />
      </div>
      <Message v-if="phoneError" severity="error" size="small" variant="simple">
        {{ phoneError }}
      </Message>

      <AppButton
        type="submit"
        label="Enregistrer"
        icon="pi pi-check"
        variant="gradient"
        :loading="savingPhone"
        block
        class="mt-2"
      />
    </form>
  </Dialog>

  <!-- 2. Invitation au groupe WhatsApp -->
  <Dialog
    :visible="showWhatsapp"
    modal
    :closable="false"
    :draggable="false"
    class="w-[min(28rem,92vw)]"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
          <i class="pi pi-whatsapp text-lg" />
        </span>
        <h2 class="font-heading text-lg font-bold text-ink">Rejoignez la communauté</h2>
      </div>
    </template>

    <p class="mb-6 text-sm leading-relaxed text-muted">
      Rejoignez le groupe WhatsApp {{ site.name }} : sujets d'actualité, conseils pour
      le TCF Canada, annonces et entraide entre candidats.
    </p>

    <div class="flex flex-col gap-2">
      <AppButton
        label="Rejoindre le groupe"
        icon="pi pi-whatsapp"
        variant="gradient"
        block
        @click="joinGroup"
      />
      <AppButton
        label="Plus tard"
        variant="ghost"
        block
        @click="dismissInvite"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { site } from "~/config/site";
import { DIAL_CODES } from "~/utils/phone";

const auth = useAuthStore();
const toast = useToast();

// ── Téléphone ──
const dialCode = ref("+237");
const phoneNumber = ref("");
const phoneError = ref<string | null>(null);
const savingPhone = ref(false);

async function savePhone() {
  phoneError.value = null;
  if (!PHONE_INPUT_REGEX.test(phoneNumber.value)) {
    phoneError.value = "Numéro de téléphone invalide.";
    return;
  }
  savingPhone.value = true;
  try {
    await auth.updatePhone(buildPhone(dialCode.value, phoneNumber.value));
    toast.add({ severity: "success", summary: "Numéro enregistré", life: 2500 });
  } catch (err: any) {
    phoneError.value = err?.data?.message ?? "Impossible d'enregistrer ce numéro.";
  } finally {
    savingPhone.value = false;
  }
}

// ── WhatsApp ──
// Masquage local immédiat, sans attendre la réponse du serveur
const hiddenLocally = ref(false);
const showWhatsapp = computed(
  () => !auth.needsPhone && auth.needsWhatsappInvite && !hiddenLocally.value,
);

function joinGroup() {
  // Ouvrir d'abord (synchronement) pour ne pas être bloqué par le navigateur
  window.open(site.whatsappGroupUrl, "_blank", "noopener");
  hiddenLocally.value = true;
  auth.respondWhatsappInvite("clicked");
}

function dismissInvite() {
  hiddenLocally.value = true;
  auth.respondWhatsappInvite("dismissed");
}
</script>