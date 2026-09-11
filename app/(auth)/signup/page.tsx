'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { mapAuthError, isLeakedPasswordError } from '@/lib/utils/auth-errors';
import { ensureDefaultCategories } from '@/lib/utils/default-categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, ArrowRight, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
  .regex(/[0-9]/, 'Must contain at least 1 number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least 1 symbol');

const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: passwordRules,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

type SignupForm = z.infer<typeof signupSchema>;
type FieldErrors = Partial<Record<keyof SignupForm, string>>;

interface Requirement {
  label: string;
  met: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  const requirements: Requirement[] = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: '1 uppercase letter', met: /[A-Z]/.test(password) },
      { label: '1 number', met: /[0-9]/.test(password) },
      { label: '1 symbol', met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  const allMet = requirements.every((r) => r.met);
  const isStrong = allMet && password.length >= 12;

  const strength = useMemo(() => {
    if (!password) return { label: '', level: 0, color: '' };
    if (!allMet) return { label: 'Weak', level: 1, color: 'bg-red-500' };
    if (!isStrong) return { label: 'Medium', level: 2, color: 'bg-amber-500' };
    return { label: 'Strong', level: 3, color: 'bg-green-500' };
  }, [password, allMet, isStrong]);

  const validateField = useCallback(
    (field: keyof SignupForm, value: string) => {
      const partial = {
        fullName,
        email,
        password,
        confirmPassword,
        [field]: value,
      };
      const result = signupSchema.safeParse(partial);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === field);
        if (issue) {
          setFieldErrors((prev) => ({ ...prev, [field]: issue.message }));
          return;
        }
      }
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [fullName, email, password, confirmPassword]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = signupSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    } as SignupForm);

    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupForm;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      if (data.user) {
        try {
          await ensureDefaultCategories(data.user.id);
        } catch {
          // Categories might already be created by trigger or on first login
        }
      }

      toast.success('Account created! Redirecting to dashboard...');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      if (isLeakedPasswordError(err)) {
        setError(
          'This password is too common or has appeared in a data breach. Try a less predictable combination (avoid your name + simple numbers).'
        );
      } else {
        setError(mapAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 dark:from-black dark:to-zinc-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
            <Wallet className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Start managing your cash flow with SpendWise</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Rian Sanjaya"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) validateField('fullName', e.target.value);
                }}
                onBlur={(e) => validateField('fullName', e.target.value)}
                required
                aria-invalid={!!fieldErrors.fullName}
              />
              {fieldErrors.fullName && (
                <p className="text-sm text-destructive">{fieldErrors.fullName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) validateField('email', e.target.value);
                }}
                onBlur={(e) => validateField('email', e.target.value)}
                required
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) validateField('password', e.target.value);
                  if (fieldErrors.confirmPassword && confirmPassword) {
                    validateField('confirmPassword', confirmPassword);
                  }
                }}
                onBlur={(e) => validateField('password', e.target.value)}
                required
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
              />

              {/* Strength meter */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-colors ${strength.level >= 1 ? strength.color : 'bg-muted'}`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-colors ${strength.level >= 2 ? strength.color : 'bg-muted'}`}
                    />
                    <div
                      className={`h-1.5 flex-1 rounded-full transition-colors ${strength.level >= 3 ? strength.color : 'bg-muted'}`}
                    />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Strength:{' '}
                    <span
                      className={
                        strength.level === 1
                          ? 'text-red-500'
                          : strength.level === 2
                            ? 'text-amber-500'
                            : strength.level === 3
                              ? 'text-green-500'
                              : ''
                      }
                    >
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}

              {/* Requirement checklist */}
              <ul className="space-y-1 pt-1">
                {requirements.map((req) => (
                  <li
                    key={req.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      req.met ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                    }`}
                  >
                    {req.met ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {req.label}
                  </li>
                ))}
              </ul>
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) validateField('confirmPassword', e.target.value);
                }}
                onBlur={(e) => validateField('confirmPassword', e.target.value)}
                required
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.confirmPassword}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-brand hover:bg-brand/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
