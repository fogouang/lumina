<template>
  <div class="flex flex-col gap-10">
    <MethodologyHero
      title="Compréhension écrite au TCF Canada"
      lead="Cette épreuve évalue votre capacité à comprendre des textes écrits de difficulté progressive, tirés de situations de la vie quotidienne, professionnelle et académique. Une méthodologie rigoureuse vous permettra de gagner un temps précieux."
      :stats="[
        { icon: 'pi pi-clock', value: '60 min', label: 'Durée' },
        { icon: 'pi pi-list', value: '39 questions', label: 'QCM' },
        { icon: 'pi pi-sort-amount-up', value: 'Progressive', label: 'Difficulté' },
        { icon: 'pi pi-check-circle', value: '0 pénalité', label: 'Mauvaise réponse' },
      ]"
    />

    <MethodologyBlock title="Types de textes rencontrés" icon="pi pi-folder-open">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="t in textTypes"
          :key="t.level"
          class="flex flex-col rounded-2xl border border-line bg-canvas p-5 transition-all duration-300 ease-spring hover:-translate-y-1 hover:bg-card hover:shadow-lift"
        >
          <span class="brand-gradient w-fit rounded-full px-3 py-0.5 text-xs font-bold text-white">{{ t.level }}</span>
          <p class="mt-3 font-heading font-bold text-ink">{{ t.title }}</p>
          <p class="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{{ t.desc }}</p>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span v-for="tag in t.tags" :key="tag" class="rounded-full bg-card-2 px-2.5 py-0.5 text-xs text-muted">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </MethodologyBlock>

    <MethodologyBlock title="Stratégies essentielles" icon="pi pi-star">
      <div class="flex flex-col gap-6">
        <MethodologyStep
          v-for="step in strategies"
          :key="step.num"
          :num="step.num"
          :title="step.title"
          :desc="step.desc"
          :tip="step.tip"
        />
      </div>
    </MethodologyBlock>

    <MethodologyBlock title="Pièges fréquents à éviter" icon="pi pi-exclamation-triangle">
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="trap in traps"
          :key="trap.title"
          class="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4 dark:border-red-950 dark:bg-red-950/40"
        >
          <span class="grid size-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-times text-xs" />
          </span>
          <div>
            <p class="font-semibold text-ink">{{ trap.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">{{ trap.desc }}</p>
          </div>
        </div>
      </div>
    </MethodologyBlock>

    <MethodologyBlock title="Gestion du temps" icon="pi pi-clock">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        <div
          v-for="t in timeManagement"
          :key="t.label"
          class="rounded-2xl border border-line bg-canvas p-4 text-center"
        >
          <p class="font-heading text-2xl font-extrabold text-gradient">{{ t.time }}</p>
          <p class="mt-1 text-xs text-muted">{{ t.label }}</p>
        </div>
      </div>
      <MethodologyCallout class="mt-4">
        Soit environ <strong>1 minute 30 par question</strong>. Si vous bloquez, passez à la suivante et
        revenez à la fin. <strong>Ne laissez aucune réponse vide</strong> : une mauvaise réponse ne retire
        aucun point.
      </MethodologyCallout>
    </MethodologyBlock>

    <MethodologyCallout variant="gold">
      <strong>Règle d'or :</strong> répondez à toutes les questions sans exception. Une réponse incorrecte
      ne retire aucun point, alors qu'une réponse manquante rapporte zéro à coup sûr.
    </MethodologyCallout>
  </div>
</template>

<script setup lang="ts">
const textTypes = [
  {
    level: 'A1 – A2',
    title: 'Textes simples du quotidien',
    desc: 'Documents courts et directs de la vie courante.',
    tags: ['Annonces', 'Messages', 'Courriels simples', 'Panneaux'],
  },
  {
    level: 'B1 – B2',
    title: 'Textes informatifs et professionnels',
    desc: 'Documents plus longs nécessitant une lecture attentive.',
    tags: ['Articles de presse', 'Documents administratifs', 'Rapports'],
  },
  {
    level: 'C1 – C2',
    title: 'Textes complexes et argumentatifs',
    desc: 'Textes longs avec des nuances et des opinions d\'auteurs.',
    tags: ['Textes argumentatifs', 'Essais', 'Textes spécialisés', 'Littérature'],
  },
]

const strategies = [
  {
    num: 1,
    title: 'Lisez la question AVANT le texte',
    desc: 'Identifiez immédiatement l\'information que vous cherchez avant de lire. Cela transforme une lecture passive en une recherche ciblée.',
    tip: 'Soulignez les mots-clés de la question (qui, quoi, où, quand, pourquoi).',
  },
  {
    num: 2,
    title: 'Lisez rapidement le texte en entier',
    desc: 'Une première lecture rapide pour saisir le thème général, les personnages et la structure. N\'essayez pas de tout retenir.',
    tip: null,
  },
  {
    num: 3,
    title: 'Analysez chaque option de réponse',
    desc: 'Méfiez-vous des options qui reprennent des mots du texte mais déforment le sens. Une réponse correcte peut être une reformulation de l\'idée, pas une copie exacte.',
    tip: 'Éliminez d\'abord les réponses clairement fausses, puis choisissez parmi les options restantes.',
  },
  {
    num: 4,
    title: 'Repérez les connecteurs logiques',
    desc: 'Les mots comme "mais", "cependant", "pourtant", "néanmoins" indiquent souvent un retournement de situation crucial pour comprendre l\'intention de l\'auteur.',
    tip: null,
  },
  {
    num: 5,
    title: 'Déduisez le sens par le contexte',
    desc: 'Face à un mot inconnu, analysez le contexte autour de lui. Les phrases voisines donnent presque toujours des indices suffisants.',
    tip: 'Ne bloquez jamais sur un seul mot inconnu  le sens global reste compréhensible.',
  },
]

const traps = [
  {
    title: 'Les reprises de mots du texte',
    desc: 'Une réponse qui reprend mot pour mot des expressions du texte n\'est pas forcément correcte. L\'examinateur teste votre compréhension, pas votre mémoire.',
  },
  {
    title: 'Les informations partiellement vraies',
    desc: 'Certaines réponses sont vraies... mais incomplètes. Une réponse doit répondre EXACTEMENT à ce qui est demandé.',
  },
  {
    title: 'La confusion entre opinion et fait',
    desc: 'Distinguez ce que dit l\'auteur de façon factuelle et ce qu\'il exprime comme opinion personnelle.',
  },
  {
    title: 'Les pronoms et référents',
    desc: '"Il", "elle", "ce dernier", "celui-ci" peuvent renvoyer à des personnages différents. Soyez vigilant sur les antécédents.',
  },
]

const timeManagement = [
  { time: '~90 sec', label: 'Par question' },
  { time: '45 min', label: 'Pour les 39 questions' },
  { time: '15 min', label: 'Révision finale' },
]
</script>
