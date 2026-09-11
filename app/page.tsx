'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, TrendingUp, Globe, ArrowRight, Shield, PieChart } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-brand text-white">
          <Wallet className="h-6 w-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-brand">SpendWise</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Sign In
          </Button>
          <Button className="bg-brand hover:bg-brand/90" onClick={() => router.push('/signup')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm text-brand">
          <Globe className="h-4 w-4" />
          7 currencies supported
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Manage your daily cash flow
          <span className="block text-brand">with precision</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Track income and expenses across multiple currencies, see your net balance at a glance,
          and calculate your safe spending limit — all in one clean, fast app.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="bg-brand hover:bg-brand/90"
            onClick={() => router.push('/signup')}
          >
            Start for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: 'Safe-to-Spend',
              desc: 'Get your daily spending limit calculated from your remaining monthly balance.',
            },
            {
              icon: Globe,
              title: 'Multi-Currency',
              desc: 'Log transactions in IDR, USD, JPY, EUR, GBP, CNY, or KRW with proper formatting.',
            },
            {
              icon: PieChart,
              title: 'Category Insights',
              desc: 'See where your money goes with visual breakdowns by category.',
            },
          ].map((f) => (
            <Card key={f.title} className="p-5 text-left shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                <f.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
