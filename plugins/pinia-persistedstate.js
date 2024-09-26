import { defineNuxtPlugin } from "#app";
import { createPersistedStatePlugin } from "pinia-plugin-persistedstate-2";

export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(
    createPersistedStatePlugin({
      storage: {
        // Ensure localStorage is accessed only on the client
        getItem: (key) =>
          typeof window !== "undefined" ? localStorage.getItem(key) : null,
        setItem: (key, value) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(key);
          }
        },
      },
      // Specify which stores to persist (optional)
      // e.g., to persist only the auth store:
      paths: ["auth.user", "auth.authTokens", "auth.isAuthenticated"],
    })
  );
});
