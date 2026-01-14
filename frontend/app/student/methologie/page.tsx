"use client";

import { useState } from "react";
import { BookOpen, Volume2, Pencil, Mic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";

const METHODOLOGIES = [
  {
    value: "compréhension-écrite",
    label: "Compréhension Écrite",
    icon: BookOpen,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-white",
    content: (
      <>
        <h3 className="text-xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
          Compréhension écrite – TCF Canada
        </h3>

        <p className="text-muted-foreground mb-6">
          Cette épreuve évalue votre capacité à comprendre des textes écrits de
          difficulté progressive, issus de situations de la vie quotidienne,
          professionnelle et académique.
        </p>

        <div className="space-y-6">
          {/* Format */}
          <div>
            <h4 className="font-medium mb-2">Format de l’épreuve</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>39 questions à choix multiples (QCM)</li>
              <li>4 propositions (A, B, C, D) – une seule réponse correcte</li>
              <li>Difficulté progressive</li>
              <li>Durée : 60 minutes</li>
              <li>Aucune pénalité en cas de mauvaise réponse</li>
            </ul>
          </div>

          {/* Types de textes */}
          <div>
            <h4 className="font-medium mb-2">Types de textes rencontrés</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Annonces, messages, courriels et documents administratifs</li>
              <li>Articles de presse et textes de la vie professionnelle</li>
              <li>Textes argumentatifs et opinions d’auteurs</li>
              <li>Textes longs, spécialisés ou littéraires</li>
            </ul>
          </div>

          {/* Stratégies */}
          <div>
            <h4 className="font-medium mb-3">
              Stratégies essentielles pour réussir
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    1. Lire la question en premier
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Identifiez immédiatement l’information recherchée avant de
                    lire le texte.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    2. Analyser chaque choix de réponse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Attention aux pièges : pronoms, temps verbaux, détails
                    inexacts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    3. Repérer la logique du texte
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Utilisez les connecteurs logiques pour comprendre
                    l’intention de l’auteur.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    4. S’appuyer sur le contexte
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Même avec des mots inconnus, déduisez le sens général du
                    texte.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Règle d’or */}
          <p className="text-sm italic text-muted-foreground">
            💡 Règle d’or : répondez à toutes les questions. Une réponse
            incorrecte ne fait pas perdre de points.
          </p>
        </div>
      </>
    ),
  },

  {
    value: "compréhension-orale",
    label: "Compréhension Orale",
    icon: Volume2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-white",
    content: (
      <>
        <h3 className="text-xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
          Compréhension orale – TCF Canada
        </h3>

        <p className="text-muted-foreground mb-6">
          Cette épreuve évalue votre capacité à comprendre le français parlé
          dans des situations variées : dialogues, annonces, interviews, exposés
          et discours authentiques.
        </p>

        <div className="space-y-6">
          {/* Format */}
          <div>
            <h4 className="font-medium mb-2">Format de l’épreuve</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>39 questions à choix multiples (QCM)</li>
              <li>4 propositions (A, B, C, D) – une seule réponse correcte</li>
              <li>Écoute unique pour chaque audio</li>
              <li>Difficulté progressive</li>
              <li>Durée : environ 35 à 40 minutes</li>
            </ul>
          </div>

          {/* Types d’écoutes */}
          <div>
            <h4 className="font-medium mb-2">Types de documents audio</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Dialogues et conversations du quotidien</li>
              <li>Annonces et messages courts</li>
              <li>Interviews et émissions radio ou TV</li>
              <li>Exposés et discours sur des sujets concrets ou abstraits</li>
              <li>Français parlé à un débit naturel</li>
            </ul>
          </div>

          {/* Stratégies */}
          <div>
            <h4 className="font-medium mb-3">Stratégies clés pour réussir</h4>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    1. Anticipez le type d’information
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Identifiez l’idée générale, les détails ou l’intention du
                    locuteur.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    2. Prenez des notes efficaces
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Notez mots-clés, chiffres, lieux, noms propres.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    3. Habituez-vous aux accents
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Français standard et accent canadien / québécois.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    4. Ne bloquez pas sur un mot inconnu
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Concentrez-vous sur le sens global du message.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Conseils finaux */}
          <p className="text-sm italic text-muted-foreground">
            🎧 Conseil clé : chaque audio est diffusé une seule fois. Restez
            concentré du début à la fin.
          </p>
        </div>
      </>
    ),
  },

  {
    value: "expression-écrite",
    label: "Expression Écrite",
    icon: Pencil,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-white",
    content: (
      <>
        <h3 className="text-xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
          Expression écrite – TCF Canada
        </h3>

        <p className="text-muted-foreground mb-6">
          Cette épreuve évalue votre capacité à communiquer efficacement à
          l’écrit, à structurer vos idées et à défendre un point de vue de
          manière claire et argumentée.
        </p>

        <div className="space-y-6">
          {/* Format */}
          <div>
            <h4 className="font-medium mb-2">Format de l’épreuve</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Durée totale : 60 minutes</li>
              <li>3 tâches obligatoires</li>
              <li>Tâche 1 : 60 à 120 mots</li>
              <li>Tâche 2 : 120 à 150 mots</li>
              <li>Tâche 3 : 120 à 180 mots</li>
            </ul>
          </div>

          {/* Compétences évaluées */}
          <div>
            <h4 className="font-medium mb-2">Compétences évaluées</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Fournir les informations demandées</li>
              <li>Exprimer et justifier une opinion</li>
              <li>Structurer un texte de manière cohérente</li>
              <li>Comparer deux points de vue</li>
              <li>Utiliser un vocabulaire et des structures adaptées</li>
              <li>Reformuler et synthétiser des informations</li>
            </ul>
          </div>

          {/* Détail des tâches */}
          <div>
            <h4 className="font-medium mb-3">Les 3 tâches expliquées</h4>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Tâche 1 – Message
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Décrire, raconter ou expliquer une situation à un
                    destinataire précis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Tâche 2 – Article / récit
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Raconter une expérience personnelle ou un événement de façon
                    structurée.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Tâche 3 – Comparaison & opinion
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Résumer deux opinions, prendre position et argumenter.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Méthodologie clé */}
          <div>
            <h4 className="font-medium mb-3">Méthodologie pour réussir</h4>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Structurez toujours votre texte
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Introduction, développement en paragraphes, conclusion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Utilisez les connecteurs logiques
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tout d’abord, ensuite, cependant, en effet, enfin…
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Montrez votre niveau de langue
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Conditionnel, subjonctif, phrases complexes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Respectez le nombre de mots
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trop court ou trop long = pénalité automatique.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Règle d’or */}
          <p className="text-sm italic text-muted-foreground">
            ✍️ Règle d’or : qualité du français + clarté des idées = score
            élevé.
          </p>
        </div>
      </>
    ),
  },

  {
    value: "expression-orale",
    label: "Expression Orale",
    icon: Mic,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-white",
    content: (
      <>
        <h3 className="text-xl font-semibold mb-4 text-emerald-700 dark:text-emerald-300">
          Expression orale au TCF Canada
        </h3>
        <p className="text-muted-foreground mb-6">
          Cette épreuve évalue votre capacité à communiquer spontanément,
          clairement et de manière structurée en français dans des situations de
          la vie courante et académique.
          <br />
          <span className="font-medium">
            Durée totale : 12 minutes – 3 tâches
          </span>
        </p>

        <div className="space-y-6">
          {/* Format */}
          <div>
            <h4 className="font-medium mb-2">Format de l’épreuve</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Entretien individuel face-à-face (enregistré)</li>
              <li>Durée totale : 12 minutes</li>
              <li>Tâche 1 : Entretien dirigé – 2 minutes (sans préparation)</li>
              <li>
                Tâche 2 : Interaction avec préparation – 5 min 30 (dont 2 min de
                préparation)
              </li>
              <li>
                Tâche 3 : Donner son point de vue – 4 min 30 (sans préparation)
              </li>
            </ul>
          </div>

          {/* Détail des 3 tâches */}
          <div>
            <h4 className="font-medium mb-3">Les 3 tâches expliquées</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Tâche 1 – Entretien dirigé (2 min)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Parler de vous naturellement : identité, formation,
                    profession, loisirs, projets.
                  </p>
                  <p className="text-xs italic mt-2 text-emerald-600/80">
                    Astuce : ne récitez pas, soyez naturel comme dans une vraie
                    conversation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Tâche 2 – Interaction (5 min 30)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Obtenir des informations dans un contexte concret (logement,
                    emploi, voyage…).
                  </p>
                  <p className="text-xs italic mt-2 text-emerald-600/80">
                    Astuce : préparez 8–10 questions ouvertes + salutations et
                    relances polies.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Tâche 3 – Point de vue (4 min 30)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Exprimer et argumenter une opinion sur un sujet de société.
                  </p>
                  <p className="text-xs italic mt-2 text-emerald-600/80">
                    Astuce : minimum 3 arguments + exemples personnels pour
                    maximiser le score.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Méthodologie clé */}
          <div>
            <h4 className="font-medium mb-3">Méthodologie pour réussir</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Structurez vos réponses
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Introduction claire → développement avec arguments →
                    conclusion nette.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Utilisez des connecteurs logiques
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tout d’abord, ensuite, par ailleurs, en revanche, à mon
                    avis, donc…
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Parlez avec aisance et confiance
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Légèrement plus lentement, voix claire, sourire, regard
                    direct.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    Entraînez-vous régulièrement
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enregistrez-vous, réécoutez, corrigez prononciation et
                    fluidité.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Règle d’or */}
          <p className="text-sm italic text-muted-foreground mt-4">
            🗣️ Règle d’or : la fluidité + la structure + des exemples personnels
            = excellent score.
          </p>
        </div>
      </>
    ),
  },
];

