'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useCurrency } from '@/lib/currency-context';
import type { Transaction, Category, CurrencyCode, TransactionType } from '@/lib/types';
import { CURRENCIES } from '@/lib/types';
import { TransactionModal } from '@/components/transactions/transaction-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { getCategoryIcon } from '@/lib/utils/icon-map';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { profile } = useAuth();
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | CurrencyCode>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [page, setPage] = useState(0);

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
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Map<string, string>();
    for (const t of transactions) {
      const d = new Date(t.transaction_date);
      const key = format(d, 'yyyy-MM');
      if (!months.has(key)) {
        months.set(key, format(d, 'MMMM yyyy'));
      }
    }
    return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      // Currency filter
      if (currencyFilter !== 'all' && t.currency !== currencyFilter) return false;
      // Month filter
      if (monthFilter !== 'all') {
        const tMonth = format(new Date(t.transaction_date), 'yyyy-MM');
        if (tMonth !== monthFilter) return false;
      }
      // Search
      if (search) {
        const catName = t.categories?.name?.toLowerCase() ?? '';
        const note = t.note?.toLowerCase() ?? '';
        const q = search.toLowerCase();
        if (!catName.includes(q) && !note.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, currencyFilter, monthFilter, search]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [search, typeFilter, currencyFilter, monthFilter]);

  const handleEdit = (t: Transaction) => {
    setEditingTxn(t);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTxn(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('transactions').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Transaction deleted');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage all your transactions.
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-brand hover:bg-brand/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by note or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={(v) => setCurrencyFilter(v as typeof currencyFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Currencies</SelectItem>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction list */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Receipt className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium">No transactions found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {transactions.length === 0
                  ? 'Start by adding your first transaction.'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {paginated.map((t) => {
                  const cat = t.categories;
                  const Icon = cat ? getCategoryIcon(cat.icon) : Receipt;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{cat?.name ?? 'Unknown'}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {format(new Date(t.transaction_date), 'MMM d, yyyy')}
                            {t.note ? ` · ${t.note}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            t.type === 'income' ? 'text-brand' : 'text-destructive'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(t.amount), t.currency)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(t)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(t.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === 0}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm tabular-nums">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingTransaction={editingTxn}
        onSaved={loadData}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The transaction will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
