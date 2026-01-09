import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Rewrite API calls to the backend
  if (url.pathname.startsWith('/api/v1')) {
    url.hostname = 'api.legalconnectapp.com';
    url.protocol = 'http';
    url.port = '';
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
