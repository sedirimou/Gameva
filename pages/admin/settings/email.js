import { useState, useEffect } from 'react';
import { showAdminNotification } from '../../../components/admin/AdminNotification';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function EmailSettingsPage() {
  const [formData, setFormData] = useState({
    mailer: 'SMTP',
    port: '587',
    host: 'smtp.gmail.com',
    username: '',
    password: '',
    localDomain: '',
    senderName: '',
    senderEmail: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  // Load existing configuration on mount
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const response = await fetch('/api/admin/email-config');
      if (response.ok) {
        const config = await response.json();
        setFormData(prevData => ({
          ...prevData,
          ...config
        }));
      }
    } catch (error) {
      console.log('No existing config found, using defaults');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-update configuration based on provider selection
    if (field === 'host') {
      if (value.includes('gmail')) {
        setFormData(prev => ({
          ...prev,
          port: '587',
          mailer: 'SMTP'
        }));
      } else if (value.includes('outlook') || value.includes('hotmail')) {
        setFormData(prev => ({
          ...prev,
          port: '587',
          mailer: 'SMTP'
        }));
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        showAdminNotification('success', 'Settings Saved', 'Email configuration updated successfully');
      } else {
        showAdminNotification('error', 'Save Failed', data.message || 'Failed to save configuration');
      }
    } catch (error) {
      showAdminNotification('error', 'Save Error', 'Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      showAdminNotification('error', 'Email Required', 'Please enter a test email address');
      return;
    }

    setTestLoading(true);
    try {
      // First save current settings
      await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // Then send test email
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: testEmail,
          useCurrentConfig: true 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showAdminNotification('success', 'Test Email Sent', 
          `Test email sent successfully to ${testEmail}`);
        setTestEmail('');
      } else {
        showAdminNotification('error', 'Test Failed', data.message || 'Failed to send test email');
      }
    } catch (error) {
      showAdminNotification('error', 'Test Error', 'Failed to send test email');
    } finally {
      setTestLoading(false);
    }
  };

  const quickSetupGmail = () => {
    setFormData(prev => ({
      ...prev,
      mailer: 'SMTP',
      port: '587',
      host: 'smtp.gmail.com',
      localDomain: ''
    }));
    showAdminNotification('info', 'Gmail Setup', 'Gmail SMTP configuration applied. Please enter your credentials.');
  };

  const quickSetupOutlook = () => {
    setFormData(prev => ({
      ...prev,
      mailer: 'SMTP',
      port: '587',
      host: 'smtp-mail.outlook.com',
      localDomain: ''
    }));
    showAdminNotification('info', 'Outlook Setup', 'Outlook SMTP configuration applied. Please enter your credentials.');
  };

  const quickSetupCustom = () => {
    setFormData(prev => ({
      ...prev,
      mailer: 'SMTP',
      port: '587',
      host: '',
      localDomain: 'your-domain.com'
    }));
    showAdminNotification('info', 'Custom Setup', 'Custom domain configuration template applied.');
  };

  return (
    <AdminLayout currentPage="Email Settings" title="Email Settings - Admin - Gamava">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure SMTP email service for your application</p>
        </div>

        {/* Quick Setup Options */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={quickSetupGmail}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg transition-colors duration-200 text-center"
            >
              <div className="font-semibold">Gmail</div>
              <div className="text-sm opacity-90">smtp.gmail.com:587</div>
            </button>
            <button
              onClick={quickSetupOutlook}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors duration-200 text-center"
            >
              <div className="font-semibold">Outlook</div>
              <div className="text-sm opacity-90">smtp-mail.outlook.com:587</div>
            </button>
            <button
              onClick={quickSetupCustom}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors duration-200 text-center"
            >
              <div className="font-semibold">Custom Domain</div>
              <div className="text-sm opacity-90">Your own SMTP server</div>
            </button>
          </div>
        </div>

        {/* SMTP Configuration Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">SMTP Configuration</h2>
          
          <div className="space-y-6">
            {/* Mailer */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Mailer
              </label>
              <select
                value={formData.mailer}
                onChange={(e) => handleInputChange('mailer', e.target.value)}
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SMTP">SMTP</option>
              </select>
            </div>

            {/* Port */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Port
              </label>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => handleInputChange('port', e.target.value)}
                placeholder="Ex: 587"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">The port used by your mail server (common ports: 25, 465, 587)</p>
            </div>

            {/* Host */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Host
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                placeholder="Ex: smtp.gmail.com"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">SMTP host address</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Username to login to mail server"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your mail server login username</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Your mail server login password"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your mail server login password</p>
            </div>

            {/* Local Domain */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Local domain
              </label>
              <input
                type="text"
                value={formData.localDomain}
                onChange={(e) => handleInputChange('localDomain', e.target.value)}
                placeholder="It can be empty. Needs to set to your domain when using SMTP Relay. E.g. your-domain.com"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">The domain that will be used to identify the server when communicating with remote SMTP servers</p>
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Sender name
              </label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => handleInputChange('senderName', e.target.value)}
                placeholder="Name"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">The name that will appear in the From field of emails sent by the system</p>
            </div>

            {/* Sender Email */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Sender email
              </label>
              <input
                type="email"
                value={formData.senderEmail}
                onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                placeholder="Email address (e.g. admin@example.com)"
                className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">The email address that will be used as the sender for all emails sent by the system</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save settings</span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendTestEmail}
                disabled={testLoading || !testEmail}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {testLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send test email</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Tips */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SMTP Configuration Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">Gmail Setup</h4>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>• Host: smtp.gmail.com</li>
                <li>• Port: 587 (TLS) or 465 (SSL)</li>
                <li>• Use App Password instead of regular password</li>
                <li>• Enable 2-factor authentication first</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">Outlook/Hotmail</h4>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>• Host: smtp-mail.outlook.com</li>
                <li>• Port: 587 (TLS)</li>
                <li>• Use your full email as username</li>
                <li>• Regular password or App Password</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">Custom Domain</h4>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                <li>• Contact your hosting provider for SMTP details</li>
                <li>• Common ports: 587 (TLS), 465 (SSL), 25 (unsecure)</li>
                <li>• Set local domain to your website domain</li>
                <li>• Use proper authentication credentials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}