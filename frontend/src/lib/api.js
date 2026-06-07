const DEFAULT_API_ORIGIN = 'http://localhost:5001';

/**
 * Base URL for the GearUp API (no trailing slash).
 */
export function getApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    return String(envUrl).replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // Local network dev: same host, backend on 5001
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
  }

  return DEFAULT_API_ORIGIN;
}

/**
 * Absolute URL for an API path (path must start with /).
 */
export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}
