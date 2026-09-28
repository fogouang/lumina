<template>
  <div class="flex flex-col gap-6">
    <h1 class="account-page-title mb-0">Sécurité</h1>

    <!-- Mot de passe -->
    <div class="account-section">
      <h2 class="account-section__title">Mot de passe</h2>

      <Form
        v-slot="$form"
        :initial-values="{ current_password: '', new_password: '', confirm_password: '' }"
        :resolver="passwordResolver"
        class="flex max-w-xl flex-col gap-5"
        @submit="onPasswordSubmit"
      >
        <div class="flex flex-col gap-2">
          <label for="security-current" class="text-sm font-semibold text-ink">Mot de passe actuel</label>
          <Password
            input-id="security-current"
            name="current_password"
            placeholder="••••••••"
            autocomplete="current-password"
            :feedback="false"
            toggle-mask
            fluid
            :invalid="$form.current_password?.invalid"
          />
          <Message v-if="$form.current_password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.current_password.error.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="security-new" class="text-sm font-semibold text-ink">Nouveau mot de passe</label>
          <Password
            input-id="security-new"
            name="new_password"
            placeholder="••••••••"
            autocomplete="new-password"
            toggle-mask
            fluid
            :invalid="$form.new_password?.invalid"
          />
          <Message v-if="$form.new_password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.new_password.error.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-2">
          <label for="security-confirm" class="text-sm font-semibold text-ink">Confirmer le nouveau mot de passe</label>
          <Password
            input-id="security-confirm"
            name="confirm_password"
            placeholder="••••••••"
            autocomplete="new-password"
            :feedback="false"
            toggle-mask
            fluid
            :invalid="$form.confirm_password?.invalid"
          />
          <Message v-if="$form.confirm_password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.confirm_password.error.message }}
          </Message>
        </div>

        <div
          v-if="passwordSuccess"
          class="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-3.5 dark:border-green-900 dark:bg-green-950"
        >
          <i class="pi pi-check-circle mt-0.5 text-green-600 dark:text-green-400" />
          <p class="text-sm font-medium text-green-800 dark:text-green-300">Mot de passe mis à jour avec succès.</p>
        </div>
        <div
          v-if="passwordError"
          class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900 dark:bg-red-950"
        >
          <i class="pi pi-exclamation-circle mt-0.5 text-red-600 dark:text-red-400" />
          <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ passwordError }}</p>
        </div>

        <div>
          <AppButton
            type="submit"
            label="Mettre à jour le mot de passe"
            icon="pi pi-lock"
            variant="gradient"
            :loading="passwordLoading"
          />
        </div>
      </Form>
    </div>

    <!-- Zone de danger -->
    <div class="account-section border-red-200 dark:border-red-900">
      <h2 class="account-section__title border-red-200 text-red-600 dark:border-red-900 dark:text-red-400">
        Zone de danger
      </h2>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-4">
          <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-trash" />
          </span>
          <div>
            <h3 class="font-heading font-bold text-ink">Supprimer mon compte</h3>
            <p class="mt-1 max-w-lg text-sm leading-relaxed text-muted">
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </p>
          </div>
        </div>
        <AppButton
          label="Supprimer le compte"
          icon="pi pi-trash"
          variant="danger"
          class="shrink-0"
          @click="confirmDelete = true"
        />
      </div>
    </div>

    <!-- Confirmation suppression -->
    <Dialog
      v-model:visible="confirmDelete"
      modal
      dismissable-mask
      :draggable="false"
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-exclamation-triangle" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Supprimer mon compte ?</h3>
        </div>
      </template>

      <p class="leading-relaxed text-muted">
        Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est
        <strong class="font-semibold text-ink">irréversible</strong>.
      </p>

      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="confirmDelete = false" />
        <AppButton
          label="Oui, supprimer"
          icon="pi pi-trash"
          variant="danger"
          :loading="deleteLoading"
          @click="onDeleteAccount"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { zodResolver } from '@primevue/forms/resolvers/zod'

definePageMeta({ layout: 'account', middleware: 'auth' })


const auth          = useAuthStore()
const { patch, del } = useApi()
const toast         = useToast()

// ── Mot de passe ─────────────────────────────────────────────
const passwordLoading = ref(false)
const passwordSuccess = ref(false)
const passwordError   = ref<string | null>(null)

const passwordResolver = zodResolver(
  z.object({
    current_password: z.string().min(1, { message: 'Mot de passe actuel requis.' }),
    new_password:     z.string().min(8, { message: 'Minimum 8 caractères.' }),
    confirm_password: z.string().min(1, { message: 'Confirmation requise.' }),
  }).refine(data => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirm_password'],
  })
)

async function onPasswordSubmit({ valid, values }: {
  valid: boolean
  values: { current_password?: string; new_password?: string; confirm_password?: string }
}) {
  if (!valid) return
  if (!values.current_password || !values.new_password) return

  passwordLoading.value = true
  passwordSuccess.value = false
  passwordError.value   = null

  try {
    await patch(`/v1/users/${auth.user?.id}`, {
      current_password: values.current_password,
      new_password:     values.new_password,
    })
    passwordSuccess.value = true
    toast.add({ severity: 'success', summary: 'Mot de passe mis à jour !', life: 3000 })
  } catch {
    passwordError.value = 'Mot de passe actuel incorrect ou erreur serveur.'
  } finally {
    passwordLoading.value = false
  }
}

// ── Suppression compte ───────────────────────────────────────
const confirmDelete = ref(false)
const deleteLoading = ref(false)

async function onDeleteAccount() {
  deleteLoading.value = true
  try {
    await del(`/v1/users/${auth.user?.id}`)
    confirmDelete.value = false
    await auth.logout()
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur lors de la suppression.', life: 3000 })
  } finally {
    deleteLoading.value = false
  }
}

useHead({ title: 'Sécurité | Lumina TCF' })
</script>

