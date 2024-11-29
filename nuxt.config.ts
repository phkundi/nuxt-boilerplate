// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  modules: ["@vite-pwa/nuxt", "@pinia/nuxt", "@nuxt/content"],

  plugins: [
    "~/plugins/global-components.ts",
    "~/plugins/fontawesome.ts",
    // "~/plugins/firebase.client.ts",
    // "~/plugins/vue-gtm.client.ts" // Uncomment to enable Google Tag Manager
  ],

  css: [
    "~/assets/css/main.scss",
    "@fortawesome/fontawesome-svg-core/styles.css",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  imports: {
    dirs: ["store", "endpoints"], // Auto imports files from the specified directories
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL,
      apiUrl:
        process.env.NODE_ENV === "development"
          ? process.env.NUXT_DEV_HTTPS === "true"
            ? process.env.API_URL?.replace("http://", "https://")
            : process.env.API_URL
          : process.env.API_URL, // in production, your app should always be served via https
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
      firebaseEnv: process.env.FIREBASE_ENV,
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
          content: "#fff",
        },
        {
          name: "theme-color",
          content: "#fff",
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
      link: [
        {
          rel: "manifest",
          href: "/site.webmanifest",
        },
      ],
    },
  },
  pwa: {
    devOptions: {
      enabled: process.env.NODE_ENV === "development",
      type: "module",
    },
    injectRegister: "auto",
    registerType: "autoUpdate",
    strategies: "injectManifest",
    srcDir: "pwa",
    filename: "sw.js",
    injectManifest: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,ico,png,svg}", "/offline"],
      navigateFallback: "/offline",
      runtimeCaching: [
        {
          urlPattern: ".*.(js|css|png|jpg|jpeg|svg|woff|woff2|eot|ttf|otf)$",
          handler: "CacheFirst",
          options: {
            cacheName: "asset-cache",
            expiration: {
              maxEntries: 1000,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            },
          },
        },
      ],
    },
    includeAssets: [
      "favicon.ico",
      "apple-touch-icon.png",
      "mask-icon.svg",
      "fonts/*.woff",
      "fonts/*.woff2",
      "img/*.png",
    ],
    manifest: false,
  },
});
