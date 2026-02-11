// ============================================
// AUTHENTICATION UTILITY FUNCTIONS
// ============================================
// Token is stored in localStorage on login. These helpers decode the JWT
// to get id and role (no API calls). Used for protected routes.

const TOKEN_KEY = 'token';

/** Decode JWT payload (base64url-safe). Returns null if invalid. */
export const decodeToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
};

/** Get user id from JWT payload. */
export const getCurrentUserId = () => {
  const payload = decodeToken();
  return payload?.id ?? payload?.userId ?? null;
};

/** Get role from JWT payload (backend sets role = accountType: renter | owner | admin). */
export const getRoleFromToken = () => {
  const payload = decodeToken();
  return payload?.role ?? null;
};

/** Decoded payload with accountType alias (role) for compatibility. */
export const getCurrentUser = () => {
  const payload = decodeToken();
  if (!payload) return null;
  return { ...payload, accountType: payload.role };
};

/** True if token exists in localStorage. */
export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY);
