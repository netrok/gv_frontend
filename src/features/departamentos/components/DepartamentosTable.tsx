// src/features/departamentos/components/DepartamentosTable.tsx
import { useMemo, useState, useEffect } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Chip, TablePagination, CircularProgress
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";

type Departamento = {
  id: number;
  nombre: string;
  clave?: string | null;
  descripcion?: string | null;
  activo?: boolean;
};

type Paginated<T> = { results: T[]; count: number };
type ApiResponse = Paginated<Departamento> | Departamento[];

type Props = {
  search: string;
  pageSize?: number;
  onEdit: (id: number | string) => void;
  onDelete: (id: number | string) => void;
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function DepartamentosTable({
  search,
  pageSize = 25,
  onEdit,
  onDelete,
}: Props) {
  const [page, setPage] = useState(0); // 0-based UI
  const debouncedQ = useDebouncedValue(search.trim(), 300);

  // 🔁 Resetear página cuando cambia el término
  useEffect(() => {
    setPage(0);
  }, [debouncedQ]);

  const queryKey = useMemo(
    () => ["departamentos", { term: debouncedQ, page: page + 1, per_page: pageSize }],
    [debouncedQ, page, pageSize]
  );

  const { data, isLoading, isFetching } = useQuery<ApiResponse>({
    queryKey,
    queryFn: async () => {
      const res = await api.get<ApiResponse>("/v1/departamentos/", {
        params: {
          // ✅ enviamos ambos, el backend ignorará el que no use
          q: debouncedQ || undefined,
          search: debouncedQ || undefined, // DRF SearchFilter
          page: page + 1,
          per_page: pageSize,
        },
      });
      return res.data;
    },
    // v5: equivalente del antiguo keepPreviousData
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
  });

  const rows: Departamento[] = Array.isArray(data) ? data : (data?.results ?? []);
  const total: number = Array.isArray(data) ? rows.length : (data?.count ?? rows.length);

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80}>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Clave</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell width={120}>Estado</TableCell>
              <TableCell align="right" width={120}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                    <CircularProgress size={28} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box sx={{ p: 2, opacity: 0.7 }}>
                    {debouncedQ ? "Sin resultados para tu búsqueda." : "Sin registros."}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell>{d.id}</TableCell>
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell>{d.clave ?? ""}</TableCell>
                  <TableCell>{d.descripcion ?? ""}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={d.activo ? "Activo" : "Inactivo"}
                      color={d.activo ? "success" : "default"}
                      variant={d.activo ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => onEdit(d.id)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => onDelete(d.id)} size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[pageSize]}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : total}`
        }
        labelRowsPerPage={isFetching ? "Actualizando…" : "Filas por página"}
      />
    </Paper>
  );
}
