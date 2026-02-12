import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { registerDevice } from "../api/mockApi";
import { FiCopy } from "react-icons/fi";
import { useNotify } from "../contexts/NotificationProvider";

type Props = { open: boolean; onClose: () => void; farmerId?: string };

export default function DeviceRegistration({ open, onClose, farmerId }: Props) {
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down("sm"));
  const [deviceId, setDeviceId] = useState("");
  const [sim, setSim] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const handleSubmit = async () => {
    setError(null);
    if (!deviceId.trim() || !sim.trim()) {
      setError("Device ID and SIM number are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await registerDevice({ farmer_id: farmerId || "unknown", device_id: deviceId.trim(), sim_number: sim.trim() });
      setToken(res.api_token);
    } catch (err: any) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard?.writeText(token);
    notify({ message: "Token copied to clipboard", severity: "success" });
  };

  const handleClose = () => {
    // reset local state when closing
    setDeviceId("");
    setSim("");
    setToken(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreenDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid #eadfce",
            background: "linear-gradient(140deg, #fffdf7 0%, #f2fbf7 60%, #f2f6ff 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            letterSpacing: 0.3,
            fontWeight: 700,
          }}
        >
          Register Device
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}

            {!token ? (
              <>
                <TextField
                  label="Device ID"
                  fullWidth
                  margin="normal"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="e.g. SOIL-SENSOR-001"
                />
                <TextField
                  label="SIM Number"
                  fullWidth
                  margin="normal"
                  value={sim}
                  onChange={(e) => setSim(e.target.value)}
                  placeholder="e.g. 256701234567"
                />
              </>
            ) : (
              <>
                <Alert severity="success">Device registered successfully.</Alert>
                <TextField
                  label="API Token"
                  fullWidth
                  margin="normal"
                  value={token}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopy} edge="end" size="small" aria-label="copy token">
                          <FiCopy />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!token && (
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Register"}
            </Button>
          )}
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* notifier handles snackbars globally */}
    </>
  );
}
