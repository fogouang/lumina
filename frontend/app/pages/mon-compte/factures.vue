<template>
  <div>
    <h1 class="account-page-title">Mes factures</h1>

    <div class="account-section">
      <!-- Chargement -->
      <div v-if="loading" class="flex flex-col gap-3">
        <Skeleton v-for="n in 4" :key="n" height="4.5rem" border-radius="1rem" />
      </div>

      <!-- Vide -->
      <div v-else-if="!payments.length" class="flex flex-col items-center gap-3 py-12 text-center">
        <span class="grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
          <i class="pi pi-receipt text-xl" />
        </span>
        <p class="font-semibold text-ink">Aucune facture disponible</p>
        <p class="max-w-sm text-sm text-faint">Vos factures apparaîtront ici après votre premier paiement.</p>
      </div>

      <!-- Liste -->
      <div v-else class="flex flex-col divide-y divide-line">
        <div
          v-for="payment in payments"
          :key="payment.id"
          class="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
        >
          <div class="flex min-w-0 flex-1 items-center gap-4">
            <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              <i :class="paymentIcon(payment.payment_status)" />
            </span>
            <div class="min-w-0">
              <p class="truncate font-semibold text-ink">{{ payment.invoice_number }}</p>
              <div class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-faint">
                <Tag
                  :value="statusLabel(payment.payment_status)"
                  :severity="statusSeverity(payment.payment_status)"
                  rounded
                />
                <span class="capitalize">{{ payment.payment_method }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ formatDate(payment.created_at) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4 sm:justify-end">
            <p class="whitespace-nowrap font-heading text-lg font-extrabold text-ink">
              {{ formatPrice(payment.amount) }}
              <span class="text-xs font-semibold text-faint">FCFA</span>
            </p>
            <AppCta
              v-if="payment.invoice_url"
              :to="payment.invoice_url"
              external
              target="_blank"
              rel="noopener"
              label="PDF"
              icon="pi pi-download"
              icon-pos="left"
              variant="outline"
              size="md"
            />
            <AppButton
              v-else
              label="Générer"
              icon="pi pi-file-pdf"
              variant="secondary"
              size="small"
              :loading="generatingId === payment.id"
              @click="generateInvoice(payment.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaymentResponse } from '#shared/api/models/PaymentResponse'
import type { SuccessResponse_list_PaymentResponse__ } from '#shared/api/models/SuccessResponse_list_PaymentResponse__'

definePageMeta({ layout: 'account', middleware: 'auth' })

const { get, post } = useApi()
const toast = useToast()

const loading      = ref(true)
const payments     = ref<PaymentResponse[]>([])
const generatingId = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_PaymentResponse__>('/v1/payments/me')
    payments.value = (res.data ?? []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } finally {
    loading.value = false
  }
})

async function generateInvoice(paymentId: string) {
  generatingId.value = paymentId
  try {
    await post(`/v1/invoices/generate/${paymentId}`)
    toast.add({ severity: 'success', summary: 'Facture générée !', life: 3000 })
    // Recharger
    const res = await get<SuccessResponse_list_PaymentResponse__>('/v1/payments/me')
    payments.value = res.data ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Erreur lors de la génération', life: 3000 })
  } finally {
    generatingId.value = null
  }
}

function statusLabel(s: string) {
  return { pending: 'En attente', completed: 'Payé', failed: 'Échoué', refunded: 'Remboursé' }[s] ?? s
}
function statusSeverity(s: string) {
  return { pending: 'warning', completed: 'success', failed: 'danger', refunded: 'secondary' }[s] ?? 'secondary'
}
function paymentIcon(s: string) {
  return { pending: 'pi pi-clock', completed: 'pi pi-check', failed: 'pi pi-times', refunded: 'pi pi-refresh' }[s] ?? 'pi pi-receipt'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatPrice(n: number) {
  return n.toLocaleString('fr-FR')
}

useHead({ title: 'Factures | Lumina TCF' })
</script>

