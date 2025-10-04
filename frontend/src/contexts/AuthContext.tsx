import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, googleCredential?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isSessionRestored: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionRestored, setIsSessionRestored] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      console.log('Checking for token on mount:', token ? 'Token found' : 'No token');
      if (token) {
        try {
          console.log('Validating token with /auth/me');
          setIsLoading(true);
          const { data } = await api.get('/auth/me');
          console.log('User data fetched:', data.user);
          setUser(data.user);
        } catch (error: unknown) {
          console.error('Token validation failed:', (error as Error).message);
          localStorage.removeItem('token');
          console.log('Token removed due to validation failure');
        } finally {
          setIsLoading(false);
          setIsSessionRestored(true);
        }
      } else {
        setIsSessionRestored(true);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string, googleCredential?: string) => {
    console.log('Initiating login:', googleCredential ? 'Google auth' : `Email: ${email}`);
    setIsLoading(true);
    try {
      let data;
      if (googleCredential) {
        console.log('Sending Google credential to /auth/google');
        ({ data } = await api.post('/auth/google', { token: googleCredential }));
      } else {
        ({ data } = await api.post('/auth/login', { email, password }));
      }
      console.log('Login successful, user:', data.user, 'token:', data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error: unknown) {
      console.error('Login failed:', (error as Error).message);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
      console.log('Login process completed, isLoading:', false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    console.log('Initiating registration for email:', email, 'name:', name);
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email, password, name });
      console.log('Registration successful, user:', data.user, 'token:', data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error: unknown) {
      console.error('Registration failed:', (error as Error).message);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
      console.log('Registration process completed, isLoading:', false);
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    setUser(null);
    localStorage.removeItem('token');
    console.log('Logout completed');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, setUser, isLoading, isSessionRestored }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth called outside AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}