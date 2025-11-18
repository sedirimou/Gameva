import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';
import CategoryFilters from '../components/frontend/CategoryFilters';
import ProductCard from '../components/frontend/ProductCard';
import Pagination from '../components/frontend/Pagination';
import { Filter, X } from 'lucide-react';
import { useCartWishlist } from '../hooks/useCartWishlist';
import { sessionManager } from '../lib/sessionManager';

function getProductImage(product) {
  // Try to extract image from various possible fields
  if (product.images_cover_url) {
    return product.images_cover_url;
  }
  if (product.images_cover_thumbnail) {
    return product.images_cover_thumbnail;
  }
  if (product.coverUrl) {
    return product.coverUrl;
  }
  if (product.cover_url) {
    return product.cover_url;
  }
  if (product.image) {
    return product.image;
  }
  // Return placeholder if no image found
  return '/images/placeholder-game.jpg';
}

export default function SearchPage() {
  const router = useRouter();
  const { q, ...query } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    platforms: [],
    genres: [],
    languages: [],
    tags: [],
    regions: [],
    priceMin: '',
    priceMax: '',
    productTypes: [],
    priceSort: ''
  });

  const PRODUCTS_PER_PAGE = 24;
  const { cartItems, wishlistItems, addToCart, toggleWishlist } = useCartWishlist();

  // Fetch search results from API
  const fetchSearchResults = async (searchQuery, page = 1, filterParams = {}) => {
    try {
      setLoading(true);
      
      // Build search parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      params.append('limit', PRODUCTS_PER_PAGE.toString());
      params.append('offset', ((page - 1) * PRODUCTS_PER_PAGE).toString());
      
      // Add session information
      const sessionId = sessionManager.getSessionId();
      if (sessionId) params.append('session_id', sessionId);
      
      // Add filter parameters
      if (filterParams.platforms?.length > 0) {
        params.append('platforms', filterParams.platforms.join(','));
      }
      if (filterParams.genres?.length > 0) {
        params.append('genres', filterParams.genres.join(','));
      }
      if (filterParams.languages?.length > 0) {
        params.append('languages', filterParams.languages.join(','));
      }
      if (filterParams.tags?.length > 0) {
        params.append('tags', filterParams.tags.join(','));
      }
      if (filterParams.productTypes?.length > 0) {
        params.append('productTypes', filterParams.productTypes.join(','));
      }
      if (filterParams.operatingSystems?.length > 0) {
        params.append('operatingSystems', filterParams.operatingSystems.join(','));
      }
      if (filterParams.priceMin) {
        params.append('price_min', filterParams.priceMin);
      }
      if (filterParams.priceMax) {
        params.append('price_max', filterParams.priceMax);
      }
      
      const response = await fetch(`/api/search/products?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform data to match ProductCard expectations
        const transformedProducts = data.results.map(product => ({
          id: product.id,
          name: product.name,
          originalName: product.name,
          description: product.description || '',
          platform: product.platform,
          region: 'Global',
          finalPrice: product.final_price || product.price || 0,
          price: product.price || 0,
          coverUrl: getProductImage(product),
          productType: 'Digital Key',
          categories: product.genres || [],
          releaseDate: product.release_date,
          slug: product.slug || `${product.id}`
        }));
        
        setSearchResults(transformedProducts);
        setTotalResults(data.total || transformedProducts.length);
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchSearchResults(q, currentPage, filters);
    }
  }, [router.isReady, q, currentPage, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // Fetch new results with updated filters
    fetchSearchResults(q, 1, newFilters);
  };

  const totalPages = Math.ceil(totalResults / PRODUCTS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchSearchResults(q, page, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSearchTitle = () => {
    if (q) {
      return `Search results for "${q}"`;
    }
    return 'Search Results';
  };

  if (loading) {
    return (
      <MainLayout 
        title="Loading... - Gamava"
        description="Loading search results"
        includeFooter={true}
      >
        <div className="w-full overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4 md:py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-6 w-1/3"></div>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-80 lg:flex-shrink-0 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-white/20 rounded"></div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div key={i} className="aspect-[3/4.8] bg-white/20 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={`${getSearchTitle()} - Gamava`}
      description="Search results for products on Gamava"
      includeFooter={true}
    >
      <div className="w-full overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4 md:py-8">
          {/* Page Title Section */}
          <div className="flex flex-row justify-between items-start mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                {getSearchTitle()}
              </h1>
              <p className="text-white/70 text-sm lg:text-base">
                Showing {searchResults.length} of {totalResults} results
              </p>
            </div>
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden ml-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <CategoryFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                    <p className="text-white/70">Try adjusting your search terms or filters</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        onToggleWishlist={toggleWishlist}
                        cartItems={cartItems}
                        wishlistItems={wishlistItems}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`lg:hidden fixed top-32 left-0 bottom-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div 
            className="relative bg-[#153e90] w-80 max-w-[85vw] h-full overflow-y-auto p-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Filters</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <CategoryFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}