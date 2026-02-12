import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthProvider";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email.trim(), password, registrationCode.trim());
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(130deg, #f7f1e8 0%, #e9f8f2 55%, #e8eefb 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #eadfce" }}>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}>
            Admin Registration
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Create an admin account with your 6-digit registration code.
          </Typography>

          <Box component="form" onSubmit={onSubmit} mt={2}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />
              <TextField
                type={showPassword ? "text" : "password"}
                label="Password"
                helperText="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
                required
              />
              <TextField
                label="6-digit registration code"
                value={registrationCode}
                onChange={(e) => setRegistrationCode(e.target.value)}
                inputProps={{ inputMode: "numeric", maxLength: 6, pattern: "\\d{6}" }}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <Typography variant="body2" color="text.secondary">
                Already registered?{" "}
                <Link component={RouterLink} to="/login">
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
