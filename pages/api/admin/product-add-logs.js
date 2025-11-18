import { ProductAddLogger } from '../../../lib/productAddLogger.js';
import { monitorAPIRoute } from '../../../lib/apiMonitor.js';

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { limit = 50, type } = req.query;
      
      // Get recent logs
      const logs = await ProductAddLogger.getRecentLogs(parseInt(limit), type || null);
      
      // Get log statistics
      const stats = await ProductAddLogger.getLogStats();
      
      res.status(200).json({
        success: true,
        logs,
        stats,
        total: logs.length
      });
      
    } catch (error) {
      console.error('Failed to fetch product add logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch logs',
        details: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default monitorAPIRoute(handler);