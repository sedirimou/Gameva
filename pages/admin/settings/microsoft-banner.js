import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';

export default function MicrosoftBannerSettings() {
  const [bannerData, setBannerData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      const response = await fetch('/api/admin/microsoft-banner');
      if (response.ok) {
        const data = await response.json();
        setBannerData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          image_url: data.image_url || '',
          is_active: data.is_active !== false
        });
      }
    } catch (error) {
      console.error('Error fetching banner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/microsoft-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Banner updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error updating banner. Please try again.');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      setMessage('Error updating banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBannerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Microsoft Banner Settings</h1>
            <p className="text-gray-600">Manage the banner content for the Microsoft special page</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Title
              </label>
              <input
                type="text"
                value={bannerData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Microsoft Products"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Subtitle
              </label>
              <textarea
                value={bannerData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Discover the latest Microsoft software and tools"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image URL
              </label>
              <input
                type="url"
                value={bannerData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/banner-image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to use the default gradient background
              </p>
            </div>

            {/* Image Preview */}
            {bannerData.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={bannerData.image_url}
                    alt="Banner preview"
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="100%25" height="100%25" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Is Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={bannerData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Banner is active
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Banner Settings'}
              </button>
            </div>
          </form>

          {/* Preview Section */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Banner Preview</h2>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div 
                className="h-48 bg-cover bg-center bg-no-repeat relative"
                style={{
                  backgroundImage: bannerData.image_url 
                    ? `url(${bannerData.image_url})` 
                    : 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                }}
              >
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                  <div className="text-white">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2">
                      {bannerData.title || 'Microsoft Products'}
                    </h1>
                    {bannerData.subtitle && (
                      <p className="text-lg md:text-xl opacity-90">
                        {bannerData.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}