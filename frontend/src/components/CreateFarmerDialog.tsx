import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { createFarmer } from "../api/mockApi";
import type { Farmer } from "../types";

type Props = { open: boolean; onClose: () => void; onCreated?: (farmer: Farmer) => void };

export default function CreateFarmerDialog({ open, onClose, onCreated }: Props) {
  const theme = useTheme();
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down("sm"));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdPin, setCreatedPin] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !phone.trim() || !region.trim() || !district.trim()) {
      setError("All fields are required.");
      return;
    }
    // basic phone validation (digits only, 9-15 chars)
    const phoneRe = /^\d{9,15}$/;
    if (!phoneRe.test(phone.trim())) {
      setError("Phone number must be digits only (9-15 characters).");
      return;
    }
    setLoading(true);
    try {
      const res = await createFarmer({ name: name.trim(), phone_number: phone.trim(), region: region.trim(), district: district.trim() });
      setCreatedPin(res.farmer.pin ?? null);
      onCreated?.(res.farmer);
    } catch (err: any) {
      setError(err?.message ?? "Unable to create farmer.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setRegion("");
    setDistrict("");
    setError(null);
    setCreatedPin(null);
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
          Create Farmer
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {createdPin && <Alert severity="success">Farmer created. PIN: <strong>{createdPin}</strong></Alert>}
            {!createdPin && (
              <>
                <TextField label="Full name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Phone number" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2567XXXXXXXX" />
                <TextField label="Region" fullWidth value={region} onChange={(e) => setRegion(e.target.value)} />
                <TextField label="District" fullWidth value={district} onChange={(e) => setDistrict(e.target.value)} />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!createdPin && (
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={18} /> : "Create"}
            </Button>
          )}
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!createdPin} autoHideDuration={4000} onClose={() => setCreatedPin(null)} message={`PIN: ${createdPin}`} />
    </>
  );
}


