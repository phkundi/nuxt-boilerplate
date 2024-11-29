import { ref } from "vue";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const isOpen = ref<boolean>(false);
const dialogTitle = ref<string>("");
const dialogMessage = ref<string>("");
const confirmButtonText = ref<string>("Confirm");
const cancelButtonText = ref<string>("Cancel");

const confirmCallback = ref<(() => void) | null>(null);

const resolvePromise = ref<((value: boolean) => void) | null>(null);

export function useConfirmDialog() {
  const open = (
    options: ConfirmDialogOptions,
    onConfirmFn?: () => void
  ): Promise<boolean> => {
    dialogTitle.value = options.title;
    dialogMessage.value = options.message;
    confirmButtonText.value = options.confirmButtonText ?? "Confirm";
    cancelButtonText.value = options.cancelButtonText ?? "Cancel";

    // Store the callback if provided
    confirmCallback.value = onConfirmFn ?? null;
    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise.value = resolve;
    });
  };

  const onConfirm = () => {
    // Execute the stored callback if it exists
    if (confirmCallback.value) {
      confirmCallback.value();
    }
    resolvePromise.value?.(true);
    isOpen.value = false;
  };

  const onCancel = () => {
    resolvePromise.value?.(false);
    isOpen.value = false;
  };

  return {
    isOpen,
    dialogTitle,
    dialogMessage,
    confirmButtonText,
    cancelButtonText,
    open,
    onConfirm,
    onCancel,
  };
}
