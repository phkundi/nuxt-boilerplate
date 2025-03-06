import { firebaseConfig, type FirebaseConfig } from "~/constants/firebase";

export default function getFirebaseConfig(): FirebaseConfig {
  const config = useRuntimeConfig();
  const env = (config.public?.firebaseEnv ||
    process.env.NODE_ENV ||
    "development") as keyof typeof firebaseConfig;
  return firebaseConfig[env];
}
