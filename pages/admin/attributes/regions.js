import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { useModal } from '../../../hooks/useModal';
import CustomModal from '../../../components/ui/CustomModal';

export default function RegionsManagement() {
  const [regions, setRegions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon_url: '',
    country_support: []
  });
  const [loading, setLoading] = useState(true);
  const [newCountry, setNewCountry] = useState('');
  const modal = useModal();
  const { confirm, error } = modal;

  // Common country codes for easy selection
  const popularCountries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'RU', name: 'Russia' },
    { code: 'IN', name: 'India' }
  ];

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/admin/attributes/regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingRegion ? 'PUT' : 'POST';
      const payload = editingRegion 
        ? { ...formData, id: editingRegion.id }
        : formData;

      const response = await fetch('/api/admin/attributes/regions', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingRegion(null);
        setFormData({ title: '', icon_url: '', country_support: [] });
        fetchRegions();
      } else {
        const errorData = await response.json();
        await error('Error', errorData.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Error saving region:', err);
      await error('Error', 'An error occurred while saving');
    }
  };

  const handleEdit = (region) => {
    setEditingRegion(region);
    setFormData({
      title: region.title || '',
      icon_url: region.icon_url || '',
      country_support: Array.isArray(region.country_support) ? region.country_support : []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (region) => {
    const confirmed = await confirm(
      'Delete Region',
      `Are you sure you want to delete "${region.title}"? This action cannot be undone.`,
      'Delete',
      'Cancel'
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/attributes/regions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: region.id }),
      });

      if (response.ok) {
        fetchRegions();
      } else {
        const errorData = await response.json();
        await error('Error', errorData.error || 'Failed to delete region');
      }
    } catch (err) {
      console.error('Error deleting region:', err);
      await error('Error', 'An error occurred while deleting');
    }
  };

  const openAddModal = () => {
    setEditingRegion(null);
    setFormData({ title: '', icon_url: '', country_support: [] });
    setIsModalOpen(true);
  };

  const addCountry = (countryCode) => {
    if (!formData.country_support.includes(countryCode)) {
      setFormData({
        ...formData,
        country_support: [...formData.country_support, countryCode]
      });
    }
  };

  const removeCountry = (countryCode) => {
    setFormData({
      ...formData,
      country_support: formData.country_support.filter(code => code !== countryCode)
    });
  };

  const addCustomCountry = () => {
    if (newCountry && !formData.country_support.includes(newCountry)) {
      setFormData({
        ...formData,
        country_support: [...formData.country_support, newCountry.toUpperCase()]
      });
      setNewCountry('');
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Regions Management" title="Regions Management - Admin - Gamava">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="Regions Management" title="Regions Management - Admin - Gamava">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Regions Management</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Region
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage regional availability and country support for games
        </p>
      </div>

      {/* Regions Table */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Countries
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
              {regions.map((region) => (
                <tr key={region.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {region.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {region.icon_url ? (
                      <img 
                        src={region.icon_url} 
                        alt={region.title} 
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 dark:bg-slate-600 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-slate-400">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(region.country_support) && region.country_support.length > 0 ? (
                        region.country_support.slice(0, 3).map((country) => (
                          <span key={country} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {country}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-slate-400">No countries</span>
                      )}
                      {Array.isArray(region.country_support) && region.country_support.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                          +{region.country_support.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {region.product_count} products
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(region)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(region)}
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
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white dark:bg-slate-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingRegion ? 'Edit Region' : 'Add New Region'}
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
                    placeholder="e.g., North America, Europe, Asia Pacific"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Icon Upload
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="region-icon-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload icon</span>
                          <input
                            id="region-icon-upload"
                            name="region-icon-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setFormData({ ...formData, icon_url: e.target.result });
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
                  {formData.icon_url && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Preview:</p>
                      <img 
                        src={formData.icon_url} 
                        alt="Icon preview" 
                        className="h-16 w-16 rounded object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Country Support
                  </label>
                  
                  {/* Selected Countries */}
                  {formData.country_support.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Selected Countries:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.country_support.map((country) => (
                          <span key={country} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {country}
                            <button
                              type="button"
                              onClick={() => removeCountry(country)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Popular Countries */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Quick Add:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {popularCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => addCountry(country.code)}
                          disabled={formData.country_support.includes(country.code)}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            formData.country_support.includes(country.code)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                          }`}
                        >
                          {country.code} - {country.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Country Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-sm"
                      placeholder="Custom country code (e.g., XX)"
                      maxLength={3}
                    />
                    <button
                      type="button"
                      onClick={addCustomCountry}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
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
                    {editingRegion ? 'Update' : 'Create'}
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