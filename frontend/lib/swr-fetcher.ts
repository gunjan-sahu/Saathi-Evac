import { apiRequest } from "@/lib/api"

export function swrFetcher<T>(path: string): Promise<T> {
  return apiRequest<T>(path)
}
