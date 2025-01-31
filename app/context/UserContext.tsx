'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { registerUser, loginUser } from '../services/userService';

interface User {
  username: string;
  balance: number;
}

interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    const userData = await loginUser(username, password);
    if (userData) {
      setUser({ username: userData.username, balance: userData.balance });
      setError(null);
      return true;
    }
    setError('Invalid credentials');
    return false;
  };

  const register = async (username: string, password: string) => {
    const success = await registerUser(username, password);
    if (success) {
      setError(null);
      return true;
    }
    setError('Username already exists');
    return false;
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <UserContext.Provider value={{ user, login, register, logout, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 