import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // console.log('Middleware triggered for path:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', 
    '/dashboard/:path*', 
    '/auth/:path*', 
    '/profile/:path*',
    '/users/:path*', // Added /users
    '/config-advisor/:path*' // Added /config-advisor
  ],
};
