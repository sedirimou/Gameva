import { useState, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/admin/DashboardLayout';
import { Base64 } from 'js-base64';
import Input from '../../components/admin/Input';
import Select from '../../components/admin/Select';
import Textarea from '../../components/admin/Textarea';
import CustomModal from '../../components/ui/CustomModal';
import { useModal } from '../../hooks/useModal';
import { getProductImageUrl } from '../../lib/imageUtils';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Modal hook for custom dialogs
  const { modal, confirmDelete, error, handleInputChange, closeModal } = useModal();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    icon: '',
    banner: '',
    description: '',
    sub_description: '',
    link: '',
    order_position: 0,
    status: true,
    show_in_main_menu: false,
    category_image: '',
    main_menu_display_type: 'products',
    main_menu_description: '',
    popular_products: []
  });
  const [iconPreview, setIconPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [uploading, setUploading] = useState({ icon: false, banner: false, categoryImage: false });
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);



  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/product-categories?hierarchical=true');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      console.log('✅ Categories API Response:', data);
      
      // Ensure categories is always an array and validate structure
      const categoriesArray = Array.isArray(data.categories) ? data.categories : [];
      console.log('✅ Processed categories array:', categoriesArray);
      
      // Validate each category object to prevent React rendering errors
      const validCategories = categoriesArray.filter(category => {
        if (!category || typeof category !== 'object') {
          console.warn('❌ Invalid category object:', category);
          return false;
        }
        return true;
      });
      
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Product search functionality
  const searchProducts = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/admin/product-categories/popular-products?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };

  const addProductToSelection = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      const updatedProducts = [...selectedProducts, product];
      setSelectedProducts(updatedProducts);
      setFormData(prev => ({
        ...prev,
        popular_products: updatedProducts.map(p => p.id)
      }));
    }
    setProductSearchTerm('');
    setSearchResults([]);
  };

  const removeProductFromSelection = (productId) => {
    const updatedProducts = selectedProducts.filter(p => p.id !== productId);
    setSelectedProducts(updatedProducts);
    setFormData(prev => ({
      ...prev,
      popular_products: updatedProducts.map(p => p.id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent submission if still uploading
    if (uploading.icon || uploading.banner || uploading.categoryImage) {
      await error('Please wait for file upload to complete');
      return;
    }
    
    try {
      const url = editingCategory 
        ? `/api/admin/product-categories?id=${editingCategory.id}` 
        : '/api/admin/product-categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Category operation successful:', result);
        
        // Handle popular products assignment
        const categoryId = editingCategory ? editingCategory.id : result.category.id;
        if (formData.show_in_main_menu && formData.main_menu_display_type === 'products' && formData.popular_products.length > 0) {
          try {
            await fetch('/api/admin/product-categories/popular-products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categoryId: categoryId,
                productIds: formData.popular_products
              })
            });
          } catch (error) {
            console.error('Error saving popular products:', error);
          }
        }
        
        // Refresh categories list
        await fetchCategories();
        
        // Reset form and close modal
        resetForm();
        setShowAddModal(false);
        setEditingCategory(null);
        
        // Show success message
        setSuccessMessage(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setShowSuccessModal(true);
      } else {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            await error(errorData.error || 'Failed to save category');
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            await error('Failed to save category');
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          await error('Failed to save category');
        }
      }
    } catch (err) {
      console.error('Error saving category:', err);
      await error('Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    const confirmed = await confirmDelete('Are you sure you want to delete this category? This action cannot be undone and will affect all associated products.', 'Delete Category');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/product-categories?id=${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            await error(errorData.error || 'Failed to delete category');
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            await error('Failed to delete category');
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          await error('Failed to delete category');
        }
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      await error('Failed to delete category');
    }
  };

  const handleEdit = async (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      parent_id: category.parent_id || '',
      icon: category.icon || '',
      banner: category.banner || '',
      description: category.description || '',
      sub_description: category.sub_description || '',
      link: category.link || '',
      order_position: category.order_position || 0,
      status: category.status === true || category.status === 'active',
      show_in_main_menu: category.show_in_main_menu === true,
      category_image: category.category_image || '',
      main_menu_display_type: category.main_menu_display_type || 'products',
      main_menu_description: category.main_menu_description || '',
      popular_products: []
    });
    
    // Set preview images if they exist (Base64 data)
    setIconPreview(category.icon || '');
    setBannerPreview(category.banner || '');
    setCategoryImagePreview(category.category_image || '');
    
    // Load popular products for this category
    if (category.id) {
      try {
        const response = await fetch(`/api/admin/product-categories/popular-products?categoryId=${category.id}`);
        const data = await response.json();
        if (data.products) {
          setSelectedProducts(data.products);
          setFormData(prev => ({
            ...prev,
            popular_products: data.products.map(p => p.id)
          }));
        }
      } catch (error) {
        console.error('Error loading popular products:', error);
      }
    }
    
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      parent_id: '',
      icon: '',
      banner: '',
      description: '',
      sub_description: '',
      link: '',
      order_position: 0,
      status: true,
      show_in_main_menu: false,
      category_image: '',
      main_menu_display_type: 'products',
      main_menu_description: '',
      popular_products: []
    });
    setIconPreview('');
    setBannerPreview('');
    setCategoryImagePreview('');
    setSelectedProducts([]);
    setProductSearchTerm('');
    setSearchResults([]);
    setUploading({ icon: false, banner: false, categoryImage: false });
  };

  // File upload handler with Base64 conversion and size validation
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    // Size validation (max 2MB for icons, 5MB for banners)
    const maxSize = type === 'icon' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      await error(`File too large. Maximum size is ${type === 'icon' ? '2MB' : '5MB'}.`);
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      await error('Please select a valid image file.');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        
        // Update form data with Base64 string
        setFormData(prev => ({ ...prev, [type]: base64String }));
        
        // Set preview
        if (type === 'icon') {
          setIconPreview(base64String);
        } else {
          setBannerPreview(base64String);
        }
        
        setUploading(prev => ({ ...prev, [type]: false }));
      };
      
      reader.onerror = async () => {
        await error('Error reading file. Please try again.');
        setUploading(prev => ({ ...prev, [type]: false }));
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing file:', err);
      await error('Error processing file. Please try again.');
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file, 'icon');
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file, 'banner');
  };

  const handleCategoryImageUpload = (e) => {
    const file = e.target.files[0];
    handleCategoryImageUpload_internal(file);
  };

  const handleCategoryImageUpload_internal = async (file) => {
    if (!file) return;

    // Size validation (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      await error('File too large. Maximum size is 2MB.');
      return;
    }

    // File type validation
    if (!file.type.startsWith('image/')) {
      await error('Please select a valid image file.');
      return;
    }

    setUploading(prev => ({ ...prev, categoryImage: true }));

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        
        // Update form data with Base64 string
        setFormData(prev => ({ ...prev, category_image: base64String }));
        
        // Set preview
        setCategoryImagePreview(base64String);
        
        setUploading(prev => ({ ...prev, categoryImage: false }));
      };
      
      reader.onerror = async () => {
        await error('Error reading file. Please try again.');
        setUploading(prev => ({ ...prev, categoryImage: false }));
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing file:', err);
      await error('Error processing file. Please try again.');
      setUploading(prev => ({ ...prev, categoryImage: false }));
    }
  };

  const removeFile = (type) => {
    setFormData(prev => ({ ...prev, [type]: '' }));
    if (type === 'icon') {
      setIconPreview('');
    } else {
      setBannerPreview('');
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const toggleMainMenu = async (categoryId, currentValue) => {
    try {
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_in_main_menu: !currentValue })
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const err = await response.json();
            await error(err.error || 'Failed to update main menu setting');
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            await error('Failed to update main menu setting');
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          await error('Failed to update main menu setting');
        }
      }
    } catch (err) {
      console.error('Error updating main menu setting:', err);
      await error('Failed to update main menu setting');
    }
  };

  const handleDragStart = (e, category) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetCategory) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetCategory.id) return;

    // Simple reordering - in a real implementation, you'd want more sophisticated logic
    try {
      const allCategories = flattenCategories(categories);
      const newOrder = reorderCategories(allCategories, draggedItem, targetCategory);
      
      const response = await fetch('/api/admin/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newOrder })
      });

      if (response.ok) {
        await fetchCategories();
      } else {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const err = await response.json();
            await error(err.error || 'Failed to reorder categories');
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text);
            await error('Failed to reorder categories');
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          await error('Failed to reorder categories');
        }
      }
    } catch (err) {
      console.error('Error reordering categories:', err);
      await error('Failed to reorder categories');
    }

    setDraggedItem(null);
  };

  const flattenCategories = (cats) => {
    const result = [];
    const addCategories = (categories, level = 0) => {
      categories.forEach(cat => {
        result.push({ ...cat, level });
        if (cat.children && cat.children.length > 0) {
          addCategories(cat.children, level + 1);
        }
      });
    };
    addCategories(cats);
    return result;
  };

  const reorderCategories = (categories, draggedItem, targetCategory) => {
    const filtered = categories.filter(cat => cat.id !== draggedItem.id);
    const targetIndex = filtered.findIndex(cat => cat.id === targetCategory.id);
    filtered.splice(targetIndex, 0, draggedItem);
    return filtered.map((cat, index) => ({ id: cat.id, order_position: index }));
  };

  const renderCategory = (category, level = 0) => (
    <div
      key={category.id}
      className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2"
      draggable
      onDragStart={(e) => handleDragStart(e, category)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, category)}
    >
      <div className={`p-4 bg-white dark:bg-gray-800 ${level > 0 ? 'ml-8 border-l-4 border-blue-500' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {category.icon && category.icon.startsWith('data:') && (
                <img src={category.icon} alt="" className="w-6 h-6 object-cover rounded" />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {category.name}
                  {level > 0 && <span className="text-sm text-gray-500 ml-2">(Sub-category)</span>}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">/{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Main Menu Toggle - Only for main categories */}
            {level === 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show in Main Menu:</span>
                <button
                  onClick={() => toggleMainMenu(category.id, category.show_in_main_menu)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    category.show_in_main_menu ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      category.show_in_main_menu ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
            
            {/* Status Badge */}
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              category.status 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {category.status ? 'Active' : 'Inactive'}
            </span>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(category)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                title="Edit category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title="Delete category"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Render Sub-categories */}
      {category.children && category.children.length > 0 && (
        <div className="ml-4">
          {category.children.map(child => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <Head>
        <title>Category Management - Admin Dashboard</title>
      </Head>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage categories and sub-categories for your store</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingCategory(null);
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Categories</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop to reorder • Toggle "Show in Main Menu" for header visibility
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No categories found. Create your first category to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map(category => renderCategory(category))}
              </div>
            )}
          </div>
        </div>





        {/* Add/Edit Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                    className="text-white hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-white/10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => {
                          let cleanSlug = e.target.value.toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters but keep spaces
                            .replace(/\s+/g, '-') // Replace spaces with hyphens
                            .replace(/-+/g, '-') // Replace multiple hyphens with single
                            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
                          
                          // Prevent overly long slugs
                          if (cleanSlug.length > 50) {
                            cleanSlug = cleanSlug.substring(0, 50).replace(/-+$/, '');
                          }
                          
                          setFormData(prev => ({ ...prev, slug: cleanSlug }));
                        }}
                        placeholder="category-slug"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        URL-friendly identifier (lowercase, hyphens only)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Parent Category
                      </label>
                      <select
                        value={formData.parent_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      >
                        <option value="">None (Main Category)</option>
                        {flattenCategories(categories)
                          .filter(cat => cat.level === 0 && cat.id !== editingCategory?.id)
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))
                        }
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Position
                      </label>
                      <input
                        type="number"
                        value={formData.order_position}
                        onChange={(e) => setFormData(prev => ({ ...prev, order_position: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>

                    {/* Icon Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Category Icon (Max 2MB)</span>
                        </span>
                      </label>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIconUpload}
                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            disabled={uploading.icon}
                          />
                          {uploading.icon && (
                            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                              <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
                                Converting to Base64...
                              </div>
                            </div>
                          )}
                        </div>
                        {iconPreview && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img src={iconPreview} alt="معاينة الأيقونة" className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">Icon uploaded successfully</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Base64 encoded</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile('icon')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                title="Remove Icon"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Category Banner (Max 5MB)</span>
                        </span>
                      </label>
                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700"
                            disabled={uploading.banner}
                          />
                          {uploading.banner && (
                            <div className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent mr-3"></div>
                                Converting to Base64...
                              </div>
                            </div>
                          )}
                        </div>
                        {bannerPreview && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img src={bannerPreview} alt="معاينة البانر" className="w-20 h-10 object-cover rounded-lg border-2 border-white shadow-sm" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">Banner uploaded successfully</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Base64 encoded</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile('banner')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                title="Remove Banner"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Link URL
                      </label>
                      <input
                        type="text"
                        value={formData.link}
                        onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                        placeholder="https://example.com or /custom-page"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sub-description
                    </label>
                    <textarea
                      value={formData.sub_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, sub_description: e.target.value }))}
                      rows={2}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    />
                  </div>

                  {/* Main Menu Configuration Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Main Menu Configuration
                    </h3>

                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.show_in_main_menu}
                            onChange={(e) => setFormData(prev => ({ ...prev, show_in_main_menu: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Show in Main Menu</span>
                        </label>

                        {formData.show_in_main_menu && (
                          <div className="space-y-4 pl-6 border-l-2 border-blue-300 dark:border-blue-600">
                            
                            {/* Category Image Upload */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category Image for Main Menu (Max 2MB)
                              </label>
                              <div className="space-y-3">
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCategoryImageUpload}
                                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                    disabled={uploading.categoryImage}
                                  />
                                  {uploading.categoryImage && (
                                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                                    </div>
                                  )}
                                </div>
                                {categoryImagePreview && (
                                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <img src={categoryImagePreview} alt="Category preview" className="w-12 h-12 object-cover rounded-lg" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">Category Image Uploaded</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">This image will appear in the Main Menu</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCategoryImagePreview('');
                                        setFormData(prev => ({ ...prev, category_image: '' }));
                                      }}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Main Menu Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Main Menu Description
                              </label>
                              <textarea
                                value={formData.main_menu_description}
                                onChange={(e) => setFormData(prev => ({ ...prev, main_menu_description: e.target.value }))}
                                rows={2}
                                placeholder="Brief description shown in Main Menu..."
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                              />
                            </div>

                            {/* Display Type Toggle */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Main Menu Display Type
                              </label>
                              <div className="flex space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="main_menu_display_type"
                                    value="products"
                                    checked={formData.main_menu_display_type === 'products'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, main_menu_display_type: e.target.value }))}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show Popular Products</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="main_menu_display_type"
                                    value="image"
                                    checked={formData.main_menu_display_type === 'image'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, main_menu_display_type: e.target.value }))}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show Category Image</span>
                                </label>
                              </div>
                            </div>

                            {/* Popular Products Selection */}
                            {formData.main_menu_display_type === 'products' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Popular Products (Max 10)
                                </label>
                                
                                {/* Product Search */}
                                <div className="relative mb-3">
                                  <input
                                    type="text"
                                    value={productSearchTerm}
                                    onChange={(e) => {
                                      setProductSearchTerm(e.target.value);
                                      searchProducts(e.target.value);
                                    }}
                                    placeholder="Search products to add..."
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                  />
                                  
                                  {/* Search Results */}
                                  {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                      {searchResults.map(product => (
                                        <button
                                          key={product.id}
                                          type="button"
                                          onClick={() => addProductToSelection(product)}
                                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                                        >
                                          <img 
                                            src={getProductImageUrl(product)} 
                                            alt={product.name}
                                            className="w-8 h-8 object-cover rounded"
                                            onError={(e) => {
                                              e.currentTarget.src = '/placeholder-game.svg';
                                            }}
                                          />
                                          <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">€{product.price}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Selected Products */}
                                {selectedProducts.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Selected Products ({selectedProducts.length}/10):</p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {selectedProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                          <div className="flex items-center space-x-3">
                                            <img 
                                              src={getProductImageUrl(product)} 
                                              alt={product.name}
                                              className="w-6 h-6 object-cover rounded"
                                              onError={(e) => {
                                                e.currentTarget.src = '/placeholder-game.svg';
                                              }}
                                            />
                                            <span className="text-sm text-gray-900 dark:text-white">{product.name}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => removeProductFromSelection(product.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingCategory(null);
                        resetForm();
                      }}
                      className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading.icon || uploading.banner}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {uploading.icon || uploading.banner ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </span>
                      ) : (
                        editingCategory ? 'Update Category' : 'Create Category'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Success!</h3>
                <p className="text-gray-600 dark:text-gray-400">{successMessage}</p>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSuccessMessage('');
                  }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  OK
                </button>
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
        />
      </div>
    </DashboardLayout>
  );
}