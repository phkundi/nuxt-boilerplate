import tailwindcss from "@tailwindcss/vite";

const backendUrl =
  process.env.NUXT_DEV_HTTPS === "development"
    ? process.env.BACKEND_URL?.replace("http://", "https://") ||
      "https://127.0.0.1:8000"
    : process.env.BACKEND_URL;

const apiUrl = backendUrl + "/api/";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-08-27",
  devtools: { enabled: false },

  modules: ["@vite-pwa/nuxt", "@pinia/nuxt"],

  plugins: [
    // Fontawesome plugin, enables fontawesome icons
    "~/plugins/fontawesome.ts",

    // Touch gesture plugin, enables a vue directive for touch gestures (swipes)
    // "~/plugins/touch-gesture.ts",

    // Firebase plugin, enables firebase services for push notifications
    // "~/plugins/firebase.client.ts",

    // Google Tag Manager plugin, enables Google Tag Manager
    // "~/plugins/vue-gtm.client.ts"

    // iOS optimization plugin, enhances native feel on iOS devices
    // "~/plugins/ios-optimization.client.ts",
  ],

  css: [
    "~/assets/css/main.scss",
    "@fortawesome/fontawesome-svg-core/styles.css",
  ],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },

  vite: {
    server: {
      allowedHosts: [
        "localhost",
        "127.0.0.1",
      ],
    },
    plugins: [tailwindcss()],
  },

  imports: {
    dirs: ["store", "endpoints"], // Auto imports files from the specified directories
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.SITE_URL,
      apiUrl,
      backendUrl,
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
  sourcemap: {
    client: "hidden",
  },
});
