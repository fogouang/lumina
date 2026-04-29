// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from "@primeuix/themes/aura";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  modules: ["@primevue/nuxt-module", "@pinia/nuxt"],
  css: ["~/assets/css/main.css","primeicons/primeicons.css"],
  primevue: {
    options: {
      theme: {
        preset: Aura,
      },
    },
     autoImport: true,
  },
    nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:8002/api",
        changeOrigin: true,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl:
        process.env.NODE_ENV === "production" ? "http://localhost:8002" : "", 
    },
  },
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss() as any],
  },
});
