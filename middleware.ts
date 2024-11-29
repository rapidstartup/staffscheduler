import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check for manager routes
  if (request.nextUrl.pathname.startsWith('/manager') && token.role !== 'manager') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/manager/:path*', '/admin/:path*'],
}

