<template>
  <div class="py-4 flex justify-center bg-slate-100">default layout</div>
  <slot />
</template>
<script setup>
const authStore = useAuthStore();
const { logout, fetchUser } = authStore;
const { isAuthentticated } = storeToRefs(authStore);

const handleLogout = () => {
  logout();
  router.push("/login");
};

// import { initializeNotifications } from "~/helpers/pushHelpers";

// onMounted(async () => {
//   if (isAuthentticated.value) {
//     await initializeNotifications();
//   }
// });
</script>
