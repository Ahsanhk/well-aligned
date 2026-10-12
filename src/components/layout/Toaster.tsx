'use client';

import { ToastCard } from '@/components/ui/ToastCard';
import { useToastStore } from '@/store/toast';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 sm:top-4 sm:right-4 sm:bottom-auto sm:left-auto sm:w-96 sm:items-end">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          message={toast.message}
          tone={toast.tone}
          actionLabel={toast.action?.label}
          onAction={
            toast.action &&
            (() => {
              toast.action?.onAction();
              dismiss(toast.id);
            })
          }
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}
