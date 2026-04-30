// app/composables/useApi.ts

type Body = Record<string, unknown> | BodyInit | null | undefined;

interface FetchOptions {
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  [key: string]: unknown;
}

export function useApi() {
  const {
    public: { apiBaseUrl },
  } = useRuntimeConfig();
  const token = useCookie<string | null>("access_token");

  const base = apiBaseUrl ? `${apiBaseUrl}/api` : "/api";

  function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token.value) {
      headers["Authorization"] = `Bearer ${token.value}`;
    }
    return headers;
  }

  async function get<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    return $fetch<T>(`${base}${endpoint}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
      ...options,
    });
  }

  async function post<T>(
    endpoint: string,
    body?: Body,
    options: FetchOptions = {},
  ): Promise<T> {
    return $fetch<T>(`${base}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body,
      credentials: "include",
      ...options,
    });
  }

  async function put<T>(
    endpoint: string,
    body?: Body,
    options: FetchOptions = {},
  ): Promise<T> {
    return $fetch<T>(`${base}${endpoint}`, {
      method: "PUT",
      headers: getHeaders(),
      body,
      credentials: "include",
      ...options,
    });
  }

  async function patch<T>(
    endpoint: string,
    body?: Body,
    options: FetchOptions = {},
  ): Promise<T> {
    return $fetch<T>(`${base}${endpoint}`, {
      method: "PATCH",
      headers: getHeaders(),
      body,
      credentials: "include",
      ...options,
    });
  }

  async function del<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    return $fetch<T>(`${base}${endpoint}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
      ...options,
    });
  }

  return { get, post, put, patch, del };
}
