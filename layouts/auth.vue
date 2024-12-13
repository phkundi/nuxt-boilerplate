<template>
  <div class="h-screen flex justify-center items-center bg-slate-50">
    <div class="max-w-4xl w-full flex flex-col items-center">
      <span class="text-2xl font-bold text-primary">App Name</span>
      <!-- <img src="/logo/black-text.png" alt="App Name" class="h-8" /> -->
      <slot />
    </div>
  </div>
</template>
<script setup>
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const router = useRouter();

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }
  if (isAuthenticated.value) {
    router.push("/");
  }
});
</script>
