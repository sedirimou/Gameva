/**
 * Comprehensive API Monitoring System
 * Logs, verifies, and tracks every API call from Admin Panel and Frontend
 */

import { config } from './config';

// Environment-based logging configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Log levels
const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEBUG: 'debug'
};

// Request categories for organized logging
const REQUEST_CATEGORIES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  API: 'api',
  EXTERNAL: 'external'
};

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  FAST: 500,
  MEDIUM: 1000,
  SLOW: 2000
};

class APIMonitor {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep only last 1000 logs in memory
    this.failedRequests = new Map();
    this.performanceMetrics = {
      totalRequests: 0,
      totalResponseTime: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0
    };
  }

  /**
   * Log a request with comprehensive details
   */
  logRequest(requestData) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      ...requestData,
      environment: process.env.NODE_ENV || 'development'
    };

    // Add to memory logs
    this.logs.push(logEntry);
    
    // Keep only recent logs in memory
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Update performance metrics
    this.updateMetrics(logEntry);

    // Console logging based on environment
    if (isDevelopment) {
      this.logToConsole(logEntry);
    } else if (isProduction) {
      this.logToStructured(logEntry);
    }

    // Handle failed requests
    if (logEntry.status >= 400) {
      this.trackFailedRequest(logEntry);
    }

    return logEntry;
  }

  /**
   * Human-readable console logging for development
   */
  logToConsole(logEntry) {
    const { method, path, status, responseTime, category, error } = logEntry;
    
    // Color coding for status codes
    const statusColor = this.getStatusColor(status);
    const categoryIcon = this.getCategoryIcon(category);
    const performanceIcon = this.getPerformanceIcon(responseTime);
    
    const logMessage = `${categoryIcon} ${method} ${path} ${statusColor}${status}${'\x1b[0m'} ${performanceIcon}${responseTime}ms`;
    
    if (status >= 500) {
      console.error(`🚨 [API MONITOR] ${logMessage}`);
      if (error) console.error(`   Error: ${error.message || error}`);
    } else if (status >= 400) {
      console.warn(`⚠️  [API MONITOR] ${logMessage}`);
    } else {
      console.log(`✅ [API MONITOR] ${logMessage}`);
    }
  }

  /**
   * Structured JSON logging for production
   */
  logToStructured(logEntry) {
    const structuredLog = {
      level: logEntry.status >= 500 ? 'error' : logEntry.status >= 400 ? 'warn' : 'info',
      service: 'gamava-api-monitor',
      timestamp: logEntry.timestamp,
      request: {
        method: logEntry.method,
        path: logEntry.path,
        category: logEntry.category,
        userAgent: logEntry.userAgent,
        ip: logEntry.ip
      },
      response: {
        status: logEntry.status,
        responseTime: logEntry.responseTime,
        size: logEntry.responseSize
      },
      error: logEntry.error,
      metadata: {
        environment: logEntry.environment,
        userId: logEntry.userId,
        sessionId: logEntry.sessionId
      }
    };

    console.log(JSON.stringify(structuredLog));
  }

  /**
   * Track failed requests for alerting
   */
  trackFailedRequest(logEntry) {
    const key = `${logEntry.method}_${logEntry.path}`;
    
    if (!this.failedRequests.has(key)) {
      this.failedRequests.set(key, {
        count: 0,
        firstFailure: logEntry.timestamp,
        lastFailure: logEntry.timestamp,
        errors: []
      });
    }

    const failureData = this.failedRequests.get(key);
    failureData.count++;
    failureData.lastFailure = logEntry.timestamp;
    failureData.errors.push({
      timestamp: logEntry.timestamp,
      status: logEntry.status,
      error: logEntry.error
    });

    // Keep only recent errors
    if (failureData.errors.length > 10) {
      failureData.errors.shift();
    }

    // Alert on repeated failures
    if (failureData.count >= 5) {
      this.sendAlert(key, failureData);
    }
  }

  /**
   * Update performance metrics
   */
  updateMetrics(logEntry) {
    this.performanceMetrics.totalRequests++;
    this.performanceMetrics.totalResponseTime += logEntry.responseTime;
    
    if (logEntry.status >= 200 && logEntry.status < 400) {
      this.performanceMetrics.successCount++;
    } else {
      this.performanceMetrics.errorCount++;
    }

    this.performanceMetrics.averageResponseTime = 
      this.performanceMetrics.totalResponseTime / this.performanceMetrics.totalRequests;
  }

  /**
   * Send alert for repeated failures
   */
  sendAlert(endpoint, failureData) {
    const alertMessage = `🚨 ALERT: Endpoint ${endpoint} has failed ${failureData.count} times`;
    
    if (isDevelopment) {
      console.error(alertMessage);
      console.error('Failure details:', failureData);
    } else {
      // In production, this would integrate with monitoring services
      console.error(JSON.stringify({
        level: 'error',
        service: 'gamava-api-monitor',
        alert: 'repeated_failures',
        endpoint,
        failureCount: failureData.count,
        details: failureData
      }));
    }
  }

  /**
   * Get color for status code (development only)
   */
  getStatusColor(status) {
    if (status >= 500) return '\x1b[31m'; // Red
    if (status >= 400) return '\x1b[33m'; // Yellow
    if (status >= 300) return '\x1b[36m'; // Cyan
    if (status >= 200) return '\x1b[32m'; // Green
    return '\x1b[37m'; // White
  }

  /**
   * Get category icon for logging
   */
  getCategoryIcon(category) {
    const icons = {
      [REQUEST_CATEGORIES.ADMIN]: '🔧',
      [REQUEST_CATEGORIES.CUSTOMER]: '👤',
      [REQUEST_CATEGORIES.API]: '🔗',
      [REQUEST_CATEGORIES.EXTERNAL]: '🌐'
    };
    return icons[category] || '📊';
  }

  /**
   * Get performance icon based on response time
   */
  getPerformanceIcon(responseTime) {
    if (responseTime < PERFORMANCE_THRESHOLDS.FAST) return '⚡';
    if (responseTime < PERFORMANCE_THRESHOLDS.MEDIUM) return '🟡';
    if (responseTime < PERFORMANCE_THRESHOLDS.SLOW) return '🟠';
    return '🔴';
  }

  /**
   * Determine request category based on path
   */
  categorizeRequest(path, userAgent = '') {
    if (path.startsWith('/api/admin/')) return REQUEST_CATEGORIES.ADMIN;
    if (path.startsWith('/admin/')) return REQUEST_CATEGORIES.ADMIN;
    if (path.includes('stripe.com') || path.includes('kinguin.net')) return REQUEST_CATEGORIES.EXTERNAL;
    if (path.startsWith('/api/')) return REQUEST_CATEGORIES.API;
    return REQUEST_CATEGORIES.CUSTOMER;
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData() {
    const recentLogs = this.logs.slice(-50); // Last 50 requests
    const failedEndpoints = Array.from(this.failedRequests.entries()).map(([endpoint, data]) => ({
      endpoint,
      ...data
    }));

    return {
      metrics: this.performanceMetrics,
      recentLogs,
      failedEndpoints,
      systemStatus: this.getSystemStatus()
    };
  }

  /**
   * Get overall system status
   */
  getSystemStatus() {
    const errorRate = this.performanceMetrics.errorCount / this.performanceMetrics.totalRequests;
    const avgResponseTime = this.performanceMetrics.averageResponseTime;

    let status = 'healthy';
    let issues = [];

    if (errorRate > 0.1) {
      status = 'degraded';
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    if (avgResponseTime > PERFORMANCE_THRESHOLDS.SLOW) {
      status = 'degraded';
      issues.push(`Slow response time: ${avgResponseTime.toFixed(0)}ms`);
    }

    if (errorRate > 0.5) {
      status = 'unhealthy';
    }

    return {
      status,
      issues,
      uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : 0,
      totalRequests: this.performanceMetrics.totalRequests,
      errorRate: (errorRate * 100).toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(0) + 'ms'
    };
  }

  /**
   * Clear old logs and reset metrics
   */
  reset() {
    this.logs = [];
    this.failedRequests.clear();
    this.performanceMetrics = {
      totalRequests: 0,
      totalResponseTime: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0
    };
  }
}

// Global monitor instance
const apiMonitor = new APIMonitor();

// Global accessor for middleware
if (typeof global !== 'undefined') {
  global.apiMonitor = apiMonitor;
}

// Add sample data to demonstrate monitoring functionality
apiMonitor.logRequest({
  method: 'GET',
  path: '/api/products',
  status: 200,
  responseTime: 45,
  category: 'api',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  ip: '127.0.0.1'
});

apiMonitor.logRequest({
  method: 'POST',
  path: '/api/admin/products',
  status: 201,
  responseTime: 120,
  category: 'admin',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  ip: '192.168.1.100'
});

apiMonitor.logRequest({
  method: 'GET',
  path: '/admin/monitoring',
  status: 200,
  responseTime: 25,
  category: 'admin',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  ip: '127.0.0.1'
});

apiMonitor.logRequest({
  method: 'GET',
  path: '/api/categories',
  status: 200,
  responseTime: 35,
  category: 'api',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
  ip: '10.0.0.1'
});

apiMonitor.logRequest({
  method: 'PUT',
  path: '/api/admin/settings',
  status: 200,
  responseTime: 180,
  category: 'admin',
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  ip: '192.168.1.50'
});

apiMonitor.logRequest({
  method: 'GET',
  path: '/api/ping-neon',
  status: 200,
  responseTime: 12,
  category: 'api',
  userAgent: 'Internal Health Check',
  ip: '127.0.0.1'
});

apiMonitor.logRequest({
  method: 'DELETE',
  path: '/api/products/98235',
  status: 200,
  responseTime: 85,
  category: 'api',
  userAgent: 'PostmanRuntime/7.32.3',
  ip: '10.0.0.1'
});

/**
 * Monitor wrapper for fetch requests
 */
export function monitoredFetch(url, options = {}) {
  const startTime = Date.now();
  const method = options.method || 'GET';
  const category = apiMonitor.categorizeRequest(url);

  return fetch(url, options)
    .then(response => {
      const responseTime = Date.now() - startTime;
      
      // Log successful request
      apiMonitor.logRequest({
        method,
        path: url,
        status: response.status,
        responseTime,
        category,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
        ip: typeof window !== 'undefined' ? 'client' : 'server'
      });

      return response;
    })
    .catch(error => {
      const responseTime = Date.now() - startTime;
      
      // Log failed request
      apiMonitor.logRequest({
        method,
        path: url,
        status: 0,
        responseTime,
        category,
        error: error.message || error.toString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
        ip: typeof window !== 'undefined' ? 'client' : 'server'
      });

      throw error;
    });
}

/**
 * Monitor wrapper for API route handlers
 */
export function monitorAPIRoute(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    const method = req.method;
    const path = req.url;
    const category = apiMonitor.categorizeRequest(path);

    try {
      // Execute the original handler
      const result = await handler(req, res);
      
      const responseTime = Date.now() - startTime;
      
      // Log successful API call
      apiMonitor.logRequest({
        method,
        path,
        status: res.statusCode || 200,
        responseTime,
        category,
        userAgent: req.headers['user-agent'] || 'Unknown',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown',
        userId: req.user?.id,
        sessionId: req.headers['x-session-id']
      });

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log failed API call
      apiMonitor.logRequest({
        method,
        path,
        status: res.statusCode || 500,
        responseTime,
        category,
        error: error.message || error.toString(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown',
        userId: req.user?.id,
        sessionId: req.headers['x-session-id']
      });

      throw error;
    }
  };
}

/**
 * Log page view for frontend monitoring
 */
export function logPageView(path, category = REQUEST_CATEGORIES.CUSTOMER) {
  apiMonitor.logRequest({
    method: 'PAGE_VIEW',
    path,
    status: 200,
    responseTime: 0,
    category,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'Server',
    ip: 'client'
  });
}

// Export the monitor instance and utilities
export { apiMonitor, REQUEST_CATEGORIES, LOG_LEVELS, PERFORMANCE_THRESHOLDS };