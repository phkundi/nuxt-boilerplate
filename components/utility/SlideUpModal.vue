<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        class="fixed inset-0 bg-gray-900 bg-opacity-60 z-50"
        v-if="modelValue"
        @click="handleClose"
      ></div>
    </Transition>
    <Transition :name="transitionName">
      <div
        v-if="modelValue"
        v-swipe="{
          down: handleClose,
        }"
        :class="[
          'fixed z-50 bg-white shadow-up overflow-y-auto transition-all duration-300 ease-in-out',
          'lg:rounded-2xl lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2',
          isDesktop
            ? `lg:w-full lg:max-h-[95vh] ${sizeClass}`
            : 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[95vh]',
        ]"
        :style="[!isDesktop && height ? `height: ${height}` : '']"
      >
        <div>
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type ModalSize = "sm" | "md" | "lg";

const props = defineProps({
  modelValue: Boolean,
  height: String,
  size: {
    type: String as PropType<ModalSize>,
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
  isDesktop.value = window.innerWidth >= 1024; // 1024px is the 'lg' breakpoint in Tailwind
};

onMounted(() => {
  checkDesktop();
  window.addEventListener("resize", checkDesktop);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkDesktop);
});

const sizeClassMap = {
  sm: "lg:max-w-sm",
  md: "lg:max-w-xl",
  lg: "lg:max-w-4xl",
};

const sizeClass = computed(() => sizeClassMap[props.size]);

const transitionName = computed(() => (isDesktop.value ? "fade" : "slide-up"));
</script>
<style scoped>
/* Slide up transition */
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
/* Fade transition for the overlay and modal */
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
