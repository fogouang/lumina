<template>
  <section class="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
    <div class="bg-grid pointer-events-none absolute inset-0 opacity-60" />

    <div class="relative mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Outil gratuit"
        title="Calculez votre niveau NCLC"
        subtitle="Entrez vos scores TCF Canada pour connaître instantanément votre équivalence NCLC."
      />

      <div class="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start">
        <!-- Calculateur -->
        <div v-reveal="{ from: 'left' }">
          <div class="rounded-[2rem_0.5rem] border border-line bg-card p-7 shadow-lift sm:p-8">
            <div class="flex items-center gap-3">
              <span class="brand-gradient grid size-11 place-items-center rounded-leaf text-white shadow-brand">
                <i class="pi pi-calculator" />
              </span>
              <div>
                <h3 class="font-heading text-lg font-bold text-ink">Vos scores</h3>
                <p class="text-sm text-faint">Remplissez une ou plusieurs épreuves</p>
              </div>
            </div>

            <div class="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div v-for="field in fields" :key="field.key" class="flex flex-col gap-2">
                <label :for="`nclc-${field.key}`" class="flex items-center gap-2 text-sm font-semibold text-ink">
                  <i :class="[field.icon, 'text-primary']" />
                  {{ field.label }}
                </label>
                <InputNumber
                  v-model="scores[field.key]"
                  :input-id="`nclc-${field.key}`"
                  :min="field.min"
                  :max="field.max"
                  :placeholder="`ex. ${field.example}`"
                  :use-grouping="false"
                  show-buttons
                  class="w-full"
                  input-class="w-full"
                />
                <span class="text-xs text-faint">Score de {{ field.min }} à {{ field.max }}</span>
              </div>
            </div>

            <AppButton
              label="Calculer mon niveau NCLC"
              icon="pi pi-calculator"
              variant="gradient"
              size="large"
              block
              class="mt-7"
              @click="calculate"
            />

            <!-- Résultats -->
            <Transition
              enter-active-class="transition-all duration-500 ease-spring"
              leave-active-class="transition-all duration-300"
              enter-from-class="opacity-0 translate-y-3"
              leave-to-class="opacity-0 translate-y-3"
            >
              <div v-if="results" class="mt-7 border-t border-line pt-7">
                <p class="text-xs font-semibold uppercase tracking-widest text-faint">Vos résultats</p>
                <div class="mt-4 grid grid-cols-2 gap-3">
                  <div
                    v-for="field in fields"
                    :key="field.key"
                    class="rounded-2xl border p-4 transition-colors duration-300"
                    :class="toneClasses[getSeverity(results[field.key])]"
                  >
                    <div class="flex items-center gap-2 text-xs font-semibold">
                      <i :class="field.icon" />
                      <span class="truncate">{{ field.label }}</span>
                    </div>
                    <p class="mt-3 font-heading text-3xl font-extrabold leading-none">
                      {{ results[field.key] }}
                    </p>
                    <p class="mt-1 text-xs font-medium opacity-75">
                      {{ results[field.key] !== "—" ? "Niveau NCLC" : "Non renseigné" }}
                    </p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Tableau d'équivalence -->
        <div v-reveal="{ from: 'right', delay: 150 }">
          <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
            <div class="flex items-center gap-3 border-b border-line px-6 py-5">
              <span class="grid size-10 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <i class="pi pi-table" />
              </span>
              <div>
                <h3 class="font-heading text-base font-bold text-ink">Tableau d'équivalence officiel</h3>
                <p class="text-xs text-faint">Scores TCF Canada et niveaux NCLC correspondants</p>
              </div>
            </div>

            <DataTable
              :value="equivalenceTable"
              size="small"
              :row-class="rowClass"
              class="text-sm"
            >
              <Column field="nclc" header="NCLC">
                <template #body="{ data }">
                  <div class="flex items-center gap-2">
                    <span
                      class="grid size-8 place-items-center rounded-lg font-heading text-sm font-extrabold"
                      :class="data.nclc === '7' ? 'brand-gradient text-white' : 'bg-card-2 text-ink'"
                    >
                      {{ data.nclc }}
                    </span>
                    <span
                      v-if="data.nclc === '7'"
                      class="hidden rounded-full bg-accent-100 px-2 py-0.5 text-[0.65rem] font-semibold text-accent-800 sm:inline dark:bg-accent-950 dark:text-accent-300"
                    >
                      Objectif fréquent
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="co" header="Comp. orale" />
              <Column field="ce" header="Comp. écrite" />
              <Column field="eo" header="Exp. orale" />
              <Column field="ee" header="Exp. écrite" />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const fields = [
  { key: "co", label: "Compréhension orale", icon: "pi pi-headphones", min: 100, max: 699, example: 450 },
  { key: "ce", label: "Compréhension écrite", icon: "pi pi-book", min: 100, max: 699, example: 480 },
  { key: "eo", label: "Expression orale", icon: "pi pi-microphone", min: 0, max: 20, example: 12 },
  { key: "ee", label: "Expression écrite", icon: "pi pi-pen-to-square", min: 0, max: 20, example: 10 },
];

