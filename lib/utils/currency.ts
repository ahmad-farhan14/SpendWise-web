import type { CurrencyCode } from '@/lib/types';

const currencyLocaleMap: Record<string, string> = {
  IDR: 'id-ID',
  USD: 'en-US',
  JPY: 'ja-JP',
  EUR: 'de-DE',
  GBP: 'en-GB',
  CNY: 'zh-CN',
  KRW: 'ko-KR',
};

const zeroDecimalCurrencies = ['JPY', 'KRW'];

export function formatCurrency(amount: number, currency: string): string {
  const locale = currencyLocaleMap[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
    maximumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
  }).format(amount);
}

export function formatNumber(amount: number, currency: string): string {
  const locale = currencyLocaleMap[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
    maximumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
  }).format(amount);
}

export function formatThousands(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (!clean || clean === '0') return clean;
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseFormattedNumber(value: string, currency: CurrencyCode): number {
  const locale = currencyLocaleMap[currency] ?? 'en-US';
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
    maximumFractionDigits: zeroDecimalCurrencies.includes(currency) ? 0 : 2,
  });
  const decimalSep = formatter.format(1.1).charAt(1);
  const thousandSep = decimalSep === ',' ? '.' : ',';
  return parseFloat(value.replace(new RegExp(`\\${thousandSep}`, 'g'), '').replace(decimalSep, '.')) || 0;
}
