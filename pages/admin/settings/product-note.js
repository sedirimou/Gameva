import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../../components/layout/AdminLayout';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import AdminNotification, { showAdminNotification } from '../../../components/admin/AdminNotification';
import Input from '../../../components/admin/Input';
import AdminSelect from '../../../components/admin/Select';

export default function ProductNotePage() {
  const [notes, setNotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProducts, setSearchProducts] = useState([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    note_type: 'category', // 'category' or 'product'
    category_ids: [],
    product_ids: [],
    title_1: '',
    title_2: '',
    note: ''
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // CKEditor state
  const [editorReady, setEditorReady] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchCategories();
    fetchProducts();
    loadCKEditor();
  }, []);



  // Transform categories for hierarchical display
  const categoryOptions = Array.isArray(categories) ? categories
    .sort((a, b) => {
      // Sort main categories first, then subcategories
      if (!a.parent_id && b.parent_id) return -1;
      if (a.parent_id && !b.parent_id) return 1;
      return a.order_position - b.order_position;
    })
    .map(category => ({
      value: category.id,
      label: category.parent_id ? `└─ ${category.name}` : category.name,
      isMainCategory: !category.parent_id
    })) : [];

  // Transform products for searchable dropdown
  const productOptions = Array.isArray(products) ? products
    .sort((a, b) => a.name?.localeCompare(b.name) || 0)
    .map(product => ({
      value: product.id,
      label: `${product.name} (ID: ${product.id})`,
      productId: product.id,
      productName: product.name
    })) : [];

  const loadCKEditor = () => {
    if (typeof window !== 'undefined' && window.CKEDITOR) {
      setEditorReady(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js';
      script.onload = () => {
        setEditorReady(true);
      };
      document.head.appendChild(script);
    }
  };

  const initializeEditor = () => {
    if (editorReady && typeof window !== 'undefined' && window.CKEDITOR) {
      setTimeout(() => {
        try {
          if (window.CKEDITOR.instances['note-editor']) {
            window.CKEDITOR.instances['note-editor'].destroy();
          }
          
          const editor = window.CKEDITOR.replace('note-editor', {
            height: 200,
            toolbar: [
              { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
              { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
              { name: 'links', items: ['Link', 'Unlink'] },
              { name: 'tools', items: ['Maximize'] }
            ],
            // Hide security notifications permanently
            versionCheck: false,
            notification_aggregationTimeout: 0,
            removeButtons: '',
            extraPlugins: '',
            // Disable all notifications including security warnings
            on: {
              instanceReady: function() {
                // Hide any existing notification bars
                if (this.ui.space('notification')) {
                  this.ui.space('notification').setHtml('');
                  this.ui.space('notification').setStyle('display', 'none');
                }
              }
            }
          });
          
          editor.on('instanceReady', () => {
            setEditorInstance(editor);
            if (noteContent) {
              editor.setData(noteContent);
            }
          });
        } catch (error) {
          console.error('Error initializing CKEditor:', error);
        }
      }, 100);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/admin/product-notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  const searchProductsAsync = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    setIsSearchingProducts(true);
    try {
      const response = await fetch(`/api/admin/products?search=${encodeURIComponent(inputValue)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        const products = data.products || [];
        return products.map(product => ({
          value: product.id,
          label: `${product.name} (ID: ${product.id})`,
          productId: product.id,
          productName: product.name
        }));
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearchingProducts(false);
    }
    return [];
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/product-categories?hierarchical=false');
      if (response.ok) {
        const data = await response.json();
        console.log('Categories fetch response:', data);
        // Extract categories array from the response
        const categoriesArray = data.categories || data || [];
        console.log('Setting categories:', categoriesArray);
        setCategories(Array.isArray(categoriesArray) ? categoriesArray : []);
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on note type
    if (formData.note_type === 'category') {
      if (!formData.category_ids || formData.category_ids.length === 0) {
        alert('Please select at least one category');
        return;
      }
    } else if (formData.note_type === 'product') {
      if (!formData.product_ids || formData.product_ids.length === 0) {
        alert('Please select at least one product');
        return;
      }
    }

    let noteContent = '';
    if (editorInstance) {
      noteContent = editorInstance.getData();
    }

    if (!noteContent.trim()) {
      alert('Please enter note content');
      return;
    }

    try {
      const url = '/api/admin/product-notes';
      const method = editingNote ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        note: noteContent,
        ...(editingNote && { id: editingNote.id })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchNotes();
        handleCloseModal();
        showAdminNotification('success', 'Success', editingNote ? 'Note updated successfully!' : 'Note created successfully!');
      } else {
        const error = await response.json();
        showAdminNotification('error', 'Error', error.error || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      showAdminNotification('error', 'Error', 'Error saving note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    
    // Handle both old single category and new multiple categories
    let categoryIds = [];
    let selectedCategoryOptions = [];
    let productIds = [];
    let selectedProductOptions = [];
    
    if (note.note_type === 'category') {
      // Use category_ids array if available, fallback to single category_id
      categoryIds = note.category_ids || (note.category_id ? [note.category_id] : []);
      selectedCategoryOptions = categoryIds.map(id => {
        const category = categories.find(cat => cat.id === id);
        return category ? {
          value: category.id,
          label: category.parent_id ? `└─ ${category.name}` : category.name,
          isMainCategory: !category.parent_id
        } : null;
      }).filter(Boolean);
    } else if (note.note_type === 'product') {
      productIds = note.product_ids || [];
      selectedProductOptions = productIds.map(id => {
        const product = products.find(prod => prod.id === id);
        return product ? {
          value: product.id,
          label: product.name
        } : null;
      }).filter(Boolean);
    }
    
    setFormData({
      note_type: note.note_type || 'category',
      category_ids: categoryIds,
      product_ids: productIds,
      title_1: note.title_1 || '',
      title_2: note.title_2 || '',
      note: note.note || ''
    });
    
    setSelectedCategories(selectedCategoryOptions);
    setSelectedProducts(selectedProductOptions);
    setNoteContent(note.note || '');
    setShowModal(true);
  };

  const handleDelete = async (noteId) => {
    // Create a custom confirmation modal instead of browser confirm
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (confirmed) {
      try {
        const response = await fetch(`/api/admin/product-notes?id=${noteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchNotes();
          showAdminNotification('success', 'Success', 'Note deleted successfully!');
        } else {
          showAdminNotification('error', 'Error', 'Failed to delete note');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        showAdminNotification('error', 'Error', 'Error deleting note');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({
      note_type: 'category',
      category_ids: [],
      product_ids: [],
      title_1: '',
      title_2: '',
      note: ''
    });
    setSelectedCategories([]);
    setSelectedProducts([]);
    setNoteContent('');
    
    if (editorInstance) {
      editorInstance.setData('');
    }
  };

  const handleCategoryChange = (selectedOptions) => {
    const categoryIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedCategories(selectedOptions || []);
    setFormData({ ...formData, category_ids: categoryIds });
  };

  const handleProductChange = (selectedOptions) => {
    const productIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedProducts(selectedOptions || []);
    setFormData({ ...formData, product_ids: productIds });
  };

  const handleNoteTypeChange = (noteType) => {
    setFormData({ 
      ...formData, 
      note_type: noteType,
      category_ids: [],
      product_ids: [],
      title_1: '',
      title_2: ''
    });
    setSelectedCategories([]);
    setSelectedProducts([]);
  };

  useEffect(() => {
    if (showModal && editorReady) {
      initializeEditor();
    }
  }, [showModal, editorReady]);



  if (loading) {
    return (
      <AdminLayout title="Product Note Management" currentPage="Product Note Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Product Note Management - Admin</title>
        <style jsx>{`
          /* Hide CKEditor security notifications permanently */
          .cke_notification_warning,
          .cke_notification_info,
          .cke_notification,
          .cke_notification_message {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          
          /* Hide any notification containers */
          .cke_notification_close,
          .cke_notification_progress,
          .cke_notification_text {
            display: none !important;
          }
        `}</style>
      </Head>
      <AdminLayout title="Product Note Management" currentPage="Product Note Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Note Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Add New Note
            </button>
          </div>

          {/* Notes List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Existing Notes</h3>
            </div>
            
            {notes.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No product notes found. Create your first note to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notes.map((note) => (
                  <div key={note.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-1">
                          <div className="mb-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                note.note_type === 'category' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              }`}>
                                {note.note_type === 'category' ? 'Category Note' : 'Product Note'}
                              </span>
                            </div>
                            {(note.title_1 || note.title_2) && (
                              <div className="mb-2">
                                {note.title_1 && (
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {note.title_1}
                                  </h3>
                                )}
                                {note.title_2 && (
                                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                    {note.title_2}
                                  </h4>
                                )}
                              </div>
                            )}
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {note.note_type === 'category' 
                                ? `Category: ${note.category_name || 'Multiple Categories'}`
                                : `${note.product_count || 0} Selected Products`
                              }
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              {note.note_type === 'category'
                                ? `${note.product_count || 0} products will inherit this note (including subcategories)`
                                : `Individual note assigned to ${note.product_count || 0} specific products`
                              }
                            </p>
                          </div>
                          <div 
                            className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none mb-2"
                            dangerouslySetInnerHTML={{ __html: note.note }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Updated: {new Date(note.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(note)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingNote ? 'Edit Product Note' : 'Add New Product Note'}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Note Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="note_type"
                        value="category"
                        checked={formData.note_type === 'category'}
                        onChange={(e) => handleNoteTypeChange(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Category Note (Inherits to subcategories)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="note_type"
                        value="product"
                        checked={formData.note_type === 'product'}
                        onChange={(e) => handleNoteTypeChange(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Individual Product Note</span>
                    </label>
                  </div>
                </div>

                {/* Category Selection (only show if category type) */}
                {formData.note_type === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categories (Select multiple)
                  </label>
                  <Select
                    key={`categories-${categories.length}`}
                    value={selectedCategories}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    isMulti
                    placeholder="Select categories..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={() => categoryOptions.length === 0 ? "Loading categories..." : "No options"}
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        fontWeight: state.data.isMainCategory ? 'bold' : 'normal',
                        paddingLeft: state.data.isMainCategory ? '12px' : '28px',
                        color: '#374151',
                        backgroundColor: state.isFocused ? '#EBF4FF' : 'white',
                        '&:hover': {
                          backgroundColor: '#EBF4FF'
                        }
                      }),
                      control: (provided) => ({
                        ...provided,
                        borderColor: '#D1D5DB',
                        '&:hover': {
                          borderColor: '#9CA3AF'
                        },
                        '&:focus-within': {
                          borderColor: '#3B82F6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#EBF4FF',
                        border: '1px solid #BFDBFE'
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#1E40AF'
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#6B7280',
                        '&:hover': {
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626'
                        }
                      })
                    }}
                  />
                </div>
                )}

                {/* Product Selection (only show if product type) */}
                {formData.note_type === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Products (Select multiple)
                  </label>
                  <AsyncSelect
                    key={`products-async-search`}
                    value={selectedProducts}
                    onChange={handleProductChange}
                    loadOptions={searchProductsAsync}
                    defaultOptions={[]}
                    isMulti
                    placeholder="Type to search for products..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={({ inputValue }) => 
                      inputValue && inputValue.length >= 2 
                        ? "No products found" 
                        : "Type at least 2 characters to search"
                    }
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        color: '#374151',
                        backgroundColor: state.isFocused ? '#EBF4FF' : 'white',
                        '&:hover': {
                          backgroundColor: '#EBF4FF'
                        }
                      }),
                      control: (provided) => ({
                        ...provided,
                        borderColor: '#D1D5DB',
                        '&:hover': {
                          borderColor: '#9CA3AF'
                        },
                        '&:focus-within': {
                          borderColor: '#3B82F6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#EBF4FF',
                        border: '1px solid #BFDBFE'
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#1E40AF'
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#1E40AF',
                        '&:hover': {
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626'
                        }
                      })
                    }}
                  />
                </div>
                )}

                {/* Title Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title 1
                    </label>
                    <input
                      type="text"
                      value={formData.title_1}
                      onChange={(e) => setFormData({ ...formData, title_1: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter title 1..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title 2
                    </label>
                    <input
                      type="text"
                      value={formData.title_2}
                      onChange={(e) => setFormData({ ...formData, title_2: e.target.value })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter title 2..."
                    />
                  </div>
                </div>

                {/* Note Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note Content *
                  </label>
                  <textarea
                    id="note-editor"
                    name="note-editor"
                    rows={8}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the note content here..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
      <AdminNotification />
    </>
  );
}