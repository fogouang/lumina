<template>
  <div class="eo">

    <!-- Intro -->
    <div class="eo__intro">
      <h2 class="eo__title">Expression Orale TCF Canada</h2>
      <p class="eo__lead">
        L'expression orale évalue votre capacité à communiquer spontanément et de façon structurée en français. C'est une épreuve en face-à-face avec un examinateur, enregistrée, composée de 3 tâches progressives.
      </p>
      <div class="eo__overview">
        <div class="eo__stat">
          <i class="pi pi-clock" />
          <div>
            <p class="eo__stat-val">12 min</p>
            <p class="eo__stat-lab">Durée totale</p>
          </div>
        </div>
        <div class="eo__stat">
          <i class="pi pi-list" />
          <div>
            <p class="eo__stat-val">3 tâches</p>
            <p class="eo__stat-lab">Progressives</p>
          </div>
        </div>
        <div class="eo__stat">
          <i class="pi pi-microphone" />
          <div>
            <p class="eo__stat-val">Face-à-face</p>
            <p class="eo__stat-lab">Enregistré</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Compétences évaluées -->
    <div class="eo__block">
      <h3 class="eo__block-title"><i class="pi pi-star" /> Vous êtes évalué sur</h3>
      <div class="eo__tags">
        <span v-for="c in competences" :key="c" class="eo__tag">{{ c }}</span>
      </div>
    </div>

    <!-- Tabs tâches -->
    <div class="eo__tasks">
      <div class="eo__task-tabs">
        <button
          v-for="t in tasks"
          :key="t.id"
          class="eo__task-tab"
          :class="{ 'eo__task-tab--active': activeTask === t.id }"
          @click="activeTask = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- TÂCHE 1 -->
      <div v-if="activeTask === 1" class="eo__task-content">
        <div class="eo__task-header">
          <div>
            <h3 class="eo__task-title">Tâche 1 Entretien dirigé</h3>
            <p class="eo__task-sub">Sans préparation  parlez de vous naturellement</p>
          </div>
          <Tag value="2 minutes" severity="info" />
        </div>

        <div class="eo__tip-box">
          <i class="pi pi-info-circle" />
          <p>L'examinateur engage une conversation avec vous. Il peut vous poser des questions sur votre vie, vos goûts, vos projets. <strong>Ne récitez pas</strong> soyez naturel comme dans une vraie conversation.</p>
        </div>

        <h4 class="eo__sub-title">Structure recommandée</h4>
        <div class="eo__steps">
          <div v-for="step in task1Steps" :key="step.num" class="eo__step">
            <div class="eo__step-num">{{ step.num }}</div>
            <div>
              <p class="eo__step-title">{{ step.title }}</p>
              <p class="eo__step-desc">{{ step.desc }}</p>
              <div v-if="step.examples?.length" class="eo__examples">
                <p v-for="ex in step.examples" :key="ex" class="eo__example">• {{ ex }}</p>
              </div>
            </div>
          </div>
        </div>

        <h4 class="eo__sub-title">Thèmes que l'examinateur peut aborder</h4>
        <div class="eo__themes">
          <span v-for="theme in task1Themes" :key="theme" class="eo__theme">{{ theme }}</span>
        </div>

        <h4 class="eo__sub-title">Questions types de l'examinateur</h4>
        <div class="eo__questions">
          <div v-for="q in task1Questions" :key="q" class="eo__question">
            <i class="pi pi-comment" />
            <p>{{ q }}</p>
          </div>
        </div>

        <div class="eo__gold-rule">
          <i class="pi pi-sparkles" />
          <p>Visez <strong>minimum 1 minute 50 secondes</strong>. En deçà, vous perdez des points. Terminez par « Je vous remercie ».</p>
        </div>
      </div>

      <!-- TÂCHE 2 -->
      <div v-else-if="activeTask === 2" class="eo__task-content">
        <div class="eo__task-header">
          <div>
            <h3 class="eo__task-title">Tâche 2  Exercice en interaction</h3>
            <p class="eo__task-sub">Avec 2 minutes de préparation  posez des questions pour obtenir des informations</p>
          </div>
          <Tag value="5 min 30" severity="info" />
        </div>

        <div class="eo__timing-grid">
          <div class="eo__timing">
            <i class="pi pi-pencil" />
            <div>
              <p class="eo__timing-val">2 min</p>
              <p class="eo__timing-lab">Préparation (notes autorisées)</p>
            </div>
          </div>
          <div class="eo__timing">
            <i class="pi pi-comments" />
            <div>
              <p class="eo__timing-val">3 min 30</p>
              <p class="eo__timing-lab">Échange avec l'examinateur</p>
            </div>
          </div>
        </div>

        <div class="eo__tip-box">
          <i class="pi pi-info-circle" />
          <p>C'est <strong>vous qui menez la conversation</strong>. Vous posez des questions à l'examinateur pour obtenir des informations dans un contexte précis (logement, emploi, voyage, association...). Le statut des deux interlocuteurs est indiqué dans la consigne.</p>
        </div>

        <h4 class="eo__sub-title">Structure à suivre</h4>
        <div class="eo__steps">
          <div v-for="step in task2Steps" :key="step.num" class="eo__step">
            <div class="eo__step-num">{{ step.num }}</div>
            <div>
              <p class="eo__step-title">{{ step.title }}</p>
              <p class="eo__step-desc">{{ step.desc }}</p>
              <div v-if="step.examples?.length" class="eo__examples">
                <p v-for="ex in step.examples" :key="ex" class="eo__example">• {{ ex }}</p>
              </div>
            </div>
          </div>
        </div>

        <h4 class="eo__sub-title">Exemples de sujets</h4>
        <div class="eo__subject-examples">
          <div v-for="s in task2Subjects" :key="s" class="eo__subject">
            <i class="pi pi-bookmark" />
            <p>{{ s }}</p>
          </div>
        </div>

        <div class="eo__gold-rule">
          <i class="pi pi-sparkles" />
          <p>Préparez <strong>au minimum 10 questions</strong> sur le brouillon. Évitez les questions fermées (oui/non) posez des questions ouvertes pour que l'examinateur développe ses réponses.</p>
        </div>
      </div>

      <!-- TÂCHE 3 -->
      <div v-else-if="activeTask === 3" class="eo__task-content">
        <div class="eo__task-header">
          <div>
            <h3 class="eo__task-title">Tâche 3  Donner son point de vue</h3>
            <p class="eo__task-sub">Sans préparation  argumentez de façon spontanée et convaincante</p>
          </div>
          <Tag value="4 min 30" severity="info" />
        </div>

        <div class="eo__tip-box">
          <i class="pi pi-info-circle" />
          <p>L'examinateur vous pose une question sur un sujet de société. Vous devez répondre de façon <strong>spontanée, structurée et argumentée</strong>. Présentez au moins <strong>3 arguments</strong> avec des exemples personnels.</p>
        </div>

        <h4 class="eo__sub-title">Structure à suivre</h4>
        <div class="eo__steps">
          <div v-for="step in task3Steps" :key="step.num" class="eo__step">
            <div class="eo__step-num">{{ step.num }}</div>
            <div>
              <p class="eo__step-title">{{ step.title }}</p>
              <p class="eo__step-desc">{{ step.desc }}</p>
              <div v-if="step.examples?.length" class="eo__examples">
                <p v-for="ex in step.examples" :key="ex" class="eo__example">• {{ ex }}</p>
              </div>
            </div>
          </div>
        </div>

        <h4 class="eo__sub-title">Exemple développé</h4>
        <div class="eo__example-block">
          <div class="eo__example-prompt">
            <i class="pi pi-bookmark" />
            <p><strong>Sujet :</strong> Voyager nous rend meilleurs. Êtes-vous d'accord ? Pourquoi ?</p>
          </div>
          <div class="eo__example-text">
            <div class="eo__example-section">
              <p class="eo__example-label">Introduction  Prise de position</p>
              <p>Le voyage est souvent présenté comme une expérience enrichissante. Personnellement, je partage cette opinion, car voyager développe nos capacités d'adaptation, enrichit notre culture et renforce notre confiance en nous.</p>
            </div>
            <div class="eo__example-section">
              <p class="eo__example-label">Argument 1</p>
              <p>Tout d'abord, voyager favorise l'ouverture d'esprit. En découvrant d'autres cultures et modes de vie, on apprend à relativiser ses propres certitudes. Par exemple, un séjour en Asie m'a permis de comprendre une philosophie de vie fondée sur l'harmonie et le respect de la nature.</p>
            </div>
            <div class="eo__example-section">
              <p class="eo__example-label">Argument 2</p>
              <p>Ensuite, le voyage stimule notre développement personnel. Faire face à l'imprévu un train manqué, une langue inconnue nous apprend la résilience et l'adaptabilité. J'ai moi-même surmonté des imprévus qui m'ont rendu plus autonome.</p>
            </div>
            <div class="eo__example-section">
              <p class="eo__example-label">Argument 3</p>
              <p>Par ailleurs, voyager enrichit notre compréhension culturelle. Visiter des musées, assister à des festivals locaux, goûter à la gastronomie tout cela nous rend plus tolérants et curieux du monde.</p>
            </div>
            <div class="eo__example-section">
              <p class="eo__example-label">Conclusion</p>
              <p>En conclusion, voyager nous rend indéniablement meilleurs, à condition d'aborder chaque destination avec humilité et ouverture d'esprit.</p>
            </div>
          </div>
        </div>

        <h4 class="eo__sub-title">Sujets d'entraînement</h4>
        <div class="eo__subject-examples">
          <div v-for="s in task3Subjects" :key="s" class="eo__subject">
            <i class="pi pi-bookmark" />
            <p>{{ s }}</p>
          </div>
        </div>

        <div class="eo__gold-rule">
          <i class="pi pi-sparkles" />
          <p><strong>Fluidité + Structure + Exemples personnels = excellent score.</strong> Parlez légèrement plus lentement que d'habitude pour articuler clairement et éviter les hésitations.</p>
        </div>
      </div>
    </div>

    <!-- Conseils généraux -->
    <div class="eo__block">
      <h3 class="eo__block-title"><i class="pi pi-lightbulb" /> Conseils pour réussir l'épreuve</h3>
      <div class="eo__advice-grid">
        <div v-for="tip in generalTips" :key="tip.title" class="eo__advice">
          <i :class="tip.icon" class="eo__advice-icon" />
          <div>
            <p class="eo__advice-title">{{ tip.title }}</p>
            <p class="eo__advice-desc">{{ tip.desc }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
const activeTask = ref(1)

const tasks = [
  { id: 1, label: 'Tâche 1  Entretien dirigé' },
  { id: 2, label: 'Tâche 2  Interaction' },
  { id: 3, label: 'Tâche 3  Point de vue' },
]

const competences = [
  'Parler de vous et de votre environnement',
  'Poser des questions adaptées',
  'Donner et défendre une opinion',
  'Argumenter de façon structurée',
  'Présenter des sujets complexes',
  'Exprimer accord et désaccord',
  'Interagir spontanément',
  'Conclure de façon claire',
]

const task1Steps = [
  {
    num: 1, title: 'État civil',
    desc: 'Nom, âge, nationalité, lieu de résidence, statut matrimonial, région d\'origine.',
    examples: [],
  },
  {
    num: 2, title: 'Formation académique',
    desc: 'Mentionnez votre diplôme le plus élevé en lien avec votre profession. Expliquez pourquoi vous avez choisi ce cursus.',
    examples: [],
  },
  {
    num: 3, title: 'Expérience professionnelle',
    desc: 'Nom de l\'entreprise, localisation, poste occupé, tâches principales.',
    examples: [],
  },
  {
    num: 4, title: 'Loisirs valorisants',
    desc: 'Sport, lecture, voyages, dessin... Choisissez des activités qui vous mettent en valeur.',
    examples: [],
  },
  {
    num: 5, title: 'Projets de vie',
    desc: 'Que souhaiteriez-vous avoir accompli dans 10 ans ? Soyez précis et ambitieux.',
    examples: ['Dans dix ans, j\'espère avoir...', 'Mon objectif principal est de...'],
  },
]

const task1Themes = [
  'État civil', 'Famille', 'Relations amicales', 'Formation / études',
  'Vie professionnelle', 'Loisirs et centres d\'intérêt', 'Voyages',
  'Logement', 'Projets et souhaits', 'Événements passés',
]

const task1Questions = [
  'Quel est votre film préféré ? Pourquoi ?',
  'Où êtes-vous allé durant vos dernières vacances ?',
  'Comment imaginez-vous votre vie dans 30 ans ?',
  'Où avez-vous appris le français ?',
  'Qu\'est-ce qui vous passionne dans votre métier ?',
]

const task2Steps = [
  {
    num: 1, title: 'Salutation appropriée',
    desc: 'Adaptez le registre selon le statut de l\'interlocuteur.',
    examples: ['Bonjour, j\'espère que vous allez bien.', 'Salut, comment tu vas ?'],
  },
  {
    num: 2, title: 'Introduction contextuelle',
    desc: 'Introduisez la raison de votre prise de contact.',
    examples: ['J\'ai appris que vous vendez votre vélo...', 'J\'ai appris que tu organises un voyage...'],
  },
  {
    num: 3, title: 'Questionnement structuré',
    desc: 'Posez vos questions de façon ordonnée. Utilisez les connecteurs entre chaque réponse et votre question suivante.',
    examples: ['Quel est le prix ?', 'Comment cela fonctionne-t-il ?', 'Quelles sont les conditions ?'],
  },
  {
    num: 4, title: 'Petite conclusion',
    desc: 'Résumez ce que vous avez appris et annoncez votre décision.',
    examples: ['Je vous remercie pour ces informations, je vais réfléchir et reviendrai vers vous rapidement.'],
  },
  {
    num: 5, title: 'Remerciement + Formule de politesse',
    desc: 'Clôturez l\'échange courtoisement.',
    examples: ['Merci pour votre temps. À très bientôt !', 'Je vous remercie. Au plaisir de vous revoir.'],
  },
]

const task2Subjects = [
  'Je dirige une association d\'aide aux personnes en difficulté. Demandez-moi comment elle fonctionne (actions, financements, adhérents...).',
  'Vous partez en vacances et cherchez quelqu\'un pour garder votre chat. Je vous propose ma candidature. Posez-moi des questions (motivation, goûts, expérience...).',
  'Vous vous interrogez sur l\'organisation des transports en commun en France. Posez-moi des questions (fréquence, horaires, tarifs...).',
]

const task3Steps = [
  {
    num: 1, title: 'Comprendre le sujet',
    desc: 'Reformulez mentalement la question pour être sûr de ce qu\'on vous demande.',
    examples: [],
  },
  {
    num: 2, title: 'Introduction  Prise de position',
    desc: 'Annoncez clairement votre point de vue dès le début.',
    examples: [
      'Personnellement, je suis convaincu(e) que...',
      'De mon point de vue, cette affirmation est...',
      'Il me semble évident que...',
    ],
  },
  {
    num: 3, title: 'Argument 1 + exemple',
    desc: 'Développez votre premier argument avec un exemple concret ou personnel.',
    examples: ['Tout d\'abord,... Par exemple,...', 'Premièrement,... En effet,...'],
  },
  {
    num: 4, title: 'Argument 2 + exemple',
    desc: 'Développez votre deuxième argument.',
    examples: ['Ensuite,... Ainsi,...', 'De plus,... J\'ai personnellement constaté que...'],
  },
  {
    num: 5, title: 'Argument 3 + exemple',
    desc: 'Un troisième argument renforce considérablement votre score.',
    examples: ['Par ailleurs,... À titre d\'exemple,...', 'Enfin,... Il convient de noter que...'],
  },
  {
    num: 6, title: 'Conclusion claire',
    desc: 'Résumez votre position et ouvrez sur une perspective.',
    examples: [
      'En conclusion, voyager nous rend meilleurs à condition de...',
      'Pour conclure, bien que... il n\'en demeure pas moins que...',
    ],
  },
]

const task3Subjects = [
  'Faut-il interdire la vente d\'alcool aux mineurs ?',
  'Voyager nous rend meilleurs. Êtes-vous d\'accord ?',
  'Les moyens de communication se développent. Les gens communiquent-ils mieux aujourd\'hui ?',
  'Tous les membres du foyer doivent participer aux tâches ménagères. Êtes-vous d\'accord ?',
  'Aujourd\'hui, on peut tout apprendre seul grâce à Internet. Qu\'en pensez-vous ?',
]

const generalTips = [
  { icon: 'pi pi-volume-up',   title: 'Parlez clairement et audiblement', desc: 'Le dictaphone enregistre tout. Articulez bien, ne parlez pas trop vite.' },
  { icon: 'pi pi-eye',         title: 'Regardez l\'examinateur', desc: 'Contact visuel direct, accompagné de gestes naturels. Évitez de fixer vos notes.' },
  { icon: 'pi pi-clock',       title: 'Respectez les durées', desc: 'Pour la tâche 1, visez minimum 1 min 50 sec. L\'examinateur vous fera signe à la fin.' },
  { icon: 'pi pi-link',        title: 'Utilisez des connecteurs logiques', desc: 'Tout d\'abord, Ensuite, Par ailleurs, En revanche, À mon avis, Donc, En conclusion...' },
  { icon: 'pi pi-refresh',     title: 'Entraînez-vous à voix haute', desc: 'Enregistrez-vous, réécoutez, corrigez votre prononciation et votre fluidité.' },
  { icon: 'pi pi-headphones',  title: 'Écoutez du français authentique', desc: 'Radios, podcasts, films non sous-titrés. Variez les accents : standard, québécois.' },
  { icon: 'pi pi-star',        title: 'Pensez en français', desc: 'Ne traduisez pas dans votre tête. Formulez directement vos idées en français.' },
  { icon: 'pi pi-heart',       title: 'Restez naturel et confiant', desc: 'Parlez légèrement plus lentement pour calmer le stress. Souriez  cela s\'entend.' },
]
</script>

<style scoped>
.eo { display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem 0; }

.eo__title { font-size: 1.375rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.75rem; }
.eo__lead  { font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.75; margin: 0 0 1.5rem; }

.eo__overview { display: flex; gap: 1rem; flex-wrap: wrap; }
.eo__stat {
  display: flex; align-items: center; gap: 0.75rem;
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 0.875rem 1.25rem; flex: 1; min-width: 140px;
}
.eo__stat i { font-size: 1.25rem; color: var(--color-primary-500); flex-shrink: 0; }
.eo__stat-val { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.eo__stat-lab { font-size: 0.75rem; color: var(--text-tertiary); margin: 0; }

.eo__block-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 1rem;
}
.eo__block-title i { color: var(--color-primary-500); }

.eo__tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.eo__tag {
  background: var(--color-primary-50); color: var(--color-primary-700);
  border: 1px solid var(--color-primary-100); border-radius: 9999px;
  padding: 0.375rem 0.875rem; font-size: 0.8125rem; font-weight: 500;
}

.eo__task-tabs {
  display: flex; gap: 0.5rem; flex-wrap: wrap;
  border-bottom: 2px solid var(--border-color); margin-bottom: 1.5rem;
}
.eo__task-tab {
  padding: 0.625rem 1.25rem; background: none; border: none;
  border-bottom: 3px solid transparent; margin-bottom: -2px;
  font-size: 0.9rem; font-weight: 600; color: var(--text-tertiary);
  cursor: pointer; transition: all 0.2s; font-family: inherit;
}
.eo__task-tab:hover { color: var(--color-primary-600); }
.eo__task-tab--active { color: var(--color-primary-600); border-bottom-color: var(--color-primary-500); }

.eo__task-content { display: flex; flex-direction: column; gap: 1.5rem; }
.eo__task-header  { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.eo__task-title   { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.eo__task-sub     { font-size: 0.875rem; color: var(--text-tertiary); margin: 0; }
.eo__sub-title    { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.75rem; }

.eo__timing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.eo__timing {
  display: flex; align-items: center; gap: 0.75rem;
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 0.875rem 1.25rem;
}
.eo__timing i { color: var(--color-primary-500); font-size: 1.25rem; flex-shrink: 0; }
.eo__timing-val { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.eo__timing-lab { font-size: 0.75rem; color: var(--text-tertiary); margin: 0; }

.eo__tip-box {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem;
}
.eo__tip-box i { color: #3b82f6; flex-shrink: 0; margin-top: 0.1rem; }
.eo__tip-box p  { font-size: 0.9rem; color: #1e40af; line-height: 1.6; margin: 0; }

.eo__steps { display: flex; flex-direction: column; gap: 1rem; }
.eo__step  { display: flex; gap: 1rem; align-items: flex-start; }
.eo__step-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 800; flex-shrink: 0;
}
.eo__step-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.eo__step-desc  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin: 0 0 0.375rem; }
.eo__examples   { display: flex; flex-direction: column; gap: 0.25rem; }
.eo__example    { font-size: 0.8125rem; color: var(--color-primary-700); font-style: italic; margin: 0; }

.eo__themes { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.eo__theme {
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.5rem; padding: 0.375rem 0.75rem;
  font-size: 0.8125rem; color: var(--text-secondary);
}

.eo__questions { display: flex; flex-direction: column; gap: 0.625rem; }
.eo__question  {
  display: flex; gap: 0.75rem; align-items: flex-start;
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.75rem; padding: 0.75rem 1rem;
}
.eo__question i { color: var(--color-primary-400); flex-shrink: 0; margin-top: 0.1rem; }
.eo__question p { font-size: 0.875rem; color: var(--text-secondary); font-style: italic; margin: 0; }

.eo__subject-examples { display: flex; flex-direction: column; gap: 0.625rem; }
.eo__subject {
  display: flex; gap: 0.75rem; align-items: flex-start;
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.75rem; padding: 0.75rem 1rem;
}
.eo__subject i { color: var(--color-primary-400); flex-shrink: 0; margin-top: 0.1rem; }
.eo__subject p { font-size: 0.875rem; color: var(--text-secondary); margin: 0; line-height: 1.6; }

.eo__example-block {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.875rem; overflow: hidden;
}
.eo__example-prompt {
  display: flex; gap: 0.75rem; align-items: flex-start;
  padding: 0.875rem 1.25rem; background: var(--bg-ground);
  border-bottom: 1px solid var(--border-color);
}
.eo__example-prompt i { color: var(--color-primary-500); flex-shrink: 0; margin-top: 0.1rem; }
.eo__example-prompt p { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }
.eo__example-text { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.eo__example-section { display: flex; flex-direction: column; gap: 0.375rem; }
.eo__example-label { font-size: 0.75rem; font-weight: 700; color: var(--color-primary-500); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.eo__example-text p { font-size: 0.9rem; color: var(--text-primary); line-height: 1.8; margin: 0; }

.eo__gold-rule {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: var(--color-primary-50); border: 1px solid var(--color-primary-100);
  border-radius: 0.875rem; padding: 1rem;
}
.eo__gold-rule i { color: var(--color-primary-500); font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.eo__gold-rule p { font-size: 0.9rem; font-style: italic; color: var(--color-primary-700); margin: 0; line-height: 1.6; }

.eo__advice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.eo__advice {
  display: flex; gap: 0.875rem; align-items: flex-start;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 1rem;
}
.eo__advice-icon  { color: var(--color-primary-500); font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.eo__advice-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.eo__advice-desc  { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

@media (max-width: 640px) {
  .eo__overview    { flex-direction: column; }
  .eo__timing-grid { grid-template-columns: 1fr; }
  .eo__task-tabs   { overflow-x: auto; flex-wrap: nowrap; }
  .eo__task-tab    { white-space: nowrap; }
}
</style>