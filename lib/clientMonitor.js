/**
 * Client-side API Monitoring
 * Tracks frontend API calls and page views
 */

// Global monitoring state
let monitoringEnabled = true;
let logs = [];
const MAX_CLIENT_LOGS = 100;

// Page category mapping
const PAGE_CATEGORIES = {
  '/': 'customer',
  '/wishlist': 'customer',
  '/cart': 'customer',
  '/checkout': 'customer',
  '/thankyou': 'customer',
  '/search': 'customer',
  '/product/': 'customer',
  '/auth/': 'customer',
  '/user/': 'customer',
  '/dashboard': 'customer',
  '/admin/': 'admin',
  '/special-': 'customer',
  '/404': 'customer'
};

// Get category for current page
function getPageCategory(path) {
  for (const [prefix, category] of Object.entries(PAGE_CATEGORIES)) {
    if (path.startsWith(prefix)) {
      return category;
    }
  }
  return 'customer';
}

// Enhanced fetch wrapper for client-side monitoring
export function monitoredFetch(url, options = {}) {
  if (!monitoringEnabled) return fetch(url, options);
  
  const startTime = Date.now();
  const method = options.method || 'GET';
  const isExternal = !url.startsWith('/') && !url.includes(window.location.hostname);
  
  // Determine category
  let category = 'api';
  if (isExternal) {
    category = 'external';
  } else if (url.includes('/admin/')) {
    category = 'admin';
  } else if (url.startsWith('/api/')) {
    category = 'api';
  } else {
    category = 'customer';
  }

  return fetch(url, options)
    .then(response => {
      const responseTime = Date.now() - startTime;
      
      // Log successful request
      logClientRequest({
        method,
        path: url,
        status: response.status,
        responseTime,
        category,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });

      return response;
    })
    .catch(error => {
      const responseTime = Date.now() - startTime;
      
      // Log failed request
      logClientRequest({
        method,
        path: url,
        status: 0,
        responseTime,
        category,
        error: error.message || error.toString(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      });

      throw error;
    });
}

// Log client-side request
function logClientRequest(logData) {
  // Add to local logs
  logs.push(logData);
  
  // Keep only recent logs
  if (logs.length > MAX_CLIENT_LOGS) {
    logs.shift();
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    const { method, path, status, responseTime, category, error } = logData;
    
    // Color coding
    let statusColor = '';
    if (status >= 500) statusColor = 'color: red';
    else if (status >= 400) statusColor = 'color: orange';
    else if (status >= 300) statusColor = 'color: blue';
    else if (status >= 200) statusColor = 'color: green';
    
    // Category icon
    const categoryIcons = {
      admin: '🔧',
      customer: '👤',
      api: '🔗',
      external: '🌐'
    };
    const categoryIcon = categoryIcons[category] || '📊';
    
    // Performance indicator
    let perfIcon = '⚡';
    if (responseTime > 2000) perfIcon = '🔴';
    else if (responseTime > 1000) perfIcon = '🟠';
    else if (responseTime > 500) perfIcon = '🟡';

    const logMessage = `${categoryIcon} ${method} ${path} ${status} ${perfIcon}${responseTime}ms`;
    
    if (error) {
      console.error(`🚨 [CLIENT] ${logMessage}`, error);
    } else if (status >= 400) {
      console.warn(`⚠️  [CLIENT] ${logMessage}`);
    } else {
      console.log(`✅ [CLIENT] ${logMessage}`);
    }
  }

  // Send to server monitoring (optional, for production)
  if (process.env.NODE_ENV === 'production') {
    sendToServerMonitoring(logData);
  }
}

// Send client logs to server monitoring
function sendToServerMonitoring(logData) {
  // Debounced sending to avoid overwhelming the server
  if (!window.monitoringQueue) {
    window.monitoringQueue = [];
  }
  
  window.monitoringQueue.push(logData);
  
  // Send batch every 10 seconds or when queue reaches 20 items
  if (!window.monitoringTimer) {
    window.monitoringTimer = setTimeout(() => {
      if (window.monitoringQueue.length > 0) {
        fetch('/api/admin/monitoring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'BATCH_CLIENT_LOGS',
            path: '/client-logs',
            status: 200,
            responseTime: 0,
            category: 'client',
            logs: window.monitoringQueue
          })
        }).catch(err => {
          console.warn('Failed to send client logs to server:', err);
        });
        
        window.monitoringQueue = [];
      }
      window.monitoringTimer = null;
    }, 10000);
  }
}

// Track page view
export function trackPageView(path = window.location.pathname) {
  if (!monitoringEnabled) return;
  
  const category = getPageCategory(path);
  
  logClientRequest({
    method: 'PAGE_VIEW',
    path,
    status: 200,
    responseTime: 0,
    category,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    page: path
  });
}

// Track page performance
export function trackPagePerformance() {
  if (!monitoringEnabled || !window.performance) return;
  
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    logClientRequest({
      method: 'PAGE_PERFORMANCE',
      path: window.location.pathname,
      status: 200,
      responseTime: navigation.loadEventEnd - navigation.loadEventStart,
      category: getPageCategory(window.location.pathname),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      page: window.location.pathname,
      metrics: {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart
      }
    });
  }
}

// Track JavaScript errors
export function trackError(error, errorInfo = {}) {
  if (!monitoringEnabled) return;
  
  logClientRequest({
    method: 'ERROR',
    path: window.location.pathname,
    status: 500,
    responseTime: 0,
    category: getPageCategory(window.location.pathname),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    page: window.location.pathname,
    error: error.message || error.toString(),
    stack: error.stack,
    errorInfo
  });
}

// Get client monitoring stats
export function getClientStats() {
  return {
    totalLogs: logs.length,
    logs: logs.slice(-20), // Last 20 logs
    pageViews: logs.filter(log => log.method === 'PAGE_VIEW').length,
    apiCalls: logs.filter(log => log.method !== 'PAGE_VIEW' && log.method !== 'ERROR').length,
    errors: logs.filter(log => log.method === 'ERROR').length,
    averageResponseTime: logs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / logs.length
  };
}

// Initialize monitoring
export function initializeMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Track initial page view
  trackPageView();
  
  // Track performance after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(trackPagePerformance, 100);
    });
  } else {
    setTimeout(trackPagePerformance, 100);
  }
  
  // Track navigation changes (for SPA)
  let currentPath = window.location.pathname;
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackPageView(currentPath);
    }
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackPageView(currentPath);
    }
  };
  
  // Track popstate events
  window.addEventListener('popstate', () => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackPageView(currentPath);
    }
  });
  
  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), {
      type: 'unhandledRejection'
    });
  });
  
  console.log('🔍 Client-side monitoring initialized');
}

// Enable/disable monitoring
export function setMonitoringEnabled(enabled) {
  monitoringEnabled = enabled;
}

// Export for global access
if (typeof window !== 'undefined') {
  window.clientMonitor = {
    trackPageView,
    trackPagePerformance,
    trackError,
    getClientStats,
    setMonitoringEnabled,
    logs
  };
}