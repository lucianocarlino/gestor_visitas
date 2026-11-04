/**
 * API endpoint configuration.
 * - Web build: no VITE_API_BASE_URL defined -> relative '/api' (Nginx / Vite proxy), unchanged behavior.
 * - Android build (vite build --mode android): absolute backend URL from .env.android.
 */

const DEFAULT_API_BASE_URL = '/api';

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
  /\/+$/,
  '',
);

/** Builds the full URL for a backend path such as '/visits' or '/core/empaques'. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/** fetch() wrapper that resolves backend paths against the configured API base URL. */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
