<template>
  <Form
    v-slot="$form"
    :initial-values="initialValues"
    :resolver="resolver"
    class="flex flex-col gap-5"
    @submit="onSubmit"
  >
    <!-- Parrainage -->
    <div
      v-if="referralCode"
      class="flex items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-3.5 dark:border-accent-900 dark:bg-accent-950"
    >
      <span class="grid size-9 shrink-0 place-items-center rounded-[0.8rem_0.25rem] bg-accent-400 text-accent-950">
        <i class="pi pi-gift text-sm" />
      </span>
      <p class="text-sm font-semibold text-accent-900 dark:text-accent-200">
        Vous avez été invité·e à rejoindre {{ site.name }}.
      </p>
    </div>

    <!-- Prénom + Nom -->
    <div class="grid gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label for="register-first-name" class="text-sm font-semibold text-ink">Prénom</label>
        <InputText
          id="register-first-name"
          name="first_name"
          placeholder="Jean"
          autocomplete="given-name"
          fluid
          :invalid="$form.first_name?.invalid"
        />
        <Message v-if="$form.first_name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.first_name.error.message }}
        </Message>
      </div>

      <div class="flex flex-col gap-2">
        <label for="register-last-name" class="text-sm font-semibold text-ink">Nom</label>
        <InputText
          id="register-last-name"
          name="last_name"
          placeholder="Dupont"
          autocomplete="family-name"
          fluid
          :invalid="$form.last_name?.invalid"
        />
        <Message v-if="$form.last_name?.invalid" severity="error" size="small" variant="simple">
          {{ $form.last_name.error.message }}
        </Message>
      </div>
    </div>

    <!-- Email -->
    <div class="flex flex-col gap-2">
      <label for="register-email" class="text-sm font-semibold text-ink">Email</label>
      <InputText
        id="register-email"
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

    <!-- Téléphone -->
    <div class="flex flex-col gap-2">
      <label for="register-phone" class="text-sm font-semibold text-ink">
        Téléphone <span class="font-normal text-faint">(optionnel)</span>
      </label>
      <InputText
        id="register-phone"
        name="phone"
        type="tel"
        placeholder="+237 6XX XXX XXX"
        autocomplete="tel"
        fluid
      />
    </div>

    <!-- Mot de passe -->
    <div class="flex flex-col gap-2">
      <label for="register-password" class="text-sm font-semibold text-ink">Mot de passe</label>
      <Password
        input-id="register-password"
        name="password"
        placeholder="••••••••"
        autocomplete="new-password"
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
      label="Créer mon compte"
      icon="pi pi-user-plus"
      variant="gradient"
      size="large"
      :loading="auth.loading"
      block
      class="mt-1"
    />

    <!-- Bascule -->
    <p v-if="showSwitch" class="text-center text-sm text-muted">
      Déjà un compte ?
      <button
        type="button"
        class="font-semibold text-primary underline-offset-4 hover:underline"
        @click="handleSwitchToLogin"
      >
        Se connecter
      </button>
    </p>
  </Form>
</template>

<script setup lang="ts">
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { site } from "~/config/site";

const props = defineProps<{
  referralCode?: string | null;
  showSwitch?: boolean;
}>();

const emit = defineEmits<{
  success: [];
}>();

const auth = useAuthStore();
const { close, switchTab, openLogin } = useAuthModal();

function handleSwitchToLogin() {
  switchTab("login"); // pour le cas où le composant est dans le modal
  openLogin(); // pour le cas où on est sur une page standalone (no-op si déjà ouvert)
}

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
      referral_code: props.referralCode || undefined,
    });
    toast.add({
      severity: "success",
      summary: "Compte créé !",
      detail: `Bienvenue sur ${site.name}.`,
      life: 3000,
    });
    close();
    emit("success");
  } catch {
    // erreur déjà dans auth.error
  }
}
</script>