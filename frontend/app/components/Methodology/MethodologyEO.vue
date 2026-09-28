<template>
  <div class="flex flex-col gap-10">
    <MethodologyHero
      title="Expression orale au TCF Canada"
      lead="L'expression orale évalue votre capacité à communiquer spontanément et de façon structurée en français. C'est une épreuve en face-à-face avec un examinateur, enregistrée, composée de 3 tâches progressives."
      :stats="[
        { icon: 'pi pi-clock', value: '12 min', label: 'Durée totale' },
        { icon: 'pi pi-list', value: '3 tâches', label: 'Progressives' },
        { icon: 'pi pi-microphone', value: 'Face-à-face', label: 'Enregistré' },
      ]"
    />

    <MethodologyBlock title="Vous êtes évalué sur" icon="pi pi-star">
      <MethodologyTags :items="competences" />
    </MethodologyBlock>

    <!-- Tâches -->
    <div class="flex flex-col gap-6">
      <MethodologyTaskTabs v-model="activeTask" :tasks="tasks" />

      <!-- Tâche 1 -->
      <div v-if="activeTask === 1" class="flex flex-col gap-6">
        <MethodologyTaskHeader
          title="Tâche 1 : entretien dirigé"
          subtitle="Sans préparation : parlez de vous naturellement"
          badge="2 minutes"
        />

        <MethodologyCallout>
          L'examinateur engage une conversation avec vous. Il peut vous poser
          des questions sur votre vie, vos goûts, vos projets.
          <strong>Ne récitez pas</strong> : soyez naturel, comme dans une vraie
          conversation.
        </MethodologyCallout>

        <MethodologyBlock title="Structure recommandée" icon="pi pi-sitemap">
          <div class="flex flex-col gap-6">
            <MethodologyStep
              v-for="step in task1Steps"
              :key="step.num"
              :num="step.num"
              :title="step.title"
              :desc="step.desc"
              :examples="step.examples"
              example-style="bullet"
            />
          </div>
        </MethodologyBlock>

        <div class="grid gap-10 xl:grid-cols-2 xl:gap-8">
          <MethodologyBlock
            title="Thèmes que l'examinateur peut aborder"
            icon="pi pi-th-large"
          >
            <MethodologyTags :items="task1Themes" />
          </MethodologyBlock>

          <MethodologyBlock
            title="Questions types de l'examinateur"
            icon="pi pi-comments"
          >
            <div class="flex flex-col gap-2">
              <div
                v-for="q in task1Questions"
                :key="q"
                class="flex items-start gap-3 rounded-2xl rounded-tl-sm border border-line bg-canvas px-4 py-3"
              >
                <i class="pi pi-comment mt-0.5 text-primary" />
                <p class="text-sm leading-relaxed text-ink">{{ q }}</p>
              </div>
            </div>
          </MethodologyBlock>
        </div>

        <MethodologyCallout variant="gold">
          Visez <strong>au minimum 1 minute 50 secondes</strong>. En deçà, vous
          perdez des points. Terminez par « Je vous remercie ».
        </MethodologyCallout>
      </div>

      <!-- Tâche 2 -->
      <div v-else-if="activeTask === 2" class="flex flex-col gap-6">
        <MethodologyTaskHeader
          title="Tâche 2 : exercice en interaction"
          subtitle="Avec 2 minutes de préparation : posez des questions pour obtenir des informations"
          badge="5 min 30"
        />

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            class="flex items-center gap-4 rounded-2xl border border-line bg-canvas p-4"
          >
            <span
              class="grid size-11 shrink-0 place-items-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300"
            >
              <i class="pi pi-pencil" />
            </span>
            <div>
              <p class="font-heading text-xl font-extrabold text-ink">2 min</p>
              <p class="text-xs text-muted">Préparation (notes autorisées)</p>
            </div>
          </div>
          <div
            class="flex items-center gap-4 rounded-2xl border border-line bg-canvas p-4"
          >
            <span
              class="grid size-11 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
            >
              <i class="pi pi-comments" />
            </span>
            <div>
              <p class="font-heading text-xl font-extrabold text-ink">
                3 min 30
              </p>
              <p class="text-xs text-muted">Échange avec l'examinateur</p>
            </div>
          </div>
        </div>

        <MethodologyCallout>
          C'est <strong>vous qui menez la conversation</strong>. Vous posez des
          questions à l'examinateur pour obtenir des informations dans un
          contexte précis (logement, emploi, voyage, association...). Le statut
          des deux interlocuteurs est indiqué dans la consigne.
        </MethodologyCallout>

        <MethodologyBlock title="Structure à suivre" icon="pi pi-sitemap">
          <div class="flex flex-col gap-6">
            <MethodologyStep
              v-for="step in task2Steps"
              :key="step.num"
              :num="step.num"
              :title="step.title"
              :desc="step.desc"
              :examples="step.examples"
              example-style="bullet"
            />
          </div>
        </MethodologyBlock>

        <MethodologyBlock title="Exemples de sujets" icon="pi pi-bookmark">
          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="s in task2Subjects"
              :key="s"
              class="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4"
            >
              <i class="pi pi-bookmark mt-0.5 text-primary" />
              <p class="text-sm leading-relaxed text-ink">{{ s }}</p>
            </div>
          </div>
        </MethodologyBlock>

        <MethodologyCallout variant="gold">
          Préparez <strong>au minimum 10 questions</strong> sur le brouillon.
          Évitez les questions fermées (oui/non) : posez des questions ouvertes
          pour que l'examinateur développe ses réponses.
        </MethodologyCallout>
      </div>

      <!-- Tâche 3 -->
      <div v-else-if="activeTask === 3" class="flex flex-col gap-6">
        <MethodologyTaskHeader
          title="Tâche 3 : donner son point de vue"
          subtitle="Sans préparation : argumentez de façon spontanée et convaincante"
          badge="4 min 30"
        />

        <MethodologyCallout>
          L'examinateur vous pose une question sur un sujet de société. Vous
          devez répondre de façon
          <strong>spontanée, structurée et argumentée</strong>. Présentez au
          moins <strong>3 arguments</strong>
          avec des exemples personnels.
        </MethodologyCallout>

        <MethodologyBlock title="Structure à suivre" icon="pi pi-sitemap">
          <div class="flex flex-col gap-6">
            <MethodologyStep
              v-for="step in task3Steps"
              :key="step.num"
              :num="step.num"
              :title="step.title"
              :desc="step.desc"
              :examples="step.examples"
              example-style="bullet"
            />
          </div>
        </MethodologyBlock>

        <MethodologyBlock title="Exemple développé" icon="pi pi-file-edit">
          <div
            class="overflow-hidden rounded-card border border-line bg-card shadow-soft"
          >
            <div
              class="flex items-start gap-3 border-b border-line bg-canvas px-5 py-4"
            >
              <i class="pi pi-bookmark mt-0.5 shrink-0 text-primary" />
              <p class="text-sm leading-relaxed text-muted">
                <strong class="font-semibold text-ink">Sujet :</strong> Voyager
                nous rend meilleurs. Êtes-vous d'accord ? Pourquoi ?
              </p>
            </div>
            <div class="flex flex-col divide-y divide-line">
              <div
                v-for="part in eoExample"
                :key="part.label"
                class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:gap-5"
              >
                <span
                  class="w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:w-36 sm:text-center"
                  :class="part.tone"
                >
                  {{ part.label }}
                </span>
                <p class="text-[0.9375rem] leading-relaxed text-ink">
                  {{ part.text }}
                </p>
              </div>
            </div>
          </div>
        </MethodologyBlock>

        <MethodologyBlock title="Sujets d'entraînement" icon="pi pi-bookmark">
          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="s in task3Subjects"
              :key="s"
              class="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4"
            >
              <i class="pi pi-bookmark mt-0.5 text-primary" />
              <p class="text-sm leading-relaxed text-ink">{{ s }}</p>
            </div>
          </div>
        </MethodologyBlock>

        <MethodologyCallout variant="gold">
          <strong
            >Fluidité + structure + exemples personnels = excellent
            score.</strong
          >
          Parlez légèrement plus lentement que d'habitude pour articuler
          clairement et éviter les hésitations.
        </MethodologyCallout>
      </div>
    </div>

    <MethodologyBlock
      title="Conseils pour réussir l'épreuve"
      icon="pi pi-lightbulb"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="tip in generalTips"
          :key="tip.title"
          class="group flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4 transition-colors hover:bg-card"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 group-hover:brand-gradient group-hover:text-white dark:bg-primary-950 dark:text-primary-300"
          >
            <i :class="tip.icon" />
          </span>
          <div>
            <p class="font-semibold text-ink">{{ tip.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              {{ tip.desc }}
            </p>
          </div>
        </div>
      </div>
    </MethodologyBlock>
  </div>
</template>

<script setup lang="ts">
const activeTask = ref(1);

const tasks = [
  { id: 1, label: "Tâche 1  Entretien dirigé" },
  { id: 2, label: "Tâche 2  Interaction" },
  { id: 3, label: "Tâche 3  Point de vue" },
];

const competences = [
  "Parler de vous et de votre environnement",
  "Poser des questions adaptées",
  "Donner et défendre une opinion",
  "Argumenter de façon structurée",
  "Présenter des sujets complexes",
  "Exprimer accord et désaccord",
  "Interagir spontanément",
  "Conclure de façon claire",
];

const task1Steps = [
  {
    num: 1,
    title: "État civil",
    desc: "Nom, âge, nationalité, lieu de résidence, statut matrimonial, région d'origine.",
    examples: [],
  },
  {
    num: 2,
    title: "Formation académique",
    desc: "Mentionnez votre diplôme le plus élevé en lien avec votre profession. Expliquez pourquoi vous avez choisi ce cursus.",
    examples: [],
  },
  {
    num: 3,
    title: "Expérience professionnelle",
    desc: "Nom de l'entreprise, localisation, poste occupé, tâches principales.",
    examples: [],
  },
  {
    num: 4,
    title: "Loisirs valorisants",
    desc: "Sport, lecture, voyages, dessin... Choisissez des activités qui vous mettent en valeur.",
    examples: [],
  },
  {
    num: 5,
    title: "Projets de vie",
    desc: "Que souhaiteriez-vous avoir accompli dans 10 ans ? Soyez précis et ambitieux.",
    examples: [
      "Dans dix ans, j'espère avoir...",
      "Mon objectif principal est de...",
    ],
  },
];

const task1Themes = [
  "État civil",
  "Famille",
  "Relations amicales",
  "Formation / études",
  "Vie professionnelle",
  "Loisirs et centres d'intérêt",
  "Voyages",
  "Logement",
  "Projets et souhaits",
  "Événements passés",
];

const task1Questions = [
  "Quel est votre film préféré ? Pourquoi ?",
  "Où êtes-vous allé durant vos dernières vacances ?",
  "Comment imaginez-vous votre vie dans 30 ans ?",
  "Où avez-vous appris le français ?",
  "Qu'est-ce qui vous passionne dans votre métier ?",
];

const task2Steps = [
  {
    num: 1,
    title: "Salutation appropriée",
    desc: "Adaptez le registre selon le statut de l'interlocuteur.",
    examples: [
      "Bonjour, j'espère que vous allez bien.",
      "Salut, comment tu vas ?",
    ],
  },
  {
    num: 2,
    title: "Introduction contextuelle",
    desc: "Introduisez la raison de votre prise de contact.",
    examples: [
      "J'ai appris que vous vendez votre vélo...",
      "J'ai appris que tu organises un voyage...",
    ],
  },
  {
    num: 3,
    title: "Questionnement structuré",
    desc: "Posez vos questions de façon ordonnée. Utilisez les connecteurs entre chaque réponse et votre question suivante.",
    examples: [
      "Quel est le prix ?",
      "Comment cela fonctionne-t-il ?",
      "Quelles sont les conditions ?",
    ],
  },
  {
    num: 4,
    title: "Petite conclusion",
    desc: "Résumez ce que vous avez appris et annoncez votre décision.",
    examples: [
      "Je vous remercie pour ces informations, je vais réfléchir et reviendrai vers vous rapidement.",
    ],
  },
  {
    num: 5,
    title: "Remerciement + Formule de politesse",
    desc: "Clôturez l'échange courtoisement.",
    examples: [
      "Merci pour votre temps. À très bientôt !",
      "Je vous remercie. Au plaisir de vous revoir.",
    ],
  },
];

const task2Subjects = [
  "Je dirige une association d'aide aux personnes en difficulté. Demandez-moi comment elle fonctionne (actions, financements, adhérents...).",
  "Vous partez en vacances et cherchez quelqu'un pour garder votre chat. Je vous propose ma candidature. Posez-moi des questions (motivation, goûts, expérience...).",
  "Vous vous interrogez sur l'organisation des transports en commun en France. Posez-moi des questions (fréquence, horaires, tarifs...).",
];

const task3Steps = [
  {
    num: 1,
    title: "Comprendre le sujet",
    desc: "Reformulez mentalement la question pour être sûr de ce qu'on vous demande.",
    examples: [],
  },
  {
    num: 2,
    title: "Introduction  Prise de position",
    desc: "Annoncez clairement votre point de vue dès le début.",
    examples: [
      "Personnellement, je suis convaincu(e) que...",
      "De mon point de vue, cette affirmation est...",
      "Il me semble évident que...",
    ],
  },
  {
    num: 3,
    title: "Argument 1 + exemple",
    desc: "Développez votre premier argument avec un exemple concret ou personnel.",
    examples: [
      "Tout d'abord,... Par exemple,...",
      "Premièrement,... En effet,...",
    ],
  },
  {
    num: 4,
    title: "Argument 2 + exemple",
    desc: "Développez votre deuxième argument.",
    examples: [
      "Ensuite,... Ainsi,...",
      "De plus,... J'ai personnellement constaté que...",
    ],
  },
  {
    num: 5,
    title: "Argument 3 + exemple",
    desc: "Un troisième argument renforce considérablement votre score.",
    examples: [
      "Par ailleurs,... À titre d'exemple,...",
      "Enfin,... Il convient de noter que...",
    ],
  },
  {
    num: 6,
    title: "Conclusion claire",
    desc: "Résumez votre position et ouvrez sur une perspective.",
    examples: [
      "En conclusion, voyager nous rend meilleurs à condition de...",
      "Pour conclure, bien que... il n'en demeure pas moins que...",
    ],
  },
];

const task3Subjects = [
  "Faut-il interdire la vente d'alcool aux mineurs ?",
  "Voyager nous rend meilleurs. Êtes-vous d'accord ?",
  "Les moyens de communication se développent. Les gens communiquent-ils mieux aujourd'hui ?",
  "Tous les membres du foyer doivent participer aux tâches ménagères. Êtes-vous d'accord ?",
  "Aujourd'hui, on peut tout apprendre seul grâce à Internet. Qu'en pensez-vous ?",
];

// Exemple développé de la tâche 3 (affichage)
const eoExample = [
  {
    label: "Introduction",
    tone: "brand-gradient text-white",
    text: "Le voyage est souvent présenté comme une expérience enrichissante. Personnellement, je partage cette opinion, car voyager développe nos capacités d'adaptation, enrichit notre culture et renforce notre confiance en nous.",
  },
  {
    label: "Argument 1",
    tone: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
    text: "Tout d'abord, voyager favorise l'ouverture d'esprit. En découvrant d'autres cultures et modes de vie, on apprend à relativiser ses propres certitudes. Par exemple, un séjour en Asie m'a permis de comprendre une philosophie de vie fondée sur l'harmonie et le respect de la nature.",
  },
  {
    label: "Argument 2",
    tone: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
    text: "Ensuite, le voyage stimule notre développement personnel. Faire face à l'imprévu, comme un train manqué ou une langue inconnue, nous apprend la résilience et l'adaptabilité. J'ai moi-même surmonté des imprévus qui m'ont rendu plus autonome.",
  },
  {
    label: "Argument 3",
    tone: "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
    text: "Par ailleurs, voyager enrichit notre compréhension culturelle. Visiter des musées, assister à des festivals locaux, goûter à la gastronomie : tout cela nous rend plus tolérants et curieux du monde.",
  },
  {
    label: "Conclusion",
    tone: "bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300",
    text: "En conclusion, voyager nous rend indéniablement meilleurs, à condition d'aborder chaque destination avec humilité et ouverture d'esprit.",
  },
];

const generalTips = [
  {
    icon: "pi pi-volume-up",
    title: "Parlez clairement et audiblement",
    desc: "Le dictaphone enregistre tout. Articulez bien, ne parlez pas trop vite.",
  },
  {
    icon: "pi pi-eye",
    title: "Regardez l'examinateur",
    desc: "Contact visuel direct, accompagné de gestes naturels. Évitez de fixer vos notes.",
  },
  {
    icon: "pi pi-clock",
    title: "Respectez les durées",
    desc: "Pour la tâche 1, visez minimum 1 min 50 sec. L'examinateur vous fera signe à la fin.",
  },
  {
    icon: "pi pi-link",
    title: "Utilisez des connecteurs logiques",
    desc: "Tout d'abord, Ensuite, Par ailleurs, En revanche, À mon avis, Donc, En conclusion...",
  },
  {
    icon: "pi pi-refresh",
    title: "Entraînez-vous à voix haute",
    desc: "Enregistrez-vous, réécoutez, corrigez votre prononciation et votre fluidité.",
  },
  {
    icon: "pi pi-headphones",
    title: "Écoutez du français authentique",
    desc: "Radios, podcasts, films non sous-titrés. Variez les accents : standard, québécois.",
  },
  {
    icon: "pi pi-star",
    title: "Pensez en français",
    desc: "Ne traduisez pas dans votre tête. Formulez directement vos idées en français.",
  },
  {
    icon: "pi pi-heart",
    title: "Restez naturel et confiant",
    desc: "Parlez légèrement plus lentement pour calmer le stress. Souriez  cela s'entend.",
  },
];
</script>
