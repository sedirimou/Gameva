import React from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';


export default function SearchDropdown({
  searchResults = [],
  searchHistory = [],
  isSearching = false,
  error = null,
  searchTerm = '',
  onResultSelect,
  onHistorySelect,
  onClose
}) {
  const { formatPrice } = useCurrency();
  // Generate product slug from name using same logic as API
  const generateSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const hasResults = searchResults && searchResults.length > 0;
  const hasHistory = searchHistory && searchHistory.length > 0;
  const searchTermString = typeof searchTerm === 'string' ? searchTerm : '';
  const hasSearchTerm = searchTermString && searchTermString.trim().length > 0;
  const showSearchResults = hasResults && hasSearchTerm;
  const showSearchHistory = hasHistory && !hasSearchTerm;
  const showContent = showSearchResults || showSearchHistory || isSearching || error;

  // Always show dropdown when it should be visible (when focused)
  // Don't return null if we're supposed to show the dropdown

  return (
    <div className="absolute top-full left-0 w-full mt-1 bg-[#153e90] rounded-lg shadow-xl border border-gray-200 z-[100000] max-h-96 overflow-hidden">
      {/* Loading State */}
      {isSearching && (
        <div className="p-4 text-center text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Searching...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Search Results */}
      {showSearchResults && !isSearching && (
        <div>
          <div className="px-4 py-2 border-b border-white/30" style={{ backgroundColor: '#000d6e' }}>
            <div className="flex items-center space-x-2 text-sm" style={{ color: '#ffffff' }}>
              <TrendingUp className="h-4 w-4" />
              <span>Search Results ({searchResults.length})</span>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {searchResults.map((product) => (
              <div
                key={product.id}
                className="flex items-center p-3 hover:bg-[#4162a6] cursor-pointer border-b border-white/30 last:border-b-0"
                onClick={() => {
                  const slug = generateSlug(product.name) || product.kinguinid || product.id;
                  onResultSelect(slug);
                }}
              >
                <div className="w-12 h-12 flex-shrink-0 mr-3">
                  <img
                    src={(() => {
                      // Try images_cover_url first
                      if (product.images_cover_url) {
                        return `/api/proxy-image?url=${encodeURIComponent(product.images_cover_url)}`;
                      }
                      
                      // Try images_cover_thumbnail
                      if (product.images_cover_thumbnail) {
                        return `/api/proxy-image?url=${encodeURIComponent(product.images_cover_thumbnail)}`;
                      }
                      
                      // Try first screenshot
                      if (product.images_screenshots_url) {
                        try {
                          const screenshots = JSON.parse(product.images_screenshots_url);
                          if (screenshots && screenshots.length > 0 && screenshots[0]) {
                            return `/api/proxy-image?url=${encodeURIComponent(screenshots[0])}`;
                          }
                        } catch (e) {
                          // If JSON parsing fails, ignore silently
                        }
                      }
                      
                      // Default to placeholder
                      return '/placeholder-game.svg';
                    })()}
                    alt={product.name}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder-game.svg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium hover:bg-[#4162a6] truncate">
                    {product.name}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <span>{product.platform}</span>
                    {product.genres && product.genres.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{product.genres.slice(0, 2).join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-semibold text-green-400">
                    {formatPrice(product.finalPrice || product.price)}
                  </div>
                  {product.finalPrice && product.finalPrice < product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* View All Results Link */}
          {hasSearchTerm && (
            <div className="p-3 border-t border-white/30" style={{ backgroundColor: '#000d6e' }}>
              <button
                className="w-full text-left font-medium hover:opacity-80 transition-opacity"
                style={{ color: '#ffffff' }}
                onClick={() => {
                  window.location.href = `/search?q=${encodeURIComponent(searchTermString)}`;
                  onClose();
                }}
              >
                View all results for "{searchTermString}"
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search History - Show when no search term and history exists */}
      {hasHistory && !hasSearchTerm && !isSearching && !error && (
        <div>
          <div className="px-4 py-2 border-b border-white/30" style={{ backgroundColor: '#000d6e' }}>
            <div className="flex items-center space-x-2 text-sm" style={{ color: '#ffffff' }}>
              <Clock className="h-4 w-4" />
              <span>Recent Searches</span>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {searchHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 hover:bg-[#4162a6] cursor-pointer border-b border-white/30 last:border-b-0"
                onClick={() => onHistorySelect(item.term)}
              >
                <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{item.term}</div>
                  <div className="text-sm text-gray-300">
                    {item.count} search{item.count > 1 ? 'es' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when focused but no history */}
      {!hasHistory && !hasSearchTerm && !isSearching && !error && (
        <div className="p-4 text-center text-gray-300">
          <Clock className="h-6 w-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No recent searches</p>
        </div>
      )}

      {/* No Results */}
      {!showSearchResults && !showSearchHistory && !isSearching && !error && hasSearchTerm && (
        <div className="p-4 text-center text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No results found for "{searchTermString}"</p>
          <p className="text-sm mt-1">Try different keywords or check spelling</p>
        </div>
      )}
    </div>
  );
}