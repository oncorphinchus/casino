'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from './UserContext';
import { updateUserBalance } from '../services/userService';

interface CurrencyContextType {
  balance: number;
  updateBalance: (amount: number) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const { user, updateUserData } = useUser();

  // Set initial balance when user logs in
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    } else {
      setBalance(0);
    }
  }, [user]);

  const updateBalance = async (amount: number) => {
    if (!user) return;
    
    const newBalance = balance + amount;
    setBalance(newBalance);
    
    // Update balance in S3 and user context
    const success = await updateUserBalance(user.username, newBalance);
    if (success) {
      updateUserData({ ...user, balance: newBalance });
    }
  };

  return (
    <CurrencyContext.Provider value={{ balance, updateBalance }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
} 