export default function MethodologiePage() {
  const [activeTab, setActiveTab] = useState("compréhension-écrite");

  const activeMethod = METHODOLOGIES.find((m) => m.value === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Méthodologie TCF Canada"
        description="Stratégies et astuces pour réussir chaque épreuve du TCF Canada"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2  dark:bg-emerald-950/30 p-1 rounded-lg">
          {METHODOLOGIES.map((method) => (
            <TabsTrigger
              key={method.value}
              value={method.value}
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <method.icon className="mr-2 h-4 w-4" />
              {method.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {METHODOLOGIES.map((method) => (
          <TabsContent key={method.value} value={method.value}>
            <Card
              className={`border-emerald-200 dark:border-emerald-800 mt-4 ${method.bgColor}`}
            >
              <CardContent className="pt-6">
                <div className="prose prose-emerald dark:prose-invert max-w-none">
                  {method.content}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Bouton ou call-to-action final */}
      <div className="text-center pt-4">
        <p className="text-muted-foreground">
          Prêt à vous entraîner ? Découvrez nos{" "}
          <span className="text-emerald-600 font-medium">examens blancs</span>{" "}
          et{" "}
          <span className="text-emerald-600 font-medium">
            corrections détaillées
          </span>{" "}
          !
        </p>
      </div>
    </div>
  );
}
