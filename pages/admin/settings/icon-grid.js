import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/layout/AdminLayout';
import { handleApiError, handleApiSuccess } from '../../../lib/errorHandler';

export default function IconGridPage() {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    subtitle: '',
    icon_path: '',
    redirect_link: '',
    link_target: '_self',
    position: 1,
    is_active: true
  });
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const response = await fetch('/api/admin/icon-grid');
      if (response.ok) {
        const data = await response.json();
        setIcons(data.icons || []);
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch icon grid');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let iconPath = formData.icon_path;
    
    // Handle file upload if present
    if (uploadFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('image', uploadFile);
      
      try {
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          iconPath = uploadData.imageUrl;
        } else {
          const errorData = await uploadResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to upload icon');
        }
      } catch (error) {
        handleApiError(error, 'Failed to upload icon');
        return;
      }
    }

    const payload = {
      ...formData,
      icon_path: iconPath
    };

    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `/api/admin/icon-grid/${formData.id}` 
        : '/api/admin/icon-grid';
        
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        handleApiSuccess(formData.id ? 'Icon updated successfully' : 'Icon created successfully');
        setShowForm(false);
        resetForm();
        fetchIcons();
      } else {
        throw new Error('Failed to save icon');
      }
    } catch (error) {
      handleApiError(error, 'Failed to save icon');
    }
  };

  const handleEdit = (icon) => {
    setFormData({
      id: icon.id,
      title: icon.title || '',
      subtitle: icon.subtitle || '',
      icon_path: icon.icon_path || '',
      redirect_link: icon.redirect_link || '',
      link_target: icon.link_target || '_self',
      position: icon.position || 1,
      is_active: icon.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this icon?')) return;

    try {
      const response = await fetch(`/api/admin/icon-grid/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        handleApiSuccess('Icon deleted successfully');
        fetchIcons();
      } else {
        throw new Error('Failed to delete icon');
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete icon');
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      subtitle: '',
      icon_path: '',
      redirect_link: '',
      link_target: '_self',
      position: 1,
      is_active: true
    });
    setUploadFile(null);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Icon Grid Section - Admin</title>
      </Head>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Icon Grid Section Management
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add New Icon'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {formData.id ? 'Edit Icon' : 'Add New Icon'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="24/7 Support"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Online assistance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Icon Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload an SVG or image file for the icon
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Icon URL (Alternative)
                </label>
                <input
                  type="text"
                  value={formData.icon_path}
                  onChange={(e) => setFormData({ ...formData, icon_path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/icon.svg or /path/to/icon.svg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Redirect Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.redirect_link}
                  onChange={(e) => setFormData({ ...formData, redirect_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="/category/support or https://example.com"
                />
              </div>

              {formData.redirect_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Link Target
                  </label>
                  <select
                    value={formData.link_target}
                    onChange={(e) => setFormData({ ...formData, link_target: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="_self">Open in same page</option>
                    <option value="_blank">Open in new tab</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Status
                  </label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {formData.id ? 'Update Icon' : 'Create Icon'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Icons ({icons.length}/6)
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading icons...
            </div>
          ) : icons.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No icons configured. Add your first icon to get started.
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {icons.map((icon) => (
                  <div
                    key={icon.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded ${
                        icon.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {icon.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Position {icon.position}
                      </span>
                    </div>

                    {icon.icon_path && (
                      <div className="mb-3 flex justify-center">
                        <img
                          src={icon.icon_path}
                          alt={icon.title || 'Icon'}
                          className="w-8 h-8"
                        />
                      </div>
                    )}

                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {icon.title || 'Untitled'}
                    </h3>
                    {icon.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {icon.subtitle}
                      </p>
                    )}
                    {icon.redirect_link && (
                      <div className="mt-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          → {icon.redirect_link}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ({icon.link_target === '_blank' ? 'New tab' : 'Same page'})
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(icon)}
                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(icon.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}