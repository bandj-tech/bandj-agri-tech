import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert, IconButton } from "@mui/material";
import type { AlertColor } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type NotifyOptions = {
  message: string;
  severity?: AlertColor;
  action?: ReactNode;
  autoHideDuration?: number;
};

type NotifyFn = (opts: NotifyOptions) => void;

const NotifyContext = createContext<NotifyFn | null>(null);

export function useNotify() {
  const fn = useContext(NotifyContext);
  if (!fn) throw new Error("useNotify must be used within NotificationProvider");
  return fn;
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor | undefined>("info");
  const [actionNode, setActionNode] = useState<ReactNode | undefined>(undefined);
  const [autoHide, setAutoHide] = useState<number | undefined>(4000);

  const notify: NotifyFn = ({ message, severity = "info", action, autoHideDuration = 4000 }) => {
    setMessage(message);
    setSeverity(severity);
    setActionNode(action);
    setAutoHide(autoHideDuration);
    setOpen(true);
  };

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar open={open} autoHideDuration={autoHide} onClose={() => setOpen(false)}>
        <Alert
          severity={severity}
          sx={{ width: "100%" }}
          action={
            <>
              {actionNode}
              <IconButton aria-label="close" color="inherit" size="small" onClick={() => setOpen(false)}>
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  );
}


