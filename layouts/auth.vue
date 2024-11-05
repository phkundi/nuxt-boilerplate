<template>
  <div class="flex min-h-full flex-1">
    <slot />
    <div class="relative hidden w-0 flex-1 lg:block">
      <img
        class="absolute inset-0 h-full w-full object-cover"
        src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
        alt=""
      />
    </div>
  </div>
</template>
<script setup>
// import { initializeNotifications } from "~/helpers/pushHelpers";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push("/");
  } else {
    // await initializeNotifications();
  }
});
</script>
