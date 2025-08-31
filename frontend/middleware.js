import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Get the JWT token from Authorization header or cookies
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies.get('auth-token')?.value;
  
  let user = null;
  if (token) {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        user = null;
      } else {
        user = payload;
      }
    } catch (error) {
      // Invalid token
      user = null;
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    '/create',
    '/profile',
    '/settings',
    '/bookmarks',
    '/liked',
    '/following',
    '/followers'
  ];

  // Admin only routes
  const adminRoutes = [
    '/admin'
  ];

  // Author only routes (can create stories) - removed /create to allow all authenticated users
  const authorRoutes = [
    // '/create' - moved to regular protected routes
  ];

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/home',
    '/login',
    '/register',
    '/trending',
    '/categories',
    '/story',
    '/user',
    '/api'
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAuthorRoute = authorRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // If accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // If accessing admin route without admin role
  if (isAdminRoute && user?.role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If accessing author route without author/admin role
  if (isAuthorRoute && !['author', 'admin'].includes(user?.role)) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
