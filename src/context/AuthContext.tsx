import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authAPI, clearToken, getToken } from '@/lib/api';

const USER_KEY = 'talentai_user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string, role: UserRole, email?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // If there's a stored user but no token, clear the user
  useEffect(() => {
    if (user && !getToken()) {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const login = useCallback(async (username: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ username, password, role });
      if (response.success && response.user) {
        persistUser(response.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (username: string, password: string, role: UserRole, email?: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.signup({ username, email: email ?? '', password, role });
      if (response.success && response.user) {
        persistUser(response.user);
      }
      return { success: response.success, message: response.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } finally {
      clearToken();
      persistUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

