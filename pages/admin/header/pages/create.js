import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/layout/AdminLayout';
import { monitoredFetch } from '../../../../lib/clientMonitor';
import { handleApiError, handleApiSuccess } from '../../../../lib/errorHandler';

export default function CreateHeaderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    motivation_title: '',
    description: '',
    selected_categories: '',
    add_to_header_menu: false,
    header_button_title: '',
    icon_placement_type: 'random',
    icon_list: [],
    // Core content fields
    top_banner: '',
    bottom_description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    sort_order: 0,
    // Visual settings
    background_color: '#153e8f',
    icon_color: '#ffffff',
    icon_size: 24,
    icon_quantity: 6,
    icon_opacity: 20,
    icon_height: 48,
    icon_grid_rows: 5,
    icon_grid_columns: 5,
    icon_distribution_pattern: 'random',
    // Banner settings
    banner_opacity: 100,
    banner_height: 300,
    // Layout settings
    bottom_description_width: 1400,
    page_max_width: 1400,
    title_font_size: 48,
    motivation_font_size: 20
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlugFromTitle(title)
    }));
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/product-categories?hierarchical=false');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      handleApiError(null, 'Title and slug are required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        selected_categories: typeof formData.selected_categories === 'string' 
          ? formData.selected_categories 
          : JSON.stringify(formData.selected_categories),
        icon_list: typeof formData.icon_list === 'string' 
          ? formData.icon_list 
          : Array.isArray(formData.icon_list) ? formData.icon_list.join(', ') : ''
      };

      const response = await monitoredFetch('/api/admin/special-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        handleApiSuccess('Header page created successfully');
        router.push('/admin/header/pages');
      } else {
        const error = await response.json();
        handleApiError(error, 'Failed to create header page');
      }
    } catch (error) {
      handleApiError(error, 'Failed to create header page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Header Page</h1>
              <p className="text-gray-600 mt-1">Create a new special page for header navigation</p>
            </div>
            <button
              onClick={() => router.push('/admin/header/pages')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Pages
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Enter page title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="page-slug"
                required
              />
            </div>
          </div>

          {/* Core Special Page Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivation Title
            </label>
            <input
              type="text"
              name="motivation_title"
              value={formData.motivation_title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter motivation title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Enter page description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Category
            </label>
            <select
              name="selected_categories"
              value={formData.selected_categories}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Select a category (optional)</option>
              {categories.filter(cat => !cat.parent_id).map(category => (
                <option key={category.id} value={JSON.stringify([category.id])}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>



          {/* Content Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Content Fields</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top Banner
                </label>
                <textarea
                  name="top_banner"
                  value={formData.top_banner}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter top banner content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bottom Description
                </label>
                <textarea
                  name="bottom_description"
                  value={formData.bottom_description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter bottom description"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter meta title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter meta description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <textarea
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter meta keywords (comma separated)"
                />
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visual Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  name="background_color"
                  value={formData.background_color}
                  onChange={handleInputChange}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Color
                </label>
                <input
                  type="color"
                  name="icon_color"
                  id="icon_color"
                  value={formData.icon_color}
                  onChange={handleInputChange}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Font Size
                </label>
                <input
                  type="number"
                  name="title_font_size"
                  id="title_font_size"
                  value={formData.title_font_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="48"
                  min="12"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivation Font Size
                </label>
                <input
                  type="number"
                  name="motivation_font_size"
                  value={formData.motivation_font_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="20"
                  min="12"
                  max="50"
                />
              </div>
            </div>
          </div>

          {/* Icon Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Icon Settings</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Placement Type
                </label>
                <select
                  name="icon_placement_type"
                  value={formData.icon_placement_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="random">Random</option>
                  <option value="grid">Grid</option>
                  <option value="scattered">Scattered</option>
                  <option value="border">Border</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon List (comma separated FontAwesome icons)
                </label>
                <textarea
                  name="icon_list"
                  value={Array.isArray(formData.icon_list) ? formData.icon_list.join(', ') : formData.icon_list}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon_list: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="fa-gamepad, fa-trophy, fa-star, fa-heart"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter FontAwesome icon names separated by commas (e.g., fa-gamepad, fa-trophy, fa-star)
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Size
                </label>
                <input
                  type="number"
                  name="icon_size"
                  value={formData.icon_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="24"
                  min="12"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Quantity
                </label>
                <input
                  type="number"
                  name="icon_quantity"
                  value={formData.icon_quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="6"
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Opacity
                </label>
                <input
                  type="number"
                  name="icon_opacity"
                  value={formData.icon_opacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="20"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Height
                </label>
                <input
                  type="number"
                  name="icon_height"
                  value={formData.icon_height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="48"
                  min="12"
                  max="200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Grid Rows
                </label>
                <input
                  type="number"
                  name="icon_grid_rows"
                  value={formData.icon_grid_rows}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="5"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Grid Columns
                </label>
                <input
                  type="number"
                  name="icon_grid_columns"
                  value={formData.icon_grid_columns}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="5"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Distribution Pattern
                </label>
                <select
                  name="icon_distribution_pattern"
                  value={formData.icon_distribution_pattern}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="random">Random</option>
                  <option value="grid">Grid</option>
                  <option value="scattered">Scattered</option>
                  <option value="border">Border</option>
                </select>
              </div>
            </div>
          </div>

          {/* Banner Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Banner Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Opacity
                </label>
                <input
                  type="number"
                  name="banner_opacity"
                  value={formData.banner_opacity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="100"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Height
                </label>
                <input
                  type="number"
                  name="banner_height"
                  value={formData.banner_height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="300"
                  min="100"
                  max="800"
                />
              </div>
            </div>
          </div>

          {/* Layout Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bottom Description Width
                </label>
                <input
                  type="number"
                  name="bottom_description_width"
                  value={formData.bottom_description_width}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="1400"
                  min="600"
                  max="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Max Width
                </label>
                <input
                  type="number"
                  name="page_max_width"
                  value={formData.page_max_width}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="1400"
                  min="600"
                  max="2000"
                />
              </div>
            </div>
          </div>

          {/* Header Menu Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Header Menu Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="add_to_header_menu"
                  checked={formData.add_to_header_menu}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Add to Header Menu
                </label>
              </div>

              {formData.add_to_header_menu && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Header Button Title
                  </label>
                  <input
                    type="text"
                    name="header_button_title"
                    value={formData.header_button_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter button text for header (optional, defaults to page title)"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/header/pages')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create Header Page'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}