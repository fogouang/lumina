<template>
  <section class="section section--light">
    <div class="container">

      <!-- Header -->
      <div class="section-header">
        <Tag value="Outil gratuit" severity="success" />
        <h2 class="section-title">Calculez votre niveau NCLC</h2>
        <p class="section-subtitle">
          Entrez vos scores TCF Canada pour connaître instantanément
          votre équivalence NCLC.
        </p>
      </div>

      <div class="nclc__wrapper">

        <!-- Calculateur -->
        <div class="nclc__calculator">
          <div class="nclc__inputs">
            <div v-for="field in fields" :key="field.key" class="nclc__field">
              <label class="nclc__label">
                {{ field.emoji }} {{ field.label }}
                <span class="nclc__range">({{ field.min }}–{{ field.max }})</span>
              </label>
              <InputNumber
                v-model="scores[field.key]"
                :min="field.min"
                :max="field.max"
                :placeholder="`ex. ${field.example}`"
                :use-grouping="false"
                show-buttons
                class="nclc__input"
              />
            </div>
          </div>

          <Button
            label="Calculer mon niveau NCLC"
            icon="pi pi-calculator"
            size="large"
            class="nclc__submit bg-gradient-primary w-full"
            @click="calculate"
          />

          <!-- Résultats -->
          <Transition name="nclc__fade">
            <div v-if="results" class="nclc__results">
              <div
                v-for="field in fields"
                :key="field.key"
                class="nclc__result-item"
              >
                <span class="nclc__result-label">{{ field.emoji }} {{ field.label }}</span>
                <Tag
                  :value="results[field.key] !== '—' ? `NCLC ${results[field.key]}` : '—'"
                  :severity="getSeverity(results[field.key])"
                />
              </div>
            </div>
          </Transition>
        </div>

        <!-- Table équivalence -->
        <div class="nclc__table-wrap">
          <h4 class="nclc__table-title">
            <i class="pi pi-table" />
            Tableau d'équivalence officiel
          </h4>
          <DataTable
            :value="equivalenceTable"
            striped-rows
            class="nclc__table"
            size="small"
          >
            <Column field="nclc" header="NCLC"         style="width: 80px; font-weight: 700;" />
            <Column field="co"   header="Comp. Orale"  />
            <Column field="ce"   header="Comp. Écrite" />
            <Column field="eo"   header="Exp. Orale"   />
            <Column field="ee"   header="Exp. Écrite"  />
          </DataTable>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// ── Champs ─────────────────────────────────────────────────────────────────
const fields = [
  { key: 'co', label: 'Compréhension orale',  emoji: '🎧', min: 100, max: 699, example: 450 },
  { key: 'ce', label: 'Compréhension écrite', emoji: '📖', min: 100, max: 699, example: 480 },
  { key: 'eo', label: 'Expression orale',     emoji: '🎤', min: 0,   max: 20,  example: 12  },
  { key: 'ee', label: 'Expression écrite',    emoji: '✍️', min: 0,   max: 20,  example: 10  },
]

const scores  = ref({ co: null, ce: null, eo: null, ee: null })
const results = ref(null)

// ── Tables de conversion officielles ──────────────────────────────────────
const rangesCO = [
  [10, 549, 699], [9, 523, 548], [8, 503, 522], [7, 458, 502],
  [6, 398, 457],  [5, 369, 397], [4, 331, 368],
]
const rangesCE = [
  [10, 549, 699], [9, 524, 548], [8, 499, 523], [7, 453, 498],
  [6, 406, 452],  [5, 375, 405], [4, 342, 374],
]
const rangesEO = [
  [10, 16, 20], [9, 14, 15], [8, 12, 13], [7, 10, 11],
  [6, 7, 9],    [5, 6, 6],   [4, 4, 5],
]
const rangesEE = [
  [10, 16, 20], [9, 14, 15], [8, 12, 13], [7, 10, 11],
  [6, 7, 9],    [5, 6, 6],   [4, 4, 5],
]

const rangesMap = { co: rangesCO, ce: rangesCE, eo: rangesEO, ee: rangesEE }

function getLevel(score, ranges) {
  if (score === null || score === undefined) return '—'
  for (const [level, min, max] of ranges) {
    if (score >= min && score <= max) return level
  }
  return score < ranges[ranges.length - 1][1] ? '<4' : '10+'
}

function calculate() {
  results.value = Object.fromEntries(
    fields.map(f => [f.key, getLevel(scores.value[f.key], rangesMap[f.key])])
  )
}

function getSeverity(level) {
  if (level === '—') return 'secondary'
  const n = parseInt(level)
  if (n >= 7)  return 'success'
  if (n >= 5)  return 'warning'
  return 'danger'
}

// ── Table ──────────────────────────────────────────────────────────────────
const equivalenceTable = [
  { nclc: '10+', co: '549–699', ce: '549–699', eo: '16–20', ee: '16–20' },
  { nclc: '9',   co: '523–548', ce: '524–548', eo: '14–15', ee: '14–15' },
  { nclc: '8',   co: '503–522', ce: '499–523', eo: '12–13', ee: '12–13' },
  { nclc: '7',   co: '458–502', ce: '453–498', eo: '10–11', ee: '10–11' },
  { nclc: '6',   co: '398–457', ce: '406–452', eo: '7–9',   ee: '7–9'   },
  { nclc: '5',   co: '369–397', ce: '375–405', eo: '6',     ee: '6'     },
  { nclc: '4',   co: '331–368', ce: '342–374', eo: '4–5',   ee: '4–5'   },
]
</script>

<style scoped>
.nclc__wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* ── Calculateur ───────────────────────────────────────────── */
.nclc__calculator {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.nclc__inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.nclc__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nclc__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.nclc__range {
  font-weight: 400;
  color: var(--text-tertiary);
}

.nclc__input {
  width: 100%;
}

.nclc__submit {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

/* ── Résultats ─────────────────────────────────────────────── */
.nclc__results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-color);
}

.nclc__result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  background: var(--bg-ground);
  border-radius: 0.625rem;
}

.nclc__result-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* ── Transition ────────────────────────────────────────────── */
.nclc__fade-enter-active,
.nclc__fade-leave-active {
  transition: all 0.3s ease;
}
.nclc__fade-enter-from,
.nclc__fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ── Table ─────────────────────────────────────────────────── */
.nclc__table-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  padding: 1.5rem;
}

.nclc__table-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nclc__table-title i {
  color: var(--color-primary-600);
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .nclc__wrapper {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .nclc__inputs  { grid-template-columns: 1fr; }
  .nclc__results { grid-template-columns: 1fr; }
}
</style>