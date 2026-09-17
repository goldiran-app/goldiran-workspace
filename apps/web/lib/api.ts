export const apiBaseUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl.replace(/\/$/, "")}${normalized}`;
}

type Envelope<T> = {
  data?: T;
  error?: string;
};

export async function fetchData<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path), { cache: "no-store" });
  const payload = (await response.json()) as Envelope<T>;
  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed: ${response.status}`);
  }
  if (payload.data === undefined) {
    throw new Error("Empty response");
  }
  return payload.data;
}

export type Initiative = {
  id: string;
  name: string;
  description: string;
};

export type Project = {
  id: string;
  initiativeId: string | null;
  name: string;
  description: string;
};

export type Issue = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
};

export type Stats = {
  initiatives: number;
  projects: number;
  issues: number;
};
