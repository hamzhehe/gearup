/** @type {string} Base URL for the GearUp API (no trailing slash). 
 * Empty string allows Next.js rewrite rules in next.config.mjs to handle backend requests.
 */
export const API_BASE_URL = '';

const isLocalBackend = false;

/**
 * Base URL for the GearUp API (no trailing slash).
 */
export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Absolute URL for an API path (path must start with /).
 */
export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
