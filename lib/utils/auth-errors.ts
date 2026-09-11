interface AuthError {
  message: string;
}

export function isLeakedPasswordError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as AuthError & { code?: string };
    const code = e.code ?? '';
    const msg = e.message ?? '';
    return (
      code === 'weak_password' ||
      code === 'password_too_common' ||
      msg.includes('Password should be at least') ||
      msg.includes('has been found in') ||
      msg.includes('leaked') ||
      msg.includes('breached') ||
      msg.includes('too common')
    );
  }
  return false;
}

export function mapAuthError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as AuthError & { code?: string; status?: number };
    const code = e.code ?? '';
    const msg = e.message ?? '';

    if (code === 'invalid_credentials' || msg.includes('Invalid login credentials')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (code === 'user_already_exists' || msg.includes('User already registered')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    if (code === 'email_not_confirmed' || msg.includes('Email not confirmed')) {
      return 'Please confirm your email before signing in.';
    }
    if (code === 'over_request_rate_limit' || msg.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (isLeakedPasswordError(err)) {
      return 'This password is too common or has appeared in a data breach. Try a less predictable combination (avoid your name + simple numbers).';
    }

    if (e.message) return e.message;
  }

  return 'Something went wrong. Please try again.';
}
