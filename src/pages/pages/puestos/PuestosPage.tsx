import React from 'react'
import { Paper, Typography } from '@mui/material'


const PuestosPage: React.FC = () => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700}>Puestos</Typography>
      <Typography sx={{ mt: 1 }}>Aquí mostraremos el CRUD de puestos.</Typography>
    </Paper>
  )
}


export default PuestosPage