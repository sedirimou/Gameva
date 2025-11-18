import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminNotification, { showAdminNotification } from '../../components/admin/AdminNotification';
import { useModal } from '../../hooks/useModal';
import CustomModal from '../../components/ui/CustomModal';
import { getProductImageUrl } from '../../lib/imageUtils';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(25);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryTypeToggle, setCategoryTypeToggle] = useState('category'); // 'category' or 'type'
  const { modal, confirm, error, success } = useModal();
  const [filters, setFilters] = useState({
    search: '',
    platform: '',
    category: '',
    region: '',
    type: '',
    system: '',
    priceMin: '',
    priceMax: '',
    commissionMin: '',
    commissionMax: ''
  });

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    platforms: [],
    categories: [],
    regions: [],
    types: [],
    systems: []
  });

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [currentPage, productsPerPage, sortBy, sortOrder]);

  // Debounced search and filter effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching/filtering
      fetchProducts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * productsPerPage;
      const queryParams = new URLSearchParams({
        limit: productsPerPage,
        offset: offset,
        sortBy: sortBy,
        sortOrder: sortOrder,
        _cacheBust: Date.now() + Math.random(), // Strong cache busting
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`/api/admin/products-with-commission?${queryParams}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const data = await response.json();
      
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const fetchFilterOptions = async () => {
    try {
      // Add cache buster to ensure fresh data
      const cacheBuster = Date.now();
      const response = await fetch(`/api/admin/filter-options?_cacheBust=${cacheBuster}`);
      const result = await response.json();
      const data = result.data || result; // Handle both nested and flat response structures
      setFilterOptions({
        platforms: data.platforms || [],
        categories: data.categories || [],
        regions: data.regions || [],
        types: data.types || [],
        systems: data.systems || []
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async (action, value = null) => {
    if (selectedProducts.length === 0) {
      await error('No Products Selected', 'Please select products first before performing bulk actions.');
      return;
    }

    try {
      let response;
      
      if (action === 'changeCategory') {
        // Value is now a category ID (since we fixed the dropdown)
        const categoryId = parseInt(value);
        if (!categoryId) {
          await error('Invalid Selection', 'Please select a valid category before proceeding.');
          return;
        }
        
        // Use the proper admin products API for category updates
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateCategory',
            productIds: selectedProducts,
            categoryId: categoryId
          })
        });
      } else if (action === 'removeFromCategory') {
        // Remove products from all categories (make them uncategorized)
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'removeFromCategory',
            productIds: selectedProducts
          })
        });
      } else if (action === 'changeSystem') {
        // Use the proper admin products API for system updates
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateSystems',
            productIds: selectedProducts,
            systems: [value]
          })
        });
      } else {
        // Use the old bulk API for other actions
        response = await fetch('/api/admin/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            productIds: selectedProducts,
            value
          })
        });
      }

      if (response.ok) {
        const result = await response.json();
        fetchProducts();
        setSelectedProducts([]);
        showAdminNotification('success', 'Bulk Operation Complete', result.message || `Successfully updated ${selectedProducts.length} products`);
      } else {
        const error = await response.json();
        showAdminNotification('error', 'Bulk Operation Failed', error.error || 'Failed to update products');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      showAdminNotification('error', 'Operation Failed', 'Failed to complete bulk operation. Please try again.');
    }
  };

  const handleProductAction = async (productId, action) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchProducts();
        showAdminNotification('success', 'Product Updated', `Product ${action} completed successfully`);
      } else {
        showAdminNotification('error', 'Update Failed', `Failed to ${action} product`);
      }
    } catch (error) {
      console.error('Product action error:', error);
      showAdminNotification('error', 'Operation Failed', `Product ${action} failed. Please try again.`);
    }
  };

  const formatPrice = (price) => {
    return price ? `€${parseFloat(price).toFixed(2)}` : 'N/A';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-EU');
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <AdminLayout currentPage="All Products" title="All Products - Admin - Gamava">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Total: {totalProducts} products
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Products per page */}
              <select
                value={productsPerPage}
                onChange={(e) => {
                  setProductsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value={200}>200 per page</option>
                <option value={500}>500 per page</option>
              </select>

              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                Filters
              </button>
              
              <button
                onClick={() => {
                  fetchFilterOptions();
                  fetchProducts();
                  showAdminNotification('info', 'Data Refreshed', 'Categories and products updated with latest data');
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                title="Refresh categories and products with latest data"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search (Name/ID)
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Product name or ID"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                />
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters({...filters, platform: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">All Platforms</option>
                  {filterOptions.platforms.map((platform, index) => (
                    <option key={`platform-${platform.title || platform.id || index}`} value={platform.title || platform}>
                      {platform.title || platform} {platform.product_count !== undefined ? `(${platform.product_count})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((category, index) => (
                    <option key={`category-${category.id || index}`} value={category.name || category}>
                      {category.name || category} ({category.product_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region
                </label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">All Regions</option>
                  {filterOptions.regions.map((region, index) => (
                    <option key={`region-${region.id || index}`} value={region.name || region}>
                      {region.name || region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">All Types</option>
                  {filterOptions.types.map((type, index) => (
                    <option key={`type-${type.id || index}`} value={type.name || type}>
                      {type.name || type} ({type.product_count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* System */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  System
                </label>
                <select
                  value={filters.system}
                  onChange={(e) => setFilters({...filters, system: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">All Systems</option>
                  {filterOptions.systems.map((system, index) => (
                    <option key={`filter-system-${system.id || index}`} value={system.name || system}>
                      {system.name || system}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price Range (€)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                    placeholder="Min"
                    className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                    placeholder="Max"
                    className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Commission Range */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Commission Range (%)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.commissionMin}
                    onChange={(e) => setFilters({...filters, commissionMin: e.target.value})}
                    placeholder="Min %"
                    className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                  />
                  <input
                    type="number"
                    value={filters.commissionMax}
                    onChange={(e) => setFilters({...filters, commissionMax: e.target.value})}
                    placeholder="Max %"
                    className="w-1/2 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setFilters({
                    search: '', platform: '', genre: '', region: '', type: '', 
                    system: '', priceMin: '', priceMax: '', commissionMin: '', commissionMax: ''
                  });
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('remove')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Bulk Remove
                </button>
                <button
                  onClick={() => handleBulkAction('removeFromCategory')}
                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                >
                  Remove from Category
                </button>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction('changeCategory', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">Change Category</option>
                  {filterOptions.categories.map((category, index) => (
                    <option key={`bulk-category-${category.id || index}`} value={category.id}>
                      {category.name || category} ({category.product_count || 0})
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction('changeType', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">Change Type</option>
                  {filterOptions.types.map((type, index) => (
                    <option key={`bulk-type-${type.id || index}`} value={type.name || type}>
                      {type.name || type} ({type.product_count || 0})
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction('changeSystem', e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-black dark:text-white bg-white dark:bg-gray-700"
                >
                  <option value="">Change System</option>
                  {filterOptions.systems.map((system, index) => (
                    <option key={`bulk-system-${system.id || index}`} value={system.name || system}>
                      {system.name || system}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Image
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('name')}
                >
                  Product Name
                  {sortBy === 'name' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                  onClick={() => setCategoryTypeToggle(categoryTypeToggle === 'category' ? 'type' : 'category')}
                  title="Click to toggle between Category and Type"
                >
                  <div className="flex items-center">
                    {categoryTypeToggle === 'category' ? 'Category' : 'Type'}
                    <svg className="ml-1 w-3 h-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {sortBy === 'price' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('kinguin_price')}
                >
                  Kinguin Price
                  {sortBy === 'kinguin_price' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('updated_at')}
                >
                  Last Updated
                  {sortBy === 'updated_at' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={`product-${product.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-game.svg';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.platform} • ID: {product.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {categoryTypeToggle === 'category' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {product.category || 'Uncategorized'}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {product.type || 'BASE GAME'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="font-medium">
                        {product.kinguin_price ? formatPrice(product.kinguin_price) : 'N/A'}
                      </div>
                      {product.kinguin_price && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Import price
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {product.status ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">

                        {/* Edit */}
                        <button
                          onClick={() => window.location.href = `/admin/products/edit/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* View in new tab */}
                        <button
                          onClick={() => window.open(`/product/${product.slug || product.id}`, '_blank')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Open product detail page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                        
                        {/* Remove */}
                        <button
                          onClick={async () => {
                            const confirmed = await confirm(
                              'Remove Product',
                              'Are you sure you want to remove this product? This action cannot be undone.',
                              'Remove',
                              'Cancel'
                            );
                            
                            if (confirmed) {
                              handleProductAction(product.id, 'remove');
                            }
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{totalProducts}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Notification System */}
      <AdminNotification />
      
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