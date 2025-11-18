import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useModal } from '../../../hooks/useModal';
import CustomModal from '../../../components/ui/CustomModal';

export default function LanguagesManagement() {
  const [languages, setLanguages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    flag_url: ''
  });
  const [loading, setLoading] = useState(true);
  const modal = useModal();
  const { confirm, error } = modal;

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/admin/attributes/languages');
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingLanguage ? 'PUT' : 'POST';
      const payload = editingLanguage 
        ? { ...formData, id: editingLanguage.id }
        : formData;

      const response = await fetch('/api/admin/attributes/languages', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingLanguage(null);
        setFormData({ title: '', flag_url: '' });
        fetchLanguages();
      } else {
        const errorData = await response.json();
        error(errorData.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Error saving language:', err);
      error('An error occurred while saving');
    }
  };

  const handleEdit = (language) => {
    setEditingLanguage(language);
    setFormData({
      title: language.title || '',
      flag_url: language.flag_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (language) => {
    const confirmed = await confirm(`Are you sure you want to delete "${language.title}"?`);
    if (confirmed) {
      try {
        const response = await fetch('/api/admin/attributes/languages', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: language.id }),
        });

        if (response.ok) {
          fetchLanguages();
        } else {
          const errorData = await response.json();
          error(errorData.error || 'Failed to delete language');
        }
      } catch (err) {
        console.error('Error deleting language:', err);
        error('An error occurred while deleting');
      }
    }
  };

  const openAddModal = () => {
    setEditingLanguage(null);
    setFormData({ title: '', flag_url: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Languages Management" title="Languages Management - Admin - Gamava">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="Languages Management" title="Languages Management - Admin - Gamava">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Languages Management</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Language
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage game languages and their country flags
        </p>
      </div>

      {/* Languages Table */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Flag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {languages.map((language) => (
                <tr key={language.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {language.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {language.flag_url ? (
                      <img 
                        src={language.flag_url} 
                        alt={`${language.title} flag`} 
                        className="h-6 w-8 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-6 w-8 bg-gray-200 dark:bg-slate-600 rounded flex items-center justify-center border border-gray-200">
                        <span className="text-xs text-gray-500 dark:text-slate-400">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {language.product_count} products
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(language)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(language)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-slate-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingLanguage ? 'Edit Language' : 'Add New Language'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., English, Spanish, French"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Flag Upload
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="flag-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload flag</span>
                          <input
                            id="flag-upload"
                            name="flag-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setFormData({ ...formData, flag_url: e.target.result });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG up to 5MB</p>
                    </div>
                  </div>
                  {formData.flag_url && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Preview:</p>
                      <img 
                        src={formData.flag_url} 
                        alt="Flag preview" 
                        className="h-8 w-12 rounded object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    {editingLanguage ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <CustomModal />
    </AdminLayout>
  );
}