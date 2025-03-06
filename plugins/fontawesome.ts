/*
    Fontawesome plugin, enables using fontawesome icons.

    How to use:
    <font-awesome-icon :icon="['fas', 'user']" />

    You can also import the icons directly in your components.
    import { faUser } from "@fortawesome/free-solid-svg-icons";
    <font-awesome-icon :icon="faUser" />

    Add styling via tailwind classes:
    <font-awesome-icon :icon="faUser" class="text-red-500 text-2xl" />
*/

import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import type { Plugin } from "nuxt/app";

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false;
library.add(fas);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("font-awesome-icon", FontAwesomeIcon);
}) satisfies Plugin;
