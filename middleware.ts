import { NextRequest, NextResponse } from 'next/server';
import { securityManager } from './src/config/security';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') && !pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  try {
    // Apply security middleware
    const securityMiddlewareHandler = securityManager.getMiddleware();
    const result = await securityMiddlewareHandler(request);

    // If security middleware returned a response (blocked request), return it
    if (result && result.status !== 200) {
      return result;
    }

    // Continue with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // In case of middleware error, allow the request but log the error
    return NextResponse.json(
      { error: 'Internal security error' },
      { status: 500 }
    );
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};