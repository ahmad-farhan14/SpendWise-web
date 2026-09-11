'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useCurrency } from '@/lib/currency-context';
import type { Category, CurrencyCode, TransactionType } from '@/lib/types';
import { CURRENCIES, CURRENCY_LABELS } from '@/lib/types';
import { getCategoryIcon } from '@/lib/utils/icon-map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, User, Tag, Coins } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_ICONS = [
  'utensils', 'car', 'shopping-bag', 'receipt', 'film', 'heart-pulse',
  'wallet', 'laptop', 'trending-up', 'more-horizontal', 'circle',
];

export default function SettingsPage() {
  const { profile, setProfile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>('expense');
  const [newCatIcon, setNewCatIcon] = useState('circle');
  const [addingCat, setAddingCat] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', profile.id)
      .order('type', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    setCategories((data ?? []) as Category[]);
  }, [profile]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (profile) setFullName(profile.full_name ?? '');
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id);
      if (error) throw error;
      setProfile({ ...profile, full_name: fullName });
      toast.success('Profile updated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCurrencyChange = async (c: CurrencyCode) => {
    setSavingCurrency(true);
    setCurrency(c);
    try {
      const supabase = createClient();
      if (profile) {
        await supabase.from('profiles').update({ default_currency: c }).eq('id', profile.id);
        setProfile({ ...profile, default_currency: c });
        toast.success(`Default currency changed to ${c}`);
      }
    } catch {
      toast.error('Failed to save currency preference');
    } finally {
      setSavingCurrency(false);
    }
  };

  const handleAddCategory = async () => {
    if (!profile) return;
    if (!newCatName.trim()) {
      toast.error('Category name is required');
      return;
    }
    setAddingCat(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').insert({
        user_id: profile.id,
        name: newCatName.trim(),
        type: newCatType,
        icon: newCatIcon,
      });
      if (error) throw error;
      toast.success('Category added');
      setNewCatName('');
      setNewCatType('expense');
      setNewCatIcon('circle');
      setCatDialogOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add category';
      toast.error(message);
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatId) return;
    setDeletingCat(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').delete().eq('id', deleteCatId);
      if (error) {
        if (error.code === '23503') {
          toast.error('Cannot delete a category that has transactions. Remove or reassign them first.');
        } else {
          throw error;
        }
      } else {
        toast.success('Category deleted');
        setDeleteCatId(null);
        loadCategories();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      toast.error(message);
    } finally {
      setDeletingCat(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, currency, and categories.
        </p>
      </div>

      {/* Profile */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-brand" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email ?? ''}
              disabled
              className="bg-muted"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="h-5 w-5 text-brand" />
            Default Currency
          </CardTitle>
          <CardDescription>
            This is the base currency used for your dashboard summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={currency}
            onValueChange={(v) => handleCurrencyChange(v as CurrencyCode)}
            disabled={savingCurrency}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CURRENCY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5 text-brand" />
              Categories
            </CardTitle>
            <CardDescription>Manage your income and expense categories.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setCatDialogOpen(true)} variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Expense categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-destructive">Expense Categories</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {expenseCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteCatId(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Income categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-brand">Income Categories</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {incomeCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteCatId(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Education"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newCatType} onValueChange={(v) => setNewCatType(v as TransactionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICONS.map((iconName) => {
                  const Icon = getCategoryIcon(iconName);
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewCatIcon(iconName)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                        newCatIcon === iconName
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={addingCat} className="bg-brand hover:bg-brand/90">
              {addingCat ? 'Adding...' : 'Add Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCatId} onOpenChange={(open) => !open && setDeleteCatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              If any transactions use this category, you must reassign them first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={deletingCat}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingCat ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
