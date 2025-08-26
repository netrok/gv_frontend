import React from 'react'
import { Paper, Typography } from '@mui/material'


const DepartamentosPage: React.FC = () => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700}>Departamentos</Typography>
            <Typography sx={{ mt: 1 }}>Aquí mostraremos el CRUD de departamentos.</Typography>
        </Paper>
    )
}


export default DepartamentosPage