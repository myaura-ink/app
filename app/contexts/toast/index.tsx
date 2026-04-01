"use client";

import { Alert, Snackbar } from "@mui/material";
import { createContext, useCallback, useContext, useState } from "react";

type ToastSeverity = "success" | "error" | "info" | "warning";

interface ToastMessage {
  message: string;
  severity: ToastSeverity;
  key: number;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback((message: string, severity: ToastSeverity) => {
    setToast({ message, severity, key: Date.now() });
    setOpen(true);
  }, []);

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const ctx: ToastContextType = {
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error"),
    info: (msg) => show(msg, "info"),
    warning: (msg) => show(msg, "warning"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={toast?.severity ?? "info"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
