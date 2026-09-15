import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';
import { apiClient } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  profile: any | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  setSessionToken: (token: string, user?: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skillnexa_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response.data?.success) {
        setUser(response.data.data.user);
        setProfile(response.data.data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch user context:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data?.success) {
      const { user: userData, token: authToken } = response.data.data;
      localStorage.setItem('skillnexa_token', authToken);
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      await fetchCurrentUser();
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await apiClient.post('/auth/register', credentials);
    if (response.data?.success) {
      const { user: userData, token: authToken } = response.data.data;
      localStorage.setItem('skillnexa_token', authToken);
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      await fetchCurrentUser();
    }
  };

  const setSessionToken = async (authToken: string, userData?: any) => {
    localStorage.setItem('skillnexa_token', authToken);
    localStorage.setItem('token', authToken);
    setToken(authToken);
    if (userData) setUser(userData);
    await fetchCurrentUser();
  };

  const logout = () => {
    localStorage.removeItem('skillnexa_token');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        setSessionToken,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
