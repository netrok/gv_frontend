// src/components/Shell.tsx
import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppBar, Box, Button, Container, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '../state/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/empleados', label: 'Empleados' },
  { to: '/departamentos', label: 'Departamentos' },
  { to: '/puestos', label: 'Puestos' },
]

const Shell: React.FC = ()=>{
  const [open, setOpen] = React.useState(false)
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <Box sx={{ display:'flex', minHeight:'100dvh' }}>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <IconButton onClick={()=>setOpen(true)}><MenuIcon/></IconButton>
          <Typography variant="h6" sx={{ flexGrow:1 }}>GV — RH</Typography>
          <Typography sx={{ mr:2 }}>{user?.username}</Typography>
          <Button variant="contained" onClick={logout}>Salir</Button>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={()=>setOpen(false)}>
        <Box sx={{ width:260, p:1 }}>
          <Typography variant="h6" sx={{p:2}}>Menú</Typography>
          <Divider/>
          <List>
            {nav.map(n=> (
              <ListItem key={n.to} disablePadding>
                <ListItemButton component={Link} to={n.to} selected={pathname===n.to} onClick={()=>setOpen(false)}>
                  <ListItemText primary={n.label}/>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Toolbar/>
      <Container sx={{ py:3 }}>
        <Outlet/>
      </Container>
    </Box>
  )
}

export default Shell