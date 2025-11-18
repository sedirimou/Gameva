/**
 * API Monitoring Dashboard API
 * Provides monitoring data for admin dashboard
 */

import { apiMonitor } from '../../../lib/apiMonitor';
import { requireAdmin } from '../../../lib/auth';

// Access the global monitoring instance from middleware
let globalMonitoringData = null;

// Helper function to get monitoring data
function getMonitoringData() {
  try {
    // First try to get data from apiMonitor instance
    const apiData = apiMonitor.getDashboardData();
    
    // If apiData has logs, use it; otherwise return default structure
    if (apiData && apiData.recentLogs && apiData.recentLogs.length > 0) {
      return apiData;
    }
    
    // Return default structure with no logs
    return {
      metrics: {
        totalRequests: 0,
        totalResponseTime: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0
      },
      recentLogs: [],
      failedEndpoints: [],
      systemStatus: {
        status: 'healthy',
        issues: [],
        errorRate: 0,
        avgResponseTime: 0
      }
    };
  } catch (error) {
    console.error('Error getting monitoring data:', error);
    return {
      metrics: {
        totalRequests: 0,
        totalResponseTime: 0,
        successCount: 0,
        errorCount: 0,
        averageResponseTime: 0
      },
      recentLogs: [],
      failedEndpoints: [],
      systemStatus: {
        status: 'healthy',
        issues: [],
        errorRate: 0,
        avgResponseTime: 0
      }
    };
  }
}

export default async function handler(req, res) {
  try {
    // Require admin authentication
    const user = await requireAdmin(req, res);
    if (!user) {
      return; // requireAdmin already sent the error response
    }

    if (req.method === 'GET') {
      // Get monitoring dashboard data
      const dashboardData = getMonitoringData();
      
      // Add additional system information
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : 0,
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        ...dashboardData,
        systemInfo
      });

    } else if (req.method === 'DELETE') {
      // Clear monitoring data
      apiMonitor.reset();
      
      return res.status(200).json({ 
        message: 'Monitoring data cleared successfully' 
      });

    } else if (req.method === 'POST') {
      // Add custom log entry
      const { method, path, status, responseTime, category, message } = req.body;
      
      if (!method || !path || !status) {
        return res.status(400).json({ 
          error: 'Missing required fields: method, path, status' 
        });
      }

      const logEntry = apiMonitor.logRequest({
        method,
        path,
        status,
        responseTime: responseTime || 0,
        category: category || 'custom',
        message,
        userAgent: req.headers['user-agent'] || 'Manual Entry',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown',
        userId: req.user?.id,
        sessionId: req.headers['x-session-id']
      });

      return res.status(201).json({
        message: 'Log entry added successfully',
        logEntry
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Monitoring API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}