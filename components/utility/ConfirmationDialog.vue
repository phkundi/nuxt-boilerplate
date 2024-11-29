<template>
  <UtilitySlideUpModal
    :modelValue="confirmDialog.isOpen.value"
    @update:modelValue="handleModelValueUpdate"
    size="sm"
  >
    <div class="p-6">
      <h3 class="font-semibold font-display text-lg">
        {{ dialogTitle }}
      </h3>
      <p class="text-sm text-muted">{{ dialogMessage }}</p>
      <div class="flex justify-end gap-2 mt-4">
        <button class="btn btn-outline" @click="confirmDialog.onCancel">
          {{ cancelButtonText }}
        </button>
        <button class="btn btn-primary" @click="confirmDialog.onConfirm">
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </UtilitySlideUpModal>
</template>

<script setup lang="ts">
import { useConfirmDialog } from "@/composables/useConfirmDialog";

const confirmDialog = useConfirmDialog();

const dialogTitle = computed(() => confirmDialog.dialogTitle);
const dialogMessage = computed(() => confirmDialog.dialogMessage);
const confirmButtonText = computed(() => confirmDialog.confirmButtonText);
const cancelButtonText = computed(() => confirmDialog.cancelButtonText);

const handleModelValueUpdate = (value: boolean) => {
  if (!value) {
    confirmDialog.onCancel();
  }
};
</script>
