<template>
  <Transition name="fade">
    <div
      class="fixed inset-0 bg-gray-900 bg-opacity-60 z-50"
      v-if="modelValue"
      @click="$emit('update:modelValue', false)"
    ></div>
  </Transition>
  <Transition :name="transitionName">
    <div
      v-if="modelValue"
      :class="[
        'fixed z-50 bg-white shadow-left overflow-y-auto transition-all duration-300 ease-in-out',
        'h-full',
        isDesktop
          ? `top-0 bottom-0 rounded-l-2xl right-0 ${sizeClass}`
          : 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[95vh]',
      ]"
      :style="[!isDesktop && height ? `height: ${height}` : '']"
      v-swipe="{
        down: handleClose,
      }"
    >
      <div>
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
type DrawerSize = "sm" | "md" | "lg";

const props = defineProps({
  modelValue: Boolean,
  height: String,
  size: {
    type: String as PropType<DrawerSize>,
    default: "md",
  },
});

const emit = defineEmits(["update:modelValue", "close"]);

const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
};

const isDesktop = ref(false);

const checkDesktop = () => {
  isDesktop.value = window.innerWidth >= 1024;
};

onMounted(() => {
  checkDesktop();
  window.addEventListener("resize", checkDesktop);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkDesktop);
});

const sizeClassMap = {
  sm: "lg:w-96", // 384px
  md: "lg:w-[32rem]", // 512px
  lg: "lg:w-[48rem]", // 768px
};

const sizeClass = computed(() => sizeClassMap[props.size]);

const transitionName = computed(() =>
  isDesktop.value ? "slide-right" : "slide-up"
);
</script>

<style scoped>
/* Slide right transition for desktop */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.slide-right-leave-from,
.slide-right-enter-to {
  transform: translateX(0);
}

/* Slide up transition for mobile */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
.slide-up-leave-from,
.slide-up-enter-to {
  transform: translateY(0);
}

/* Fade transition for the overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-leave-from,
.fade-enter-to {
  opacity: 1;
}
</style>
