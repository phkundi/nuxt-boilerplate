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
<script setup lang="ts">
import type { Router } from "vue-router";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const router: Router = useRouter();

onMounted(async (): Promise<void> => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }
  if (isAuthenticated.value) {
    await router.push("/");
  }
});
</script>
