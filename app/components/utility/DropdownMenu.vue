<template>
  <div class="relative">
    <button
      type="button"
      @click.stop="toggleMenu"
      class="text-primary-text inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
    >
      <slot name="trigger" />
    </button>

    <div
      v-if="isOpen"
      v-click-outside="close"
      @click.stop
      class="ring-opacity-10 absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none"
    >
      <div class="py-1">
        <button
          v-for="(item, index) in items"
          :key="index"
          @click="handleItemClick(item)"
          class="hover:text-primary-text w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'text-red-600 hover:text-red-700': item.danger }"
        >
          <div class="flex items-center">
            <font-awesome-icon
              v-if="item.icon"
              :icon="item.icon"
              class="mr-3 h-4 w-4"
            />
            {{ item.label }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MenuItem {
  label: string;
  action: () => void;
  icon?: any;
  danger?: boolean;
}

const props = defineProps<{
  items: MenuItem[];
}>();

const isOpen = ref(false);

const close = () => {
  isOpen.value = false;
};

const toggleMenu = (event: Event) => {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
};

const handleItemClick = (item: MenuItem) => {
  item.action();
  close();
};
</script>
