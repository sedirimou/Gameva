/**
 * LeeCMS Admin Page Editor
 * Integrated with existing admin panel for editing static pages with LeeCMS
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminLayout from '../../../../components/layout/AdminLayout';
import LeeCMSBuilder from '../../../../components/cms/LeeCMSBuilder';
import LeeCMSRenderer from '../../../../components/cms/LeeCMSRenderer';
import AdminInput from '../../../../components/admin/AdminInput';
import AdminSelect from '../../../../components/admin/AdminSelect';
import { monitoredFetch } from '../../../../lib/clientMonitor';
import { handleApiError, handleApiSuccess } from '../../../../lib/errorHandler';

export default function EditPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [page, setPage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [pageSettings, setPageSettings] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    page_category_id: '',
    is_active: true
  });
  const [leecmsContent, setLeecmsContent] = useState([]);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (slug) {
      // Special case: Help Center has its own admin interface
      if (slug === 'help-center') {
        router.push('/admin/footer/pages/help-center');
        return;
      }
      fetchPage();
      fetchCategories();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      console.log('Fetching page with slug:', slug);
      
      // First try to find by slug in the general pages endpoint
      let response = await monitoredFetch(`/api/admin/pages`);
      let pageData = null;
      
      if (response.ok) {
        const data = await response.json();
        pageData = data.pages && data.pages.find(p => p.slug === slug || p.id === slug);
      }
      
      if (!pageData) {
        // Try by ID if slug doesn't work
        response = await monitoredFetch(`/api/admin/pages/${slug}`);
        if (response.ok) {
          const data = await response.json();
          pageData = data.page;
        }
      }
      
      if (!pageData) {
        handleApiError(null, 'Page not found');
        router.push('/admin/footer/pages');
        return;
      }
      
      console.log('Found page data:', pageData);
        
        setPage(pageData);
        setPageSettings({
          title: pageData.title || '',
          slug: pageData.slug || '',
          meta_title: pageData.meta_title || '',
          meta_description: pageData.meta_description || '',
          page_category_id: pageData.page_category_id || '',
          is_active: pageData.is_active !== false
        });

      // Parse LeeCMS content
      if (pageData.content_json) {
        try {
          const content = typeof pageData.content_json === 'string' 
            ? JSON.parse(pageData.content_json) 
            : pageData.content_json;
          console.log('Parsed LeeCMS content:', content);
          setLeecmsContent(Array.isArray(content) ? content : []);
        } catch (error) {
          console.error('Error parsing LeeCMS content:', error);
          setLeecmsContent([]);
        }
      } else {
        console.log('No content_json found, setting empty array');
        setLeecmsContent([]);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch page');
      router.push('/admin/footer/pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await monitoredFetch('/api/admin/page-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSaveContent = async (content) => {
    try {
      setSaving(true);
      
      const updateData = {
        ...pageSettings,
        content_json: JSON.stringify(content),
        type: 'leecms' // Mark as LeeCMS page
      };

      const response = await monitoredFetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setLeecmsContent(content);
        handleApiSuccess('Page content saved successfully!');
      } else {
        const errorData = await response.json();
        handleApiError(null, errorData.error || 'Failed to save page');
      }
    } catch (error) {
      handleApiError(error, 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsChange = (field, value) => {
    setPageSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await monitoredFetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pageSettings,
          content_json: JSON.stringify(leecmsContent),
          type: 'leecms'
        })
      });

      if (response.ok) {
        handleApiSuccess('Page settings saved successfully!');
        
        // If slug changed, redirect to new URL
        if (pageSettings.slug !== page.slug) {
          router.push(`/admin/pages/edit/${pageSettings.slug}`);
        } else {
          // Refresh page data
          fetchPage();
        }
      } else {
        const errorData = await response.json();
        handleApiError(null, errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      handleApiError(error, 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!page) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Page Not Found</h2>
          <p className="text-gray-500 mt-2">The requested page could not be found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Page: {page.title} - LeeCMS Admin</title>
      </Head>
      
      <AdminLayout>
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Page: {page.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  Using LeeCMS modular page builder
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  View Live Page
                </button>
                <button
                  onClick={() => router.push('/admin/footer/pages')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to Pages
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Content Builder
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Page Settings
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'content' && (
            <div className="min-h-screen">
              <LeeCMSBuilder
                initialContent={leecmsContent}
                onSave={handleSaveContent}
                onPreview={setIsPreviewMode}
                isPreviewMode={isPreviewMode}
                pageData={page}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Page Settings</h3>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <AdminInput
                        label="Page Title"
                        value={pageSettings.title}
                        onChange={(value) => handleSettingsChange('title', value)}
                        placeholder="Enter page title"
                      />
                    </div>
                    
                    <div>
                      <AdminInput
                        label="Page Slug"
                        value={pageSettings.slug}
                        onChange={(value) => handleSettingsChange('slug', value)}
                        placeholder="page-url-slug"
                        helpText={`URL: /page/${pageSettings.slug}`}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <AdminSelect
                      label="Category"
                      value={pageSettings.page_category_id}
                      onChange={(value) => handleSettingsChange('page_category_id', value)}
                      options={[
                        { value: '', label: 'Select Category' },
                        ...categories.map((category) => ({
                          value: category.id,
                          label: category.name
                        }))
                      ]}
                    />
                  </div>

                  {/* SEO */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900">SEO Settings</h4>
                    
                    <div>
                      <AdminInput
                        label="Meta Title"
                        value={pageSettings.meta_title}
                        onChange={(value) => handleSettingsChange('meta_title', value)}
                        placeholder="SEO title for search engines"
                        maxLength="60"
                        helpText={`${pageSettings.meta_title.length}/60 characters`}
                      />
                    </div>
                    
                    <div>
                      <AdminInput
                        label="Meta Description"
                        type="textarea"
                        value={pageSettings.meta_description}
                        onChange={(value) => handleSettingsChange('meta_description', value)}
                        rows={3}
                        placeholder="Brief description for search engines"
                        maxLength="160"
                        helpText={`${pageSettings.meta_description.length}/160 characters`}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={pageSettings.is_active}
                        onChange={(e) => handleSettingsChange('is_active', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Page is active and visible to visitors
                      </span>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSaveSettings}
                      disabled={saving}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}