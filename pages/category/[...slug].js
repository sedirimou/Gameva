import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import ProductCard from '../../components/frontend/ProductCard';
import CategoryFilters from '../../components/frontend/CategoryFilters';
import { useAppPreloader } from '../../hooks/useAppPreloader';

export default function CategoryPage({ initialProducts, initialTotal, pageTitle }) {
  const router = useRouter();
  const { slug } = router.query;
  
  // Use cached filter options for faster loading
  const { getFilterOptions, isCached } = useAppPreloader();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(initialProducts || []);
  const [totalProducts, setTotalProducts] = useState(initialTotal || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Refs to prevent infinite loops
  const fetchingRef = useRef(false);
  const initialFetchDone = useRef(false);
  
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

  const itemsPerPage = 20;

  // Fetch products function
  const fetchProducts = async (page = 1, appendToExisting = false) => {
    if (typeof window === 'undefined') return;
    
    if (fetchingRef.current) {
      console.log('🚫 Fetch already in progress, skipping...');
      return;
    }
    
    fetchingRef.current = true;
    
    if (appendToExisting) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setProducts([]);
    }

    try {
      const categorySlug = Array.isArray(slug) ? slug.join('/') : slug;
      
      // Build URL with filters
      const params = new URLSearchParams({
        categorySlug,
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      // Add filters to URL parameters
      if (filters.platforms?.length > 0) {
        params.set('platforms', filters.platforms.join(','));
      }
      if (filters.genres?.length > 0) {
        params.set('genres', filters.genres.join(','));
      }
      if (filters.languages?.length > 0) {
        params.set('languages', filters.languages.join(','));
      }
      if (filters.regions?.length > 0) {
        params.set('regions', filters.regions.join(','));
      }
      if (filters.tags?.length > 0) {
        params.set('tags', filters.tags.join(','));
      }
      if (filters.productTypes?.length > 0) {
        params.set('productTypes', filters.productTypes.join(','));
      }
      if (filters.operatingSystems?.length > 0) {
        params.set('operatingSystems', filters.operatingSystems.join(','));
      }
      if (filters.priceMin) {
        params.set('priceMin', filters.priceMin);
      }
      if (filters.priceMax) {
        params.set('priceMax', filters.priceMax);
      }
      if (filters.priceSort) {
        params.set('priceSort', filters.priceSort);
      }
      
      const url = `/api/products-with-relationships?${params.toString()}`;
      
      console.log('Fetching from URL:', url);
      console.log('Applied filters:', filters);
      
      // XMLHttpRequest fallback for better reliability
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 30000;
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ ok: true, json: () => Promise.resolve(data) });
            } catch (parseError) {
              reject(new Error('Failed to parse JSON response'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network request failed'));
        xhr.ontimeout = () => reject(new Error('Request timeout'));
        xhr.send();
      });

      const data = await response.json();
      
      if (data.success && data.products) {
        console.log('XMLHttpRequest succeeded with', data.products.length, 'products');
        console.log('Response data structure:', {
          success: data.success,
          productsCount: data.products.length,
          hasProducts: data.products.length > 0,
          hasPagination: !!data.pagination
        });
        
        if (appendToExisting) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setTotalProducts(data.pagination?.totalProducts || data.total || data.products.length);
        console.log('✅ Products loaded successfully:', data.products.length);
      } else {
        console.error('❌ API response structure invalid:', data);
        if (!appendToExisting) {
          setProducts([]);
          setTotalProducts(0);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching products:', {
        message: error.message,
        name: error.name,
        cause: error.cause
      });
      
      if (!appendToExisting) {
        setProducts([]);
        setTotalProducts(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    console.log('🔧 handleFilterChange called with:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL with shallow routing for SPA behavior
    const urlParams = new URLSearchParams();
    
    if (newFilters.platforms?.length > 0) {
      urlParams.set('platforms', newFilters.platforms.join(','));
    }
    if (newFilters.genres?.length > 0) {
      urlParams.set('genres', newFilters.genres.join(','));
    }
    if (newFilters.languages?.length > 0) {
      urlParams.set('languages', newFilters.languages.join(','));
    }
    if (newFilters.regions?.length > 0) {
      urlParams.set('regions', newFilters.regions.join(','));
    }
    if (newFilters.tags?.length > 0) {
      urlParams.set('tags', newFilters.tags.join(','));
    }
    if (newFilters.productTypes?.length > 0) {
      urlParams.set('productTypes', newFilters.productTypes.join(','));
    }
    if (newFilters.operatingSystems?.length > 0) {
      urlParams.set('operatingSystems', newFilters.operatingSystems.join(','));
    }
    if (newFilters.priceMin && newFilters.priceMin !== '' && newFilters.priceMin !== '0') {
      urlParams.set('priceMin', newFilters.priceMin);
    }
    if (newFilters.priceMax && newFilters.priceMax !== '' && newFilters.priceMax !== '100') {
      urlParams.set('priceMax', newFilters.priceMax);
    }
    if (newFilters.priceSort) {
      urlParams.set('priceSort', newFilters.priceSort);
    }
    
    const newUrl = urlParams.toString() 
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    
    console.log('🔧 New URL after filter change:', newUrl);
    router.push(newUrl, undefined, { shallow: true });
  };

  // Initialize filters from URL parameters
  useEffect(() => {
    if (!router.isReady) return;
    
    const urlParams = router.query;
    console.log('🔍 URL parameters received:', urlParams);
    
    // Check if this is a hero navigation
    const isHeroNavigation = typeof window !== 'undefined' && localStorage.getItem('hero-navigation') === 'true';
    
    if (isHeroNavigation) {
      console.log('🦸 Hero navigation detected, clearing all filters');
      console.log('🦸 Current URL:', window.location.href);
      console.log('🦸 URL Parameters:', urlParams);
      
      // Clear hero navigation flag
      localStorage.removeItem('hero-navigation');
      
      // Force clean state regardless of URL parameters
      const cleanFilters = {
        platforms: [],
        genres: [],
        languages: [],
        tags: [],
        regions: [],
        priceMin: '',
        priceMax: '',
        productTypes: [],
        priceSort: ''
      };
      setFilters(cleanFilters);
      
      // Clear localStorage to prevent persistence
      try {
        localStorage.removeItem('category-filters');
        localStorage.removeItem('price-filters');
        localStorage.removeItem('applied-filters');
      } catch (e) {
        console.log('localStorage not available');
      }
      
      // Force clean URL by replacing current URL without parameters
      const cleanUrl = window.location.pathname;
      if (window.location.href !== window.location.origin + cleanUrl) {
        console.log('🧹 Cleaning URL from:', window.location.href, 'to:', cleanUrl);
        history.replaceState(null, '', cleanUrl);
      }
      
      return;
    }
    
    // Check if this is a clean navigation (no price parameters)
    const isCleanNavigation = !urlParams.priceMin && !urlParams.priceMax && 
                              !urlParams.platforms && !urlParams.genres && 
                              !urlParams.regions && !urlParams.tags;
    
    if (isCleanNavigation) {
      console.log('🧹 Clean navigation detected, resetting filters');
      // Reset filters to ensure clean state
      const cleanFilters = {
        platforms: [],
        genres: [],
        languages: [],
        tags: [],
        regions: [],
        priceMin: '',
        priceMax: '',
        productTypes: [],
        priceSort: ''
      };
      setFilters(cleanFilters);
      
      // Clear localStorage to prevent persistence
      try {
        localStorage.removeItem('category-filters');
        localStorage.removeItem('price-filters');
        localStorage.removeItem('applied-filters');
      } catch (e) {
        console.log('localStorage not available');
      }
      
      return;
    }
    
    const newFilters = { ...filters };
    let hasChanges = false;
    
    // Parse platform parameter
    if (urlParams.platforms) {
      const platformsArray = typeof urlParams.platforms === 'string' 
        ? urlParams.platforms.split(',').map(p => p.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(platformsArray) !== JSON.stringify(newFilters.platforms)) {
        newFilters.platforms = platformsArray;
        hasChanges = true;
      }
    }
    
    // Parse other filter parameters
    if (urlParams.genres) {
      const genresArray = typeof urlParams.genres === 'string' 
        ? urlParams.genres.split(',').map(g => g.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(genresArray) !== JSON.stringify(newFilters.genres)) {
        newFilters.genres = genresArray;
        hasChanges = true;
      }
    }
    
    if (urlParams.languages) {
      const languagesArray = typeof urlParams.languages === 'string' 
        ? urlParams.languages.split(',').map(l => l.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(languagesArray) !== JSON.stringify(newFilters.languages)) {
        newFilters.languages = languagesArray;
        hasChanges = true;
      }
    }
    
    if (urlParams.regions) {
      const regionsArray = typeof urlParams.regions === 'string' 
        ? urlParams.regions.split(',').map(r => r.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(regionsArray) !== JSON.stringify(newFilters.regions)) {
        newFilters.regions = regionsArray;
        hasChanges = true;
      }
    }
    
    if (urlParams.tags) {
      const tagsArray = typeof urlParams.tags === 'string' 
        ? urlParams.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(tagsArray) !== JSON.stringify(newFilters.tags)) {
        newFilters.tags = tagsArray;
        hasChanges = true;
      }
    }
    
    if (urlParams.productTypes) {
      const productTypesArray = typeof urlParams.productTypes === 'string' 
        ? urlParams.productTypes.split(',').map(pt => pt.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(productTypesArray) !== JSON.stringify(newFilters.productTypes)) {
        newFilters.productTypes = productTypesArray;
        hasChanges = true;
      }
    }
    
    if (urlParams.operatingSystems) {
      const operatingSystemsArray = typeof urlParams.operatingSystems === 'string' 
        ? urlParams.operatingSystems.split(',').map(os => os.trim()).filter(Boolean)
        : [];
      if (JSON.stringify(operatingSystemsArray) !== JSON.stringify(newFilters.operatingSystems)) {
        newFilters.operatingSystems = operatingSystemsArray;
        hasChanges = true;
      }
    }
    
    if (urlParams.priceMin && urlParams.priceMin !== newFilters.priceMin) {
      newFilters.priceMin = urlParams.priceMin;
      hasChanges = true;
    }
    
    if (urlParams.priceMax && urlParams.priceMax !== newFilters.priceMax) {
      newFilters.priceMax = urlParams.priceMax;
      hasChanges = true;
    }
    
    if (urlParams.priceSort && urlParams.priceSort !== newFilters.priceSort) {
      newFilters.priceSort = urlParams.priceSort;
      hasChanges = true;
    }
    
    if (hasChanges) {
      console.log('🔧 Initializing filters from URL:', newFilters);
      setFilters(newFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  // Initial fetch only once when component mounts and filters are initialized
  useEffect(() => {
    if (!router.isReady || !slug) return;
    
    if (!initialFetchDone.current) {
      // Delay initial fetch slightly to allow URL parameters to be parsed first
      const timer = setTimeout(() => {
        console.log('🚀 Initial fetch for slug:', slug, 'with filters:', filters);
        fetchProducts(1, false);
        initialFetchDone.current = true;
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, slug, filters]);

  // Reset flag when slug changes
  useEffect(() => {
    initialFetchDone.current = false;
  }, [slug]);

  // Fetch products when filters change (excluding initial load)
  useEffect(() => {
    if (!router.isReady || !slug) return;
    
    // Only refetch if this is not the initial mount and filters have been applied
    if (initialFetchDone.current) {
      console.log('🔄 Filters changed, refetching products...', filters);
      fetchProducts(1, false);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, router.isReady, slug]);

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Load more products for pagination
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isSidebarOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      
      // Cleanup on unmount
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isSidebarOpen]);

  // Get dynamic category title based on filters
  const getCategoryTitle = () => {
    if (!slug) return 'Products';
    
    // Check for active filters and create dynamic title
    let titleParts = [];
    
    // Add filter-specific parts
    if (filters.platforms && filters.platforms.length > 0) {
      titleParts.push(filters.platforms.join(', '));
    }
    
    if (filters.genres && filters.genres.length > 0) {
      titleParts.push(filters.genres.join(', '));
    }
    
    if (filters.priceMin || filters.priceMax) {
      if (filters.priceMin && filters.priceMax) {
        titleParts.push(`€${filters.priceMin}-€${filters.priceMax}`);
      } else if (filters.priceMin) {
        titleParts.push(`From €${filters.priceMin}`);
      } else if (filters.priceMax) {
        titleParts.push(`Up to €${filters.priceMax}`);
      }
    }
    
    if (filters.regions && filters.regions.length > 0) {
      titleParts.push(filters.regions.join(', '));
    }
    
    if (filters.productTypes && filters.productTypes.length > 0) {
      titleParts.push(filters.productTypes.join(', '));
    }
    
    // If we have filter-specific parts, use them
    if (titleParts.length > 0) {
      return `${titleParts.join(' • ')} Products`;
    }
    
    // Fallback to slug-based title
    const categoryName = Array.isArray(slug) 
      ? slug[slug.length - 1]
      : slug;
    
    return categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <MainLayout 
      title={`${getCategoryTitle()} - Gamava`}
      description="Browse our extensive collection of digital games"
      includeFooter={true}
      useGradient={false}
    >
      <div className="w-full overflow-x-hidden mt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-[60] flex" style={{ top: '140px' }}>
                {/* Backdrop */}
                <div 
                  className="fixed bg-black/50 backdrop-blur-sm"
                  style={{ top: '140px', left: 0, right: 0, bottom: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                />
                
                {/* Sliding Sidebar */}
                <div className={`
                  relative w-80 max-w-[80vw] bg-[#153e8f] border-r border-white/10 
                  transform transition-transform duration-300 ease-in-out
                  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                  {/* Close Button */}
                  <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Filters</h3>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Sidebar Content */}
                  <div className="h-full overflow-y-auto pb-20">
                    <CategoryFilters 
                      filters={filters} 
                      onFilterChange={handleFilterChange} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
              <div className="sticky top-0">
                <CategoryFilters 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 category-results">
              <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h1 className="text-2xl font-bold text-white">
                    {getCategoryTitle()}
                  </h1>
                  <div className="text-white/70">
                    {loading ? 'Loading...' : `${totalProducts} products found`}
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-pulse">
                      <div className="aspect-[16/10] bg-white/20 rounded-lg mb-4"></div>
                      <div className="h-4 bg-white/20 rounded mb-2"></div>
                      <div className="h-3 bg-white/20 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                      <ProductCard key={`${product.id}-${index}`} product={product} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {currentPage < totalPages && (
                    <div className="mt-12 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-8 py-3 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                        style={{
                          background: loadingMore 
                            ? 'linear-gradient(131deg, rgba(153, 180, 118, 0.5) 0%, rgba(41, 173, 178, 0.5) 100%)'
                            : 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                        }}
                      >
                        {loadingMore ? 'Loading More...' : 'Load More Products'}
                      </button>
                    </div>
                  )}

                  {/* Pagination Info */}
                  <div className="mt-8 text-center text-white/60">
                    Showing {products.length} of {totalProducts} products
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-white/70 text-lg mb-4">
                    No products found in this category
                  </div>
                  <p className="text-white/50">
                    Try adjusting your filters or browse other categories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const { slug, priceMin, priceMax, ...otherParams } = context.query;
  
  console.log('🚀 getServerSideProps called with query:', context.query);
  console.log('🚀 Extracted parameters:', { slug, priceMin, priceMax, otherParams });
  
  // Check if this is a hero button navigation (clean URL without intentional price filters)
  const isHeroNavigation = !priceMin && !priceMax && Object.keys(otherParams).length === 0;
  
  if (isHeroNavigation) {
    console.log('🦸 Hero navigation detected - serving clean page');
  } else {
    console.log('🔍 Filtered navigation detected');
  }
  
  try {
    const categorySlug = Array.isArray(slug) ? slug.join('/') : slug;
    const queryParams = new URLSearchParams({
      categorySlug,
      page: '1',
      limit: '20'
    });
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : `http://localhost:${process.env.PORT || 3000}`;
    
    const response = await fetch(`${baseUrl}/api/products-with-relationships?${queryParams}`);
    const data = await response.json();
    
    let products = [];
    let total = 0;
    
    if (data.success && data.products) {
      products = data.products;
      total = data.pagination?.totalProducts || data.total || data.products.length;
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products;
      total = data.total || data.products.length;
    }
    
    const pageTitle = categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      props: {
        initialProducts: products,
        initialTotal: total,
        pageTitle
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialProducts: [],
        initialTotal: 0,
        pageTitle: 'Products'
      }
    };
  }
}