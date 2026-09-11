/*
# SpendWise - Initial Database Schema

## Overview
Creates the core tables for SpendWise: a multi-currency personal finance tracker.
Tables: profiles, categories, transactions.

## New Tables

1. profiles
   - id (uuid, PK, references auth.users) — one row per user
   - email (text) — cached from auth
   - full_name (text, nullable) — user display name
   - default_currency (varchar(3)) — user's preferred base currency (default IDR)
   - created_at (timestamptz)

2. categories
   - id (uuid, PK)
   - user_id (uuid, references profiles, default auth.uid())
   - name (varchar(50)) — category name
   - type (varchar(10)) — 'income' or 'expense'
   - icon (varchar(50)) — lucide icon name
   - created_at (timestamptz)

3. transactions
   - id (uuid, PK)
   - user_id (uuid, references profiles, default auth.uid())
   - category_id (uuid, references categories)
   - type (varchar(10)) — 'income' or 'expense'
   - amount (numeric(15,2)) — must be > 0
   - currency (varchar(3)) — currency code for this transaction
   - note (text, nullable) — optional note max 200 chars
   - transaction_date (date) — date of transaction
   - created_at (timestamptz)

## Indexes
- idx_transactions_user_id on transactions(user_id)
- idx_transactions_date on transactions(transaction_date)
- idx_categories_user_id on categories(user_id)

## Security (RLS)
All tables have RLS enabled. Policies:
- profiles: user can SELECT and UPDATE only their own row
- categories: user can CRUD only their own categories (4 separate policies)
- transactions: user can CRUD only their own transactions (4 separate policies)

## Triggers
- on_auth_user_created: after insert on auth.users, auto-creates a profile row
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  default_currency varchar(3) NOT NULL DEFAULT 'IDR',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  name varchar(50) NOT NULL,
  type varchar(10) NOT NULL CHECK (type IN ('income', 'expense')),
  icon varchar(50) NOT NULL DEFAULT 'circle',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type varchar(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  currency varchar(3) NOT NULL,
  note text,
  transaction_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Categories policies (4 separate CRUD)
DROP POLICY IF EXISTS "select_own_categories" ON public.categories;
CREATE POLICY "select_own_categories" ON public.categories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_categories" ON public.categories;
CREATE POLICY "insert_own_categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_categories" ON public.categories;
CREATE POLICY "update_own_categories" ON public.categories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_categories" ON public.categories;
CREATE POLICY "delete_own_categories" ON public.categories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Transactions policies (4 separate CRUD)
DROP POLICY IF EXISTS "select_own_transactions" ON public.transactions;
CREATE POLICY "select_own_transactions" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON public.transactions;
CREATE POLICY "insert_own_transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON public.transactions;
CREATE POLICY "update_own_transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON public.transactions;
CREATE POLICY "delete_own_transactions" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();