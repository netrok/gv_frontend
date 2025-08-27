import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { getList, toMap } from "../helpers/format";

export function useCatalogos() {
  const { data: puestosResp } = useQuery({
    queryKey: ["puestos", "map"],
    queryFn: async () => (await api.get("/v1/puestos?per_page=1000")).data,
  });
  const { data: dptosResp } = useQuery({
    queryKey: ["departamentos", "map"],
    queryFn: async () => (await api.get("/v1/departamentos?per_page=1000")).data,
  });

  const puestoMap = React.useMemo(() => toMap(getList(puestosResp)), [puestosResp]);
  const dptoMap   = React.useMemo(() => toMap(getList(dptosResp)),   [dptosResp]);

  return { puestoMap, dptoMap };
}
