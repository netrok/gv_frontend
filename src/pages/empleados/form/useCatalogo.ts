import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { normalize } from "./utils";

export type ItemCat = { id: number; nombre: string };

export function useCatalogo(path: string) {
  return useQuery({
    queryKey: ["catalogo", path],
    queryFn: async () => {
      const { data } = await api.get(path);
      return normalize<ItemCat>(data);
    },
    staleTime: 5 * 60 * 1000,
  });
}
