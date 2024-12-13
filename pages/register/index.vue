<template>
  <NuxtLayout>
    <h1 class="text-lg font-medium text-center my-2 text-muted">
      Access your account
    </h1>
    <div class="w-full px-4 lg:px-0 mt-4 sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div class="lg:bg-white px-6 py-10 lg:shadow sm:rounded-lg sm:px-12">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <UtilityFormInput
            id="first_name"
            label="First Name"
            type="text"
            placeholder="John"
            v-model="credentials.first_name"
            :validationState="validationState.first_name"
          />
          <UtilityFormInput
            id="email"
            label="Email address"
            type="email"
            placeholder="office@example.com"
            v-model="credentials.email"
            :validationState="validationState.email"
          />
          <UtilityFormInput
            id="password"
            label="Password"
            type="password"
            placeholder="********"
            v-model="credentials.password"
            :validationState="validationState.password"
          />
          <UtilityFormInput
            id="password2"
            label="Repeat Password"
            type="password"
            placeholder="********"
            v-model="credentials.password2"
            :validationState="validationState.password2"
          />

          <div class="relative flex items-start">
            <div class="flex h-6 items-center">
              <input
                id="terms"
                aria-describedby="terms-description"
                name="terms"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                v-model="credentials.accept_terms"
              />
            </div>
            <div class="ml-3 text-sm/6">
              <label for="terms" class="font-medium text-primary"
                >Accept Terms & Conditions</label
              >
              <p id="comments-description" class="text-muted text-xs">
                Please read and accept our terms and conditions to continue.
              </p>
              <span
                class="text-xs text-error"
                v-if="!validationState.accept_terms.isValid"
                >{{ validationState.accept_terms.message }}</span
              >
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full">Register</button>
        </form>
      </div>

      <p class="mt-10 text-center text-sm/6 text-muted">
        Already have an account?
        {{ " " }}
        <NuxtLink
          to="/login"
          class="font-semibold text-primary hover:text-primary-hover"
          >Login</NuxtLink
        >
      </p>
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
import { type RegisterCredentials } from "~/types/auth";
import { registerFormValidation } from "~/validators/auth";
import { useToast } from "~/composables/useToast";
import { useFormValidation } from "~/composables/useFormValidation";

const { register } = useAuthStore();
const { success: successToast, error: errorToast } = useToast();

definePageMeta({
  layout: "auth",
});

const loading = ref(false);
const credentials = reactive<RegisterCredentials>({
  first_name: "",
  email: "",
  password: "",
  password2: "",
  accept_terms: false,
});

const { validationState, validateForm, handleApiErrors } =
  useFormValidation(credentials);

const handleSubmit = async (): Promise<void> => {
  loading.value = true;

  if (!validateForm(registerFormValidation)) {
    loading.value = false;
    return;
  }

  try {
    await register(credentials);
    await new Promise((resolve) => setTimeout(resolve, 200));
    successToast("Registration successful");
  } catch (err: any) {
    if (err.status === 400 && err.data) {
      handleApiErrors(err.data);
    } else {
      errorToast("An unknown error occurred", "Registration Failed");
    }
  } finally {
    loading.value = false;
  }
};
</script>
