import React from "react";
import { Paper, Typography } from "@mui/material";

const Dashboard: React.FC = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="h5" fontWeight={700}>Dashboard visible </Typography>
    <Typography sx={{ mt: 1 }}>Si ves esto, la UI está viva.</Typography>
  </Paper>
);

export default Dashboard;
