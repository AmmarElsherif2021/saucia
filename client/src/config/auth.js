export const AUTH_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  OAUTH_REDIRECT_URL: import.meta.env.VITE_OAUTH_REDIRECT_URL || 'http://localhost:5173/auth/callback',
  SESSION_KEY: 'auth_session',
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes
  SESSION_REFRESH_INTERVAL: 50 * 60 * 1000, // 50 minutes
};