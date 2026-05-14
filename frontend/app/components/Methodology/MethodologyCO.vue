<template>
  <div class="co">

    <!-- Intro -->
    <div class="co__intro">
      <h2 class="co__title">Compréhension Orale TCF Canada</h2>
      <p class="co__lead">
        Cette épreuve évalue votre capacité à comprendre le français parlé dans des situations variées. Chaque document audio n'est diffusé qu'une seule fois  la concentration et la prise de notes sont essentielles.
      </p>
      <div class="co__overview">
        <div class="co__stat">
          <i class="pi pi-clock" />
          <div>
            <p class="co__stat-val">35 min</p>
            <p class="co__stat-lab">Durée</p>
          </div>
        </div>
        <div class="co__stat">
          <i class="pi pi-list" />
          <div>
            <p class="co__stat-val">39 questions</p>
            <p class="co__stat-lab">QCM</p>
          </div>
        </div>
        <div class="co__stat">
          <i class="pi pi-headphones" />
          <div>
            <p class="co__stat-val">1 écoute</p>
            <p class="co__stat-lab">Unique par audio</p>
          </div>
        </div>
        <div class="co__stat">
          <i class="pi pi-check-circle" />
          <div>
            <p class="co__stat-val">0 pénalité</p>
            <p class="co__stat-lab">Mauvaise réponse</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Types de documents -->
    <div class="co__block">
      <h3 class="co__block-title"><i class="pi pi-folder-open" /> Types de documents audio</h3>
      <div class="co__types-grid">
        <div v-for="t in audioTypes" :key="t.level" class="co__type-card">
          <div class="co__type-level">{{ t.level }}</div>
          <p class="co__type-title">{{ t.title }}</p>
          <p class="co__type-desc">{{ t.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Avant l'écoute -->
    <div class="co__block">
      <h3 class="co__block-title"><i class="pi pi-eye" /> Avant l'écoute  Ce qu'il faut faire</h3>
      <div class="co__steps">
        <div v-for="step in beforeListening" :key="step.num" class="co__step">
          <div class="co__step-num">{{ step.num }}</div>
          <div>
            <p class="co__step-title">{{ step.title }}</p>
            <p class="co__step-desc">{{ step.desc }}</p>
            <div v-if="step.tip" class="co__step-tip">
              <i class="pi pi-lightbulb" />
              <p>{{ step.tip }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pendant l'écoute -->
    <div class="co__block">
      <h3 class="co__block-title"><i class="pi pi-headphones" /> Pendant l'écoute</h3>
      <div class="co__steps">
        <div v-for="step in duringListening" :key="step.num" class="co__step">
          <div class="co__step-num">{{ step.num }}</div>
          <div>
            <p class="co__step-title">{{ step.title }}</p>
            <p class="co__step-desc">{{ step.desc }}</p>
            <div v-if="step.tip" class="co__step-tip">
              <i class="pi pi-lightbulb" />
              <p>{{ step.tip }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ce qu'il faut noter -->
    <div class="co__block">
      <h3 class="co__block-title"><i class="pi pi-pencil" /> Éléments clés à noter pendant l'écoute</h3>
      <div class="co__notes-grid">
        <div v-for="note in keyNotes" :key="note.title" class="co__note">
          <i :class="note.icon" class="co__note-icon" />
          <div>
            <p class="co__note-title">{{ note.title }}</p>
            <p class="co__note-desc">{{ note.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Accents -->
    <div class="co__block">
      <h3 class="co__block-title"><i class="pi pi-globe" /> Accents rencontrés au TCF Canada</h3>
      <div class="co__accents">
        <div v-for="accent in accents" :key="accent.name" class="co__accent">
          <div class="co__accent-flag">{{ accent.flag }}</div>
          <div>
            <p class="co__accent-name">{{ accent.name }}</p>
            <p class="co__accent-desc">{{ accent.desc }}</p>
          </div>
        </div>
      </div>
      <div class="co__tip-box">
        <i class="pi pi-info-circle" />
        <p>Le TCF Canada inclut souvent l'accent <strong>québécois</strong>. Habituez-vous à l'écouter en regardant des émissions québécoises comme <em>Tout le monde en parle</em> ou des balados canadiens-français.</p>
      </div>
    </div>

    <!-- Entraînement -->
    <div class="co__block">
      <h3 class="co__block-title"><i class="pi pi-bolt" /> Exercices d'entraînement recommandés</h3>
      <div class="co__training">
        <div v-for="ex in training" :key="ex.title" class="co__train">
          <i class="pi pi-check-circle co__train-icon" />
          <div>
            <p class="co__train-title">{{ ex.title }}</p>
            <p class="co__train-desc">{{ ex.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Règle d'or -->
    <div class="co__gold-rule">
      <i class="pi pi-sparkles" />
      <p><strong>Règle d'or :</strong> chaque audio n'est diffusé qu'une seule fois. Restez concentré du début à la fin une seconde de distraction peut vous faire manquer l'information clé.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
const audioTypes = [
  { level: 'A1 – A2', title: 'Dialogues et messages courts', desc: 'Conversations simples du quotidien, annonces courtes, messages laissés sur répondeur.' },
  { level: 'B1 – B2', title: 'Interviews et émissions', desc: 'Émissions radio ou TV, interviews sur des sujets concrets, débats simples.' },
  { level: 'C1 – C2', title: 'Exposés et discours complexes', desc: 'Conférences, discours académiques, débats sur des sujets abstraits ou spécialisés.' },
]

const beforeListening = [
  {
    num: 1, title: 'Lisez la question AVANT l\'écoute',
    desc: 'Vous avez quelques secondes avant chaque audio. Utilisez-les pour lire la question et anticiper le type d\'information attendu.',
    tip: 'Identifiez si la question porte sur le thème général, un détail précis, l\'intention du locuteur ou une information chiffrée.',
  },
  {
    num: 2, title: 'Anticipez le contexte',
    desc: 'La question vous donne déjà des indications sur le contexte. Qui parle ? Dans quelle situation ? Pour quel objectif ?',
    tip: null,
  },
  {
    num: 3, title: 'Préparez votre crayon',
    desc: 'Soyez prêt à noter les mots-clés dès que l\'audio commence. Ne prenez pas de notes complètes  seulement des repères.',
    tip: null,
  },
]

const duringListening = [
  {
    num: 1, title: 'Captez l\'idée générale en premier',
    desc: 'Les premières secondes d\'un audio donnent toujours le contexte : qui parle, où, et pourquoi. Ne les manquez pas.',
    tip: null,
  },
  {
    num: 2, title: 'Notez les mots-clés',
    desc: 'Chiffres, noms propres, lieux, dates, verbes d\'action  notez uniquement l\'essentiel. Pas de phrases complètes.',
    tip: 'Créez vos propres abréviations : pb = problème, imp = important, qst = question.',
  },
  {
    num: 3, title: 'Ne bloquez pas sur un mot inconnu',
    desc: 'Si vous n\'avez pas compris un mot, continuez d\'écouter. Le sens global reste souvent compréhensible grâce au contexte.',
    tip: null,
  },
  {
    num: 4, title: 'Identifiez le ton et l\'intention',
    desc: 'Le locuteur exprime-t-il une opinion positive ou négative ? Une certitude ou un doute ? L\'intonation donne des indices précieux.',
    tip: null,
  },
]

const keyNotes = [
  { icon: 'pi pi-hashtag',  title: 'Chiffres et dates',    desc: 'Prix, heures, numéros, années, âges.' },
  { icon: 'pi pi-map-marker', title: 'Lieux',              desc: 'Villes, adresses, pays, bâtiments.' },
  { icon: 'pi pi-user',     title: 'Noms propres',          desc: 'Personnes mentionnées dans le document.' },
  { icon: 'pi pi-arrows-h', title: 'Relations entre idées', desc: 'Cause, conséquence, opposition, accord.' },
  { icon: 'pi pi-flag',     title: 'Intention du locuteur', desc: 'Informer, convaincre, se plaindre, proposer.' },
  { icon: 'pi pi-exclamation-circle', title: 'Mots de restriction', desc: '"Mais", "cependant", "sauf", "pourtant"  souvent clés pour la bonne réponse.' },
]

const accents = [
  { flag: '🇫🇷', name: 'Français standard', desc: 'L\'accent neutre de référence, utilisé dans la plupart des documents.' },
  { flag: '🇨🇦', name: 'Accent québécois',   desc: 'Fréquent dans les documents du TCF Canada. Certains sons et expressions diffèrent.' },
  { flag: '🌍',   name: 'Accents francophones', desc: 'Accents africains, belges ou suisses peuvent apparaître dans certains documents.' },
]

const training = [
  { title: 'Écoutez des radios françaises',          desc: 'RFI, France Inter, Radio Canada variez les sujets : infos, reportages, émissions.' },
  { title: 'Regardez des films sans sous-titres',    desc: 'Commencez avec des sous-titres français, puis entraînez-vous sans.' },
  { title: 'Pratiquez l\'écoute unique',             desc: 'Écoutez un document audio une seule fois, puis répondez à des questions sans réécouter.' },
  { title: 'Imaginez des questions sur un audio',    desc: 'Après l\'écoute, créez vous-même des questions QCM  excellent entraînement cognitif.' },
  { title: 'Pensez directement en français',         desc: 'Ne traduisez plus mentalement. Formulez vos pensées en français au quotidien.' },
  { title: 'Écoutez des podcasts québécois',         desc: 'Pour vous habituer à l\'accent canadien avant l\'examen.' },
]
</script>

<style scoped>
.co { display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem 0; }

.co__title { font-size: 1.375rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.75rem; }
.co__lead  { font-size: 0.9375rem; color: var(--text-secondary); line-height: 1.75; margin: 0 0 1.5rem; }

.co__overview { display: flex; gap: 1rem; flex-wrap: wrap; }
.co__stat {
  display: flex; align-items: center; gap: 0.75rem;
  background: var(--bg-ground); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 0.875rem 1.25rem; flex: 1; min-width: 130px;
}
.co__stat i { font-size: 1.25rem; color: var(--color-primary-500); flex-shrink: 0; }
.co__stat-val { font-size: 1.125rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.co__stat-lab { font-size: 0.75rem; color: var(--text-tertiary); margin: 0; }

.co__block-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 1rem;
}
.co__block-title i { color: var(--color-primary-500); }

.co__types-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
.co__type-card {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 1.25rem;
}
.co__type-level {
  display: inline-block; background: var(--gradient-primary); color: #fff;
  border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.75rem;
  font-weight: 700; margin-bottom: 0.625rem;
}
.co__type-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.375rem; }
.co__type-desc  { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

.co__steps { display: flex; flex-direction: column; gap: 1.25rem; }
.co__step  { display: flex; gap: 1rem; align-items: flex-start; }
.co__step-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--gradient-primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem; font-weight: 800; flex-shrink: 0;
}
.co__step-title { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.co__step-desc  { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; margin: 0; }
.co__step-tip {
  display: flex; align-items: flex-start; gap: 0.5rem; margin-top: 0.5rem;
  background: #fefce8; border: 1px solid #fde68a; border-radius: 0.5rem; padding: 0.5rem 0.75rem;
}
.co__step-tip i { color: #d97706; font-size: 0.875rem; flex-shrink: 0; margin-top: 0.1rem; }
.co__step-tip p { font-size: 0.8125rem; color: #92400e; margin: 0; line-height: 1.5; }

.co__notes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.co__note {
  display: flex; gap: 0.875rem; align-items: flex-start;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.875rem; padding: 1rem;
}
.co__note-icon  { color: var(--color-primary-500); font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.co__note-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.25rem; }
.co__note-desc  { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

.co__accents { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.co__accent {
  display: flex; gap: 1rem; align-items: center;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.75rem; padding: 0.875rem 1rem;
}
.co__accent-flag { font-size: 1.5rem; flex-shrink: 0; }
.co__accent-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.125rem; }
.co__accent-desc { font-size: 0.8125rem; color: var(--text-secondary); margin: 0; }

.co__tip-box {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 0.75rem; padding: 1rem;
}
.co__tip-box i { color: #3b82f6; flex-shrink: 0; margin-top: 0.1rem; }
.co__tip-box p { font-size: 0.9rem; color: #1e40af; line-height: 1.6; margin: 0; }

.co__training { display: flex; flex-direction: column; gap: 0.75rem; }
.co__train {
  display: flex; gap: 0.875rem; align-items: flex-start;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: 0.75rem; padding: 0.875rem 1rem;
}
.co__train-icon { color: #16a34a; font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.co__train-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.125rem; }
.co__train-desc  { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

.co__gold-rule {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: var(--color-primary-50); border: 1px solid var(--color-primary-100);
  border-radius: 0.875rem; padding: 1rem;
}
.co__gold-rule i { color: var(--color-primary-500); font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.co__gold-rule p { font-size: 0.9rem; font-style: italic; color: var(--color-primary-700); margin: 0; line-height: 1.6; }

@media (max-width: 640px) {
  .co__overview   { flex-direction: column; }
  .co__types-grid { grid-template-columns: 1fr; }
  .co__notes-grid { grid-template-columns: 1fr; }
}
</style>