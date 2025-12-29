<template>
  <NuxtLayout>
    <h1 class="text-muted my-2 text-center text-lg font-medium">
      Access your account
    </h1>
    <div class="mt-4 w-full px-4 sm:mx-auto sm:w-full sm:max-w-[480px] lg:px-0">
      <div class="px-6 py-10 sm:rounded-lg sm:px-12 lg:bg-white lg:shadow">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <UtilityFormInput
            id="email"
            label="Email address"
            type="email"
            placeholder="office@example.com"
            v-model="credentials.email"
            :validationState="validationState.email"
          />

          <div>
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="text-primary-text block text-sm/6 font-medium"
                >Password</label
              >
              <div class="text-sm/6">
                <NuxtLink
                  to="/forgot-password"
                  class="text-muted hover:text-muted-hover font-medium"
                  >Forgot password?</NuxtLink
                >
              </div>
            </div>
            <div class="mt-2">
              <UtilityFormInput
                id="password"
                label="Password"
                type="password"
                hideLabel
                placeholder="********"
                v-model="credentials.password"
                :validationState="validationState.password"
              />
            </div>
          </div>

          <div>
            <button type="submit" class="btn btn-primary w-full">
              Sign in
            </button>
          </div>
        </form>
      </div>

      <p class="text-muted mt-10 text-center text-sm/6">
        Never used OC3D before?
        {{ " " }}
        <NuxtLink
          to="/register"
          class="text-primary hover:text-primary-hover font-semibold"
          >Create an account</NuxtLink
        >
      </p>
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
import type { LoginCredentials } from "~/types/auth";
import { loginFormValidation } from "~/validators/auth";
import { useToast } from "~/composables/useToast";
import { useFormValidation } from "~/composables/useFormValidation";

definePageMeta({
  layout: "auth",
  title: "Login",
});

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { login } = authStore;
const { error: toastError } = useToast();

const router = useRouter();

const credentials = reactive<LoginCredentials>({
  email: "",
  password: "",
});

const { validationState, validateForm } = useFormValidation(credentials);

const handleSubmit = async () => {
  if (!validateForm(loginFormValidation)) {
    return;
  }

  try {
    await login(credentials);
    router.push("/");
  } catch (err) {
    toastError("Invalid email or password", "Login failed");
  }
};

watch(
  isAuthenticated,
  (newValue) => {
    if (newValue) {
      router.push("/");
    }
  },
  { immediate: true },
);
</script>
