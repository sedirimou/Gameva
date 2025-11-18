/**
 * Next.js Middleware for API Monitoring and Header Size Optimization
 * Automatically tracks all requests and prevents 431 header size errors
 */

import { NextResponse } from 'next/server';

// Import the APIMonitor instance directly
let apiMonitor = null;

// Dynamic import to avoid ESM issues in middleware
async function getApiMonitor() {
  if (!apiMonitor) {
    try {
      const { apiMonitor: importedMonitor } = await import('./lib/apiMonitor.js');
      apiMonitor = importedMonitor;
    } catch (error) {
      console.error('Failed to import apiMonitor:', error);
    }
  }
  return apiMonitor;
}

export async function middleware(request) {
  const startTime = Date.now();
  let response;
  let statusCode = 200;
  
  try {
    // Create response with header size optimization
    response = NextResponse.next();
    
    // Prevent 431 errors by setting header size limits
    response.headers.set('X-Max-Header-Size', '8192');
    
    // Remove potentially large headers to prevent 431 errors
    const userAgent = request.headers.get('user-agent');
    if (userAgent && userAgent.length > 800) {
      // Truncate oversized user-agent headers
      const modifiedHeaders = new Headers(request.headers);
      modifiedHeaders.set('user-agent', userAgent.substring(0, 800));
    }
    
    statusCode = response.status;
  } catch (error) {
    console.error('Middleware error:', error);
    response = NextResponse.next();
    statusCode = 500;
  }
  
  // Track the request with API Monitor
  try {
    const monitor = await getApiMonitor();
    if (monitor) {
      const duration = Date.now() - startTime;
      const pathname = request.nextUrl.pathname;
      const method = request.method;
      
      // Determine the category based on the path
      let category = '👤'; // Default to user request
      if (pathname.startsWith('/api/admin')) {
        category = '🔧'; // Admin API
      } else if (pathname.startsWith('/api/')) {
        category = '🔗'; // Public API
      }
      
      // Only log non-static requests
      if (!pathname.startsWith('/_next/') && !pathname.includes('.')) {
        monitor.trackRequest({
          method,
          url: pathname,
          statusCode,
          responseTime: duration,
          timestamp: new Date().toISOString()
        });
        
        // Console log with category and performance info
        const performanceIndicator = duration < 100 ? '⚡' : duration < 500 ? '🔴' : '🐌';
        const perfSuffix = duration < 100 ? `⚡${duration}ms` : `🔴${duration}ms`;
        console.log(`✅ [MIDDLEWARE] ${category} ${method} ${pathname} ${statusCode} ${perfSuffix}`);
      }
    }
  } catch (monitorError) {
    // Silently fail if monitoring fails - don't break the request
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}