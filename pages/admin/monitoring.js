/**
 * Admin Monitoring Dashboard
 * Displays comprehensive API monitoring data
 */

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { monitoredFetch } from '../../lib/apiMonitor';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/ui/CustomModal';

export default function MonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { modal, confirm, error: modalError, success } = useModal();

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      const response = await monitoredFetch('/api/admin/monitoring');
      if (!response.ok) throw new Error('Failed to fetch monitoring data');
      const data = await response.json();
      setMonitoringData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear monitoring data
  const clearMonitoringData = async () => {
    const confirmed = await confirm(
      'Clear Monitoring Data',
      'Are you sure you want to clear all monitoring data? This action cannot be undone and will remove all logs, metrics, and performance data.',
      'Clear Data',
      'Cancel'
    );
    
    if (!confirmed) return;
    
    try {
      const response = await monitoredFetch('/api/admin/monitoring', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to clear monitoring data');
      await fetchMonitoringData();
      await success('Monitoring data cleared successfully');
    } catch (err) {
      await modalError('Failed to clear monitoring data: ' + err.message);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Get status color
  const getStatusColor = (status) => {
    if (status >= 500) return 'text-red-600';
    if (status >= 400) return 'text-yellow-600';
    if (status >= 300) return 'text-blue-600';
    return 'text-green-600';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      admin: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
      api: 'bg-purple-100 text-purple-800',
      external: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Get performance color
  const getPerformanceColor = (responseTime) => {
    if (responseTime < 500) return 'text-green-600';
    if (responseTime < 1000) return 'text-yellow-600';
    if (responseTime < 2000) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading monitoring data: {error}
        </div>
      </AdminLayout>
    );
  }

  const { metrics, recentLogs, failedEndpoints, systemStatus, systemInfo } = monitoringData || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Monitoring Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                autoRefresh 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={fetchMonitoringData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Refresh
            </button>
            <button
              onClick={clearMonitoringData}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Clear Data
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                systemStatus?.status === 'healthy' ? 'text-green-600 dark:text-green-400' : 
                systemStatus?.status === 'degraded' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {systemStatus?.status?.toUpperCase() || 'UNKNOWN'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{systemStatus?.totalRequests || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{systemStatus?.avgResponseTime || '0ms'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{systemStatus?.errorRate || 'NaN%'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
            </div>
          </div>
          
          {systemStatus?.issues && systemStatus.issues.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-semibold text-yellow-800">Issues Detected:</h3>
              <ul className="list-disc list-inside text-yellow-700">
                {systemStatus.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{metrics?.totalRequests || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{metrics?.successCount || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{metrics?.errorCount || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{metrics?.averageResponseTime?.toFixed(0) || 0}ms</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{systemInfo?.uptime?.toFixed(0) || 0}s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent API Calls</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentLogs && recentLogs.length > 0 ? (
                  recentLogs.slice().reverse().map((log, index) => (
                    <tr key={log.id || index} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {log.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 truncate max-w-xs">
                        {log.path}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getPerformanceColor(log.responseTime)}`}>
                        {log.responseTime}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No recent logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Failed Endpoints */}
        {failedEndpoints && failedEndpoints.length > 0 && (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Failed Endpoints</h2>
            <div className="space-y-4">
              {failedEndpoints.map((endpoint, index) => (
                <div key={index} className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-300">{endpoint.endpoint}</h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Failed {endpoint.count} times
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-400">
                        First failure: {new Date(endpoint.firstFailure).toLocaleString()}
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-400">
                        Last failure: {new Date(endpoint.lastFailure).toLocaleString()}
                      </p>
                    </div>
                    <span className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm">
                      {endpoint.count} failures
                    </span>
                  </div>
                  
                  {endpoint.errors && endpoint.errors.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-red-700 dark:text-red-300">Recent Errors:</h4>
                      <div className="mt-1 space-y-1">
                        {endpoint.errors.slice(-3).map((error, errorIndex) => (
                          <div key={errorIndex} className="text-xs text-red-600 dark:text-red-400">
                            {new Date(error.timestamp).toLocaleTimeString()} - Status: {error.status}
                            {error.error && ` - ${error.error}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Runtime</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Node.js {systemInfo?.nodeVersion}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform: {systemInfo?.platform}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uptime: {systemInfo?.uptime?.toFixed(0)}s</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Memory Usage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                RSS: {((systemInfo?.memoryUsage?.rss || 0) / 1024 / 1024).toFixed(1)}MB
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Heap Used: {((systemInfo?.memoryUsage?.heapUsed || 0) / 1024 / 1024).toFixed(1)}MB
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Heap Total: {((systemInfo?.memoryUsage?.heapTotal || 0) / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={modal.onCancel}
        onConfirm={modal.onConfirm}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        variant={modal.variant}
        showCancel={modal.showCancel}
        inputValue={modal.inputValue}
        onInputChange={(value) => modal.setInputValue && modal.setInputValue(value)}
        inputPlaceholder={modal.inputPlaceholder}
      />
    </AdminLayout>
  );
}