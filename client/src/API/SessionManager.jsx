import { AUTH_CONFIG } from "../config/auth";

class SessionManager {
  constructor() {
    this.session = this.loadSession();
  }

  loadSession() {
    // In development, always return mock session
    if (AUTH_CONFIG.isDevelopment) {
      return AUTH_CONFIG.DEV_SESSION;
    }
    
    try {
      const stored = localStorage.getItem('supabase_session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading session from localStorage:', error);
      return null;
    }
  }

  saveSession(session) {
    // Skip localStorage in development
    if (AUTH_CONFIG.isDevelopment) {
      this.session = AUTH_CONFIG.DEV_SESSION;
      return;
    }
    
    try {
      if (session) {
        localStorage.setItem('supabase_session', JSON.stringify(session));
        this.session = session;
      } else {
        this.clearSession();
      }
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  clearSession() {
    if (AUTH_CONFIG.isDevelopment) {
      this.session = null;
      return;
    }
    
    try {
      localStorage.removeItem('supabase_session');
      this.session = null;
    } catch (error) {
      console.error('Error clearing session from localStorage:', error);
    }
  }

  getSession() {
    return AUTH_CONFIG.isDevelopment ? AUTH_CONFIG.DEV_SESSION : this.session;
  }

  getAccessToken() {
    return this.getSession()?.access_token;
  }

  isAuthenticated() {
    if (AUTH_CONFIG.isDevelopment) return true;
    return !!(this.session?.access_token && this.session?.user);
  }

  isSessionExpired() {
    if (AUTH_CONFIG.isDevelopment) return false;
    if (!this.session?.expires_at) return true;
    
    const expiryTime = new Date(this.session.expires_at * 1000);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return now >= (expiryTime.getTime() - bufferTime);
  }
}

export const sessionManager = new SessionManager();