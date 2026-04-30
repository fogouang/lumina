<template>
  <div>
    <h1 class="account-page-title">Mon profil</h1>

    <!-- Informations personnelles -->
    <div class="account-section" style="margin-bottom:1.5rem">
      <h2 class="account-section__title">Informations personnelles</h2>

      <Form
        v-slot="$form"
        :initial-values="initialValues"
        :resolver="resolver"
        class="profil-form"
        @submit="onSubmit"
      >
        <div class="profil-form__row">
          <div class="profil-form__field">
            <label class="profil-form__label">Prénom</label>
            <InputText name="first_name" fluid :invalid="$form.first_name?.invalid" />
            <Message v-if="$form.first_name?.invalid" severity="error" size="small" variant="simple">
              {{ $form.first_name.error.message }}
            </Message>
          </div>
          <div class="profil-form__field">
            <label class="profil-form__label">Nom</label>
            <InputText name="last_name" fluid :invalid="$form.last_name?.invalid" />
            <Message v-if="$form.last_name?.invalid" severity="error" size="small" variant="simple">
              {{ $form.last_name.error.message }}
            </Message>
          </div>
        </div>

        <div class="profil-form__field">
          <label class="profil-form__label">Email</label>
          <InputText name="email" type="email" fluid disabled style="opacity:0.6;cursor:not-allowed" />
          <small style="font-size:0.8125rem;color:var(--text-tertiary)">L'email ne peut pas être modifié.</small>
        </div>

        <div class="profil-form__field">
          <label class="profil-form__label">
            Téléphone <span style="font-weight:400;color:var(--text-tertiary);font-size:0.8125rem">(optionnel)</span>
          </label>
          <InputText name="phone" type="tel" fluid />
        </div>

        <Message v-if="successMsg" severity="success" size="small">{{ successMsg }}</Message>
        <Message v-if="errorMsg"   severity="error"   size="small">{{ errorMsg }}</Message>

        <div style="display:flex;justify-content:flex-end;padding-top:0.5rem">
          <Button
            type="submit"
            label="Enregistrer"
            icon="pi pi-check"
            :loading="loading"
            class="bg-gradient-primary"
            style="border:none!important;border-radius:0.75rem!important;font-weight:700!important"
          />
        </div>
      </Form>
    </div>

    <!-- Informations compte -->
    <div class="account-section">
      <h2 class="account-section__title">Informations compte</h2>
      <div class="info-list">
        <div class="info-item">
          <span class="info-item__label">Rôle</span>
          <Tag :value="roleLabel" severity="info" />
        </div>
        <div class="info-item">
          <span class="info-item__label">Statut</span>
          <Tag
            :value="auth.user?.is_active ? 'Actif' : 'Inactif'"
            :severity="auth.user?.is_active ? 'success' : 'danger'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import type { UserUpdate } from '#shared/api/models/UserUpdate'

definePageMeta({ layout: 'account', middleware: 'auth' })

const auth    = useAuthStore()
const { patch } = useApi()
const loading    = ref(false)
const successMsg = ref<string | null>(null)
const errorMsg   = ref<string | null>(null)

const initialValues = computed(() => ({
  first_name: auth.user?.first_name ?? '',
  last_name:  auth.user?.last_name  ?? '',
  email:      auth.user?.email      ?? '',
  phone:      auth.user?.phone      ?? '',
}))

const resolver = zodResolver(
  z.object({
    first_name: z.string().min(2, { message: 'Prénom requis (min 2 caractères).' }),
    last_name:  z.string().min(2, { message: 'Nom requis (min 2 caractères).' }),
    email:      z.string().optional(),
    phone:      z.string().optional(),
  })
)

async function onSubmit({ valid, values }: {
  valid: boolean
  values: { first_name?: string; last_name?: string; phone?: string }
}) {
  if (!valid || !values.first_name || !values.last_name) return
  loading.value    = true
  successMsg.value = null
  errorMsg.value   = null
  try {
    const payload: UserUpdate = {
      first_name: values.first_name,
      last_name:  values.last_name,
      phone:      values.phone || null,
    }
    await patch(`/v1/users/${auth.user?.id}`, payload)
    await auth.fetchMe()
    successMsg.value = 'Profil mis à jour avec succès.'
  } catch {
    errorMsg.value = 'Une erreur est survenue. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    platform_admin: 'Admin',
    org_admin:      'Admin Org.',
    teacher:        'Enseignant',
    student:        'Étudiant',
  }
  return labels[auth.user?.role ?? ''] ?? auth.user?.role ?? '—'
})

useHead({ title: 'Mon profil | Lumina TCF' })
</script>

<style scoped>
.profil-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.profil-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.profil-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.profil-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.info-list { display: flex; flex-direction: column; }

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child { border-bottom: none; }

.info-item__label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 640px) {
  .profil-form__row { grid-template-columns: 1fr; }
}
</style>