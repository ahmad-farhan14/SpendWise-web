"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import {
  convertCurrency,
  useExchangeRates,
} from "@/lib/utils/currency-converter";
import type { Transaction, CurrencyCode } from "@/lib/types";
import { endOfMonth, differenceInDays } from "date-fns";

interface SummaryCardProps {
  transactions: Transaction[];
  currency: CurrencyCode;
}

export function SummaryCard({ transactions, currency }: SummaryCardProps) {
  const rates = useExchangeRates();
  const {
    totalIncome,
    totalExpense,
    netBalance,
    safeToSpendDaily,
    daysRemaining,
  } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = endOfMonth(now);
    const daysLeft = Math.max(differenceInDays(monthEnd, now) + 1, 0);

    // Ambil semua transaksi bulan ini
    const monthTxns = transactions.filter((t) => {
      const tDate = new Date(t.transaction_date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    // Konversi tiap transaksi ke base currency sebelum dikalkulasi
    const income = monthTxns
      .filter((t) => t.type === "income")
      .reduce(
        (sum, t) =>
          sum + convertCurrency(Number(t.amount), t.currency, currency, rates),
        0,
      );

    const expense = monthTxns
      .filter((t) => t.type === "expense")
      .reduce(
        (sum, t) =>
          sum + convertCurrency(Number(t.amount), t.currency, currency, rates),
        0,
      );

    const net = income - expense;
    const daily = daysLeft > 0 ? net / daysLeft : net;

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: net,
      safeToSpendDaily: daily,
      daysRemaining: daysLeft,
    };
  }, [transactions, currency, rates]);

  const isNegative = netBalance < 0;
  const safeSpendNegative = safeToSpendDaily < 0;

  return (
    <div className="space-y-4">
      {/* Main balance card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg dark:from-black dark:to-zinc-900">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Wallet className="h-4 w-4 shrink-0" />
              Net Balance
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
              {currency} · This Month
            </span>
          </div>

          <div
            className={`mt-3 text-2xl font-bold tracking-tight break-words tabular-nums sm:text-3xl lg:text-4xl ${
              isNegative ? "text-red-400" : "text-blue-400"
            }`}
          >
            {formatCurrency(netBalance, currency)}
          </div>

          {/* Safe to spend */}
          <div
            className={`mt-6 rounded-xl p-4 ${
              safeSpendNegative
                ? "bg-destructive/20 ring-1 ring-destructive/40"
                : "bg-white/10"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                {safeSpendNegative ? (
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                ) : (
                  <Wallet className="h-4 w-4 text-blue-400 shrink-0" />
                )}
                Safe-to-Spend Daily
              </div>
              <span className="text-xs text-slate-400">
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left this
                month
              </span>
            </div>
            <div
              className={`mt-2 text-lg font-bold tracking-tight break-words tabular-nums sm:text-xl ${
                safeSpendNegative ? "text-red-400" : "text-blue-400"
              }`}
            >
              {formatCurrency(safeToSpendDaily, currency)}
              <span className="ml-1 text-xs font-normal text-slate-400">
                / day
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income & Expense sub-cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 sm:h-9 sm:w-9">
                <TrendingUp className="h-4 w-4 text-brand" />
              </div>
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Income
              </span>
            </div>
            <div className="mt-3 text-base font-bold tracking-tight break-words tabular-nums text-brand sm:text-lg lg:text-xl">
              {formatCurrency(totalIncome, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 sm:h-9 sm:w-9">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Expense
              </span>
            </div>
            <div className="mt-3 text-base font-bold tracking-tight break-words tabular-nums text-destructive sm:text-lg lg:text-xl">
              {formatCurrency(totalExpense, currency)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
