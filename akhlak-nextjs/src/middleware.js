import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Keep this identical to src/lib/jwt.js secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rahasia-negara-akhlak-360-super-secure-key-2026'
);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Paths that require protection
  const protectedPrefixes = ['/admin-hr', '/manajemen', '/atasan', '/karyawan'];
  const isProtectedPath = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isProtectedPath) {
    const tokenCookie = request.cookies.get('token');
    
    if (!tokenCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
      const userRole = payload.role; // e.g., 'admin-hr', 'manajemen', 'atasan', 'karyawan'

      // Route Guards Based on Role
      if (pathname.startsWith('/admin-hr') && userRole !== 'admin-hr') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      if (pathname.startsWith('/manajemen') && userRole !== 'manajemen') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (pathname.startsWith('/atasan') && userRole !== 'atasan') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Karyawan path can be accessed by karyawan OR atasan (for multi-role IDP/Penilaian)
      if (pathname.startsWith('/karyawan') && userRole !== 'karyawan' && userRole !== 'atasan') {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Allow request to proceed
      return NextResponse.next();
      
    } catch (error) {
      // Invalid or expired token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-hr/:path*', '/manajemen/:path*', '/atasan/:path*', '/karyawan/:path*'],
};
