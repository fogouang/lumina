import { toast } from "sonner";

type ToastVariant = "default" | "success" | "destructive";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  return {
    toast: ({ title, description, variant = "default" }: ToastOptions) => {
      switch (variant) {
        case "success":
          toast.success(title, { description });
          break;
        case "destructive":
          toast.error(title, { description });
          break;
        default:
          toast(title, { description });
      }
    },
  };
}
