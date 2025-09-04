import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser, registerUser } from '../services/apiService'; // Assuming these functions exist

interface AuthContextType {
  user: { email: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedToken && storedUserEmail) {
      setToken(storedToken);
      setUser({ email: storedUserEmail });
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      setToken(data.access_token);
      setUser({ email: email });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userEmail', email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err; // Re-throw to allow component to catch
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(email, password);
      // Optionally log in the user immediately after registration
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err; // Re-throw to allow component to catch
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
