<template>
  <div class="py-4 flex justify-center bg-slate-100">default layout</div>
  <slot />
</template>
<script setup lang="ts">
import type { Router } from "vue-router";

const authStore = useAuthStore();
const { logout, fetchUser } = authStore;
const { isAuthenticated } = storeToRefs(authStore);
const router: Router = useRouter();

const handleLogout = async (): Promise<void> => {
  logout();
  await router.push("/login");
};

onMounted(async (): Promise<void> => {
  if (isAuthenticated.value) {
    await fetchUser();
  }
});
</script>
