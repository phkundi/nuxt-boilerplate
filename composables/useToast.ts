export interface Toast {
  id: number;
  type: "success" | "error" | "info";
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let counter = 0;

export function useToast() {
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = counter++;
    const duration = toast.duration || 5000;

    toasts.value.push({
      ...toast,
      id,
    });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message: string, title?: string, duration?: number) => {
    addToast({ type: "success", message, title, duration });
  };

  const error = (message: string, title?: string, duration?: number) => {
    addToast({ type: "error", message, title, duration });
  };

  const info = (message: string, title?: string, duration?: number) => {
    addToast({ type: "info", message, title, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
}
