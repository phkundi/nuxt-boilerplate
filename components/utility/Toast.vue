<template>
  <div v-show="toasts.length > 0">
    <TransitionGroup
      tag="div"
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
      class="fixed top-0 right-0 z-50 p-6 space-y-3 w-full flex flex-col items-end pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-gray-200"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <font-awesome-icon
                :icon="getIcon(toast.type)"
                class="h-5 w-5"
                :class="[
                  toast.type === 'success' && 'text-green-600',
                  toast.type === 'error' && 'text-red-600',
                  toast.type === 'info' && 'text-blue-600',
                ]"
              />
            </div>
            <div class="ml-3 w-0 flex-1">
              <p
                class="text-sm font-medium text-primary-text"
                v-if="toast.title"
              >
                {{ toast.title }}
              </p>
              <p :class="['text-sm text-muted', toast.title ? 'mt-1' : 'mt-0']">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                @click="() => removeToast(toast.id)"
                class="inline-flex text-gray-400 hover:text-gray-500"
              >
                <font-awesome-icon icon="fa-solid fa-xmark" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import {
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { useToast } from "@/composables/useToast";

const { toasts, removeToast } = useToast();

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return faCircleCheck;
    case "error":
      return faCircleXmark;
    default:
      return faCircleInfo;
  }
};
</script>
