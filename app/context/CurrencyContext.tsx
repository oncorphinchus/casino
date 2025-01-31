'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useUser } from './UserContext';

interface CurrencyContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  resetBalance: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const { user } = useUser();

  // Reset balance when user logs in
  const resetBalance = () => {
    setBalance(1000);
  };

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  return (
    <CurrencyContext.Provider value={{ balance, updateBalance, resetBalance }}>
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