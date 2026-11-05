<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <!-- Téléphone ou email -->
    <div class="flex flex-col gap-2">
      <label for="login-identifier" class="text-sm font-semibold text-ink">
        Téléphone ou email
      </label>
      <InputText
        id="login-identifier"
        name="identifier"
        type="text"
        inputmode="text"
        placeholder="6XX XX XX XX ou votre@email.com"
        autocomplete="username"
        fluid
        :invalid="$form.identifier?.invalid"
      />
      <Message v-if="$form.identifier?.invalid" severity="error" size="small" variant="simple">
        {{ $form.identifier.error.message }}
      </Message>
      <p class="text-xs text-faint">
        Hors Cameroun, ajoutez l'indicatif du pays (ex. +225, +33).
      </p>
    </div>

    <!-- Mot de passe -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label for="login-password" class="text-sm font-semibold text-ink">Mot de passe</label>
        <a
          :href="forgotPasswordUrl($form.identifier?.value)"
          target="_blank"
          rel="noopener"
          class="text-xs font-semibold text-primary underline-offset-4 hover:underline"
        >
          Mot de passe oublié ?
        </a>
      </div>
      <Password
        input-id="login-password"
        name="password"
        placeholder="••••••••"
        autocomplete="current-password"
        :feedback="false"
        toggle-mask
        fluid
        :invalid="$form.password?.invalid"
      />
      <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
        {{ $form.password.error.message }}
      </Message>
    </div>

    <!-- Erreur API -->
    <div
      v-if="auth.error"
      class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900 dark:bg-red-950"
    >
      <i class="pi pi-exclamation-circle mt-0.5 text-red-600 dark:text-red-400" />
      <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ auth.error }}</p>
    </div>

    <!-- Envoi -->
    <AppButton
      type="submit"
      label="Se connecter"
      icon="pi pi-sign-in"
      variant="gradient"
      size="large"
      :loading="auth.loading"
      block
      class="mt-1"
    />

    <!-- Bascule -->
    <p class="text-center text-sm text-muted">
      Pas encore de compte ?
      <button
        type="button"
        class="font-semibold text-primary underline-offset-4 hover:underline"
        @click="switchTab('register')"
      >
        S'inscrire
      </button>
    </p>
  </Form>
</template>

<script setup lang="ts">
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { site } from "~/config/site";

const auth = useAuthStore();
const { close, switchTab } = useAuthModal();
const toast = useToast();

const initialValues = { identifier: "", password: "" };

const resolver = zodResolver(
  z.object({
    identifier: z
      .string()
      .trim()
      .min(3, { message: "Saisissez votre téléphone ou votre email." }),
    password: z.string().min(1, { message: "Mot de passe requis." }),
  }),
);

/** Lien WhatsApp vers le support, message pré-rempli avec l'identifiant saisi. */
function forgotPasswordUrl(identifier?: string): string {
  const account = identifier?.trim() ? identifier.trim() : "...";
  const text = `Bonjour, j'ai oublié mon mot de passe ${site.name}. Mon compte : ${account}`;
  return `https://wa.me/${site.supportWhatsapp}?text=${encodeURIComponent(text)}`;
}

async function onSubmit({
  valid,
  values,
}: {
  valid: boolean;
  values: { identifier?: string; password?: string };
}) {
  if (!valid) return;
  if (!values.identifier || !values.password) return;
  try {
    await auth.login({ identifier: values.identifier.trim(), password: values.password });
    toast.add({ severity: "success", summary: "Connecté !", life: 3000 });
    close();
  } catch {
    // erreur déjà dans auth.error
  }
}
</script>