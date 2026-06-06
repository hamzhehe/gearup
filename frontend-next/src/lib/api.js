const DEFAULT_API_ORIGIN = 'http://localhost:5001';

/**
 * Base URL for the GearUp API (no trailing slash).
 */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    // If we are accessing via IP, use that same IP for the backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5001`;
    }
  }
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  return String(raw).replace(/\/$/, '');
}

/**
 * Absolute URL for an API path (path must start with /).
 */
export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}
