import { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/layout/AdminLayout';
import CustomModal from '../../../../components/ui/CustomModal';
import { useModal } from '../../../../hooks/useModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faQuestionCircle, 
  faHeadset, 
  faChevronDown,
  faChevronUp,
  faPlus,
  faTrash,
  faEdit,
  faSave,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faCheck,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';

export default function HelpCenterAdmin() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Modal hook for custom dialogs
  const { modal, confirmDelete, confirm, handleInputChange, closeModal } = useModal();
  
  // FAQ State
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({
    category_id: '',
    question: '',
    answer: '',
    sort_order: 0
  });

  // Categories State
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadFaqs()]);
    } catch (error) {
      showNotification('Error loading data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const response = await fetch('/api/admin/help-center/categories');
    if (response.ok) {
      setCategories(await response.json());
    }
  };

  const loadFaqs = async () => {
    const response = await fetch('/api/admin/help-center/faqs');
    if (response.ok) {
      setFaqs(await response.json());
    }
  };



  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // FAQ Functions
  const handleCreateFaq = async () => {
    if (!newFaq.category_id || !newFaq.question || !newFaq.answer) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      const response = await fetch('/api/admin/help-center/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaq)
      });

      if (response.ok) {
        showNotification('FAQ created successfully');
        setNewFaq({ category_id: '', question: '', answer: '', sort_order: 0 });
        loadFaqs();
      } else {
        throw new Error('Failed to create FAQ');
      }
    } catch (error) {
      showNotification('Error creating FAQ: ' + error.message, 'error');
    }
  };

  const handleUpdateFaq = async (id, updatedFaq) => {
    try {
      const response = await fetch(`/api/admin/help-center/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFaq)
      });

      if (response.ok) {
        showNotification('FAQ updated successfully');
        setEditingFaq(null);
        loadFaqs();
      } else {
        throw new Error('Failed to update FAQ');
      }
    } catch (error) {
      showNotification('Error updating FAQ: ' + error.message, 'error');
    }
  };

  const handleDeleteFaq = async (id) => {
    const confirmed = await confirmDelete('Are you sure you want to delete this FAQ? This action cannot be undone.', 'Delete FAQ');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/help-center/faqs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('FAQ deleted successfully');
        loadFaqs();
      } else {
        throw new Error('Failed to delete FAQ');
      }
    } catch (error) {
      showNotification('Error deleting FAQ: ' + error.message, 'error');
    }
  };

  // Category Functions
  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      showNotification('Please fill in name and slug', 'error');
      return;
    }

    try {
      const response = await fetch('/api/admin/help-center/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        showNotification('Category created successfully');
        setNewCategory({ name: '', slug: '', description: '', sort_order: 0 });
        loadCategories();
      } else {
        throw new Error('Failed to create category');
      }
    } catch (error) {
      showNotification('Error creating category: ' + error.message, 'error');
    }
  };

  const handleUpdateCategory = async (id, updatedCategory) => {
    try {
      const response = await fetch(`/api/admin/help-center/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory)
      });

      if (response.ok) {
        showNotification('Category updated successfully');
        setEditingCategory(null);
        loadCategories();
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      showNotification('Error updating category: ' + error.message, 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirmed = await confirmDelete('Are you sure you want to delete this category? This will also delete all associated FAQs and articles.', 'Delete Category');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/help-center/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Category deleted successfully');
        loadCategories();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete category (${response.status})`);
      }
    } catch (error) {
      showNotification('Error deleting category: ' + error.message, 'error');
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    searchTerm === '' || 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'error' 
                ? 'bg-red-100 border border-red-300 text-red-800' 
                : 'bg-green-100 border border-green-300 text-green-800'
            }`}>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={notification.type === 'error' ? faExclamationCircle : faCheckCircle} 
                  className="mr-2" 
                />
                {notification.message}
                <button 
                  onClick={() => setNotification(null)}
                  className="ml-4 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faHeadset} className="mr-3 text-blue-600" />
              Help Center Management
            </h1>
            <p className="text-xl text-gray-600">
              Manage help center categories and frequently asked questions
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'categories'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
                  Categories
                </button>
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'faq'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                  FAQs
                </button>

              </nav>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          )}

          {/* Categories Management Tab */}
          {activeTab === 'categories' && !loading && (
            <div className="space-y-6">
              {/* Create Category Form */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  <FontAwesomeIcon icon={faPlus} className="mr-2 text-blue-600" />
                  Create New Category
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Category Name *"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Category Slug *"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Sort Order"
                    value={newCategory.sort_order}
                    onChange={(e) => setNewCategory({...newCategory, sort_order: parseInt(e.target.value) || 0})}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <textarea
                  placeholder="Category Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                />
                <button
                  onClick={handleCreateCategory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Create Category
                </button>
              </div>

              {/* Categories List */}
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {editingCategory?.id === category.id ? (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Category Name"
                          />
                          <input
                            type="text"
                            value={editingCategory.slug}
                            onChange={(e) => setEditingCategory({...editingCategory, slug: e.target.value})}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Category Slug"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="number"
                            value={editingCategory.sort_order || 0}
                            onChange={(e) => setEditingCategory({...editingCategory, sort_order: parseInt(e.target.value) || 0})}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Sort Order"
                          />
                        </div>
                        <textarea
                          value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                          placeholder="Category Description"
                        />
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdateCategory(category.id, editingCategory)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700"
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {category.slug}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {category.description && (
                              <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Sort Order: {category.sort_order}</span>
                              <span>FAQs: {category.faq_count || 0}</span>
                              <span>Articles: {category.article_count || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <FontAwesomeIcon icon={faFolderOpen} className="text-4xl text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h4>
                    <p className="text-gray-600">Create your first category to organize your help content.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQ Management Tab */}
          {activeTab === 'faq' && !loading && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Create FAQ Form */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  <FontAwesomeIcon icon={faPlus} className="mr-2 text-blue-600" />
                  Create New FAQ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={newFaq.category_id}
                    onChange={(e) => setNewFaq({...newFaq, category_id: e.target.value})}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-white text-gray-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Sort Order"
                    value={newFaq.sort_order}
                    onChange={(e) => setNewFaq({...newFaq, sort_order: parseInt(e.target.value) || 0})}
                    className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="FAQ Question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                />
                <textarea
                  placeholder="FAQ Answer"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                />
                <button
                  onClick={handleCreateFaq}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Create FAQ
                </button>
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {editingFaq?.id === faq.id ? (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <select
                            value={editingFaq.category_id}
                            onChange={(e) => setEditingFaq({...editingFaq, category_id: parseInt(e.target.value)})}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id} className="bg-white text-gray-900">
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Sort Order"
                            value={editingFaq.sort_order || 0}
                            onChange={(e) => setEditingFaq({...editingFaq, sort_order: parseInt(e.target.value) || 0})}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                        />
                        <textarea
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})}
                          rows={4}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                        />
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleUpdateFaq(faq.id, editingFaq)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700"
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-2" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {faq.category_name || 'No Category'}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {faq.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">{faq.question}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFaq(faq);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFaq(faq.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <FontAwesomeIcon 
                              icon={expandedFaq === faq.id ? faChevronUp : faChevronDown}
                              className="text-gray-400"
                            />
                          </div>
                        </div>
                        {expandedFaq === faq.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No FAQ Items Found */}
          {activeTab === 'faq' && !loading && filteredFaqs.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl text-gray-300 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No FAQs Found</h4>
              <p className="text-gray-600">
                {searchTerm ? 'No FAQs match your search criteria.' : 'Create your first FAQ to help your customers.'}
              </p>
            </div>
          )}



          {/* Custom Modal */}
          {modal.isOpen && (
            <CustomModal {...modal} />
          )}

        </div>
      </div>
    </AdminLayout>
  );
}
