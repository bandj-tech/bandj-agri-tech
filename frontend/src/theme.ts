import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0f766e" },    // teal
    secondary: { main: "#06b6d4" },  // aqua
    background: { default: "#f6f8fb", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
  components: {
    MuiAppBar: { defaultProps: { elevation: 1 } },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
      defaultProps: {
        elevation: 1,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
          },
          transition: "all 180ms ease",
        },
      },
    },
  },
});

export default theme;