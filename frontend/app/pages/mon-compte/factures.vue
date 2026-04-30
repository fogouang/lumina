<template>
  <div>
    <h1 class="account-page-title">Mes factures</h1>

    <div class="account-section">

      <div v-if="loading" style="display:flex;justify-content:center;padding:3rem">
        <ProgressSpinner style="width:40px;height:40px" />
      </div>

      <div v-else-if="!payments.length" class="factures__empty">
        <i class="pi pi-receipt" />
        <p>Aucune facture disponible.</p>
      </div>

      <div v-else class="factures__list">
        <div
          v-for="payment in payments"
          :key="payment.id"
          class="facture-row"
        >
          <!-- Icône -->
          <div class="facture-row__icon" :class="`facture-row__icon--${payment.payment_status}`">
            <i :class="paymentIcon(payment.payment_status)" />
          </div>

          <!-- Infos -->
          <div class="facture-row__body">
            <span class="facture-row__ref">{{ payment.invoice_number }}</span>
            <div class="facture-row__meta">
              <Tag
                :value="statusLabel(payment.payment_status)"
                :severity="statusSeverity(payment.payment_status)"
              />
              <span class="facture-row__method">{{ payment.payment_method }}</span>
              <span class="facture-row__date">{{ formatDate(payment.created_at) }}</span>
            </div>
          </div>

          <!-- Montant -->
          <span class="facture-row__amount">{{ formatPrice(payment.amount) }} FCFA</span>

          <!-- Actions -->
          <div class="facture-row__actions">
            <a
              v-if="payment.invoice_url"
              :href="payment.invoice_url"
              target="_blank"
              rel="noopener"
            >
              <Button label="PDF" icon="pi pi-download" size="small" outlined />
            </a>
            <Button
              v-else
              label="Générer"
              icon="pi pi-file-pdf"
              size="small"
              outlined
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

<style scoped>
.factures__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 0;
  color: var(--text-tertiary);
  text-align: center;
}

.factures__empty i { font-size: 2.5rem; }
.factures__empty p { margin: 0; font-size: 0.9rem; }

.factures__list { display: flex; flex-direction: column; }

.facture-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.facture-row:last-child { border-bottom: none; }

.facture-row__icon {
  width: 40px; height: 40px;
  border-radius: 0.625rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.facture-row__icon--completed   { background: #f0fdf4; }
.facture-row__icon--completed i { color: #16a34a; font-size: 1rem; }
.facture-row__icon--pending   { background: #fffbeb; }
.facture-row__icon--pending i { color: #d97706; font-size: 1rem; }
.facture-row__icon--failed   { background: var(--color-danger-50); }
.facture-row__icon--failed i { color: var(--color-danger-600); font-size: 1rem; }
.facture-row__icon--refunded   { background: var(--bg-ground); }
.facture-row__icon--refunded i { color: var(--text-tertiary); font-size: 1rem; }

.facture-row__body { flex: 1; min-width: 0; }

.facture-row__ref {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 0.25rem;
}

.facture-row__meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.facture-row__method,
.facture-row__date {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  text-transform: capitalize;
}

.facture-row__amount {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.facture-row__actions { flex-shrink: 0; }
</style>