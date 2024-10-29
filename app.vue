<template>
  <div
    class="h-screen flex justify-center items-center"
    v-if="!authStore.isInitialized"
  >
    <UtilityLoadingSpinner color="grey" />
  </div>
  <NuxtPage v-else />
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
