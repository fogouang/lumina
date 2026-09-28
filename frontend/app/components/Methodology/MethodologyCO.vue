<template>
  <div class="flex flex-col gap-10">
    <MethodologyHero
      title="Compréhension orale au TCF Canada"
      lead="Cette épreuve évalue votre capacité à comprendre le français parlé dans des situations variées. Chaque document audio n'est diffusé qu'une seule fois : la concentration et la prise de notes sont essentielles."
      :stats="[
        { icon: 'pi pi-clock', value: '35 min', label: 'Durée' },
        { icon: 'pi pi-list', value: '39 questions', label: 'QCM' },
        {
          icon: 'pi pi-headphones',
          value: '1 écoute',
          label: 'Unique par audio',
        },
        {
          icon: 'pi pi-check-circle',
          value: '0 pénalité',
          label: 'Mauvaise réponse',
        },
      ]"
    />

    <MethodologyBlock title="Types de documents audio" icon="pi pi-folder-open">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="t in audioTypes"
          :key="t.level"
          class="flex flex-col rounded-2xl border border-line bg-canvas p-5 transition-all duration-300 ease-spring hover:-translate-y-1 hover:bg-card hover:shadow-lift"
        >
          <span
            class="brand-gradient w-fit rounded-full px-3 py-0.5 text-xs font-bold text-white"
            >{{ t.level }}</span
          >
          <p class="mt-3 font-heading font-bold text-ink">{{ t.title }}</p>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ t.desc }}</p>
        </div>
      </div>
    </MethodologyBlock>

    <div class="grid gap-10 xl:grid-cols-2 xl:gap-8">
      <MethodologyBlock
        title="Avant l'écoute : ce qu'il faut faire"
        icon="pi pi-eye"
      >
        <div class="flex flex-col gap-6">
          <MethodologyStep
            v-for="step in beforeListening"
            :key="step.num"
            :num="step.num"
            :title="step.title"
            :desc="step.desc"
            :tip="step.tip"
          />
        </div>
      </MethodologyBlock>

      <MethodologyBlock title="Pendant l'écoute" icon="pi pi-headphones">
        <div class="flex flex-col gap-6">
          <MethodologyStep
            v-for="step in duringListening"
            :key="step.num"
            :num="step.num"
            :title="step.title"
            :desc="step.desc"
            :tip="step.tip"
          />
        </div>
      </MethodologyBlock>
    </div>

    <MethodologyBlock
      title="Éléments clés à noter pendant l'écoute"
      icon="pi pi-pencil"
    >
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="note in keyNotes"
          :key="note.title"
          class="group flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4 transition-colors hover:bg-card"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 group-hover:brand-gradient group-hover:text-white dark:bg-primary-950 dark:text-primary-300"
          >
            <i :class="note.icon" />
          </span>
          <div>
            <p class="font-semibold text-ink">{{ note.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              {{ note.desc }}
            </p>
          </div>
        </div>
      </div>
    </MethodologyBlock>

    <MethodologyBlock
      title="Accents rencontrés au TCF Canada"
      icon="pi pi-globe"
    >
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="accent in accents"
          :key="accent.name"
          class="flex items-start gap-4 rounded-2xl border border-line bg-canvas p-4"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-xl bg-card text-2xl shadow-soft"
            >{{ accent.flag }}</span
          >
          <div>
            <p class="font-semibold text-ink">{{ accent.name }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              {{ accent.desc }}
            </p>
          </div>
        </div>
      </div>
      <MethodologyCallout class="mt-4">
        Le TCF Canada inclut souvent l'accent <strong>québécois</strong>.
        Habituez-vous à l'écouter en regardant des émissions québécoises comme
        <em>Tout le monde en parle</em> ou en écoutant des balados
        canadiens-français.
      </MethodologyCallout>
    </MethodologyBlock>

    <MethodologyBlock
      title="Exercices d'entraînement recommandés"
      icon="pi pi-bolt"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="ex in training"
          :key="ex.title"
          class="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4"
        >
          <i
            class="pi pi-check-circle mt-0.5 text-green-600 dark:text-green-400"
          />
          <div>
            <p class="font-semibold text-ink">{{ ex.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">{{ ex.desc }}</p>
          </div>
        </div>
      </div>
    </MethodologyBlock>

    <MethodologyCallout variant="gold">
      <strong>Règle d'or :</strong> chaque audio n'est diffusé qu'une seule
      fois. Restez concentré du début à la fin : une seconde de distraction peut
      vous faire manquer l'information clé.
    </MethodologyCallout>
  </div>
</template>

<script setup lang="ts">
const audioTypes = [
  {
    level: "A1 – A2",
    title: "Dialogues et messages courts",
    desc: "Conversations simples du quotidien, annonces courtes, messages laissés sur répondeur.",
  },
  {
    level: "B1 – B2",
    title: "Interviews et émissions",
    desc: "Émissions radio ou TV, interviews sur des sujets concrets, débats simples.",
  },
  {
    level: "C1 – C2",
    title: "Exposés et discours complexes",
    desc: "Conférences, discours académiques, débats sur des sujets abstraits ou spécialisés.",
  },
];

const beforeListening = [
  {
    num: 1,
    title: "Lisez la question AVANT l'écoute",
    desc: "Vous avez quelques secondes avant chaque audio. Utilisez-les pour lire la question et anticiper le type d'information attendu.",
    tip: "Identifiez si la question porte sur le thème général, un détail précis, l'intention du locuteur ou une information chiffrée.",
  },
  {
    num: 2,
    title: "Anticipez le contexte",
    desc: "La question vous donne déjà des indications sur le contexte. Qui parle ? Dans quelle situation ? Pour quel objectif ?",
    tip: null,
  },
  {
    num: 3,
    title: "Préparez votre crayon",
    desc: "Soyez prêt à noter les mots-clés dès que l'audio commence. Ne prenez pas de notes complètes  seulement des repères.",
    tip: null,
  },
];

const duringListening = [
  {
    num: 1,
    title: "Captez l'idée générale en premier",
    desc: "Les premières secondes d'un audio donnent toujours le contexte : qui parle, où, et pourquoi. Ne les manquez pas.",
    tip: null,
  },
  {
    num: 2,
    title: "Notez les mots-clés",
    desc: "Chiffres, noms propres, lieux, dates, verbes d'action  notez uniquement l'essentiel. Pas de phrases complètes.",
    tip: "Créez vos propres abréviations : pb = problème, imp = important, qst = question.",
  },
  {
    num: 3,
    title: "Ne bloquez pas sur un mot inconnu",
    desc: "Si vous n'avez pas compris un mot, continuez d'écouter. Le sens global reste souvent compréhensible grâce au contexte.",
    tip: null,
  },
  {
    num: 4,
    title: "Identifiez le ton et l'intention",
    desc: "Le locuteur exprime-t-il une opinion positive ou négative ? Une certitude ou un doute ? L'intonation donne des indices précieux.",
    tip: null,
  },
];

const keyNotes = [
  {
    icon: "pi pi-hashtag",
    title: "Chiffres et dates",
    desc: "Prix, heures, numéros, années, âges.",
  },
  {
    icon: "pi pi-map-marker",
    title: "Lieux",
    desc: "Villes, adresses, pays, bâtiments.",
  },
  {
    icon: "pi pi-user",
    title: "Noms propres",
    desc: "Personnes mentionnées dans le document.",
  },
  {
    icon: "pi pi-arrows-h",
    title: "Relations entre idées",
    desc: "Cause, conséquence, opposition, accord.",
  },
  {
    icon: "pi pi-flag",
    title: "Intention du locuteur",
    desc: "Informer, convaincre, se plaindre, proposer.",
  },
  {
    icon: "pi pi-exclamation-circle",
    title: "Mots de restriction",
    desc: '"Mais", "cependant", "sauf", "pourtant"  souvent clés pour la bonne réponse.',
  },
];

const accents = [
  {
    flag: "🇫🇷",
    name: "Français standard",
    desc: "L'accent neutre de référence, utilisé dans la plupart des documents.",
  },
  {
    flag: "🇨🇦",
    name: "Accent québécois",
    desc: "Fréquent dans les documents du TCF Canada. Certains sons et expressions diffèrent.",
  },
  {
    flag: "🌍",
    name: "Accents francophones",
    desc: "Accents africains, belges ou suisses peuvent apparaître dans certains documents.",
  },
];

const training = [
  {
    title: "Écoutez des radios françaises",
    desc: "RFI, France Inter, Radio Canada variez les sujets : infos, reportages, émissions.",
  },
  {
    title: "Regardez des films sans sous-titres",
    desc: "Commencez avec des sous-titres français, puis entraînez-vous sans.",
  },
  {
    title: "Pratiquez l'écoute unique",
    desc: "Écoutez un document audio une seule fois, puis répondez à des questions sans réécouter.",
  },
  {
    title: "Imaginez des questions sur un audio",
    desc: "Après l'écoute, créez vous-même des questions QCM  excellent entraînement cognitif.",
  },
  {
    title: "Pensez directement en français",
    desc: "Ne traduisez plus mentalement. Formulez vos pensées en français au quotidien.",
  },
  {
    title: "Écoutez des podcasts québécois",
    desc: "Pour vous habituer à l'accent canadien avant l'examen.",
  },
];
</script>

