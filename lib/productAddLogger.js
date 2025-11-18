/**
 * Product Add Logger
 * Comprehensive logging system for admin/products/add operations
 */

import { query } from './database';

export class ProductAddLogger {
  /**
   * Log product submission attempt
   * @param {Object} logData - Log data
   * @param {string} logData.logType - Type of log (success, validation_error, system_error, field_submission)
   * @param {Object} logData.payload - Full form payload
   * @param {string} logData.adminEmail - Admin user email
   * @param {number} logData.adminUserId - Admin user ID
   * @param {string} logData.ipAddress - IP address
   * @param {number} logData.productId - Product ID (for success logs)
   * @param {string} logData.productName - Product name
   * @param {string} logData.errorMessage - Error message (for error logs)
   * @param {string} logData.stackTrace - Stack trace (for system errors)
   */
  static async log({
    logType,
    payload = null,
    adminEmail = null,
    adminUserId = null,
    ipAddress = null,
    productId = null,
    productName = null,
    errorMessage = null,
    stackTrace = null
  }) {
    try {
      const logQuery = `
        INSERT INTO product_add_logs (
          log_type, admin_user_id, admin_email, ip_address, endpoint,
          product_id, product_name, payload, error_message, stack_trace
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, timestamp
      `;

      const values = [
        logType,
        adminUserId,
        adminEmail,
        ipAddress,
        '/admin/products/add',
        productId,
        productName,
        payload ? JSON.stringify(payload) : null,
        errorMessage,
        stackTrace
      ];

      const result = await query(logQuery, values);
      
      // Also log to console for development
      const logEntry = {
        id: result.rows[0]?.id,
        timestamp: result.rows[0]?.timestamp,
        logType,
        adminEmail,
        productName,
        errorMessage: errorMessage?.substring(0, 100) + (errorMessage?.length > 100 ? '...' : ''),
        hasPayload: !!payload
      };

      console.log(`🏷️ [PRODUCT_ADD_LOG] ${logType.toUpperCase()}:`, logEntry);
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Failed to write product add log:', error);
      // Don't throw - logging failures shouldn't break the main operation
      return null;
    }
  }

  /**
   * Log successful product creation
   */
  static async logSuccess({ payload, adminEmail, adminUserId, ipAddress, productId, productName }) {
    return this.log({
      logType: 'success',
      payload,
      adminEmail,
      adminUserId,
      ipAddress,
      productId,
      productName
    });
  }

  /**
   * Log validation errors
   */
  static async logValidationError({ payload, adminEmail, adminUserId, ipAddress, errorMessage }) {
    return this.log({
      logType: 'validation_error',
      payload,
      adminEmail,
      adminUserId,
      ipAddress,
      errorMessage
    });
  }

  /**
   * Log system/database errors
   */
  static async logSystemError({ payload, adminEmail, adminUserId, ipAddress, errorMessage, stackTrace }) {
    return this.log({
      logType: 'system_error',
      payload,
      adminEmail,
      adminUserId,
      ipAddress,
      errorMessage,
      stackTrace
    });
  }

  /**
   * Log field submission for debugging
   */
  static async logFieldSubmission({ payload, adminEmail, adminUserId, ipAddress }) {
    return this.log({
      logType: 'field_submission',
      payload,
      adminEmail,
      adminUserId,
      ipAddress
    });
  }

  /**
   * Get recent logs for admin UI
   * @param {number} limit - Number of logs to retrieve
   * @param {string} logType - Filter by log type (optional)
   */
  static async getRecentLogs(limit = 50, logType = null) {
    try {
      let logQuery = `
        SELECT 
          id, timestamp, log_type, admin_email, product_id, product_name,
          error_message, ip_address,
          CASE 
            WHEN payload IS NOT NULL THEN true 
            ELSE false 
          END as has_payload
        FROM product_add_logs
      `;

      const values = [limit];
      
      if (logType) {
        logQuery += ` WHERE log_type = $2`;
        values.push(logType);
      }

      logQuery += ` ORDER BY timestamp DESC LIMIT $1`;

      const result = await query(logQuery, values);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to retrieve product add logs:', error);
      return [];
    }
  }

  /**
   * Get log statistics for admin dashboard
   */
  static async getLogStats() {
    try {
      const statsQuery = `
        SELECT 
          log_type,
          COUNT(*) as count,
          MAX(timestamp) as last_occurrence
        FROM product_add_logs
        WHERE timestamp >= NOW() - INTERVAL '24 hours'
        GROUP BY log_type
        ORDER BY count DESC
      `;

      const result = await query(statsQuery);
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to retrieve log stats:', error);
      return [];
    }
  }

  /**
   * Extract IP address from request
   */
  static getIpAddress(req) {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           'unknown';
  }

  /**
   * Extract admin user info from request (if available)
   */
  static getAdminInfo(req) {
    // This would typically come from authentication middleware
    // For now, return demo data - you can enhance this based on your auth system
    return {
      adminUserId: null, // req.user?.id
      adminEmail: 'admin@gamava.com' // req.user?.email || 'admin@gamava.com'
    };
  }
}