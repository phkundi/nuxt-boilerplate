<template>
  <NuxtLayout>
    <h1 class="text-lg font-medium text-center my-2 text-muted">
      Access your account
    </h1>
    <div class="w-full px-4 lg:px-0 mt-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div class="lg:bg-white px-6 py-10 lg:shadow sm:rounded-lg sm:px-12">
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
                class="block text-sm/6 font-medium text-primary-text"
                >Password</label
              >
              <div class="text-sm/6">
                <NuxtLink
                  to="/forgot-password"
                  class="font-medium text-muted hover:text-muted-hover"
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

      <p class="mt-10 text-center text-sm/6 text-muted">
        Never used OC3D before?
        {{ " " }}
        <NuxtLink
          to="/register"
          class="font-semibold text-primary hover:text-primary-hover"
          >Create an account</NuxtLink
        >
      </p>
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
import type { LoginCredentials } from "~/app/types/auth";
import { loginFormValidation } from "~/validators/auth";
import { useToast } from "~/app/composables/useToast";
import { useFormValidation } from "~/app/composables/useFormValidation";

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
  { immediate: true }
);
</script>
