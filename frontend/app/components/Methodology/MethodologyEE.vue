<template>
  <div class="flex flex-col gap-10">
    <MethodologyHero
      title="Expression écrite au TCF Canada"
      lead="L'expression écrite est l'épreuve qui fait le plus échouer les candidats. Elle exige une méthodologie rigoureuse, un français de qualité et une structure claire. Voici tout ce qu'il faut savoir pour décrocher un score élevé."
      :stats="stats.map((s) => ({ icon: s.icon, value: s.val, label: s.label }))"
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
          title="Tâche 1 : rédiger un message"
          subtitle="Décrire, raconter ou expliquer à un ou plusieurs destinataires"
          badge="60 à 120 mots"
          badge-icon="pi pi-align-left"
        />

        <MethodologyCallout>
          Adaptez le registre selon le destinataire : <strong>tu</strong> pour un ami, <strong>vous</strong>
          pour un inconnu ou un supérieur.
        </MethodologyCallout>

        <MethodologyBlock title="Structure à suivre" icon="pi pi-sitemap">
          <div class="flex flex-col gap-6">
            <MethodologyStep
              v-for="step in task1Steps"
              :key="step.num"
              :num="step.num"
              :title="step.title"
              :desc="step.desc"
              :examples="step.examples"
            />
          </div>
        </MethodologyBlock>

        <MethodologyBlock title="Exemple complet niveau C2" icon="pi pi-file-edit">
          <MethodologyExample
            subject="Vous souhaitez faire du sport et voulez que votre ami vous accompagne. Écrivez-lui un message pour lui proposer de pratiquer ensemble. (60 à 120 mots)"
            :word-count="114"
          >
            <p>Bonjour Yvan, j'espère que ce message te trouvera en pleine forme !</p>
            <p>Une nouvelle aventure sportive m'attend, et je pense à quel point ce serait génial de la partager avec toi. Que dirais-tu de relever ce défi ensemble ?</p>
            <p>En effet, j'ai repéré un club de fitness non loin de chez nous, et je suis convaincu que cela pourrait être une expérience motivante pour nous deux. Les séances débutent en fin d'après-midi, ce qui serait une excellente manière de décompresser après le travail.</p>
            <p>J'attends ta réponse avec impatience.<br />À très bientôt, <em>Francine.</em></p>
          </MethodologyExample>
        </MethodologyBlock>

        <MethodologyCallout variant="tip">
          Pour viser C2 : utilisez le <strong>conditionnel</strong> (« ce serait », « dirais-tu »), le
          <strong>subjonctif</strong>, et formez plusieurs paragraphes bien ponctués.
        </MethodologyCallout>
      </div>

      <!-- Tâche 2 -->
      <div v-else-if="activeTask === 2" class="flex flex-col gap-6">
        <MethodologyTaskHeader
          title="Tâche 2 : article, courrier ou note"
          subtitle="Faire un compte rendu d'expérience ou un récit"
          badge="120 à 150 mots"
          badge-icon="pi pi-align-left"
        />

        <MethodologyCallout>
          Le plus souvent, il s'agit d'un <strong>article de blog</strong> : racontez une expérience
          personnelle de façon structurée et engageante. Utilisez la <strong>1re personne</strong> (j'ai, je).
        </MethodologyCallout>

        <MethodologyBlock title="Structure d'un article de blog" icon="pi pi-sitemap">
          <div class="flex flex-col gap-6">
            <MethodologyStep
              v-for="step in task2Steps"
              :key="step.num"
              :num="step.num"
              :title="step.title"
              :desc="step.desc"
              :examples="step.examples"
            />
          </div>
        </MethodologyBlock>

        <MethodologyBlock title="Exemple complet" icon="pi pi-file-edit">
          <MethodologyExample
            subject="Vous venez de commencer une nouvelle activité de loisir. Écrivez un article sur votre blog. (120 à 150 mots)"
          >
            <p class="font-heading font-bold">Titre : Mon expérience enrichissante dans le monde du fitness</p>
            <p>Bonjour à tous,</p>
            <p>Je suis ravi(e) de partager avec vous le début de mon aventure dans le monde du fitness. Récemment, j'ai décidé d'intégrer une activité physique à ma routine quotidienne.</p>
            <p>Chaque séance est un défi que je relève avec détermination. Les cours de cardio m'ont permis de découvrir de nouvelles facettes de ma force intérieure. Je suis étonné(e) de constater à quel point cette activité a déjà eu un impact positif : je me sens plus énergique et j'observe des progrès concrets chaque semaine.</p>
            <p>Je vous encourage vivement à vous lancer dans une activité qui vous tient à cœur !</p>
            <p>À bientôt, <em>Madeleine</em></p>
          </MethodologyExample>
        </MethodologyBlock>

        <MethodologyCallout variant="tip">
          N'oubliez pas les <strong>connecteurs logiques</strong> : en effet, de plus, ainsi, par conséquent,
          cependant… Ils font la différence entre B2 et C1.
        </MethodologyCallout>
      </div>

      <!-- Tâche 3 -->
      <div v-else-if="activeTask === 3" class="flex flex-col gap-6">
        <MethodologyTaskHeader
          title="Tâche 3 : comparer deux points de vue"
          subtitle="Résumer deux opinions et défendre votre position avec des arguments"
          badge="120 à 180 mots"
          badge-icon="pi pi-align-left"
        />

        <MethodologyCallout>
          On vous donne <strong>deux documents courts</strong> exprimant deux opinions opposées. Résumez les
          deux, prenez position, et argumentez avec <strong>2 arguments minimum</strong>.
        </MethodologyCallout>

        <MethodologyBlock title="Structure obligatoire" icon="pi pi-sitemap">
          <div class="flex flex-col gap-6">
            <MethodologyStep
              v-for="step in task3Steps"
              :key="step.num"
              :num="step.num"
              :title="step.title"
              :desc="step.desc"
              :examples="step.examples"
            />
          </div>
        </MethodologyBlock>

        <MethodologyBlock title="Exemple : la gratuité des musées" icon="pi pi-file-edit">
          <div class="mb-4 grid gap-3 md:grid-cols-2">
            <div class="rounded-2xl border border-line bg-canvas p-4">
              <p class="text-xs font-bold uppercase tracking-wider text-faint">Document 1</p>
              <p class="mt-2 text-sm leading-relaxed text-muted">
                La gratuité peut entraîner une surfréquentation et réduire les ressources financières des
                musées, affectant leur entretien.
              </p>
            </div>
            <div class="rounded-2xl border border-line bg-canvas p-4">
              <p class="text-xs font-bold uppercase tracking-wider text-faint">Document 2</p>
              <p class="mt-2 text-sm leading-relaxed text-muted">
                La gratuité rend la culture accessible à tous, indépendamment de leur situation financière,
                et contribue à l'éducation du public.
              </p>
            </div>
          </div>

          <MethodologyExample subject="La gratuité des musées : pour ou contre ? (120 à 180 mots)" :word-count="177">
            <p class="font-heading font-bold">Titre : La gratuité des musées</p>
            <p>La question de la gratuité des musées suscite un vif débat. Certains soulignent les risques de surfréquentation et l'épuisement des ressources. D'autres affirment que cette initiative favorise un accès équitable à la culture.</p>
            <p>Personnellement, je suis convaincu(e) que l'accessibilité à la culture ne devrait pas être conditionnée par des barrières financières.</p>
            <p>Tout d'abord, la gratuité élargit l'accès à la culture et favorise l'égalité sociale. Dans les villes où les musées sont gratuits, la diversité des visiteurs a considérablement augmenté.</p>
            <p>Ensuite, elle stimule l'intérêt du public pour la préservation culturelle. Des études montrent que les visiteurs ayant bénéficié d'un accès gratuit participent davantage aux initiatives de financement participatif.</p>
            <p>En résumé, bien que la gratuité soulève des défis logistiques, ses bénéfices sociaux et éducatifs justifient pleinement son développement.</p>
          </MethodologyExample>
        </MethodologyBlock>

        <MethodologyCallout variant="tip">
          Pas besoin de plus de <strong>2 arguments</strong>, sinon vous seriez à court de mots. Misez sur la
          <strong>qualité du français</strong> et la <strong>précision des exemples</strong>.
        </MethodologyCallout>
      </div>
    </div>

    <MethodologyBlock title="Conseils pour maximiser votre note" icon="pi pi-lightbulb">
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="tip in generalTips"
          :key="tip.title"
          class="group flex items-start gap-3 rounded-2xl border border-line bg-canvas p-4 transition-colors hover:bg-card"
        >
          <span class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 group-hover:brand-gradient group-hover:text-white dark:bg-primary-950 dark:text-primary-300">
            <i :class="tip.icon" />
          </span>
          <div>
            <p class="font-semibold text-ink">{{ tip.title }}</p>
            <p class="mt-1 text-sm leading-relaxed text-muted">{{ tip.desc }}</p>
          </div>
        </div>
      </div>
    </MethodologyBlock>
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