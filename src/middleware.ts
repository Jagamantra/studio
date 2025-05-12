
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// A very simplified middleware for diagnostic purposes.
// The original complex logic and imports have been removed to help isolate
// the "Cannot find the middleware module" error.
export function middleware(request: NextRequest) {
  // You can add a console.log here to see if the middleware is running:
  // console.log('Simplified middleware triggered for path:', request.nextUrl.pathname);

  // Example: If you want to test a simple redirect:
  // if (request.nextUrl.pathname.startsWith('/admin-only')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  // This will run the middleware for the homepage, dashboard, auth pages, and profile.
  matcher: ['/', '/dashboard/:path*', '/auth/:path*', '/profile/:path*'],
};
