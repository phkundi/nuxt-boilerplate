<template>
  <div class="relative" ref="containerRef">
    <div
      ref="triggerWrapperRef"
      @click.stop.prevent="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot name="trigger" :isOpen="isOpen" />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        v-click-outside="close"
        ref="menuRef"
        class="fixed z-[9999]"
        :style="menuStyle"
        @click.stop
        @mouseenter="handleMenuMouseEnterWrapper"
        @mouseleave="handleMenuMouseLeaveWrapper"
      >
        <div
          class="min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <UtilityContextMenuItem
            v-for="(item, index) in items"
            :key="index"
            :item="item"
            :depth="0"
            @action="handleAction"
            @hover="handleItemHover"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
export interface MenuItem {
  label: string;
  icon?: string;
  action?: () => void;
  children?: MenuItem[];
  danger?: boolean;
}

const props = withDefaults(
  defineProps<{
    items: MenuItem[];
    triggerMode?: "hover" | "click";
  }>(),
  {
    triggerMode: "hover",
  },
);

const emit = defineEmits<{
  (e: "action", item: MenuItem): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);
const triggerWrapperRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const triggerRect = ref<DOMRect | null>(null);
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const menuStyle = computed(() => {
  if (!triggerRect.value || !menuRef.value) return {};

  const { right, top } = triggerRect.value;
  const menuWidth = menuRef.value.offsetWidth || 200;
  const menuHeight = menuRef.value.offsetHeight || 0;

  // Position to the right of the trigger by default
  // Adjust if it would overflow the viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = right + 8; // 8px gap
  let adjustedTop = top;

  // If menu would overflow right, position to the left
  if (left + menuWidth > viewportWidth) {
    left = right - menuWidth - 8;
  }

  // If menu would overflow bottom, adjust top
  if (top + menuHeight > viewportHeight) {
    adjustedTop = viewportHeight - menuHeight - 8;
  }

  // Ensure menu doesn't go above viewport
  if (adjustedTop < 8) {
    adjustedTop = 8;
  }

  return {
    left: `${left}px`,
    top: `${adjustedTop}px`,
  };
});

const updateTriggerRect = () => {
  if (triggerWrapperRef.value) {
    triggerRect.value = triggerWrapperRef.value.getBoundingClientRect();
  }
};

const handleClick = (event: Event) => {
  if (props.triggerMode === "click") {
    event.stopPropagation();
    event.preventDefault();
    toggleMenu(event);
  }
};

const toggleMenu = (event: Event) => {
  if (!isOpen.value) {
    updateTriggerRect();
  }
  isOpen.value = !isOpen.value;
};

const handleMouseEnter = () => {
  if (props.triggerMode === "hover") {
    handleTriggerMouseEnter();
  }
};

const handleMouseLeave = () => {
  if (props.triggerMode === "hover") {
    handleTriggerMouseLeave();
  }
};

const close = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  isOpen.value = false;
};

const handleTriggerMouseEnter = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  updateTriggerRect();
  isOpen.value = true;
};

const handleTriggerMouseLeave = () => {
  hoverTimeout.value = setTimeout(() => {
    if (!isMenuHovered.value) {
      isOpen.value = false;
    }
  }, 150);
};

const isMenuHovered = ref(false);

const handleMenuMouseEnter = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  isMenuHovered.value = true;
};

const handleMenuMouseLeave = () => {
  isMenuHovered.value = false;
  hoverTimeout.value = setTimeout(() => {
    isOpen.value = false;
  }, 150);
};

const handleMenuMouseEnterWrapper = () => {
  if (props.triggerMode === "hover") {
    handleMenuMouseEnter();
  }
};

const handleMenuMouseLeaveWrapper = () => {
  if (props.triggerMode === "hover") {
    handleMenuMouseLeave();
  }
};

const handleAction = (item: MenuItem) => {
  if (item.action) {
    item.action();
  }
  emit("action", item);
  close();
};

const handleItemHover = (item: MenuItem, element: HTMLElement) => {
  // This will be used by nested menus for positioning
  // For now, we handle it in the ContextMenuItem component
};

watch(isOpen, (newValue) => {
  if (newValue) {
    nextTick(() => {
      updateTriggerRect();
    });
  }
});

onUnmounted(() => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
});
</script>
