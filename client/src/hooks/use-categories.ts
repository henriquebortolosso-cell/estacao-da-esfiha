import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.categories.list.path, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        const parsed = api.categories.list.responses[200].parse(data);
        return parsed;
      } catch (error) {
        console.warn("Failed to fetch categories:", error);
        return [];
      }
    },
  });
}
