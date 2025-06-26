import { AUTH_CONFIG } from "../config/auth";
class SessionManager {
  constructor() {
    this.sessionKey = AUTH_CONFIG.SESSION_KEY;
  }

  getSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  saveSession(session) {
    try {
      if (!session) return;
      
      const normalizedSession = {
        ...session,
        access_token: session.access_token || session.accessToken,
        refresh_token: session.refresh_token || session.refreshToken,
        expires_at: session.expires_at || session.expiresAt,
        user: session.user
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(normalizedSession));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  clearSession() {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  getAccessToken() {
    return this.getSession()?.access_token;
  }

  isAuthenticated() {
    const session = this.getSession();
    return !!(session?.access_token && session?.user);
  }

  isSessionExpired() {
    const session = this.getSession();
    if (!session?.expires_at) return true;
    
    const expiryTime = new Date(session.expires_at * 1000);
    const bufferTime = AUTH_CONFIG.TOKEN_REFRESH_BUFFER;
    
    return Date.now() >= (expiryTime.getTime() - bufferTime);
  }
}

export const sessionManager = new SessionManager();