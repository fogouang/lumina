"use client";
import { useState } from "react";
import {
  X,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const TUTORIAL_STEPS = [
  {
    title: "Bienvenue sur Lumina 🎉",
    description:
      "Lumina est votre espace personnel de préparation au TCF Canada. Tout votre parcours se gère depuis ce tableau de bord.",
    icon: BookOpen,
  },
  {
    title: "Créez votre compte gratuitement",
    description:
      "Inscrivez-vous en quelques secondes via la barre de navigation ou démarrez directement avec le test diagnostique gratuit depuis la page d’accueil.",
    icon: BookOpen,
  },
  {
    title: "Accédez à votre tableau de bord",
    description:
      "Après connexion, vous arrivez sur le Tableau de bord. Il vous donne une vue d’ensemble de votre progression et de vos activités.",
    icon: BookOpen,
  },
  {
    title: "Lancez vos entraînements",
    description:
      "Cliquez sur « Séries d'examens » pour accéder aux exercices et examens blancs en compréhension et expression (orale et écrite).",
    icon: Target,
  },
  {
    title: "Consultez vos corrections",
    description:
      "Après chaque série, retrouvez vos copies corrigées dans « Mes corrections », avec des retours détaillés et des conseils personnalisés.",
    icon: Zap,
  },
  {
    title: "Analysez vos résultats",
    description:
      "Rendez-vous dans « Mes résultats » pour suivre vos scores, mesurer vos progrès et identifier vos points à améliorer.",
    icon: Trophy,
  },
  {
    title: "Gérez votre compte",
    description:
      "Depuis « Abonnement », « Mes factures » et « Paramètres », gérez votre formule, vos paiements et vos informations personnelles.",
    icon: Trophy,
  },
];

export default function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;
  const CurrentIcon = TUTORIAL_STEPS[currentStep].icon;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl transform transition-all">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Progress Bar */}
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-3">
              <CurrentIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {TUTORIAL_STEPS[currentStep].title}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {TUTORIAL_STEPS[currentStep].description}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 text-center text-sm text-gray-500">
          Étape {currentStep + 1} sur {TUTORIAL_STEPS.length}
        </div>

        {/* Step Dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-emerald-600"
                  : index < currentStep
                  ? "w-2 bg-emerald-400"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-md bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-2 text-sm font-medium text-white transition-all hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
          >
            {currentStep === TUTORIAL_STEPS.length - 1
              ? "Commencer"
              : "Suivant"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          Passer le tutoriel
        </button>
      </div>
    </div>
  );
}
