import { firebaseConfig } from "~/constants/firebase";

export default function getFirebaseConfig() {
  const config = useRuntimeConfig();
  const env =
    config?.public?.firebaseEnv || process.env.NODE_ENV || "development";
  return firebaseConfig[env];
}
