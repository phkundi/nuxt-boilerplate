import { useRuntimeConfig } from "#app";
import { getToken } from "firebase/messaging";

export const initializeNotifications = async () => {
  if (!import.meta.client) return; // Skip on server-side

  try {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.ready; // Wait for SW to be ready
      await requestNotificationPermission();
    }
  } catch (error) {
    // Handle errors or user denial
    console.error("Push notification error:", error);
  }
};

// /**
//  * Request permission for notifications and get FCM token
//  */
export const requestNotificationPermission = async () => {
  try {
    const vapidKey = useRuntimeConfig().public.validKey;
    const { $messaging } = useNuxtApp();
    const messaging = $messaging();

    if (!messaging) {
      console.warn("Messaging service not yet initialized");
      return null;
    }
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });

      await savePushSubscription(token);

      return token;
    } else {
      throw new Error("Unable to get permission to notify.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token.", error);
    throw error;
  }
};

// /*
//  * Save push subscription to backend
//  */
export const savePushSubscription = async (token) => {
  const apiBase = useRuntimeConfig().public.apiUrl;
  const authStore = useAuthStore();
  const { authedPost } = authStore;

  try {
    await authedPost(
      `${apiBase}users/push-subscriptions/`,
      {
        fcm_token: token,
      },
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("An error occurred while saving push subscription.", error);
    throw error;
  }
};
