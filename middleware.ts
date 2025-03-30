import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// For static export, middleware is effectively disabled
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};