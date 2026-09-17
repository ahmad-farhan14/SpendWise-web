import type { CurrencyCode } from "@/lib/types";
import { useEffect, useState } from "react";

const EXCHANGE_RATES_URL = "https://open.er-api.com/v6/latest/USD";

// Static rates are used until live rates load and whenever the request fails.
export const STATIC_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  IDR: 15500,
  USD: 1,
  JPY: 150,
  EUR: 0.92,
  GBP: 0.78,
  CNY: 7.2,
  KRW: 1330,
};

let cachedExchangeRates: Record<CurrencyCode, number> | null = null;
let exchangeRatesRequest: Promise<Record<CurrencyCode, number>> | null = null;

function hasSupportedRates(
  rates: Partial<Record<CurrencyCode, unknown>>,
): rates is Record<CurrencyCode, number> {
  return (Object.keys(STATIC_EXCHANGE_RATES) as CurrencyCode[]).every(
    (currency) => {
      const rate = rates[currency];
      return typeof rate === "number" && rate > 0;
    },
  );
}

export async function getExchangeRates(): Promise<
  Record<CurrencyCode, number>
> {
  if (cachedExchangeRates) return cachedExchangeRates;
  if (exchangeRatesRequest) return exchangeRatesRequest;

  exchangeRatesRequest = fetch(EXCHANGE_RATES_URL, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Failed to load exchange rates");

      const data: { rates?: Partial<Record<CurrencyCode, unknown>> } =
        await response.json();
      if (!data.rates || !hasSupportedRates(data.rates)) {
        throw new Error(
          "Exchange rate response is missing supported currencies",
        );
      }

      cachedExchangeRates = data.rates;
      return data.rates;
    })
    .catch(() => STATIC_EXCHANGE_RATES)
    .finally(() => {
      exchangeRatesRequest = null;
    });

  return exchangeRatesRequest;
}

export function useExchangeRates(): Record<CurrencyCode, number> {
  const [rates, setRates] = useState(STATIC_EXCHANGE_RATES);

  useEffect(() => {
    getExchangeRates().then(setRates);
  }, []);

  return rates;
}

/**
 * Mengonversi nilai nominal dari fromCurrency ke toCurrency
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: Record<CurrencyCode, number> = STATIC_EXCHANGE_RATES,
): number {
  if (fromCurrency === toCurrency) return amount;

  const rateFrom = rates[fromCurrency] ?? STATIC_EXCHANGE_RATES[fromCurrency];
  const rateTo = rates[toCurrency] ?? STATIC_EXCHANGE_RATES[toCurrency];

  return amount * (rateTo / rateFrom);
}