const scores = ref({ co: null, ce: null, eo: null, ee: null });
const results = ref(null);

const rangesCO = [
  [10, 549, 699], [9, 523, 548], [8, 503, 522], [7, 458, 502],
  [6, 398, 457], [5, 369, 397], [4, 331, 368],
];
const rangesCE = [
  [10, 549, 699], [9, 524, 548], [8, 499, 523], [7, 453, 498],
  [6, 406, 452], [5, 375, 405], [4, 342, 374],
];
const rangesEO = [
  [10, 16, 20], [9, 14, 15], [8, 12, 13], [7, 10, 11],
  [6, 7, 9], [5, 6, 6], [4, 4, 5],
];
const rangesEE = [
  [10, 16, 20], [9, 14, 15], [8, 12, 13], [7, 10, 11],
  [6, 7, 9], [5, 6, 6], [4, 4, 5],
];

const rangesMap = { co: rangesCO, ce: rangesCE, eo: rangesEO, ee: rangesEE };

function getLevel(score, ranges) {
  if (score === null || score === undefined) return "—";
  for (const [level, min, max] of ranges) {
    if (score >= min && score <= max) return level;
  }
  return score < ranges[ranges.length - 1][1] ? "<4" : "10+";
}

function calculate() {
  results.value = Object.fromEntries(
    fields.map((f) => [f.key, getLevel(scores.value[f.key], rangesMap[f.key])])
  );
}

function getSeverity(level) {
  if (level === "—") return "secondary";
  const n = parseInt(level);
  if (n >= 7) return "success";
  if (n >= 5) return "warning";
  return "danger";
}

// Couleurs des tuiles de résultat, selon le niveau
const toneClasses = {
  success: "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
  warning: "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-900 dark:bg-accent-950 dark:text-accent-300",
  danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  secondary: "border-line bg-card-2 text-muted",
};

// Met en avant la ligne NCLC 7 dans le tableau
const rowClass = (data) => (data.nclc === "7" ? "bg-primary-50/60 dark:bg-primary-950/40" : "");

const equivalenceTable = [
  { nclc: "10+", co: "549–699", ce: "549–699", eo: "16–20", ee: "16–20" },
  { nclc: "9", co: "523–548", ce: "524–548", eo: "14–15", ee: "14–15" },
  { nclc: "8", co: "503–522", ce: "499–523", eo: "12–13", ee: "12–13" },
  { nclc: "7", co: "458–502", ce: "453–498", eo: "10–11", ee: "10–11" },
  { nclc: "6", co: "398–457", ce: "406–452", eo: "7–9", ee: "7–9" },
  { nclc: "5", co: "369–397", ce: "375–405", eo: "6", ee: "6" },
  { nclc: "4", co: "331–368", ce: "342–374", eo: "4–5", ee: "4–5" },
];
</script>