<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    class="auth-form"
    @submit="onSubmit"
  >
    <!-- Prénom + Nom -->
    <div class="auth-form__row">
      <div class="auth-form__field">
        <label class="auth-form__label">Prénom</label>
        <InputText
          name="first_name"
          placeholder="Jean"
          fluid
          :invalid="$form.first_name?.invalid"
        />
        <Message
          v-if="$form.first_name?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.first_name.error.message }}
        </Message>
      </div>

      <div class="auth-form__field">
        <label class="auth-form__label">Nom</label>
        <InputText
          name="last_name"
          placeholder="Dupont"
          fluid
          :invalid="$form.last_name?.invalid"
        />
        <Message
          v-if="$form.last_name?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.last_name.error.message }}
        </Message>
      </div>
    </div>

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

    <!-- Téléphone -->
    <div class="auth-form__field">
      <label class="auth-form__label"
        >Téléphone <span class="auth-form__optional">(optionnel)</span></label
      >
      <InputText name="phone" type="tel" placeholder="+237 6XX XXX XXX" fluid />
    </div>

    <!-- Mot de passe -->
    <div class="auth-form__field">
      <label class="auth-form__label">Mot de passe</label>
      <Password
        name="password"
        placeholder="••••••••"
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
      label="Créer mon compte"
      icon="pi pi-user-plus"
      :loading="auth.loading"
      class="auth-form__submit bg-gradient-primary w-full"
    />

    <!-- Switch -->
    <p class="auth-form__switch">
      Déjà un compte ?
      <button
        type="button"
        class="auth-form__switch-btn"
        @click="switchTab('login')"
      >
        Se connecter
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

const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
};

const resolver = zodResolver(
  z.object({
    first_name: z
      .string()
      .min(2, { message: "Prénom requis (min 2 caractères)." }),
    last_name: z.string().min(2, { message: "Nom requis (min 2 caractères)." }),
    email: z.string().email({ message: "Email invalide." }),
    phone: z.string().optional(),
    password: z.string().min(8, { message: "Mot de passe min 8 caractères." }),
  }),
);

async function onSubmit({
  valid,
  values,
}: {
  valid: boolean;
  values: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };
}) {
  if (!valid) return;
  if (
    !values.first_name ||
    !values.last_name ||
    !values.email ||
    !values.password
  )
    return;

  try {
    await auth.register({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || null,
      password: values.password,
    });
    toast.add({
      severity: "success",
      summary: "Compte créé !",
      detail: "Bienvenue sur Pack Ice TCF.",
      life: 3000,
    });
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
  gap: 1rem;
}

.auth-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
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

.auth-form__optional {
  font-weight: 400;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
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

@media (max-width: 480px) {
  .auth-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
