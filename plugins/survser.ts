/*
    Survser plugin, enables to display Survser surveys in your app.

    You can find more information here: https://survser.com/ and here: https://docs.survser.com/
*/

import { defineNuxtPlugin } from "#app";
import _survser from "survser-js";
import { useAuthStore } from "@/store/auth";
import { watch } from "vue";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.client && process.env.NODE_ENV === "production") {
    const { user } = storeToRefs(useAuthStore());
    _survser("setAPIKey", process.env.SURVSER_API_KEY as string);

    watch(
      user,
      (newUser) => {
        if (newUser) {
          _survser("identifyUser", {
            id: newUser.id,
            email: newUser.email,
            name: newUser.first_name + " " + newUser.last_name,
            signupDate: newUser.created_at,
          });
        }
      },
      { immediate: true }
    );
  }
});
