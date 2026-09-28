<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <!-- Email -->
    <div class="flex flex-col gap-2">
      <label for="login-email" class="text-sm font-semibold text-ink">Email</label>
      <InputText
        id="login-email"
        name="email"
        type="email"
        placeholder="votre@email.com"
        autocomplete="email"
        fluid
        :invalid="$form.email?.invalid"
      />
      <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">
        {{ $form.email.error.message }}
      </Message>
    </div>

    <!-- Mot de passe -->
    <div class="flex flex-col gap-2">
      <label for="login-password" class="text-sm font-semibold text-ink">Mot de passe</label>
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

const auth = useAuthStore();
const { close, switchTab } = useAuthModal();
const toast = useToast();

const initialValues = { email: "", password: "" };

const resolver = zodResolver(
  z.object({
    email: z.string().email({ message: "Email invalide." }),
    password: z.string().min(1, { message: "Mot de passe requis." }),
  }),
);

async function onSubmit({
  valid,
  values,
}: {
  valid: boolean;
  values: { email?: string; password?: string };
}) {
  if (!valid) return;
  if (!values.email || !values.password) return;
  try {
    await auth.login({ email: values.email, password: values.password });
    toast.add({ severity: "success", summary: "Connecté !", life: 3000 });
    close();
  } catch {
    // erreur déjà dans auth.error
  }
}
</script>