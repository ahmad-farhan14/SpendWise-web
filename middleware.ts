import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/transactions', '/settings'];
const AUTH_ROUTES = ['/login', '/signup'];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect guests away from protected routes
  if (!user && isProtectedRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';

    // TEMPORARY DEBUG: expose why middleware thinks there's no user.
    // Remove these two lines once the root cause is confirmed.
    url.searchParams.set(
      'debug_cookieCount',
      String(request.cookies.getAll().filter((c) => c.name.startsWith('sb-')).length)
    );
    url.searchParams.set('debug_authError', authError?.message ?? 'none');

    const redirect = NextResponse.redirect(url);

    // Copy cookies agar session tetap terbawa saat redirect
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });

    return redirect;
  }

  // Redirect logged-in users away from auth pages
  if (user && isAuthRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    const redirect = NextResponse.redirect(url);

    // Copy cookies agar session tetap terbawa saat redirect
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie.name, cookie.value);
    });

    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
  ],
};