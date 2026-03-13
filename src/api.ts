import type { ComparePayload, LivePayload, OverviewPayload, SessionItem } from "./types";

async function apiFetch<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchSessions() {
  return apiFetch<SessionItem[]>("/api/mock/sessions");
}

export function fetchSessionOverview(sessionKey: number) {
  return apiFetch<OverviewPayload>(`/api/mock/session/${sessionKey}/overview`);
}

export function fetchCompare() {
  return apiFetch<ComparePayload>("/api/mock/compare");
}

export function fetchLive() {
  return apiFetch<LivePayload>("/api/mock/live");
}
