<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    class="auth-form"
    @submit="onSubmit"
  >
    <!-- Email -->
    <div class="auth-form__field">
      <label class="auth-form__label">Email</label>
      <InputText
        name="email"
        type="email"
        placeholder="votre@email.com"
        fluid
        :invalid="$form.email?.invalid"
      />
      <Message
        v-if="$form.email?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.email.error.message }}
      </Message>
    </div>

    <!-- Mot de passe -->
    <div class="auth-form__field">
      <label class="auth-form__label">Mot de passe</label>
      <Password
        name="password"
        placeholder="••••••••"
        :feedback="false"
        toggle-mask
        fluid
        :invalid="$form.password?.invalid"
      />
      <Message
        v-if="$form.password?.invalid"
        severity="error"
        size="small"
        variant="simple"
      >
        {{ $form.password.error.message }}
      </Message>
    </div>

    <!-- Erreur API -->
    <Message v-if="auth.error" severity="error" size="small">
      {{ auth.error }}
    </Message>

    <!-- Submit -->
    <Button
      type="submit"
      label="Se connecter"
      icon="pi pi-sign-in"
      :loading="auth.loading"
      class="auth-form__submit bg-gradient-primary w-full"
    />

    <!-- Switch -->
    <p class="auth-form__switch">
      Pas encore de compte ?
      <button
        type="button"
        class="auth-form__switch-btn"
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

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.auth-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.auth-form__submit {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
  margin-top: 0.25rem;
}

.auth-form__switch {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.auth-form__switch-btn {
  background: none;
  border: none;
  color: var(--color-primary-600);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.auth-form__switch-btn:hover {
  text-decoration: underline;
}
</style>
