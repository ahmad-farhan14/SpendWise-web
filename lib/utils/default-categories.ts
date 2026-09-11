import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';

interface DefaultCategory {
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Food & Drink', type: 'expense', icon: 'utensils' },
  { name: 'Transportation', type: 'expense', icon: 'car' },
  { name: 'Shopping', type: 'expense', icon: 'shopping-bag' },
  { name: 'Bills', type: 'expense', icon: 'receipt' },
  { name: 'Entertainment', type: 'expense', icon: 'film' },
  { name: 'Health', type: 'expense', icon: 'heart-pulse' },
  { name: 'Other', type: 'expense', icon: 'more-horizontal' },
  { name: 'Salary', type: 'income', icon: 'wallet' },
  { name: 'Freelance', type: 'income', icon: 'laptop' },
  { name: 'Investment', type: 'income', icon: 'trending-up' },
  { name: 'Other', type: 'income', icon: 'more-horizontal' },
];

export async function ensureDefaultCategories(userId: string): Promise<Category[]> {
  const supabase = createClient();

  const { data: existing, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  if (existing && existing.length > 0) {
    return existing as Category[];
  }

  const inserts = DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    user_id: userId,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('categories')
    .insert(inserts)
    .select();

  if (insertError) throw insertError;

  return (inserted ?? []) as Category[];
}
