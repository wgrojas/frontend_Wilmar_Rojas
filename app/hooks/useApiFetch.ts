// src/hooks/useApiFetch.ts
import { Platform } from "react-native";

// 👉 CONFIGURACIÓN DEL SERVIDOR
// Si usas Android en dispositivo físico: pon aquí la IP del PC en tu red
const HOST_FOR_ANDROID = "192.168.X.X"; // <-- Cambia esto por tu IP real
const DEV_PORT = 8970;
const DEV_PROTOCOL = "http";

// Detecta automáticamente la plataforma
const host =
  Platform.OS === "android"
    ? HOST_FOR_ANDROID
    : "localhost";

export const API_BASE = `${DEV_PROTOCOL}://${host}:${DEV_PORT}/api`;

// Tipos
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type Json = Record<string, any>;
export type ApiError = { status: number; message: string; details?: any };

type FetchOptions = {
  method?: HttpMethod;
  path: string;
  body?: Json | FormData;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

// -------------------------
//   FUNCIÓN GENERAL FETCH
// -------------------------
async function doFetch<T = any>({
  method = "GET",
  path,
  body,
  headers = {},
  timeoutMs = 15000,
}: FetchOptions): Promise<{ data?: T; error?: ApiError }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...headers,
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: isFormData
        ? (body as FormData)
        : body
        ? JSON.stringify(body)
        : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const isJson = (res.headers.get("content-type") || "").includes(
      "application/json"
    );

    const payload = isJson && text ? JSON.parse(text) : text;

    if (!res.ok) {
      return {
        error: {
          status: res.status,
          message: payload?.message || "Error en la solicitud",
          details: payload,
        },
      };
    }

    return { data: payload as T };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return {
        error: { status: 0, message: "Tiempo de espera agotado", details: {} },
      };
    }

    return {
      error: { status: 0, message: err?.message || "Error de red" },
    };
  } finally {
    clearTimeout(timer);
  }
}

// -------------------------
//      API EXPORTADA
// -------------------------
export const withAuthJSON = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const api = {
  get: <T = any>(path: string, headers?: Record<string, string>) =>
    doFetch<T>({ method: "GET", path, headers }),

  post: <T = any>(
    path: string,
    body?: Json | FormData,
    headers?: Record<string, string>
  ) => doFetch<T>({ method: "POST", path, body, headers }),

  put: <T = any>(
    path: string,
    body?: Json | FormData,
    headers?: Record<string, string>
  ) => doFetch<T>({ method: "PUT", path, body, headers }),

  delete: <T = any>(path: string, headers?: Record<string, string>) =>
    doFetch<T>({ method: "DELETE", path, headers }),
};
