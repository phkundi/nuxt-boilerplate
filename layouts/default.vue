<template>
  <div>default layout</div>
  <slot />
</template>
<script setup>
const authStore = useAuthStore();
const { logout, fetchUser } = authStore;

const handleLogout = () => {
  logout();
  router.push("/login");
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await fetchUser();
  }
});
</script>
