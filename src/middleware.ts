import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { isBlocked } from '@/lib/ip-blocklist';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:;",
};

function getCorsHeaders(origin: string | null) {
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL 
    ? [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000', 'http://localhost:3001'] 
    : ['http://localhost:3000', 'http://localhost:3001'];

  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  
  // Set Security Headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Handle CORS
  const origin = request.headers.get('origin');
  if (path.startsWith('/api')) {
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }
  }

  // IP Blocklist
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
  if (isBlocked(ip)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Rate Limiting (apply to /api routes)
  if (path.startsWith('/api')) {
    let limit = 60; // default 60 req
    let windowMs = 60 * 1000; // default 1 min

    if (path === '/api/track-visit') {
      limit = 30;
      windowMs = 10 * 60 * 1000; // 10 min
    } else if (path === '/api/book-demo') {
      limit = 5;
      windowMs = 60 * 60 * 1000; // 1 hour
    } else if (path === '/api/auth/register') {
      limit = 10;
      windowMs = 60 * 60 * 1000; // 1 hour
    } else if (path.startsWith('/api/admin')) {
      limit = 120;
      windowMs = 60 * 1000; // 1 min
    } else if (path.startsWith('/api/auth')) {
      limit = 20;
      windowMs = 15 * 60 * 1000; // 15 min
    }

    const { success, remaining, reset } = rateLimit(ip, limit, windowMs);
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return new NextResponse('Too Many Requests', { 
        status: 429, 
        headers: { 'Retry-After': retryAfter.toString() } 
      });
    }
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
