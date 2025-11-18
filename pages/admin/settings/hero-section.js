/**
 * Hero Section Management Page - Admin Settings
 * Allows administrators to manage homepage hero banners
 */
import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/layout/AdminLayout';
import { handleApiError, handleApiSuccess } from '../../../lib/errorHandler';

export default function HeroSectionSettings() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    button_label: '',
    link: '',
    position: 0,
    is_active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch heroes on component mount
  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/hero');
      const data = await response.json();
      
      if (data.success) {
        setHeroes(data.heroes || []);
      } else {
        handleApiError(new Error(data.error || 'Failed to fetch heroes'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to load hero sections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      handleApiError(new Error('Please select a valid image file (JPG, PNG, or WebP)'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      handleApiError(new Error('Image file size must be less than 5MB'));
      return;
    }

    setUploadingImage(true);

    try {
      // Create FormData for file upload
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      formDataUpload.append('type', 'hero');

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          image: data.imageUrl
        }));
        handleApiSuccess('Image uploaded successfully');
        
        // Clear the file input
        e.target.value = '';
      } else {
        handleApiError(new Error(data.error || 'Failed to upload image'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateUrl = (url) => {
    // Allow internal navigation paths or full URLs
    const internalPath = /^\/[a-z0-9\-\/\._]*$/i;
    const fullUrl = /^https?:\/\/.+/i;
    return internalPath.test(url) || fullUrl.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Title is now optional - no validation needed for title
    if (!formData.image.trim()) {
      handleApiError(new Error('Image is required'));
      return;
    }
    if (!formData.button_label.trim()) {
      handleApiError(new Error('Button label is required'));
      return;
    }
    if (!formData.link || formData.link.trim() === '') {
      handleApiError(new Error('Button destination URL is required'));
      return;
    }

    setSaving(true);

    try {
      const url = editingHero ? `/api/admin/hero/${editingHero.id}` : '/api/admin/hero';
      const method = editingHero ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        handleApiSuccess(data.message || `Hero section ${editingHero ? 'updated' : 'created'} successfully`);
        resetForm();
        fetchHeroes();
      } else {
        handleApiError(new Error(data.error || 'Failed to save hero section'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title,
      image: hero.image,
      button_label: hero.button_label,
      link: hero.link,
      position: hero.position,
      is_active: hero.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (heroId, heroTitle) => {
    if (!confirm(`Are you sure you want to delete the hero section "${heroTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/hero/${heroId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        handleApiSuccess(data.message || 'Hero section deleted successfully');
        fetchHeroes();
      } else {
        handleApiError(new Error(data.error || 'Failed to delete hero section'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete hero section');
    }
  };

  const toggleStatus = async (heroId, currentStatus) => {
    try {
      const hero = heroes.find(h => h.id === heroId);
      if (!hero) return;

      const response = await fetch(`/api/admin/hero/${heroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...hero,
          is_active: !currentStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        handleApiSuccess(`Hero section ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        fetchHeroes();
      } else {
        handleApiError(new Error(data.error || 'Failed to update hero status'));
      }
    } catch (error) {
      handleApiError(error, 'Failed to update hero status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: '',
      button_label: '',
      link: '',
      position: 0,
      is_active: true
    });
    setEditingHero(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Hero Section Settings - Admin" currentPage="Hero Section Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading hero sections...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Hero Section Settings - Admin</title>
        <meta name="description" content="Manage homepage hero banners" />
      </Head>

      <AdminLayout title="Hero Section Settings - Admin" currentPage="Hero Section Settings">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hero Section Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage hero banners that appear on the homepage
            </p>
          </div>

          {/* Add New Hero Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Hero Section
            </button>
          </div>

          {/* Hero Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {editingHero ? 'Edit Hero Section' : 'Add New Hero Section'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Enter hero section title (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Button Label *
                    </label>
                    <input
                      type="text"
                      name="button_label"
                      value={formData.button_label}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="e.g., Shop Now, Learn More"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Image *
                    </label>
                    <div className="space-y-3">
                      {/* File Upload */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Upload Image</label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadingImage && (
                          <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                        )}
                      </div>
                      
                      {/* OR Separator */}
                      <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-sm text-gray-500">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Button Destination URL *
                    </label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 text-sm"
                      placeholder="/category/all-products or https://example.com/page"
                      style={{ fontSize: '14px' }}
                    />
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      <p>Where users go when clicking the hero button</p>
                      <p><strong>Examples:</strong></p>
                      <p>• Internal links: <code className="bg-gray-100 px-1 rounded">/category/all-products</code>, <code className="bg-gray-100 px-1 rounded">/category/games</code></p>
                      <p>• External links: <code className="bg-gray-100 px-1 rounded">https://example.com/special-offer</code></p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Position
                    </label>
                    <input
                      type="number"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-600 mt-1">Lower numbers appear first</p>
                  </div>

                  <div className="md:col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active (visible on homepage)
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Image Preview
                    </label>
                    <div className="relative inline-block">
                      <img 
                        src={formData.image} 
                        alt="Hero preview" 
                        className="w-64 h-32 object-cover rounded-md border border-gray-300 shadow-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div 
                        className="w-64 h-32 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm"
                        style={{ display: 'none' }}
                      >
                        Failed to load image preview
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {saving && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>
                      {saving ? 'Saving...' : uploadingImage ? 'Uploading...' : editingHero ? 'Update Hero' : 'Create Hero'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Heroes Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Hero Sections ({heroes.length})
              </h3>
            </div>
            
            {heroes.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No hero sections found. Create your first hero banner to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hero
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {heroes.map((hero) => (
                      <tr key={hero.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={hero.image}
                              alt={hero.title}
                              className="h-10 w-20 object-cover rounded-md mr-3"
                              onError={(e) => {
                                e.target.src = '/placeholder-game.svg';
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {hero.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {hero.button_label}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {hero.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            hero.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {hero.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(hero)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(hero.id, hero.is_active)}
                            className={`${
                              hero.is_active 
                                ? 'text-red-600 hover:text-red-800 dark:text-red-400' 
                                : 'text-green-600 hover:text-green-800 dark:text-green-400'
                            }`}
                          >
                            {hero.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDelete(hero.id, hero.title)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}