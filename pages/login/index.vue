<template>
  <NuxtLayout>
    <div
      class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
    >
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <img
            class="h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
            alt="Your Company"
          />
          <h2
            class="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900"
          >
            Sign in to your account
          </h2>
          <p class="mt-2 text-sm leading-6 text-gray-500">
            Not a member?
            {{ " " }}
            <a href="#" class="font-semibold text-blue-600 hover:text-blue-500"
              >Start a 14 day free trial</a
            >
          </p>
        </div>

        <div class="mt-10">
          <div>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Email address</label
                >
                <div class="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required="true"
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="johndoe@example.com"
                    v-model="credentials.email"
                  />
                </div>
              </div>

              <div>
                <label
                  for="password"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Password</label
                >
                <div class="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required="true"
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="********"
                    v-model="credentials.password"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <label
                    for="remember-me"
                    class="ml-3 block text-sm leading-6 text-gray-700"
                    >Remember me</label
                  >
                </div>

                <div class="text-sm leading-6">
                  <a
                    href="#"
                    class="font-semibold text-blue-600 hover:text-blue-500"
                    >Forgot password?</a
                  >
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { type LoginCredentials } from "~/types/auth";

definePageMeta({
  layout: "auth",
  title: "Login",
});

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { login } = authStore;

const error = ref<string | null>(null);
const router = useRouter();

const credentials = reactive<LoginCredentials>({
  email: "",
  password: "",
});

const handleSubmit = async (): Promise<void> => {
  try {
    await login(credentials);

    router.push("/");
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "An unknown error occurred";
    }
  }
};

watch(
  isAuthenticated,
  (newValue: boolean) => {
    if (newValue) {
      router.push("/");
    }
  },
  { immediate: true }
);
</script>
