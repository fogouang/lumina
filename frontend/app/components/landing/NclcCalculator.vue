<template>
  <section class="section bg-(--bg-ground) py-20">
    <div class="container">
      <!-- Header -->
      <div
        ref="headerRef"
        class="mx-auto max-w-2xl text-center transition-all duration-700"
        :class="headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <Tag value="Outil gratuit" severity="success" class="rounded-full!" />
        <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl">
          Calculez votre niveau NCLC
        </h2>
        <p class="mt-3 text-base leading-relaxed text-(--text-secondary)">
          Entrez vos scores TCF Canada pour connaître instantanément
          votre équivalence NCLC.
        </p>
      </div>

      <div ref="gridRef" class="mt-12">
        <Transition name="p-collapsible">
          <div v-if="gridVisible" class="grid">
            <div class="grid gap-8 overflow-hidden lg:grid-cols-2 lg:items-start">
              <!-- Calculateur -->
              <div class="flex flex-col gap-5 rounded-2xl border border-(--border-color) bg-(--bg-card) p-8">
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div v-for="field in fields" :key="field.key" class="flex flex-col gap-2">
                    <label class="text-[0.8125rem] font-semibold text-(--text-secondary)">
                      {{ field.emoji }} {{ field.label }}
                      <span class="font-normal text-(--text-tertiary)">({{ field.min }}–{{ field.max }})</span>
                    </label>
                    <InputNumber
                      v-model="scores[field.key]"
                      :min="field.min"
                      :max="field.max"
                      :placeholder="`ex. ${field.example}`"
                      :use-grouping="false"
                      show-buttons
                      class="w-full"
                    />
                  </div>
                </div>

                <Button
                  label="Calculer mon niveau NCLC"
                  icon="pi pi-calculator"
                  size="large"
                  class="w-full! rounded-xl! border-none! bg-gradient-primary! font-bold!"
                  @click="calculate"
                />

                <!-- Résultats -->
                <Transition
                  enter-active-class="transition-all duration-300"
                  leave-active-class="transition-all duration-300"
                  enter-from-class="opacity-0 translate-y-2"
                  leave-to-class="opacity-0 translate-y-2"
                >
                  <div
                    v-if="results"
                    class="grid grid-cols-1 gap-2.5 border-t border-(--border-color) pt-5 sm:grid-cols-2"
                  >
                    <div
                      v-for="field in fields"
                      :key="field.key"
                      class="flex items-center justify-between rounded-lg bg-(--bg-ground) px-3.5 py-2.5"
                    >
                      <span class="text-[0.8125rem] font-semibold text-(--text-secondary)">
                        {{ field.emoji }} {{ field.label }}
                      </span>
                      <Tag
                        :value="results[field.key] !== '—' ? `NCLC ${results[field.key]}` : '—'"
                        :severity="getSeverity(results[field.key])"
                      />
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Table équivalence -->
              <div class="rounded-2xl border border-(--border-color) bg-(--bg-card) p-6">
                <h4 class="mb-4 flex items-center gap-2 text-[0.9375rem] font-bold text-(--text-primary)">
                  <i class="pi pi-table text-primary-600" />
                  Tableau d’équivalence officiel
                </h4>
                <DataTable :value="equivalenceTable" striped-rows size="small">
                  <Column field="nclc" header="NCLC" style="width: 80px; font-weight: 700;" />
                  <Column field="co" header="Comp. Orale" />
                  <Column field="ce" header="Comp. Écrite" />
                  <Column field="eo" header="Exp. Orale" />
                  <Column field="ee" header="Exp. Écrite" />
                </DataTable>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const headerRef = ref(null);
const gridRef = ref(null);
const headerVisible = ref(false);
const gridVisible = ref(false);

let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === headerRef.value) headerVisible.value = true;
        if (entry.target === gridRef.value) gridVisible.value = true;
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  if (headerRef.value) observer.observe(headerRef.value);
  if (gridRef.value) observer.observe(gridRef.value);
});

onUnmounted(() => observer?.disconnect());

const fields = [
  { key: "co", label: "Compréhension orale", emoji: "🎧", min: 100, max: 699, example: 450 },
  { key: "ce", label: "Compréhension écrite", emoji: "📖", min: 100, max: 699, example: 480 },
  { key: "eo", label: "Expression orale", emoji: "🎤", min: 0, max: 20, example: 12 },
  { key: "ee", label: "Expression écrite", emoji: "✍️", min: 0, max: 20, example: 10 },
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