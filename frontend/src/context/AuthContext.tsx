/**
 * AuthContext - Session & User Authentication (RNF01)
 * Adheres strictly to SDD and Clean Code standards
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Tecnico, StatusTecnico } from '../types/domain';
import { coreApi } from '../services/apiClient';

interface AuthContextType {
  user: Tecnico | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (tecnico: Tecnico) => void;
  loginWithPassword: (idOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  allTecnicos: Tecnico[];
  refreshTecnicos: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Tecnico | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [allTecnicos, setAllTecnicos] = useState<Tecnico[]>([]);

  const refreshTecnicos = async () => {
    try {
      const data = await coreApi.getTecnicos();
      setAllTecnicos(data);
      if (!user && data.length > 0) {
        // Default to first technician
          setUser(null);
          setToken(null);
          localStorage.removeItem('sinclair_active_user');
      }
    } catch {
      // Offline fallback
      const fallbackTec: Tecnico = {
        id: 'TEC-01',
        nombre: 'Carlos Mendoza',
        ultima_conexion: new Date().toISOString(),
        estado: StatusTecnico.DISPONIBLE,
        cumpleanos: '1988-04-12',
        rol: 'tecnico',
        email: 'carlos.mendoza@sinclair-service.com',
        password: 'sinclair123',
      };
      setAllTecnicos([fallbackTec]);
      if (!user) setUser(fallbackTec);
    }
  };

  useEffect(() => {
    refreshTecnicos();
  }, []);

  const login = (tecnico: Tecnico) => {
    setUser(tecnico);
    setToken(`token_${tecnico.id}_${Date.now()}`);
    localStorage.setItem('sinclair_active_user', JSON.stringify(tecnico));
  };

  const loginWithPassword = async (
    idOrEmail: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const resp = await coreApi.authLogin({
        id: idOrEmail,
        email: idOrEmail,
        password,
      });
      setUser(resp.user);
      setToken(resp.token);
      localStorage.setItem('sinclair_active_user', JSON.stringify(resp.user));
      return { success: true };
    } catch (err: unknown) {
      // Offline / fallback check against cached allTecnicos
      const found = allTecnicos.find(
        (t) =>
          t.id.toLowerCase() === idOrEmail.toLowerCase() ||
          t.email.toLowerCase() === idOrEmail.toLowerCase()
      );
      if (found) {
        if (found.password && found.password !== password) {
          return { success: false, error: 'Contraseña incorrecta.' };
        }
        login(found);
        return { success: true };
      }
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Credenciales inválidas.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sinclair_active_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.rol === 'admin',
        login,
        loginWithPassword,
        logout,
        allTecnicos,
        refreshTecnicos,
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
