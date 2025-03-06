<template>
  <div class="relative inline-block">
    <!-- Wrapper for the element that triggers the tooltip -->
    <div
      ref="triggerRef"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot />
    </div>

    <!-- Teleported tooltip -->
    <Teleport to="body">
      <div
        v-if="showTooltip"
        ref="tooltipRef"
        :class="[
          'fixed z-[9999] px-3 py-2 text-sm rounded-md shadow-md max-w-[240px] break-words hidden lg:block',
          theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-800 border border-gray-200',
        ]"
        :style="tooltipStyle"
        @mouseenter="handleTooltipMouseEnter"
        @mouseleave="handleTooltipMouseLeave"
      >
        <div>{{ text }}</div>
        <a
          v-if="targetUrl"
          :href="targetUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="[
            'block mt-1 text-xs font-medium',
            theme === 'dark'
              ? 'text-blue-300 hover:text-blue-200'
              : 'text-blue-600 hover:text-blue-500',
          ]"
        >
          Learn more →
        </a>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: "top",
    validator: (value) => ["top", "bottom", "left", "right"].includes(value),
  },
  targetUrl: {
    type: String,
    default: "",
  },
  theme: {
    type: String,
    default: "dark",
    validator: (value) => ["dark", "light"].includes(value),
  },
});

const isHoveringTrigger = ref(false);
const isHoveringTooltip = ref(false);
const hideTimeoutId = ref(null);
const showTooltip = ref(false);

// Compute showTooltip based on either trigger or tooltip being hovered
const tooltipStyle = ref({});

function handleMouseEnter() {
  // Clear any pending hide timeout
  if (hideTimeoutId.value) {
    clearTimeout(hideTimeoutId.value);
    hideTimeoutId.value = null;
  }
  isHoveringTrigger.value = true;
  showTooltip.value = true;
}

function handleMouseLeave() {
  isHoveringTrigger.value = false;
  scheduleHide();
}

function handleTooltipMouseEnter() {
  // Clear any pending hide timeout
  if (hideTimeoutId.value) {
    clearTimeout(hideTimeoutId.value);
    hideTimeoutId.value = null;
  }
  isHoveringTooltip.value = true;
  showTooltip.value = true;
}

function handleTooltipMouseLeave() {
  isHoveringTooltip.value = false;
  scheduleHide();
}

function scheduleHide() {
  // Only hide if neither element is being hovered
  if (!isHoveringTrigger.value && !isHoveringTooltip.value) {
    hideTimeoutId.value = setTimeout(() => {
      showTooltip.value = false;
    }, 150); // 150ms delay before hiding
  }
}

const triggerRef = ref(null);
const tooltipRef = ref(null);

// Update tooltip position when it becomes visible
watch(showTooltip, async (isVisible) => {
  if (isVisible) {
    // Wait for next tick to ensure tooltip is rendered
    await nextTick();
    updateTooltipPosition();
  }
});

function updateTooltipPosition() {
  if (!triggerRef.value || !tooltipRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();

  const positions = {
    top: {
      left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      top: triggerRect.top - tooltipRect.height - 8,
    },
    bottom: {
      left: triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2,
      top: triggerRect.bottom + 8,
    },
    left: {
      left: triggerRect.left - tooltipRect.width - 8,
      top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
    right: {
      left: triggerRect.right + 8,
      top: triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2,
    },
  };

  const position = positions[props.position];
  tooltipStyle.value = {
    left: `${position.left}px`,
    top: `${position.top}px`,
  };
}

// Update position on scroll or resize
onMounted(() => {
  window.addEventListener("scroll", updateTooltipPosition, true);
  window.addEventListener("resize", updateTooltipPosition);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateTooltipPosition, true);
  window.removeEventListener("resize", updateTooltipPosition);
  if (hideTimeoutId.value) {
    clearTimeout(hideTimeoutId.value);
  }
});
</script>
