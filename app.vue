<template>
  <NuxtPage />
</template>
<script setup>
const authStore = useAuthStore();

onMounted(async () => {
  // Initialize auth state
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }
});
</script>
