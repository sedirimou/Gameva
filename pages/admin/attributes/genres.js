import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Input from '../../../components/admin/Input';
import Textarea from '../../../components/admin/Textarea';
import { useModal } from '../../../hooks/useModal';
import CustomModal from '../../../components/ui/CustomModal';

export default function GenresManagement() {
  const [genres, setGenres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon_url: '',
    description: '',
    is_featured: false
  });
  const [loading, setLoading] = useState(true);
  const { modal, confirm, error } = useModal();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/admin/attributes/genres');
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingGenre ? 'PUT' : 'POST';
      const payload = editingGenre 
        ? { ...formData, id: editingGenre.id }
        : formData;

      const response = await fetch('/api/admin/attributes/genres', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingGenre(null);
        setFormData({ title: '', icon_url: '', description: '' });
        fetchGenres();
      } else {
        const errorData = await response.json();
        await error('Error', errorData.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Error saving genre:', err);
      await error('Error', 'An error occurred while saving');
    }
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setFormData({
      title: genre.title || '',
      icon_url: genre.icon_url || '',
      description: genre.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (genre) => {
    const confirmed = await confirm(
      'Delete Genre',
      `Are you sure you want to delete "${genre.title}"? This action cannot be undone.`,
      'Delete',
      'Cancel'
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/attributes/genres', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: genre.id }),
      });

      if (response.ok) {
        fetchGenres();
      } else {
        const errorData = await response.json();
        await error('Error', errorData.error || 'Failed to delete genre');
      }
    } catch (err) {
      console.error('Error deleting genre:', err);
      await error('Error', 'An error occurred while deleting');
    }
  };

  const openAddModal = () => {
    setEditingGenre(null);
    setFormData({ title: '', icon_url: '', description: '', is_featured: false });
    setIsModalOpen(true);
  };

  const openEditModal = (genre) => {
    setEditingGenre(genre);
    setFormData({
      title: genre.title || '',
      icon_url: genre.icon_url || '',
      description: genre.description || '',
      is_featured: genre.is_featured || false
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Genres Management" title="Genres Management - Admin - Gamava">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="Genres Management" title="Genres Management - Admin - Gamava">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Genres Management</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Genre
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage game genres and their associated products
        </p>
      </div>

      {/* Genres Table */}
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Description
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
              {genres.map((genre) => (
                <tr key={genre.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {genre.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {genre.icon_url ? (
                      <div className="h-8 w-8 bg-gray-600 rounded flex items-center justify-center p-1">
                        <img 
                          src={genre.icon_url} 
                          alt={genre.title} 
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 dark:bg-slate-600 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500 dark:text-slate-400">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {genre.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {genre.product_count} products
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(genre)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(genre)}
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
                {editingGenre ? 'Edit Genre' : 'Add New Genre'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Title *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                        <label htmlFor="genre-icon-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            id="genre-icon-upload"
                            name="genre-icon-upload"
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
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Brief description of the genre"
                  />
                </div>
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Make this Genre featured
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Featured genres will be highlighted on the homepage and promotional sections
                  </p>
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
                    {editingGenre ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
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