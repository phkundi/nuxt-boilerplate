/*
    Initialize firebase for cloud messaging service (push notifications)

    If you want to use firebase for push notifications, uncomment the code below.
    You will need to add your firebase config to the constants/firebase.ts file.

    Push notifications need to be sent from the server side.
    You can find more information here: https://firebase.google.com/docs/cloud-messaging/js/client
*/

// import { initializeApp, getApps } from "firebase/app";
// import firebaseConfig from "~/constants/firebase";
// import { getMessaging, onMessage } from "firebase/messaging";
import type { Plugin } from "nuxt/app";

export default defineNuxtPlugin(() => {
  //   const app =
  //     getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  //   const messaging = getMessaging(app);

  //   console.log("Initialized firebase");

  //   // Runs whenever a message is received while the app is open (foreground)
  //   onMessage(messaging, (payload) => {
  //     alert(JSON.stringify(payload), null, 2);
  //     console.log("Message received. ", payload);
  //   });

  return {
    provide: {
      //       messaging,
    },
  };
}) satisfies Plugin;
