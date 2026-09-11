export type CurrencyCode = 'IDR' | 'USD' | 'JPY' | 'EUR' | 'GBP' | 'CNY' | 'KRW';

export type TransactionType = 'income' | 'expense';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  default_currency: CurrencyCode;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  note: string | null;
  transaction_date: string;
  created_at: string;
  categories?: Category;
}

export const CURRENCIES: CurrencyCode[] = ['IDR', 'USD', 'JPY', 'EUR', 'GBP', 'CNY', 'KRW'];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  IDR: 'IDR — Indonesian Rupiah',
  USD: 'USD — US Dollar',
  JPY: 'JPY — Japanese Yen',
  EUR: 'EUR — Euro',
  GBP: 'GBP — British Pound',
  CNY: 'CNY — Chinese Yuan',
  KRW: 'KRW — Korean Won',
};
