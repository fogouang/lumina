<template>
  <div class="flex flex-col gap-6">
    <h1 class="account-page-title mb-0">Mon profil</h1>

    <div class="grid gap-6 xl:grid-cols-3 xl:items-start">
      <!-- Informations personnelles -->
      <div v-reveal class="account-section xl:col-span-2">
        <h2 class="account-section__title">Informations personnelles</h2>

        <Form
          v-slot="$form"
          :initial-values="initialValues"
          :resolver="resolver"
          class="flex flex-col gap-5"
          @submit="onSubmit"
        >
          <div class="grid gap-5 sm:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label for="profile-first-name" class="text-sm font-semibold text-ink">Prénom</label>
              <InputText
                id="profile-first-name"
                name="first_name"
                autocomplete="given-name"
                fluid
                :invalid="$form.first_name?.invalid"
              />
              <Message v-if="$form.first_name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.first_name.error.message }}
              </Message>
            </div>
            <div class="flex flex-col gap-2">
              <label for="profile-last-name" class="text-sm font-semibold text-ink">Nom</label>
              <InputText
                id="profile-last-name"
                name="last_name"
                autocomplete="family-name"
                fluid
                :invalid="$form.last_name?.invalid"
              />
              <Message v-if="$form.last_name?.invalid" severity="error" size="small" variant="simple">
                {{ $form.last_name.error.message }}
              </Message>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="profile-email" class="text-sm font-semibold text-ink">Email</label>
            <InputText id="profile-email" name="email" type="email" fluid disabled class="cursor-not-allowed opacity-60" />
            <p class="flex items-center gap-1.5 text-xs text-faint">
              <i class="pi pi-lock text-[0.65rem]" />
              L'email ne peut pas être modifié.
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <label for="profile-phone" class="text-sm font-semibold text-ink">
              Téléphone <span class="font-normal text-faint">(optionnel)</span>
            </label>
            <InputText id="profile-phone" name="phone" type="tel" autocomplete="tel" fluid />
          </div>

          <div
            v-if="successMsg"
            class="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-3.5 dark:border-green-900 dark:bg-green-950"
          >
            <i class="pi pi-check-circle mt-0.5 text-green-600 dark:text-green-400" />
            <p class="text-sm font-medium text-green-800 dark:text-green-300">{{ successMsg }}</p>
          </div>
          <div
            v-if="errorMsg"
            class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900 dark:bg-red-950"
          >
            <i class="pi pi-exclamation-circle mt-0.5 text-red-600 dark:text-red-400" />
            <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ errorMsg }}</p>
          </div>

          <div class="flex justify-end border-t border-line pt-5">
            <AppButton
              type="submit"
              label="Enregistrer"
              icon="pi pi-check"
              variant="gradient"
              :loading="loading"
            />
          </div>
        </Form>
      </div>

      <!-- Informations compte -->
      <div v-reveal="{ delay: 120 }" class="account-section">
        <h2 class="account-section__title">Informations compte</h2>

        <div class="flex flex-col items-center gap-3 pb-6 text-center">
          <span class="brand-gradient grid size-18 place-items-center rounded-full font-heading text-xl font-bold text-white shadow-brand">
            <template v-if="initials">{{ initials }}</template>
            <i v-else class="pi pi-user text-xl" />
          </span>
          <div class="min-w-0">
            <p class="font-heading text-lg font-bold text-ink">{{ auth.fullName }}</p>
            <p class="truncate text-sm text-faint">{{ auth.user?.email }}</p>
          </div>
        </div>

        <dl class="flex flex-col divide-y divide-line border-t border-line">
          <div class="flex items-center justify-between py-3.5">
            <dt class="text-sm text-muted">Rôle</dt>
            <dd><Tag :value="roleLabel" severity="info" rounded /></dd>
          </div>
          <div class="flex items-center justify-between py-3.5">
            <dt class="text-sm text-muted">Statut</dt>
            <dd>
              <Tag
                :value="auth.user?.is_active ? 'Actif' : 'Inactif'"
                :severity="auth.user?.is_active ? 'success' : 'danger'"
                rounded
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import type { UserUpdate } from "#shared/api/models/UserUpdate";
import { site } from "~/config/site";

definePageMeta({ layout: "account", middleware: "auth" });

const auth = useAuthStore();
const { patch } = useApi();
const loading = ref(false);
const successMsg = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

const initialValues = computed(() => ({
  first_name: auth.user?.first_name ?? "",
  last_name: auth.user?.last_name ?? "",
  email: auth.user?.email ?? "",
  phone: auth.user?.phone ?? "",
}));

const resolver = zodResolver(
  z.object({
    first_name: z.string().min(2, { message: "Prénom requis (min 2 caractères)." }),
    last_name: z.string().min(2, { message: "Nom requis (min 2 caractères)." }),
    email: z.string().optional(),
    phone: z.string().optional(),
  }),
);

async function onSubmit({
  valid,
  values,
}: {
  valid: boolean;
  values: { first_name?: string; last_name?: string; phone?: string };
}) {
  if (!valid || !values.first_name || !values.last_name) return;
  loading.value = true;
  successMsg.value = null;
  errorMsg.value = null;
  try {
    const payload: UserUpdate = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone || null,
    };
    await patch(`/v1/users/${auth.user?.id}`, payload);
    await auth.fetchMe();
    successMsg.value = "Profil mis à jour avec succès.";
  } catch {
    errorMsg.value = "Une erreur est survenue. Veuillez réessayer.";
  } finally {
    loading.value = false;
  }
}

const initials = computed(() =>
  `${auth.user?.first_name?.charAt(0) ?? ""}${auth.user?.last_name?.charAt(0) ?? ""}`.toUpperCase(),
);

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    platform_admin: "Admin",
    org_admin: "Admin Org.",
    teacher: "Enseignant",
    student: "Étudiant",
  };
  return labels[auth.user?.role ?? ""] ?? auth.user?.role ?? "—";
});

useHead({ title: `Mon profil | ${site.name}` });
</script>