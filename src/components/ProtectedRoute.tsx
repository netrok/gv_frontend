import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../state/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) return <Box sx={{display:"grid",placeItems:"center",minHeight:"60vh"}}><CircularProgress/></Box>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
export default ProtectedRoute;
