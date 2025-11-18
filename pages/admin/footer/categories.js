import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminInput from '../../../components/admin/AdminInput';
import { monitoredFetch } from '../../../lib/clientMonitor';
import { handleApiError, handleApiSuccess } from '../../../lib/errorHandler';

export default function FooterCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 1
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await monitoredFetch('/api/admin/page-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        handleApiError(null, 'Failed to fetch categories');
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSortOrderChange = (categoryId, newSortOrder) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, sort_order: parseInt(newSortOrder) }
        : cat
    ));
  };

  const handleDescriptionChange = (categoryId, newDescription) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, description: newDescription }
        : cat
    ));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNewCategoryChange = (field, value) => {
    setNewCategory(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name' ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name || !newCategory.slug) {
        handleApiError(null, 'Category name is required');
        return;
      }

      setSaving(true);
      const response = await monitoredFetch('/api/admin/page-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        handleApiSuccess('Category created successfully');
        setNewCategory({ name: '', slug: '', description: '', sort_order: 1 });
        setShowAddForm(false);
        fetchCategories(); // Refresh data
      } else {
        const errorData = await response.json();
        handleApiError(null, errorData.message || 'Failed to create category');
      }
    } catch (error) {
      handleApiError(error, 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update each category
      const updatePromises = categories.map(category => 
        monitoredFetch(`/api/admin/page-categories/${category.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: category.description,
            sort_order: category.sort_order
          })
        })
      );

      await Promise.all(updatePromises);
      handleApiSuccess('Categories updated successfully');
      fetchCategories(); // Refresh data
    } catch (error) {
      handleApiError(error, 'Failed to update categories');
    } finally {
      setSaving(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Footer Categories Management</h1>
              <p className="text-gray-600 mt-1">Configure footer categories and their display order</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New Category
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Add New Category Form */}
        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Footer Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminInput
                label="Category Name"
                value={newCategory.name}
                onChange={(e) => handleNewCategoryChange('name', e.target.value)}
                placeholder="Enter category name"
                required
              />
              <AdminInput
                label="URL Slug"
                value={newCategory.slug}
                onChange={(e) => handleNewCategoryChange('slug', e.target.value)}
                placeholder="auto-generated"
              />
              <AdminInput
                type="number"
                label="Sort Order"
                value={newCategory.sort_order}
                onChange={(e) => handleNewCategoryChange('sort_order', e.target.value)}
                min="1"
                max="8"
              />
              <div className="flex items-end">
                <button
                  onClick={handleAddCategory}
                  disabled={saving || !newCategory.name}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full"
                >
                  Create Category
                </button>
              </div>
            </div>
            <div className="mt-4">
              <AdminInput
                type="textarea"
                label="Description"
                value={newCategory.description}
                onChange={(e) => handleNewCategoryChange('description', e.target.value)}
                placeholder="Enter category description..."
                rows="2"
              />
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="p-6">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Category Name
                    </label>
                    <div className="text-lg font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                      {category.name}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Fixed - cannot be changed
                    </p>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <AdminInput
                      type="number"
                      label="Sort Order"
                      value={category.sort_order || 1}
                      onChange={(e) => handleSortOrderChange(category.id, e.target.value)}
                      min="1"
                      max="8"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Display order (1-8)
                    </p>
                  </div>

                  {/* Page Count */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Pages Count
                    </label>
                    <div className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded border">
                      {category.page_count || 0} pages
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total pages in category
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <AdminInput
                    type="textarea"
                    label="Description"
                    value={category.description || ''}
                    onChange={(e) => handleDescriptionChange(category.id, e.target.value)}
                    placeholder="Enter category description..."
                    rows="3"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Category Management Rules</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maximum 8 footer categories allowed</li>
              <li>• You can create, edit, and delete custom categories</li>
              <li>• Sort order determines display position in footer (1 = leftmost)</li>
              <li>• Category names will appear in <strong>bold font</strong> in the footer</li>
              <li>• Default categories: Quick Links, Customer Service, Legal, Contact</li>
              <li>• Use descriptive names and unique URL slugs for better organization</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}