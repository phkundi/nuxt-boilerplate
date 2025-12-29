/*
    Set up Google Tag manager for analytics

    You can find more information here: https://www.pkundr.com/articles/nuxt-google-analytics
*/

import { createGtm } from "@gtm-support/vue-gtm";
import Cookies from "js-cookie";
import type { Plugin } from "nuxt/app";

interface GTMConfig {
  id: string;
  enabled: boolean;
  debug: boolean;
}

export default defineNuxtPlugin((nuxtApp) => {
  const gtmConfig = useRuntimeConfig().public.gtm as GTMConfig;
  const consentGiven = Cookies.get("userConsent") === "granted";
  const router = useRouter();

  nuxtApp.vueApp.use(
    createGtm({
      id: gtmConfig.id,
      defer: false,
      compatibility: false,
      enabled: gtmConfig.enabled && consentGiven,
      debug: gtmConfig.debug,
      loadScript: true,
      vueRouter: router,
      trackOnNextTick: false,
    })
  );
}) satisfies Plugin;
