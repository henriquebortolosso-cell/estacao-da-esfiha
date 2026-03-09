import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao carregar produtos");
      const data = await res.json();
      return api.products.list.responses[200].parse(data);
    },
  });
}
