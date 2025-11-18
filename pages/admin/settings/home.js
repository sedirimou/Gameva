import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGripVertical, 
  faEdit, 
  faEye, 
  faEyeSlash, 
  faTrash,
  faPlus,
  faSearch,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

export default function HomeSettings() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sectionProducts, setSectionProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/home-sections');
      const data = await response.json();
      if (data.success) {
        setSections(data.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = async (section) => {
    setEditingSection(section);
    // Fetch section products
    try {
      const response = await fetch(`/api/admin/home-sections/${section.id}`);
      const data = await response.json();
      if (data.success) {
        setSectionProducts(data.products);
        setSelectedProducts(data.products.map(p => p.product_id));
      }
    } catch (error) {
      console.error('Error fetching section products:', error);
    }
  };

  const fetchInitialProducts = async () => {
    setSearchLoading(true);
    try {
      const response = await fetch('/api/admin/product-search?limit=50');
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.products);
      }
    } catch (error) {
      console.error('Error fetching initial products:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      // If query is empty or too short, show initial products
      if (query.length === 0) {
        await fetchInitialProducts();
      } else {
        setSearchResults([]);
      }
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/admin/product-search?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchFocus = async () => {
    // Fetch initial products when search field is focused
    if (searchResults.length === 0 && searchQuery.length === 0) {
      await fetchInitialProducts();
    }
  };

  const handleProductSelect = async (product) => {
    const isSelected = selectedProducts.includes(product.id);
    
    if (isSelected) {
      // Remove product
      setSelectedProducts(prev => prev.filter(id => id !== product.id));
      setSectionProducts(prev => prev.filter(p => p.product_id !== product.id));
      
      await fetch(`/api/admin/home-sections/${editingSection.id}/products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id })
      });
    } else {
      // Add product
      setSelectedProducts(prev => [...prev, product.id]);
      setSectionProducts(prev => [...prev, { 
        ...product, 
        product_id: product.id,
        order_index: prev.length + 1 
      }]);
      
      await fetch(`/api/admin/home-sections/${editingSection.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: [product.id] })
      });
    }
    
    // Refresh sections to update product counts
    fetchSections();
  };

  const toggleSectionVisibility = async (section) => {
    try {
      const response = await fetch(`/api/admin/home-sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: section.title,
          is_visible: !section.is_visible
        })
      });

      if (response.ok) {
        fetchSections();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const getProductImage = (product) => {
    // Handle JSON string format
    if (product.images_cover_url) {
      try {
        if (typeof product.images_cover_url === 'string' && product.images_cover_url.startsWith('{')) {
          const imageObj = JSON.parse(product.images_cover_url);
          if (imageObj.url) return imageObj.url;
          if (imageObj.thumbnail) return imageObj.thumbnail;
        } else if (typeof product.images_cover_url === 'string') {
          return product.images_cover_url;
        }
      } catch (e) {
        // If JSON parsing fails, treat as direct URL
        if (typeof product.images_cover_url === 'string') {
          return product.images_cover_url;
        }
      }
    }
    
    // Handle thumbnail fallback
    if (product.images_cover_thumbnail) {
      try {
        if (typeof product.images_cover_thumbnail === 'string' && product.images_cover_thumbnail.startsWith('{')) {
          const imageObj = JSON.parse(product.images_cover_thumbnail);
          if (imageObj.url) return imageObj.url;
          if (imageObj.thumbnail) return imageObj.thumbnail;
        } else if (typeof product.images_cover_thumbnail === 'string') {
          return product.images_cover_thumbnail;
        }
      } catch (e) {
        if (typeof product.images_cover_thumbnail === 'string') {
          return product.images_cover_thumbnail;
        }
      }
    }
    
    return '/placeholder-game.svg';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Manage Homepage Sections</h1>
          </div>

          {!editingSection ? (
            // Section List View
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Current Sections</h2>
                <p className="text-sm text-gray-600">Drag and drop to reorder sections</p>
              </div>

              <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <FontAwesomeIcon 
                        icon={faGripVertical} 
                        className="text-gray-400 cursor-move"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-600">{parseInt(section.product_count) || 0} Products</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSectionVisibility(section)}
                        className={`p-2 rounded-lg transition-colors ${
                          section.is_visible 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <FontAwesomeIcon icon={section.is_visible ? faEye : faEyeSlash} />
                      </button>
                      
                      <button
                        onClick={() => handleEditSection(section)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>

                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>

                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                        <FontAwesomeIcon icon={faGripVertical} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Product Search View
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Section Products</h2>
                  <p className="text-sm text-gray-600">Editing: {editingSection.title}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setSearchQuery('');
                    setSearchResults([]);
                    setSelectedProducts([]);
                    setSectionProducts([]);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Back to Sections
                </button>
              </div>

              {/* Product Search */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Product Search</h3>
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={handleSearchFocus}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                
                {(searchQuery || searchResults.length > 0) && (
                  <p className="mt-2 text-sm text-gray-600">
                    {searchLoading ? 'Searching...' : `${searchResults.length} results found`}
                  </p>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-8">
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {searchResults.map((product) => {
                      const isSelected = selectedProducts.includes(product.id);
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">ID: {product.id}</p>
                          </div>
                          {isSelected && (
                            <FontAwesomeIcon icon={faCheck} className="text-blue-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Products */}
              {sectionProducts.length > 0 && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Selected Products ({sectionProducts.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionProducts.map((product) => (
                      <div
                        key={product.product_id}
                        className="flex items-center p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-600">ID: {product.product_id}</p>
                        </div>
                        <button
                          onClick={() => handleProductSelect({ id: product.product_id })}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}