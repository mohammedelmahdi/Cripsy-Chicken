import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { services } from '../api/client';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPin: (pin: string) => Promise<void>;
  logout: () => void;
  hasRole: (rolesAllowed: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('cripsy_pos_user');
    const storedToken = localStorage.getItem('cripsy_pos_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted session, clear it
        localStorage.removeItem('cripsy_pos_user');
        localStorage.removeItem('cripsy_pos_token');
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithPin = async (pin: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await services.auth.loginWithPin(pin);
      const authenticatedUser: User = {
        id: response.user.id,
        name: response.user.name,
        role: response.user.role as UserRole,
        pinHash: 'sha256-mocked-client-side', // Never store plaintext PINs
        createdAt: new Date().toISOString()
      };

      setUser(authenticatedUser);
      localStorage.setItem('cripsy_pos_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('cripsy_pos_token', response.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cripsy_pos_user');
    localStorage.removeItem('cripsy_pos_token');
  };

  const hasRole = (rolesAllowed: UserRole[]): boolean => {
    if (!user) return false;
    return rolesAllowed.includes(user.role);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginWithPin, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
