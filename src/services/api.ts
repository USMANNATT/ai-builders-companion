import { BASE_URL } from "@/constants/urls";

export async function apiPost<T = any>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const body = new URLSearchParams(params);
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
