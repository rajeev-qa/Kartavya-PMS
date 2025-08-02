import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle API routes that might not exist
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Let existing API routes handle themselves
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}