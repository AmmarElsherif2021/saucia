export const AUTH_CONFIG = {
    isDevelopment: import.meta.env.MODE === 'development',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    OAUTH_REDIRECT_URL: import.meta.env.VITE_OAUTH_REDIRECT_URL || `${window.location.origin}/auth/callback`,
    
    // Development mode user data
    DEV_USER: {
      id: 'emulator-dev-user',
      email: 'dev@example.com',
      displayName: 'Development User',
      isAdmin: true,
      photoURL: 'https://via.placeholder.com/150'
    },
    
    DEV_SESSION: {
      access_token: 'dev-mock-token',
      refresh_token: 'dev-refresh-token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: 'emulator-dev-user',
        email: 'dev@example.com',
        user_metadata: {
          full_name: 'Development User',
          avatar_url: 'https://via.placeholder.com/150'
        }
      }
    }
  };