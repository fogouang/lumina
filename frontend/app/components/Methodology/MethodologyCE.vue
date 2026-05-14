<template>
  <div class="ce">

    <!-- Intro -->
    <div class="ce__intro">
      <h2 class="ce__title">Compréhension Écrite  TCF Canada</h2>
      <p class="ce__lead">
        Cette épreuve évalue votre capacité à comprendre des textes écrits de difficulté progressive, tirés de situations de la vie quotidienne, professionnelle et académique. Une méthodologie rigoureuse vous permettra de gagner un temps précieux.
      </p>
      <div class="ce__overview">
        <div class="ce__stat">
          <i class="pi pi-clock" />
          <div>
            <p class="ce__stat-val">60 min</p>
            <p class="ce__stat-lab">Durée</p>
          </div>
        </div>
        <div class="ce__stat">
          <i class="pi pi-list" />
          <div>
            <p class="ce__stat-val">39 questions</p>
            <p class="ce__stat-lab">QCM</p>
          </div>
        </div>
        <div class="ce__stat">
          <i class="pi pi-sort-amount-up" />
          <div>
            <p class="ce__stat-val">Progressive</p>
            <p class="ce__stat-lab">Difficulté</p>
          </div>
        </div>
        <div class="ce__stat">
          <i class="pi pi-check-circle" />
          <div>
            <p class="ce__stat-val">0 pénalité</p>
            <p class="ce__stat-lab">Mauvaise réponse</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Types de textes -->
    <div class="ce__block">
      <h3 class="ce__block-title"><i class="pi pi-folder-open" /> Types de textes rencontrés</h3>
      <div class="ce__types-grid">
        <div v-for="t in textTypes" :key="t.level" class="ce__type-card">
          <div class="ce__type-level">{{ t.level }}</div>
          <p class="ce__type-title">{{ t.title }}</p>
          <p class="ce__type-desc">{{ t.desc }}</p>
          <div class="ce__type-tags">
            <span v-for="tag in t.tags" :key="tag" class="ce__type-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stratégies -->
    <div class="ce__block">
      <h3 class="ce__block-title"><i class="pi pi-star" /> Stratégies essentielles</h3>
      <div class="ce__steps">
        <div v-for="step in strategies" :key="step.num" class="ce__step">
          <div class="ce__step-num">{{ step.num }}</div>
          <div>
            <p class="ce__step-title">{{ step.title }}</p>
            <p class="ce__step-desc">{{ step.desc }}</p>
            <div v-if="step.tip" class="ce__step-tip">
              <i class="pi pi-lightbulb" />
              <p>{{ step.tip }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pièges à éviter -->
    <div class="ce__block">
      <h3 class="ce__block-title"><i class="pi pi-exclamation-triangle" /> Pièges fréquents à éviter</h3>
      <div class="ce__traps">
        <div v-for="trap in traps" :key="trap.title" class="ce__trap">
          <div class="ce__trap-icon">
            <i class="pi pi-times" />
          </div>
          <div>
            <p class="ce__trap-title">{{ trap.title }}</p>
            <p class="ce__trap-desc">{{ trap.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gestion du temps -->
    <div class="ce__block">
      <h3 class="ce__block-title"><i class="pi pi-clock" /> Gestion du temps</h3>
      <div class="ce__time-grid">
        <div v-for="t in timeManagement" :key="t.label" class="ce__time-card">
          <p class="ce__time-val">{{ t.time }}</p>
          <p class="ce__time-label">{{ t.label }}</p>
        </div>
      </div>
      <div class="ce__tip-box">
        <i class="pi pi-info-circle" />
        <p>Soit environ <strong>1 minute 30 par question</strong>. Si vous bloquez, passez à la suivante et revenez à la fin. <strong>Ne laissez aucune réponse vide</strong>  une mauvaise réponse ne retire aucun point.</p>
      </div>
    </div>

    <!-- Règle d'or -->
    <div class="ce__gold-rule">
      <i class="pi pi-sparkles" />
      <p><strong>Règle d'or :</strong> répondez à toutes les questions sans exception. Une réponse incorrecte ne retire aucun point  une réponse manquante rapporte zéro garanti.</p>
    </div>

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

<style scoped>
.ce { display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem 0; }

.ce__title { font-size: 1.375rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.75rem; }
.ce__lead  { font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.75; margin: 0 0 1.5rem; }

.ce__overview { display: flex; gap: 1rem; flex-wrap: wrap; }
.ce__stat {
  display: flex; align-items: center; gap: 0.75rem;
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 0.875rem 1.25rem; flex: 1; min-width: 130px;
}
.ce__stat i { font-size: 1.25rem; color: var(--color-primary-500); flex-shrink: 0; }
.ce__stat-val { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.ce__stat-lab { font-size: 0.75rem; color: var(--text-tertiary); margin: 0; }

.ce__block-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 1rem;
}
.ce__block-title i { color: var(--color-primary-500); }

/* Types grid */
.ce__types-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.ce__type-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 1.25rem;
}
.ce__type-level {
  display: inline-block; background: var(--gradient-primary); color: #fff;
  border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.75rem;
  font-weight: 700; margin-bottom: 0.625rem;
}
.ce__type-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.375rem; }
.ce__type-desc  { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 0.75rem; }
.ce__type-tags  { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.ce__type-tag {
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.375rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--text-tertiary);
}

/* Steps */
.ce__steps { display: flex; flex-direction: column; gap: 1.25rem; }
.ce__step  { display: flex; gap: 1rem; align-items: flex-start; }
.ce__step-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 800; flex-shrink: 0;
}
.ce__step-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.ce__step-desc  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
.ce__step-tip {
  display: flex; align-items: flex-start; gap: 0.5rem; margin-top: 0.5rem;
  background: #fefce8; border: 1px solid #fde68a; border-radius: 0.5rem; padding: 0.5rem 0.75rem;
}
.ce__step-tip i { color: #d97706; font-size: 0.875rem; flex-shrink: 0; margin-top: 0.1rem; }
.ce__step-tip p { font-size: 0.8125rem; color: #92400e; margin: 0; line-height: 1.5; }

/* Traps */
.ce__traps { display: flex; flex-direction: column; gap: 0.75rem; }
.ce__trap  {
  display: flex; gap: 1rem; align-items: flex-start;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.75rem; padding: 1rem;
}
.ce__trap-icon {
  width: 30px; height: 30px; border-radius: 50%; background: #fef2f2;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ce__trap-icon i { color: #dc2626; font-size: 0.75rem; }
.ce__trap-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.ce__trap-desc  { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

/* Time */
.ce__time-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;
}
.ce__time-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 1rem; text-align: center;
}
.ce__time-val   { font-size: 1.375rem; font-weight: 800; color: var(--color-primary-600); margin: 0 0 0.25rem; }
.ce__time-label { font-size: 0.8125rem; color: var(--text-tertiary); margin: 0; }

.ce__tip-box {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem;
}
.ce__tip-box i { color: #3b82f6; flex-shrink: 0; margin-top: 0.1rem; }
.ce__tip-box p { font-size: 0.9rem; color: #1e40af; line-height: 1.6; margin: 0; }

.ce__gold-rule {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: var(--color-primary-50); border: 1px solid var(--color-primary-100);
  border-radius: 0.875rem; padding: 1rem;
}
.ce__gold-rule i { color: var(--color-primary-500); font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.ce__gold-rule p { font-size: 0.9rem; font-style: italic; color: var(--color-primary-700); margin: 0; line-height: 1.6; }

@media (max-width: 640px) {
  .ce__overview   { flex-direction: column; }
  .ce__time-grid  { grid-template-columns: 1fr; }
  .ce__types-grid { grid-template-columns: 1fr; }
}
</style>