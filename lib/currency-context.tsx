'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { CurrencyCode } from '@/lib/types';
import { AuthContext, useAuthProvider } from '@/lib/auth-context';

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyState>({
  currency: 'IDR',
  setCurrency: () => {},
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const auth = useAuthProvider();
  const [currency, setCurrencyState] = useState<CurrencyCode>('IDR');

  useEffect(() => {
    if (auth.profile?.default_currency) {
      setCurrencyState(auth.profile.default_currency as CurrencyCode);
    }
  }, [auth.profile?.default_currency]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <CurrencyContext.Provider value={{ currency, setCurrency }}>
        {children}
      </CurrencyContext.Provider>
    </AuthContext.Provider>
  );
}
