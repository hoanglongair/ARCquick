"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onHide,
}: {
  toasts: Toast[];
  onHide: (id: string) => void;
}) {
  return (
    <>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="fixed bottom-8 right-8 z-[300] flex items-center gap-2 rounded-xl border px-5 py-3 text-sm shadow-lg transition-all"
          style={{
            background: "hsl(240, 15%, 6%)",
            borderColor:
              toast.type === "success"
                ? "hsl(152, 100%, 50%)"
                : toast.type === "error"
                  ? "hsl(0, 84%, 60%)"
                  : "hsl(186, 100%, 50%)",
            transform: "translateY(0)",
            opacity: 1,
            animation: "toastIn 0.3s ease",
          }}
        >
          <span
            style={{
              color:
                toast.type === "success"
                  ? "hsl(152, 100%, 50%)"
                  : toast.type === "error"
                    ? "hsl(0, 84%, 60%)"
                    : "hsl(186, 100%, 50%)",
            }}
          >
            {toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from {
            transform: translateY(80px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
