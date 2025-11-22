'use client';

// Simple auth session management without Supabase Auth
export function setAuthSession(email: string, role: string, privateKey?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('biochain_user_email', email);
    localStorage.setItem('biochain_user_role', role);
    localStorage.setItem('biochain_logged_in', 'true');
    if (privateKey) {
      localStorage.setItem('biochain_user_private_key', privateKey);
    }
  }
}

export function getAuthSession() {
  if (typeof window !== 'undefined') {
    const email = localStorage.getItem('biochain_user_email');
    const role = localStorage.getItem('biochain_user_role');
    const loggedIn = localStorage.getItem('biochain_logged_in');
    const privateKey = localStorage.getItem('biochain_user_private_key');

    if (email && role && loggedIn === 'true') {
      return { email, role, privateKey: privateKey || undefined };
    }
  }
  return null;
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('biochain_user_email');
    localStorage.removeItem('biochain_user_role');
    localStorage.removeItem('biochain_logged_in');
    localStorage.removeItem('biochain_user_private_key');
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('biochain_logged_in') === 'true';
  }
  return false;
}
