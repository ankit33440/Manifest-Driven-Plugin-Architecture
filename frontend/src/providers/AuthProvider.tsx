import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
  type LoginPayload,
} from '../api/auth';
import { setAccessToken } from '../api/tokenStore';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const session = await refreshSession();
      setAccessToken(session.accessToken);
      setUser(session.user);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(payload: LoginPayload) {
    const session = await loginRequest(payload);
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }

  async function logout() {
    await logoutRequest();
    setAccessToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const currentUser = await getMe();
    setUser(currentUser);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
