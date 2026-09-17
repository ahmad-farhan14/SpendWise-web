import type { CurrencyCode } from "@/lib/types";

// Rate konversi terhadap USD (Base: 1 USD)
const EXCHANGE_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1,
  IDR: 15500,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 150,
  CNY: 7.2,
  KRW: 1330,
};

/**
 * Mengonversi nilai nominal dari fromCurrency ke toCurrency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): number {
  if (fromCurrency === toCurrency) return amount;

  const rateFrom = EXCHANGE_RATES_TO_USD[fromCurrency] || 1;
  const rateTo = EXCHANGE_RATES_TO_USD[toCurrency] || 1;

  // Konversi nilai dari asal ke USD, kemudian dari USD ke target currency
  const amountInUSD = amount / rateFrom;
  return amountInUSD * rateTo;
}
