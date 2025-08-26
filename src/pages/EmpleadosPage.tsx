import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { Box, Paper, Typography } from '@mui/material'
import api from '../../lib/api'
import { Empleado } from '../../types'


const fetchEmpleados = async () => {
  const { data } = await api.get('/v1/empleados/')
  // DRF puede devolver {count, next, previous, results}
  return Array.isArray(data) ? data : data.results
}


const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'num_empleado', headerName: 'No.', width: 100 },
  { field: 'nombres', headerName: 'Nombres', width: 160 },
  { field: 'apellido_paterno', headerName: 'Apellido Paterno', width: 160 },
  { field: 'apellido_materno', headerName: 'Apellido Materno', width: 160 },
  { field: 'puesto', headerName: 'Puesto', width: 160, valueGetter: (v, row: any) => row.puesto?.nombre || row.puesto || '' },
  { field: 'departamento', headerName: 'Departamento', width: 180, valueGetter: (v, row: any) => row.departamento?.nombre || row.departamento || '' },
  { field: 'fecha_ingreso', headerName: 'Ingreso', width: 120 },
  { field: 'activo', headerName: 'Activo', width: 100, type: 'boolean' },
]


const EmpleadosPage: React.FC = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ['empleados'], queryFn: fetchEmpleados })


  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Empleados</Typography>
      <Box sx={{ height: 560 }}>
        <DataGrid rows={data as Empleado[]} columns={columns} loading={isLoading} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} />
      </Box>
    </Paper>
  )
}


export default EmpleadosPage