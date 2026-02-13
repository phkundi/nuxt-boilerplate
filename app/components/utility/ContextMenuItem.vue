<template>
  <div
    ref="itemRef"
    class="relative"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <button
      v-if="!item.children || item.children.length === 0"
      @click="handleClick"
      class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100"
      :class="{
        'text-red-600 hover:bg-red-50 hover:text-red-700': item.danger,
        'text-gray-700': !item.danger,
      }"
    >
      <Icon v-if="item.icon" :name="item.icon" size="sm" />
      <span class="flex-1">{{ item.label }}</span>
    </button>

    <div
      v-else
      class="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
      :class="{
        'bg-gray-100': isHovered,
      }"
    >
      <Icon v-if="item.icon" :name="item.icon" size="sm" />
      <span class="flex-1">{{ item.label }}</span>
      <Icon name="chevron_right" size="sm" />
    </div>

    <!-- Nested menu -->
    <Teleport to="body">
      <div
        v-if="item.children && item.children.length > 0 && isHovered"
        ref="nestedMenuRef"
        class="fixed z-[10000]"
        :style="nestedMenuStyle"
        @mouseenter="handleNestedMouseEnter"
        @mouseleave="handleNestedMouseLeave"
        @click.stop
      >
        <div
          class="min-w-[200px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          <ContextMenuItem
            v-for="(child, index) in item.children"
            :key="index"
            :item="child"
            :depth="depth + 1"
            @action="handleChildAction"
            @hover="handleChildHover"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from "./ContextMenu.vue";

const props = defineProps<{
  item: MenuItem;
  depth: number;
}>();

const emit = defineEmits<{
  (e: "action", item: MenuItem): void;
  (e: "hover", item: MenuItem, element: HTMLElement): void;
}>();

const isHovered = ref(false);
const nestedMenuRef = ref<HTMLElement | null>(null);
const itemRef = ref<HTMLElement | null>(null);
const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

const nestedMenuStyle = computed(() => {
  if (!itemRef.value || !nestedMenuRef.value) return {};

  const rect = itemRef.value.getBoundingClientRect();
  const menuWidth = nestedMenuRef.value.offsetWidth || 200;
  const menuHeight = nestedMenuRef.value.offsetHeight || 0;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Position to the right of the parent menu item
  let left = rect.right + 8;
  let top = rect.top;

  // If menu would overflow right, position to the left
  if (left + menuWidth > viewportWidth) {
    left = rect.left - menuWidth - 8;
  }

  // If menu would overflow bottom, adjust top
  if (top + menuHeight > viewportHeight) {
    top = viewportHeight - menuHeight - 8;
  }

  // Ensure menu doesn't go above viewport
  if (top < 8) {
    top = 8;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
});

const handleMouseEnter = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  isHovered.value = true;
  if (props.item.children && props.item.children.length > 0 && itemRef.value) {
    emit("hover", props.item, itemRef.value);
  }
};

const handleMouseLeave = () => {
  hoverTimeout.value = setTimeout(() => {
    isHovered.value = false;
  }, 150); // Small delay to allow moving to nested menu
};

const handleNestedMouseEnter = () => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  isHovered.value = true;
};

const handleNestedMouseLeave = () => {
  hoverTimeout.value = setTimeout(() => {
    isHovered.value = false;
  }, 150);
};

const handleClick = () => {
  if (props.item.action) {
    props.item.action();
  }
  emit("action", props.item);
};

const handleChildAction = (item: MenuItem) => {
  emit("action", item);
};

const handleChildHover = (item: MenuItem, element: HTMLElement) => {
  emit("hover", item, element);
};

onUnmounted(() => {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
});
</script>
