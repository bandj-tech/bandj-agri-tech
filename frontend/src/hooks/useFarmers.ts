import { useQuery } from "@tanstack/react-query";
import { getFarmers } from "../api/mockApi";
import type { Farmer } from "../types";

export function useFarmers() {
  return useQuery<{ farmers: Farmer[] }>({
    queryKey: ["farmers"],
    queryFn: getFarmers,
  });
}