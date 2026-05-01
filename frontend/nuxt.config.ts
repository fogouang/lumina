// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: ["@primevue/nuxt-module", "@pinia/nuxt"],
  css: ["~/assets/css/main.css", "primeicons/primeicons.css"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
    autoImport: true,
  },
  // nitro: {
  //   devProxy:
  //     process.env.NODE_ENV === "development"
  //       ? {
  //           "/api": {
  //             target: "https://lumina-tcf.online/api",
  //             changeOrigin: true,
  //           },
  //         }
  //       : {},
  // },
  // runtimeConfig: {
  //   public: {
  //     apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? "",
  //   },
  // },
  routeRules: {
    "/**": {
      headers: {
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
    },
    "/mon-compte/**": { ssr: false },
    "/admin/**": { ssr: false },
    "/epreuve/**": { ssr: false },
  },

  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:8002/api",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8002",
        changeOrigin: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: "",
    },
  },

  devtools: { enabled: true },
  vite: {
    optimizeDeps: {
      include: [
        "@primevue/forms/form",
        "zod",
        "@primevue/forms/resolvers/zod",
        "chart.js",
      ],
    },
    plugins: [tailwindcss() as any],
  },
});
