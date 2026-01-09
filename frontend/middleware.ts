import { NextRequest, NextResponse } from 'next/server';

// Middleware no longer needed - using API routes instead
// This can be deleted or left empty

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
