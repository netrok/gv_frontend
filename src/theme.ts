import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0ea5e9" },
    secondary: { main: "#111827" },
  },
  shape: { borderRadius: 14 },
});

export default theme;
