import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser, registerUser } from '../services/apiService'; // Assuming these functions exist

interface AuthContextType {
  user: { email: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, registrationCode: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setSuccess(null);
    try {
      const data = await loginUser(email, password);
      setToken(data.access_token);
      setUser({ email: email });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userEmail', email);
    } catch (err: any) {
      setError('Login failed. Please check your email and password.');
      throw err; // Re-throw to allow component to catch
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, registrationCode) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (registrationCode !== 'VANTAGE2025') {
      setError('Invalid registration code.');
      setIsLoading(false);
      throw new Error('Invalid registration code.');
    }

    try {
      await registerUser(email, password, registrationCode);
      setSuccess('Registration successful! Please login.');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      // Do not re-throw the error, as it will be handled by the form
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

  const clearError = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error, success, clearError }}>
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
