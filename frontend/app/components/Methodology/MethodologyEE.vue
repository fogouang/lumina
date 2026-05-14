<template>
  <div class="flex flex-col gap-8 py-6">

    <!-- Intro -->
    <div>
      <h2 class="text-2xl font-extrabold text-(--text-primary) mb-3">Expression Écrite TCF Canada</h2>
      <p class="text-(--text-secondary) leading-relaxed text-[0.9375rem] mb-6">
        L'expression écrite est l'épreuve qui fait le plus échouer les candidats. Elle exige une méthodologie rigoureuse, un français de qualité et une structure claire. Voici tout ce qu'il faut savoir pour décrocher un score élevé.
      </p>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div v-for="stat in stats" :key="stat.label" class="flex items-center gap-3 bg-(--bg-ground) border border-(--border-color) rounded-xl p-4">
          <i :class="stat.icon" class="text-primary-500 text-xl shrink-0" />
          <div>
            <p class="text-base font-extrabold text-(--text-primary) m-0">{{ stat.val }}</p>
            <p class="text-xs text-(--text-tertiary) m-0">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Compétences -->
    <div>
      <h3 class="text-base font-bold text-(--text-primary) flex items-center gap-2 mb-3">
        <i class="pi pi-star text-primary-500" /> Vous êtes évalué sur
      </h3>
      <div class="flex flex-wrap gap-2">
        <span v-for="c in competences" :key="c"
          class="bg-primary-50 text-primary-700 border border-primary-100 rounded-full px-3 py-1 text-[0.8125rem] font-medium">
          {{ c }}
        </span>
      </div>
    </div>

    <!-- Tabs tâches -->
    <div>
      <!-- Tab buttons -->
      <div class="flex gap-1 border-b-2 border-(--border-color) mb-6 overflow-x-auto">
        <button
          v-for="t in tasks" :key="t.id"
          class="px-4 py-2.5 text-[0.9rem] font-semibold border-b-[3px] -mb-[2px] whitespace-nowrap transition-all duration-200 bg-transparent border-x-0 border-t-0 cursor-pointer font-inherit"
          :class="activeTask === t.id
            ? 'text-primary-600 border-b-primary-500'
            : 'text-(--text-tertiary) border-b-transparent hover:text-primary-600'"
          @click="activeTask = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- TÂCHE 1 -->
      <div v-if="activeTask === 1" class="flex flex-col gap-6">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 class="text-lg font-bold text-(--text-primary) m-0 mb-1">Tâche 1  Rédiger un message</h3>
            <p class="text-sm text-(--text-tertiary) m-0">Décrire, raconter ou expliquer à un ou plusieurs destinataires</p>
          </div>
          <Tag value="60 – 120 mots" severity="warning" />
        </div>

        <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <i class="pi pi-info-circle text-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-blue-800 m-0 leading-relaxed">
            Adaptez le registre selon le destinataire : <strong>tu</strong> pour un ami, <strong>vous</strong> pour un inconnu ou supérieur.
          </p>
        </div>

        <div>
          <h4 class="text-[0.9375rem] font-bold text-[var(--text-primary)] mb-4">Structure à suivre</h4>
          <div class="flex flex-col gap-4">
            <div v-for="step in task1Steps" :key="step.num" class="flex gap-3 items-start">
              <div class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                {{ step.num }}
              </div>
              <div class="flex-1">
                <p class="text-[0.9375rem] font-bold text-[var(--text-primary)] m-0 mb-1">{{ step.title }}</p>
                <p class="text-sm text-[var(--text-secondary)] m-0 mb-2 leading-relaxed">{{ step.desc }}</p>
                <div v-if="step.examples?.length" class="flex flex-col gap-1">
                  <p v-for="ex in step.examples" :key="ex" class="text-[0.8125rem] text-[var(--color-primary-700)] italic m-0">« {{ ex }} »</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-[0.9375rem] font-bold text-[var(--text-primary)] mb-3">Exemple complet niveau C2</h4>
          <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div class="flex items-start gap-3 px-5 py-4 bg-[var(--bg-ground)] border-b border-[var(--border-color)]">
              <i class="pi pi-bookmark text-[var(--color-primary-500)] flex-shrink-0 mt-0.5" />
              <p class="text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
                <strong>Sujet :</strong> Vous souhaitez faire du sport et voulez que votre ami vous accompagne. Écrivez-lui un message pour lui proposer de pratiquer ensemble. (60–120 mots)
              </p>
            </div>
            <div class="px-5 py-5 flex flex-col gap-3">
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">Bonjour Yvan, j'espère que ce message te trouvera en pleine forme !</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">Une nouvelle aventure sportive m'attend, et je pense à quel point ce serait génial de la partager avec toi. Que dirais-tu de relever ce défi ensemble ?</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">En effet, j'ai repéré un club de fitness non loin de chez nous, et je suis convaincu que cela pourrait être une expérience motivante pour nous deux. Les séances débutent en fin d'après-midi, ce qui serait une excellente manière de décompresser après le travail.</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">J'attends ta réponse avec impatience.<br>À très bientôt, <em>Francine.</em></p>
            </div>
            <div class="flex items-center gap-2 px-5 py-3 bg-green-50 border-t border-green-100 text-sm font-semibold text-green-700">
              <i class="pi pi-check-circle" /> 114 mots
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-xl p-4">
          <i class="pi pi-sparkles text-[var(--color-primary-500)] flex-shrink-0 mt-0.5" />
          <p class="text-sm italic text-[var(--color-primary-700)] m-0 leading-relaxed">
            Pour viser C2 : utilisez le <strong>conditionnel</strong> ("ce serait", "dirais-tu"), le <strong>subjonctif</strong>, et formez plusieurs paragraphes bien ponctués.
          </p>
        </div>
      </div>

      <!-- TÂCHE 2 -->
      <div v-else-if="activeTask === 2" class="flex flex-col gap-6">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 class="text-lg font-bold text-[var(--text-primary)] m-0 mb-1">Tâche 2  Article, courrier ou note</h3>
            <p class="text-sm text-[var(--text-tertiary)] m-0">Faire un compte rendu d'expérience ou un récit</p>
          </div>
          <Tag value="120 – 150 mots" severity="warning" />
        </div>

        <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <i class="pi pi-info-circle text-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-blue-800 m-0 leading-relaxed">
            Le plus souvent, il s'agit d'un <strong>article de blog</strong> racontez une expérience personnelle de façon structurée et engageante. Utilisez la <strong>1ère personne</strong> (j'ai, je).
          </p>
        </div>

        <div>
          <h4 class="text-[0.9375rem] font-bold text-[var(--text-primary)] mb-4">Structure d'un article de blog</h4>
          <div class="flex flex-col gap-4">
            <div v-for="step in task2Steps" :key="step.num" class="flex gap-3 items-start">
              <div class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                {{ step.num }}
              </div>
              <div class="flex-1">
                <p class="text-[0.9375rem] font-bold text-[var(--text-primary)] m-0 mb-1">{{ step.title }}</p>
                <p class="text-sm text-[var(--text-secondary)] m-0 mb-2 leading-relaxed">{{ step.desc }}</p>
                <div v-if="step.examples?.length" class="flex flex-col gap-1">
                  <p v-for="ex in step.examples" :key="ex" class="text-[0.8125rem] text-[var(--color-primary-700)] italic m-0">« {{ ex }} »</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-[0.9375rem] font-bold text-[var(--text-primary)] mb-3">Exemple complet</h4>
          <div class="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden">
            <div class="flex items-start gap-3 px-5 py-4 bg-[var(--bg-ground)] border-b border-[var(--border-color)]">
              <i class="pi pi-bookmark text-[var(--color-primary-500)] flex-shrink-0 mt-0.5" />
              <p class="text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
                <strong>Sujet :</strong> Vous venez de commencer une nouvelle activité de loisir. Écrivez un article sur votre blog. (120–150 mots)
              </p>
            </div>
            <div class="px-5 py-5 flex flex-col gap-3">
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 font-bold">Titre : Mon expérience enrichissante dans le monde du fitness</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">Bonjour à tous,</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">Je suis ravi(e) de partager avec vous le début de mon aventure dans le monde du fitness. Récemment, j'ai décidé d'intégrer une activité physique à ma routine quotidienne.</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">Chaque séance est un défi que je relève avec détermination. Les cours de cardio m'ont permis de découvrir de nouvelles facettes de ma force intérieure. Je suis étonné(e) de constater à quel point cette activité a déjà eu un impact positif : je me sens plus énergique et j'observe des progrès concrets chaque semaine.</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">Je vous encourage vivement à vous lancer dans une activité qui vous tient à cœur !</p>
              <p class="text-[0.9rem] text-[var(--text-primary)] m-0 leading-relaxed">À bientôt, <em>Madeleine</em></p>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] rounded-xl p-4">
          <i class="pi pi-sparkles text-[var(--color-primary-500)] flex-shrink-0 mt-0.5" />
          <p class="text-sm italic text-[var(--color-primary-700)] m-0 leading-relaxed">
            N'oubliez pas les <strong>connecteurs logiques</strong> : En effet, De plus, Ainsi, Par conséquent, Cependant… Ils font la différence entre B2 et C1.
          </p>
        </div>
      </div>

      <!-- TÂCHE 3 -->
      <div v-else-if="activeTask === 3" class="flex flex-col gap-6">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 class="text-lg font-bold text-[var(--text-primary)] m-0 mb-1">Tâche 3  Comparer deux points de vue</h3>
            <p class="text-sm text-[var(--text-tertiary)] m-0">Résumer deux opinions et défendre votre position avec des arguments</p>
          </div>
          <Tag value="120 – 180 mots" severity="warning" />
        </div>

        <div class="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <i class="pi pi-info-circle text-blue-500 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-blue-800 m-0 leading-relaxed">
            On vous donne <strong>deux documents courts</strong> exprimant deux opinions opposées. Résumez les deux, prenez position, et argumentez avec <strong>2 arguments minimum</strong>.
          </p>
        </div>

        <div>
          <h4 class="text-[0.9375rem] font-bold text-[var(--text-primary)] mb-4">Structure obligatoire</h4>
          <div class="flex flex-col gap-4">
            <div v-for="step in task3Steps" :key="step.num" class="flex gap-3 items-start">
              <div class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                {{ step.num }}
              </div>
              <div class="flex-1">
                <p class="text-[0.9375rem] font-bold text-[var(--text-primary)] m-0 mb-1">{{ step.title }}</p>
                <p class="text-sm text-[var(--text-secondary)] m-0 mb-2 leading-relaxed">{{ step.desc }}</p>
                <div v-if="step.examples?.length" class="flex flex-col gap-1">
                  <p v-for="ex in step.examples" :key="ex" class="text-[0.8125rem] text-[var(--color-primary-700)] italic m-0">« {{ ex }} »</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-[0.9375rem] font-bold text-(--text-primary) mb-3">Exemple  La gratuité des musées</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div class="bg-(--bg-ground) border border-(--border-color) rounded-xl p-4">
              <p class="text-xs font-bold text-(--text-tertiary) uppercase tracking-wide mb-2">Document 1</p>
              <p class="text-sm text-(--text-secondary) m-0 leading-relaxed">La gratuité peut entraîner une surfréquentation et réduire les ressources financières des musées, affectant leur entretien.</p>
            </div>
            <div class="bg-(--bg-ground) border border-(--border-color) rounded-xl p-4">
              <p class="text-xs font-bold text-(--text-tertiary) uppercase tracking-wide mb-2">Document 2</p>
              <p class="text-sm text-(--text-secondary) m-0 leading-relaxed">La gratuité rend la culture accessible à tous, indépendamment de leur situation financière, et contribue à l'éducation du public.</p>
            </div>
          </div>

          <div class="bg-(--bg-card) border border-(--border-color) rounded-xl overflow-hidden">
            <div class="flex items-start gap-3 px-5 py-4 bg-(--bg-ground) border-b border-(--border-color)">
              <i class="pi pi-bookmark text-primary-500 shrink-0 mt-0.5" />
              <p class="text-sm text-(--text-secondary) m-0"><strong>Sujet :</strong> La gratuité des musées : Pour ou contre ? (120–180 mots)</p>
            </div>
            <div class="px-5 py-5 flex flex-col gap-3">
              <p class="text-[0.9rem] text-(--text-primary) m-0 font-bold">Titre : La gratuité des musées</p>
              <p class="text-[0.9rem] text-(--text-primary) m-0 leading-relaxed">La question de la gratuité des musées suscite un vif débat. Certains soulignent les risques de surfréquentation et l'épuisement des ressources. D'autres affirment que cette initiative favorise un accès équitable à la culture.</p>
              <p class="text-[0.9rem] text-(--text-primary) m-0 leading-relaxed">Personnellement, je suis convaincu(e) que l'accessibilité à la culture ne devrait pas être conditionnée par des barrières financières.</p>
              <p class="text-[0.9rem] text-(--text-primary) m-0 leading-relaxed">Tout d'abord, la gratuité élargit l'accès à la culture et favorise l'égalité sociale. Dans les villes où les musées sont gratuits, la diversité des visiteurs a considérablement augmenté.</p>
              <p class="text-[0.9rem] text-(--text-primary) m-0 leading-relaxed">Ensuite, elle stimule l'intérêt du public pour la préservation culturelle. Des études montrent que les visiteurs ayant bénéficié d'un accès gratuit participent davantage aux initiatives de financement participatif.</p>
              <p class="text-[0.9rem] text-(--text-primary) m-0 leading-relaxed">En résumé, bien que la gratuité soulève des défis logistiques, ses bénéfices sociaux et éducatifs justifient pleinement son développement.</p>
            </div>
            <div class="flex items-center gap-2 px-5 py-3 bg-green-50 border-t border-green-100 text-sm font-semibold text-green-700">
              <i class="pi pi-check-circle" /> 177 mots
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-primary-50 border border-primary-100 rounded-xl p-4">
          <i class="pi pi-sparkles text-primary-500 shrink-0 mt-0.5" />
          <p class="text-sm italic text-primary-700 m-0 leading-relaxed">
            Pas besoin de plus de <strong>2 arguments</strong>  vous seriez à court de mots. Misez sur la <strong>qualité du français</strong> et la <strong>précision des exemples</strong>.
          </p>
        </div>
      </div>

    </div>

    <!-- Conseils généraux -->
    <div>
      <h3 class="text-base font-bold text-(--text-primary) flex items-center gap-2 mb-4">
        <i class="pi pi-lightbulb text-primary-500" /> Conseils pour maximiser votre note
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="tip in generalTips" :key="tip.title" class="flex gap-3 items-start bg-(--bg-card) border border-(--border-color) rounded-xl p-4">
          <i :class="tip.icon" class="text-primary-500 text-base shrink-0 mt-0.5" />
          <div>
            <p class="text-[0.9rem] font-bold text-(--text-primary) m-0 mb-1">{{ tip.title }}</p>
            <p class="text-[0.8125rem] text-(--text-secondary) m-0 leading-relaxed">{{ tip.desc }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const activeTask = ref(1)

const tasks = [
  { id: 1, label: 'Tâche 1 Message' },
  { id: 2, label: 'Tâche 2  Article / Récit' },
  { id: 3, label: 'Tâche 3 Comparer & Argumenter' },
]

const stats = [
  { icon: 'pi pi-clock',       val: '60 min',    label: 'Durée totale' },
  { icon: 'pi pi-list',        val: '3 tâches',  label: 'Obligatoires' },
  { icon: 'pi pi-pen-to-square', val: '60 → 180', label: 'Mots attendus' },
]

const competences = [
  'Fournir des informations précises',
  'Exprimer et justifier une opinion',
  'Structurer un texte cohérent',
  'Comparer deux points de vue',
  'Utiliser un vocabulaire adapté',
  'Enchaîner les idées logiquement',
  'Reformuler et synthétiser',
  'Décrire, raconter, expliquer',
]

const task1Steps = [
  { num: 1, title: 'Salutation adaptée',        desc: 'Adaptez le registre selon le destinataire.',                                                               examples: ['Bonjour Marc, j\'espère que tu vas bien !', 'Bonjour Monsieur, j\'espère que vous vous portez bien.'] },
  { num: 2, title: 'Introduction claire',        desc: 'Présentez l\'objet du message en tenant compte des informations de la consigne.',                          examples: ['Je t\'écris afin de te parler de…', 'Suite à votre annonce, je me permets de vous contacter…'] },
  { num: 3, title: 'Corps du message',           desc: 'Fournissez les informations demandées, décrivez ou expliquez avec clarté et précision.',                   examples: [] },
  { num: 4, title: 'Recommandation ou suggestion', desc: 'Proposez une action concrète au destinataire.',                                                          examples: ['Je te suggère de…', 'Je vous invite à…'] },
  { num: 5, title: 'Formule de politesse + Signature', desc: 'Concluez de façon courtoise et signez avec votre prénom.',                                           examples: ['Cordialement,', 'À très bientôt,'] },
]

const task2Steps = [
  { num: 1, title: 'Titre accrocheur',           desc: 'Si vous n\'en trouvez pas, laissez un espace et revenez-y à la fin.',                                    examples: ['Un semestre inoubliable', 'Ma nouvelle passion : le fitness'] },
  { num: 2, title: 'Salutation',                 desc: 'Adressez-vous à vos lecteurs.',                                                                            examples: ['Bonjour à toutes et à tous,', 'Chers internautes, bonjour !'] },
  { num: 3, title: 'Introduction annonce du plan', desc: 'Présentez brièvement l\'activité. Répondez aux questions : qui ? quoi ? quand ? où ?',              examples: ['Récemment, j\'ai décidé de…', 'Après avoir longtemps hésité, j\'ai finalement…'] },
  { num: 4, title: 'Récit de l\'expérience',     desc: 'Racontez ce que vous avez vécu. Utilisez la 1ère personne et les connecteurs logiques.',                  examples: [] },
  { num: 5, title: 'Recommandation + Remerciement + Signature', desc: 'Encouragez vos lecteurs, remerciez et signez.',                                            examples: ['Je vous recommande vivement de…', 'Restez connectés ! À bientôt, Madeleine'] },
]

const task3Steps = [
  { num: 1, title: 'Titre (recommandé)',          desc: 'Résume l\'idée générale des deux documents.',                                                            examples: ['La gratuité des musées : un débat ouvert'] },
  { num: 2, title: '1er paragraphe  Résumé neutre (40–60 mots)', desc: 'Présentez les deux points de vue sans prendre position.',                               examples: ['Certaines personnes pensent que… D\'autres affirment que…'] },
  { num: 3, title: '2e paragraphe  Votre position',  desc: 'Prenez clairement position.',                                                                        examples: ['Personnellement, je suis convaincu(e) que…', 'De mon point de vue,…'] },
  { num: 4, title: '3e paragraphe  Argument 1 + exemple', desc: 'Développez votre premier argument avec un exemple concret.',                                    examples: ['Tout d\'abord,… Par exemple,…'] },
  { num: 5, title: '4e paragraphe  Argument 2 + exemple', desc: 'Développez votre second argument.',                                                             examples: ['Ensuite,… Ainsi,…', 'De plus,… Des études montrent que…'] },
  { num: 6, title: 'Conclusion nuancée',          desc: 'Récapitulez votre position tout en reconnaissant le point de vue opposé.',                               examples: ['En résumé, bien que… il n\'en demeure pas moins que…'] },
]

const generalTips = [
  { icon: 'pi pi-check',           title: 'Respectez le nombre de mots',       desc: 'Trop court ou trop long entraîne une pénalité automatique. Comptez régulièrement.' },
  { icon: 'pi pi-sort-alt',        title: 'Formez des paragraphes distincts',  desc: 'La mise en forme compte. Un texte sans paragraphes perd des points même s\'il est correct.' },
  { icon: 'pi pi-star',            title: 'Utilisez des modes avancés',        desc: 'Le conditionnel et le subjonctif signalent un niveau C1/C2 à l\'examinateur.' },
  { icon: 'pi pi-link',            title: 'Maîtrisez les connecteurs',         desc: 'Tout d\'abord, Ensuite, Cependant, En effet, Ainsi, Par conséquent, En revanche…' },
  { icon: 'pi pi-pen-to-square',   title: 'Majuscules et ponctuation',         desc: 'Chaque phrase commence par une majuscule. Les noms propres aussi.' },
  { icon: 'pi pi-clock',           title: 'Gérez votre temps',                 desc: '20 min par tâche est une bonne règle. Ne passez pas trop de temps sur la tâche 1.' },
]
</script>