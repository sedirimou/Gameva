import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import AdminLayout from '../../../components/layout/AdminLayout';
import { handleApiError, handleApiSuccess } from '../../../lib/errorHandler';

export default function CookieConsentPage() {
  const [ckEditorLoaded, setCkEditorLoaded] = useState(false);
  const essentialEditorRef = useRef(null);
  const analyticsEditorRef = useRef(null);
  const marketingEditorRef = useRef(null);
  
  const [settings, setSettings] = useState({
    banner_title: 'We use cookies',
    banner_description: 'This website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it.',
    accept_all_text: 'Accept all',
    accept_necessary_text: 'Accept only essential',
    settings_text: 'Preferences',
    close_text: 'Close',
    position: 'bottom',
    layout: 'box',
    transition: 'slide',
    theme_color: '#153e8f',
    button_color: '#29adb2',
    is_enabled: true,
    essential_cookies_description: 'Required for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility.',
    analytics_cookies_description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    marketing_cookies_description: 'Used to deliver personalized advertisements and track the effectiveness of advertising campaigns.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/cookie-consent');
      if (response.ok) {
        const data = await response.json();
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch cookie consent settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Ensure CKEditor data is synced to settings before submission
      const finalSettings = { ...settings };
      
      if (window.CKEDITOR) {
        if (window.CKEDITOR.instances['essential-editor']) {
          finalSettings.essential_cookies_description = window.CKEDITOR.instances['essential-editor'].getData();
        }
        if (window.CKEDITOR.instances['analytics-editor']) {
          finalSettings.analytics_cookies_description = window.CKEDITOR.instances['analytics-editor'].getData();
        }
        if (window.CKEDITOR.instances['marketing-editor']) {
          finalSettings.marketing_cookies_description = window.CKEDITOR.instances['marketing-editor'].getData();
        }
      }

      console.log('Submitting settings:', finalSettings);

      const response = await fetch('/api/admin/cookie-consent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalSettings),
      });

      if (response.ok) {
        handleApiSuccess('Cookie consent settings updated successfully');
        // Refresh settings from server to ensure UI is in sync
        await fetchSettings();
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      handleApiError(error, 'Failed to update cookie consent settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const initializeCKEditor = () => {
    if (typeof window !== 'undefined' && window.CKEDITOR && ckEditorLoaded) {
      // Initialize Essential Cookies editor
      if (essentialEditorRef.current && !window.CKEDITOR.instances['essential-editor']) {
        const essentialEditor = window.CKEDITOR.replace('essential-editor', {
          height: 150,
          toolbar: [
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
            { name: 'links', items: ['Link', 'Unlink'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
            { name: 'tools', items: ['Source'] }
          ]
        });

        essentialEditor.on('instanceReady', () => {
          essentialEditor.setData(settings.essential_cookies_description || '');
        });

        essentialEditor.on('change', () => {
          handleInputChange('essential_cookies_description', essentialEditor.getData());
        });
      }

      // Initialize Analytics Cookies editor
      if (analyticsEditorRef.current && !window.CKEDITOR.instances['analytics-editor']) {
        const analyticsEditor = window.CKEDITOR.replace('analytics-editor', {
          height: 150,
          toolbar: [
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
            { name: 'links', items: ['Link', 'Unlink'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
            { name: 'tools', items: ['Source'] }
          ]
        });

        analyticsEditor.on('instanceReady', () => {
          analyticsEditor.setData(settings.analytics_cookies_description || '');
        });

        analyticsEditor.on('change', () => {
          handleInputChange('analytics_cookies_description', analyticsEditor.getData());
        });
      }

      // Initialize Marketing Cookies editor
      if (marketingEditorRef.current && !window.CKEDITOR.instances['marketing-editor']) {
        const marketingEditor = window.CKEDITOR.replace('marketing-editor', {
          height: 150,
          toolbar: [
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
            { name: 'links', items: ['Link', 'Unlink'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
            { name: 'tools', items: ['Source'] }
          ]
        });

        marketingEditor.on('instanceReady', () => {
          marketingEditor.setData(settings.marketing_cookies_description || '');
        });

        marketingEditor.on('change', () => {
          handleInputChange('marketing_cookies_description', marketingEditor.getData());
        });
      }
    }
  };

  useEffect(() => {
    if (ckEditorLoaded && !loading) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(initializeCKEditor, 100);
      return () => clearTimeout(timer);
    }
  }, [ckEditorLoaded, loading]); // Removed settings dependency to prevent re-initialization

  const handleCKEditorLoad = () => {
    if (typeof window !== 'undefined' && window.CKEDITOR) {
      // Disable version check notifications
      window.CKEDITOR.config.versionCheck = false;
      setCkEditorLoaded(true);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cookie settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Cookie Consent Settings - Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cookie Consent Settings
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Enable Cookie Banner:</span>
            <button
              type="button"
              onClick={() => handleInputChange('is_enabled', !settings.is_enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.is_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.is_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Banner Content */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Banner Content
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={settings.banner_title}
                  onChange={(e) => handleInputChange('banner_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="We use cookies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Banner Description
                </label>
                <textarea
                  value={settings.banner_description}
                  onChange={(e) => handleInputChange('banner_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="This website uses cookies..."
                />
              </div>
            </div>
          </div>

          {/* Button Labels */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Button Labels
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Accept All Button
                </label>
                <input
                  type="text"
                  value={settings.accept_all_text}
                  onChange={(e) => handleInputChange('accept_all_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Accept all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Accept Essential Button
                </label>
                <input
                  type="text"
                  value={settings.accept_necessary_text}
                  onChange={(e) => handleInputChange('accept_necessary_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Accept only essential"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Settings Button
                </label>
                <input
                  type="text"
                  value={settings.settings_text}
                  onChange={(e) => handleInputChange('settings_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Preferences"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Close Button
                </label>
                <input
                  type="text"
                  value={settings.close_text}
                  onChange={(e) => handleInputChange('close_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Close"
                />
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Appearance & Position
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Position
                </label>
                <select
                  value={settings.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="bottom">Bottom</option>
                  <option value="top">Top</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Layout
                </label>
                <select
                  value={settings.layout}
                  onChange={(e) => handleInputChange('layout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="box">Box</option>
                  <option value="cloud">Cloud</option>
                  <option value="bar">Bar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Transition
                </label>
                <select
                  value={settings.transition}
                  onChange={(e) => handleInputChange('transition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Color Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Color Theme
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Theme Color (Banner Background)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <input
                    type="text"
                    value={settings.theme_color}
                    onChange={(e) => handleInputChange('theme_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="#153e8f"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Button Color (Accept Button)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.button_color}
                    onChange={(e) => handleInputChange('button_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <input
                    type="text"
                    value={settings.button_color}
                    onChange={(e) => handleInputChange('button_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="#29adb2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cookie Category Descriptions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cookie Category Descriptions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Customize the descriptions for each cookie category that appear in the preferences popup. You can include links and formatting.
            </p>
            
            <div className="space-y-6">
              {/* Essential Cookies */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Essential Cookies Description
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                  <textarea
                    ref={essentialEditorRef}
                    id="essential-editor"
                    defaultValue={settings.essential_cookies_description}
                    className="w-full min-h-[150px] p-3 border-0 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Required for the website to function properly..."
                  />
                </div>
                {!ckEditorLoaded && (
                  <p className="text-xs text-gray-500 mt-1">Loading editor...</p>
                )}
              </div>

              {/* Analytics Cookies */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Analytics Cookies Description
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                  <textarea
                    ref={analyticsEditorRef}
                    id="analytics-editor"
                    defaultValue={settings.analytics_cookies_description}
                    className="w-full min-h-[150px] p-3 border-0 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Help us understand how visitors interact..."
                  />
                </div>
                {!ckEditorLoaded && (
                  <p className="text-xs text-gray-500 mt-1">Loading editor...</p>
                )}
              </div>

              {/* Marketing Cookies */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Marketing Cookies Description
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                  <textarea
                    ref={marketingEditorRef}
                    id="marketing-editor"
                    defaultValue={settings.marketing_cookies_description}
                    className="w-full min-h-[150px] p-3 border-0 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Used to deliver personalized advertisements..."
                  />
                </div>
                {!ckEditorLoaded && (
                  <p className="text-xs text-gray-500 mt-1">Loading editor...</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>


      </div>

      {/* CKEditor Script */}
      <Script 
        src="/ckeditor/ckeditor.js" 
        strategy="afterInteractive"
        onLoad={handleCKEditorLoad}
      />
    </AdminLayout>
  );
}