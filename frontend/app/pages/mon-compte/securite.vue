<template>
  <div>

    <!-- Changer mot de passe -->
    <div class="account-section">
      <h2 class="account-section__title">Mot de passe</h2>

      <Form
        v-slot="$form"
        :initial-values="{ current_password: '', new_password: '', confirm_password: '' }"
        :resolver="passwordResolver"
        class="security-form"
        @submit="onPasswordSubmit"
      >
        <div class="security-form__field">
          <label class="security-form__label">Mot de passe actuel</label>
          <Password
            name="current_password"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            :invalid="$form.current_password?.invalid"
          />
          <Message v-if="$form.current_password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.current_password.error.message }}
          </Message>
        </div>

        <div class="security-form__field">
          <label class="security-form__label">Nouveau mot de passe</label>
          <Password
            name="new_password"
            placeholder="••••••••"
            toggle-mask
            fluid
            :invalid="$form.new_password?.invalid"
          />
          <Message v-if="$form.new_password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.new_password.error.message }}
          </Message>
        </div>

        <div class="security-form__field">
          <label class="security-form__label">Confirmer le nouveau mot de passe</label>
          <Password
            name="confirm_password"
            placeholder="••••••••"
            :feedback="false"
            toggle-mask
            fluid
            :invalid="$form.confirm_password?.invalid"
          />
          <Message v-if="$form.confirm_password?.invalid" severity="error" size="small" variant="simple">
            {{ $form.confirm_password.error.message }}
          </Message>
        </div>

        <Message v-if="passwordSuccess" severity="success" size="small">
          Mot de passe mis à jour avec succès.
        </Message>
        <Message v-if="passwordError" severity="error" size="small">
          {{ passwordError }}
        </Message>

        <div class="security-form__actions">
          <Button
            type="submit"
            label="Mettre à jour le mot de passe"
            icon="pi pi-lock"
            :loading="passwordLoading"
            class="security-form__btn bg-gradient-primary"
          />
        </div>
      </Form>
    </div>

    <!-- Zone danger -->
    <div class="account-section account-section--danger">
      <h2 class="account-section__title account-section__title--danger">Zone de danger</h2>

      <div class="danger-item">
        <div class="danger-item__text">
          <h3>Supprimer mon compte</h3>
          <p>Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
        </div>
        <Button
          label="Supprimer le compte"
          icon="pi pi-trash"
          severity="danger"
          outlined
          class="danger-item__btn"
          @click="confirmDelete = true"
        />
      </div>
    </div>

    <!-- Dialog confirmation suppression -->
    <Dialog
      v-model:visible="confirmDelete"
      modal
      header="Supprimer mon compte"
      :style="{ width: '420px' }"
    >
      <p class="confirm-delete__text">
        Êtes-vous sûr de vouloir supprimer votre compte ?
        Cette action est <strong>irréversible</strong>.
      </p>
      <template #footer>
        <Button label="Annuler" text @click="confirmDelete = false" />
        <Button
          label="Oui, supprimer"
          severity="danger"
          icon="pi pi-trash"
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

<style scoped>
/* ── Formulaire ────────────────────────────────────────────── */
.security-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  max-width: 480px;
}

.security-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.security-form__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.security-form__actions {
  padding-top: 0.5rem;
}

.security-form__btn {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

/* ── Danger zone ───────────────────────────────────────────── */
.account-section--danger {
  border-color: var(--color-danger-200) !important;
}

.account-section__title--danger {
  color: var(--color-danger-600);
}

.danger-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.danger-item__text h3 {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.danger-item__text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.danger-item__btn {
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Confirm dialog ────────────────────────────────────────── */
.confirm-delete__text {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

@media (max-width: 640px) {
  .danger-item { flex-direction: column; align-items: flex-start; }
  .security-form { max-width: 100%; }
}
</style>