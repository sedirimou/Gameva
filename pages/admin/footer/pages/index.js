import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/layout/AdminLayout';
import { monitoredFetch } from '../../../../lib/clientMonitor';
import { handleApiError, handleApiSuccess } from '../../../../lib/errorHandler';
import { useModal } from '../../../../hooks/useModal';
import CustomModal from '../../../../components/ui/CustomModal';

export default function AdminFooterPages() {
  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();
  const { modal, confirm, error, success } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pagesResponse, categoriesResponse] = await Promise.all([
        monitoredFetch('/api/admin/pages'),
        monitoredFetch('/api/admin/page-categories')
      ]);

      if (pagesResponse.ok && categoriesResponse.ok) {
        const pagesData = await pagesResponse.json();
        const categoriesData = await categoriesResponse.json();
        setPages(pagesData.pages || []);
        setCategories(categoriesData.categories || []);
      } else {
        handleApiError(null, 'Failed to fetch data');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId) => {
    const confirmed = await confirm(
      'Delete Page',
      'Are you sure you want to delete this page? This action cannot be undone.',
      'Delete',
      'Cancel'
    );
    
    if (!confirmed) return;

    try {
      const response = await monitoredFetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        handleApiSuccess('Page deleted successfully');
        fetchData();
      } else {
        const err = await response.json();
        await error('Failed to delete page: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      await error('Failed to delete page: ' + (err.message || 'Unknown error'));
    }
  };

  const togglePageStatus = async (pageId, currentStatus) => {
    try {
      const response = await monitoredFetch(`/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        handleApiSuccess(`Page ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchData();
      } else {
        const err = await response.json();
        await error('Failed to update page status: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      await error('Failed to update page status: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredPages = selectedCategory === 'all' 
    ? pages 
    : pages.filter(page => page.page_category_id === parseInt(selectedCategory));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Footer Pages Management</h1>
              <p className="text-gray-600 mt-1">Manage footer pages and static content</p>
            </div>
            <button
              onClick={() => router.push('/admin/footer/pages/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Footer Page
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.page_count} pages)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pages List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No footer pages found. Create your first page to get started.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">/{page.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {page.category_name || 'No Category'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        page.type === 'static' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {page.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePageStatus(page.id, page.is_active)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          page.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {page.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/admin/pages/edit/${page.slug}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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