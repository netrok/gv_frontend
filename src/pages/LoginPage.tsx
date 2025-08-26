import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../state/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username,setUsername] = React.useState("");
  const [password,setPassword] = React.useState("");
  const [error,setError] = React.useState<string | null>(null);
  const [loading,setLoading] = React.useState(false);

  const onSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      await login(username, password);
      nav("/");
    }catch(err:any){
      setError(String(err?.message ?? "Error de login"));
      console.error("Login error:", err);
    }finally{
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display:"grid", placeItems:"center", minHeight:"70dvh", p:2 }}>
      <Card sx={{ width:"100%", maxWidth:420 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" fontWeight={700}>Iniciar sesión</Typography>
            {error && <Alert severity="error" sx={{whiteSpace:"pre-wrap"}}>{error}</Alert>}
            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField label="Usuario" value={username} onChange={e=>setUsername(e.target.value)} required autoFocus/>
                <TextField label="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
                <Button type="submit" variant="contained" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
