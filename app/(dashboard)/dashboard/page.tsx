'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useCurrency } from '@/lib/currency-context';
import type { Transaction, Category, CurrencyCode } from '@/lib/types';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { CategoryBreakdown } from '@/components/dashboard/category-breakdown';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowRight, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { getCategoryIcon } from '@/lib/utils/icon-map';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    try {
      const [txnRes, catRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(*)')
          .eq('user_id', profile.id)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('user_id', profile.id),
      ]);

      if (txnRes.error) throw txnRes.error;
      if (catRes.error) throw catRes.error;

      setTransactions((txnRes.data ?? []) as Transaction[]);
      setCategories((catRes.data ?? []) as Category[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const recentTransactions = transactions.slice(0, 5);
  const currentCurrency = currency as CurrencyCode;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your financial overview for this month.
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-brand hover:bg-brand/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Currency notice */}
      <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-2.5 text-sm text-muted-foreground">
        Showing transactions in <span className="font-semibold text-brand">{currentCurrency}</span>.
        Transactions in other currencies are not included in this summary.
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl bg-muted lg:col-span-1" />
          <div className="h-64 animate-pulse rounded-xl bg-muted lg:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Summary */}
          <div className="lg:col-span-1">
            <SummaryCard transactions={transactions} currency={currentCurrency} />
          </div>

          {/* Right: Category breakdown + recent */}
          <div className="space-y-6 lg:col-span-2">
            <CategoryBreakdown
              transactions={transactions}
              categories={categories}
              currency={currentCurrency}
            />

            {/* Recent transactions */}
            <Card className="shadow-sm">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <Link
                  href="/transactions"
                  className="flex items-center gap-1 text-sm text-brand hover:underline"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Receipt className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      No transactions yet. Start by adding one!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentTransactions.map((t) => {
                      const cat = t.categories;
                      const Icon = cat ? getCategoryIcon(cat.icon) : Receipt;
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{cat?.name ?? 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(t.transaction_date), 'MMM d, yyyy')}
                                {t.note ? ` · ${t.note}` : ''}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-semibold tabular-nums ${
                              t.type === 'income' ? 'text-brand' : 'text-destructive'
                            }`}
                          >
                            {t.type === 'income' ? '+' : '-'}
                            {formatCurrency(Number(t.amount), t.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Floating add button on mobile */}
      <Button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-brand shadow-lg hover:bg-brand/90 sm:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={loadData}
      />
    </div>
  );
}
