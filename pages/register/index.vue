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
            Sign Up
          </h2>
          <p class="mt-2 text-sm leading-6 text-gray-500">
            Already have an account?
            {{ " " }}
            <a
              href="/login"
              class="font-semibold text-blue-600 hover:text-blue-500"
              >Login</a
            >
          </p>
        </div>

        <div class="mt-10">
          <div>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label
                  for="first_name"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >First Name</label
                >
                <div class="mt-2">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required=""
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    v-model="credentials.first_name"
                    placeholder="John"
                  />
                  <span
                    class="text-xs text-red-400"
                    v-if="!credentialValidations.first_name.isValid"
                    >{{ credentialValidations.first_name.message }}</span
                  >
                </div>
              </div>

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
                    required=""
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    v-model="credentials.email"
                    placeholder="john@doe.com"
                  />
                  <span
                    class="text-xs text-red-400"
                    v-if="!credentialValidations.email.isValid"
                    >{{ credentialValidations.email.message }}</span
                  >
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
                    required=""
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    v-model="credentials.password"
                    placeholder="********"
                  />
                  <span
                    class="text-xs text-red-400"
                    v-if="!credentialValidations.password.isValid"
                    >{{ credentialValidations.password.message }}</span
                  >
                </div>
              </div>
              <div>
                <label
                  for="password2"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Repeat Password</label
                >
                <div class="mt-2">
                  <input
                    id="password2"
                    name="password2"
                    type="password"
                    required=""
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    v-model="credentials.password2"
                    placeholder="********"
                  />
                  <span
                    class="text-xs text-red-400"
                    v-if="!credentialValidations.password2.isValid"
                    >{{ credentialValidations.password2.message }}</span
                  >
                </div>
              </div>
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium leading-6 text-gray-900"
                  >Birthday</label
                >
                <div class="mt-2">
                  <input
                    id="birthday"
                    name="birthday"
                    type="date"
                    required=""
                    class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    v-model="credentials.birthday"
                    placeholder="2000-01-01"
                  />
                  <span
                    class="text-xs text-red-400"
                    v-if="!credentialValidations.birthday.isValid"
                    >{{ credentialValidations.birthday.message }}</span
                  >
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  :disabled="loading || disableSubmit"
                  class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  :class="{ 'opacity-50': loading || disableSubmit }"
                >
                  {{ loading ? "Loading..." : "Sign Up" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup>
import { useAuthStore } from "@/store/auth";

const { register } = useAuthStore();

definePageMeta({
  layout: "auth",
});

const error = ref("");
const loading = ref(false);
const credentials = reactive({
  first_name: "",
  email: "",
  password: "",
  password2: "",
  birthday: "",
});

const credentialValidations = reactive({
  email: { isValid: true, message: "" },
  first_name: { isValid: true, message: "" },
  birthday: { isValid: true, message: "" },
  password: { isValid: true, message: "" },
  password2: { isValid: true, message: "" },
});

const checkBirthday = () => {
  const birthday = new Date(credentials.birthday);
  const today = new Date();
  const age = today.getFullYear() - birthday.getFullYear();
  return age >= 18;
};

const validateEmail = () => {
  if (!credentials.email) {
    credentialValidations.email.isValid = false;
    credentialValidations.email.message = "Email is required.";
  } else {
    credentialValidations.email.isValid = true;
    credentialValidations.email.message = "";
  }
};

const validateFirstName = () => {
  if (!credentials.first_name) {
    credentialValidations.first_name.isValid = false;
    credentialValidations.first_name.message = "First name is required.";
  } else {
    credentialValidations.first_name.isValid = true;
    credentialValidations.first_name.message = "";
  }
};

const validatePassword = () => {
  if (!credentials.password) {
    credentialValidations.password.isValid = false;
    credentialValidations.password.message = "Password is required.";
  } else if (credentials.password.length < 6) {
    credentialValidations.password.isValid = false;
    credentialValidations.password.message =
      "Password must be at least 6 characters.";
  } else {
    credentialValidations.password.isValid = true;
    credentialValidations.password.message = "";
  }
  validateRepeatPassword(); // Ensure repeat password is re-validated when password changes
};

const validateRepeatPassword = () => {
  if (!credentials.password2) {
    credentialValidations.password2.isValid = false;
    credentialValidations.password2.message = "Repeat password is required.";
  } else if (credentials.password2 !== credentials.password) {
    credentialValidations.password2.isValid = false;
    credentialValidations.password2.message = "Passwords do not match.";
  } else {
    credentialValidations.password2.isValid = true;
    credentialValidations.password2.message = "";
  }
};

const validateBirthday = () => {
  if (!credentials.birthday) {
    credentialValidations.birthday.isValid = false;
    credentialValidations.birthday.message = "Birthday is required.";
  } else {
    if (!checkBirthday()) {
      credentialValidations.birthday.isValid = false;
      credentialValidations.birthday.message =
        "You must be at least 18 years old to register.";
    } else {
      credentialValidations.birthday.isValid = true;
      credentialValidations.birthday.message = "";
    }
  }
};

const isInvalidForm = computed(() => {
  return (
    !credentialValidations.email.isValid ||
    !credentialValidations.first_name.isValid ||
    !credentialValidations.password.isValid ||
    !credentialValidations.password2.isValid ||
    !credentialValidations.birthday.isValid
  );
});

const disableSubmit = computed(() => {
  return (
    !credentials.email ||
    !credentials.first_name ||
    !credentials.password ||
    !credentials.password2 ||
    !credentials.birthday
  );
});

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;

  validateEmail();
  validateFirstName();
  validatePassword();
  validateRepeatPassword();
  validateBirthday();

  if (isInvalidForm.value) {
    loading.value = false;
    return;
  }

  try {
    await register(credentials);
    alert("Registration successful");
  } catch (error) {
    error.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>
