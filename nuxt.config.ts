// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  modules: ["@vite-pwa/nuxt", "@pinia/nuxt", "@nuxt/content"],

  plugins: [
    "~/plugins/global-components.js",
    // "~/plugins/vue-gtm.client.js" // Uncomment to enable Google Tag Manager
  ],

  css: ["~/assets/css/main.scss"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL,
      apiUrl: process.env.API_URL,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
      gtm: {
        id: process.env.GTAG_ID,
        enabled: false,
        debug: process.env.ENVIRONMENT === "development" ? true : false,
      },
    },
  },

  app: {
    baseURL: "/",
    head: {
      title: "Nuxt Boilerplate",
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, user-scalable=yes, viewport-fit=cover",
        },
        { charset: "utf-8" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        {
          name: "msapplication-TileColor",
          content: "#2d89ef",
        },
        {
          name: "theme-color",
          content: "#111b30",
        },
        {
          name: "description",
          content: "Nuxt Boilerplate",
        },
        {
          name: "og:image",
          content: process.env.SITE_URL + "/img/og-image.png",
        },
      ],
      link: [],
    },
  },
});
