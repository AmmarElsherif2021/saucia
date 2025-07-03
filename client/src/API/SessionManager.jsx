export const sessionManager = {
  getSession: () => {
    const token = localStorage.getItem('jwt');
    return token ? { access_token: token } : null;
  },
  saveSession: (session) => {
    if (session.access_token) {
      localStorage.setItem('jwt', session.access_token);
    }
  },
  clearSession: () => {
    localStorage.removeItem('jwt');
  },
  isAuthenticated: () => !!localStorage.getItem('jwt'),
  isSessionExpired: () => {
    const token = localStorage.getItem('jwt');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
  getAccessToken: () => localStorage.getItem('jwt')
};