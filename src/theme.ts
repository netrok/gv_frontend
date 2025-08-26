import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0d6efd" },
    secondary: { main: "#6c757d" },
    success: { main: "#28a745" },
    warning: { main: "#ffc107" },
    error: { main: "#dc3545" },
    background: { default: "#f6f8fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter","Roboto","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif',
    h6: { fontWeight: 800 },
    subtitle2: { textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, fontSize: 12 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, paddingInline: 16, paddingBlock: 8 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
        input: { padding: "12px 14px" },
      },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "#d0d7e2",
          "&.Mui-active": { color: "#0d6efd" },
          "&.Mui-completed": { color: "#0d6efd" },
        },
      },
    },
    MuiStepLabel: { styleOverrides: { label: { fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
  },
});

export default theme;

