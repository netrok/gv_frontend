import React, { createContext, useContext, useMemo, useState } from "react";
import { Snackbar, Alert } from "@mui/material";

type Severity = "success" | "info" | "warning" | "error";
type ToastCtx = { showToast: (message: string, severity?: Severity) => void };

const Ctx = createContext<ToastCtx | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("success");

  const showToast = (msg: string, sev: Severity = "success") => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const value = useMemo(() => ({ showToast }), []);
  return (
    <Ctx.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3200}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} variant="filled" sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Ctx.Provider>
  );
};

export const useToast = (): ToastCtx => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

