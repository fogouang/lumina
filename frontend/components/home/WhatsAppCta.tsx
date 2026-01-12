"use client";

import { useState, useEffect, useRef } from "react";

export default function WhatsAppCta() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating WhatsApp Button - Style cohérent avec le site TCF */}
      <div className="fixed bottom-20 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-110 transition-all duration-300 flex items-center justify-center animate-pulse border-4 border-white/30"
          aria-label="Contact WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7 drop-shadow-md"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94.966-.174 0-.347-.075-.521-.225-.297-.225-1.319-.487-2.512-1.556-.925-.833-1.55-1.862-1.733-2.16-.182-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.174-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
          </svg>
        </button>
      </div>

      {/* Dropdown Menu - Style glassmorphism + couleurs emerald/blue */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bottom-16 right-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden w-80 shadow-2xl border border-emerald-200/50 dark:border-emerald-800/50 z-50 transition-all duration-300"
        >
          {/* Header avec gradient emerald */}
          <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-5 text-white text-center">
            <h3 className="text-xl font-bold mb-1">Besoin d'aide pour le TCF Canada ?</h3>
            <p className="text-sm opacity-90">Notre équipe est là pour vous guider</p>
          </div>

          {/* Option WhatsApp Personnel */}
          <a
            href="https://wa.me/237694521346"
            className="flex items-center px-5 py-4 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 border-b border-gray-100 dark:border-slate-700 group"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
          >
            <div className="bg-linear-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94.966-.174 0-.347-.075-.521-.225-.297-.225-1.319-.487-2.512-1.556-.925-.833-1.55-1.862-1.733-2.16-.182-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.174-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                WhatsApp Personnel
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Réponse rapide garantie</p>
            </div>
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Option Groupe WhatsApp */}
          <a
            href="https://chat.whatsapp.com/HeF1aY2bECN5swIolVdXXH"
            className="flex items-center px-5 py-4 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 group"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
          >
            <div className="bg-linear-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Groupe WhatsApp Communauté
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rejoignez les candidats TCF Canada
              </p>
            </div>
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Footer avec badge en ligne */}
          <div className="bg-linear-to-r from-gray-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-900/20 px-5 py-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Support TCF en ligne
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Réponse sous 24h • Conseils personnalisés gratuits
            </p>
          </div>
        </div>
      )}
    </>
  );
}