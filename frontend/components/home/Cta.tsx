// components/Cta.tsx
import React from "react";

const Cta = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Fond grille subtile (comme dans le Hero) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Blobs décoratifs identiques au Hero */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-200 h-150 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-175 h-125 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[110px] -z-10 opacity-40"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium mb-8">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Plus de 5 000 candidats nous font déjà confiance
        </div>

        {/* Titre principal */}
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
          Prêt à décrocher votre <br className="hidden sm:block" />
          <span className="relative inline-block px-4 py-1 ml-1">
            <span className="absolute inset-0 bg-emerald-600 -rotate-2 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/20"></span>
            <span className="relative text-white whitespace-nowrap">
              score idéal au TCF Canada ?
            </span>
          </span>
        </h2>

        {/* Sous-titre */}
        <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
          Rejoignez dès aujourd'hui des milliers de candidats motivés et
          bénéficiez d’une préparation complète, structurée et adaptée à vos
          objectifs d’immigration au Canada.
        </p>

        {/* Boutons CTA principaux */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="group w-full sm:w-auto px-9 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl">
            Commencer ma préparation gratuitement
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-right group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>

          <a
            href="/tarifs"
            className="w-full sm:w-auto px-9 py-5 bg-white dark:bg-slate-900 text-slate-700 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            Voir les formules premium
          </a>
        </div>

        {/* Note de confiance */}
        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
          Aucun engagement • Accès immédiat • Annulation possible à tout moment
        </p>
      </div>
    </section>
  );
};

export default Cta;
