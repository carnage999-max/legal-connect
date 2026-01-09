import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proxy /api/v1/* to backend
  if (pathname.startsWith('/api/v1/')) {
    const backendUrl = `http://54.224.190.122${pathname}`;
    
    try {
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return new NextResponse(response.body, {
        status: response.status,
        headers: new Headers(response.headers),
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to proxy request' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/:path*'],
};
