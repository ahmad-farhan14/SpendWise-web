"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCategoryIcon } from "@/lib/utils/icon-map";
import { formatCurrency } from "@/lib/utils/currency";
import {
  convertCurrency,
  useExchangeRates,
} from "@/lib/utils/currency-converter";
import type { Transaction, Category, CurrencyCode } from "@/lib/types";
import { PieChart } from "lucide-react";

interface CategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
  currency: CurrencyCode;
}

interface BreakdownItem {
  category: Category;
  total: number;
  percentage: number;
}

export function CategoryBreakdown({
  transactions,
  categories,
  currency,
}: CategoryBreakdownProps) {
  const rates = useExchangeRates();
  const breakdown = useMemo<BreakdownItem[]>(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthExpenses = transactions.filter((t) => {
      const tDate = new Date(t.transaction_date);
      return t.type === "expense" && tDate >= monthStart;
    });

    const totalExpense = monthExpenses.reduce((sum, t) => {
      const convertedAmount = convertCurrency(
        Number(t.amount),
        t.currency,
        currency,
        rates,
      );
      return sum + convertedAmount;
    }, 0);

    if (totalExpense === 0) return [];

    const byCategory = new Map<string, number>();
    for (const t of monthExpenses) {
      const convertedAmount = convertCurrency(
        Number(t.amount),
        t.currency,
        currency,
        rates,
      );
      byCategory.set(
        t.category_id,
        (byCategory.get(t.category_id) ?? 0) + convertedAmount,
      );
    }

    const items: BreakdownItem[] = [];
    for (const [catId, total] of byCategory) {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) continue;
      items.push({
        category: cat,
        total,
        percentage: (total / totalExpense) * 100,
      });
    }

    return items.sort((a, b) => b.percentage - a.percentage);
  }, [transactions, categories, currency, rates]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChart className="h-5 w-5 text-brand" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PieChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No expenses recorded this month yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add an expense to see your category breakdown
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {breakdown.map((item) => {
              const Icon = getCategoryIcon(item.category.icon);
              return (
                <div key={item.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium">{item.category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(item.total, currency)}
                      </span>
                      <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
