import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedRoutes = ['/my-orders'];
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Auth routes
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    // Redirect to login if trying to access protected route without session
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && session) {
    // Redirect to my-orders if trying to access auth route with session
    return NextResponse.redirect(new URL('/my-orders', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/my-orders/:path*', '/login', '/signup'],
}; 