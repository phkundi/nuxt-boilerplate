<template>
  <div>Logout</div>
</template>
<script setup>
const { logout } = useAuthStore();

onMounted(() => {
  logout();
  navigateTo("/login");
});
</script>
