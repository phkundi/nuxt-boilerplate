<template>
  <div class="py-4 flex justify-center bg-slate-100">default layout</div>
  <slot />
</template>
<script setup>
const authStore = useAuthStore();
const { logout, fetchUser, isAuthenticated } = authStore;

const handleLogout = () => {
  logout();
  router.push("/login");
};

onMounted(async () => {
  if (isAuthenticated) {
    await fetchUser();
  }
});
</script>
