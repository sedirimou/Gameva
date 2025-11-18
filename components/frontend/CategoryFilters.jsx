import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

export default function CategoryFilters({ filters, onFilterChange }) {
  const [openDropdowns, setOpenDropdowns] = useState({
    platforms: false,
    regions: false,
    price: true,
    productTypes: false,
    genres: false,
    languages: false,
    tags: false
  });

  // Dynamic filter options state
  const [filterOptions, setFilterOptions] = useState({
    platforms: [],
    genres: [],
    languages: [],
    tags: [],
    productTypes: [],
    regions: [],
    loading: true
  });

  // Local state for price inputs to enable debouncing
  const [localPriceMin, setLocalPriceMin] = useState(filters.priceMin || '');
  const [localPriceMax, setLocalPriceMax] = useState(filters.priceMax || '');
  const debounceTimeoutRef = useRef(null);

  // Fetch dynamic filter options from entities API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterOptions(prev => ({ ...prev, loading: true }));
        
        const [platformsRes, genresRes, languagesRes, tagsRes, productTypesRes, regionsRes] = await Promise.all([
          fetch('/api/entities?type=platforms'),
          fetch('/api/entities?type=genres'),
          fetch('/api/entities?type=languages'),
          fetch('/api/entities?type=tags'),
          fetch('/api/entities?type=product_types'),
          fetch('/api/admin/attributes/regions')
        ]);

        const [platformsData, genresData, languagesData, tagsData, productTypesData, regionsData] = await Promise.all([
          platformsRes.json(),
          genresRes.json(),
          languagesRes.json(),
          tagsRes.json(),
          productTypesRes.json(),
          regionsRes.json()
        ]);

        setFilterOptions({
          platforms: platformsData.success ? platformsData.data : [],
          genres: genresData.success ? genresData.data : [],
          languages: languagesData.success ? languagesData.data : [],
          tags: tagsData.success ? tagsData.data : [],
          productTypes: productTypesData.success ? productTypesData.data : [],
          regions: Array.isArray(regionsData) ? regionsData : [],
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
        setFilterOptions(prev => ({ ...prev, loading: false }));
      }
    };

    fetchFilterOptions();
  }, []);

  // Update local state when filters prop changes (for external filter resets)
  useEffect(() => {
    setLocalPriceMin(filters.priceMin || '');
    setLocalPriceMax(filters.priceMax || '');
  }, [filters.priceMin, filters.priceMax]);

  // Debounced price filter update
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      // Only update if the local values are different from the current filters
      if (localPriceMin !== filters.priceMin || localPriceMax !== filters.priceMax) {
        const newFilters = { 
          ...filters, 
          priceMin: localPriceMin, 
          priceMax: localPriceMax 
        };
        onFilterChange(newFilters);
      }
    }, 500); // 500ms debounce delay

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localPriceMin, localPriceMax, filters.priceMin, filters.priceMax, onFilterChange]);

  const toggleDropdown = (filterType) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handleCheckboxChange = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (filterType === 'priceMin' || filterType === 'priceMax') {
      // Handle price inputs with local state for debouncing
      if (filterType === 'priceMin') {
        setLocalPriceMin(value);
      } else {
        setLocalPriceMax(value);
      }
      return; // Don't immediately update filters - let debouncing handle it
    } else {
      const currentValues = newFilters[filterType] || [];
      if (currentValues.includes(value)) {
        newFilters[filterType] = currentValues.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentValues, value];
      }
    }
    
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    // Reset local price state immediately
    setLocalPriceMin('');
    setLocalPriceMax('');
    
    onFilterChange({
      platforms: [],
      regions: [],
      priceMin: '',
      priceMax: '',
      productTypes: [],
      genres: [],
      languages: [],
      tags: []
    });
  };

  const hasActiveFilters = () => {
    return (filters.platforms || []).length > 0 ||
           (filters.regions || []).length > 0 ||
           filters.priceMin !== '' ||
           filters.priceMax !== '' ||
           (filters.productTypes || []).length > 0 ||
           (filters.genres || []).length > 0 ||
           (filters.languages || []).length > 0 ||
           (filters.tags || []).length > 0;
  };

  const FilterDropdown = ({ title, filterType, options, isPrice = false }) => {
    const isOpen = openDropdowns[filterType];
    
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleDropdown(filterType)}
          className="w-full flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
        >
          <span className="font-medium">{title}</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {isOpen && (
          <div className="mt-2 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            {isPrice ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localPriceMin}
                  onChange={(e) => setLocalPriceMin(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Minimum price"
                />
                <div className="flex items-center justify-center w-6 h-6">
                  <span className="text-white font-bold text-xl">-</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Maximum price"
                />
              </div>
            ) : filterOptions.loading ? (
              <div className="text-white/60 text-center py-4">
                Loading options...
              </div>
            ) : (
              <div className="space-y-2">
                {options.map((option) => {
                  // Handle both string options (hardcoded) and entity objects (dynamic)
                  const optionName = typeof option === 'string' ? option : (option.name || option.title);
                  const optionValue = typeof option === 'string' ? option : (option.name || option.title);
                  const productCount = typeof option === 'object' ? option.product_count : null;
                  
                  return (
                    <label key={optionValue} className="flex items-center justify-between cursor-pointer group hover:bg-white/5 rounded px-2 py-1 transition-colors">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={(filters[filterType] || []).includes(optionValue)}
                          onChange={() => handleCheckboxChange(filterType, optionValue)}
                          className="w-4 h-4 text-cyan-400 bg-white/10 border-white/30 rounded focus:ring-cyan-400 focus:ring-2"
                        />
                        <span className="text-white/80 group-hover:text-white transition-colors">
                          {optionName}
                        </span>
                      </div>
                      {productCount && (
                        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                          {productCount}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const platformOptions = ['Steam', 'PS5', 'Xbox', 'Nintendo', 'Epic Games', 'Origin', 'Uplay'];
  const regionOptions = ['Global', 'Europe', 'US', 'UK', 'Asia', 'Latin America'];
  const productTypeOptions = ['Digital Key', 'Gift Card', 'Subscription', 'DLC', 'Software'];
  const categoryOptions = ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'FPS', 'Fantasy', 'Sci-Fi', 'Horror', 'Multiplayer', 'Western'];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Filters</h2>
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 1. Explore By Price - Sort Order 1 */}
        <div className="mb-4">
          <h3 className="text-white font-medium mb-3">Explore By Price</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={localPriceMin}
              onChange={(e) => handleCheckboxChange('priceMin', e.target.value)}
              className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              placeholder="Minimum price"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={localPriceMax}
              onChange={(e) => handleCheckboxChange('priceMax', e.target.value)}
              className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              placeholder="Maximum price"
            />
          </div>
        </div>

        {/* 2. Product Type - Sort Order 2 */}
        <FilterDropdown
          title="Product Type"
          filterType="productTypes"
          options={filterOptions.productTypes}
        />

        {/* 3. Explore By Genres - Sort Order 3 */}
        <FilterDropdown
          title="Explore By Genres"
          filterType="genres"
          options={filterOptions.genres}
        />

        {/* 4. Explore By Platform - Sort Order 4 */}
        <FilterDropdown
          title="Explore By Platform"
          filterType="platforms"
          options={filterOptions.platforms}
        />

        {/* Region with Real Data */}
        <FilterDropdown
          title="Region"
          filterType="regions"
          options={filterOptions.regions}
        />

        <FilterDropdown
          title="Languages"
          filterType="languages"
          options={filterOptions.languages}
        />

        <FilterDropdown
          title="Tags"
          filterType="tags"
          options={filterOptions.tags}
        />
      </div>

      {hasActiveFilters() && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white/80 mb-3">Active Filters:</h3>
          <div className="space-y-2">
            {(filters.platforms || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Platforms:</span> {filters.platforms.join(', ')}
              </div>
            )}
            {(filters.regions || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Regions:</span> {filters.regions.join(', ')}
              </div>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Price:</span> 
                {filters.priceMin && ` $${filters.priceMin}`}
                {filters.priceMin && filters.priceMax && ' - '}
                {filters.priceMax && `$${filters.priceMax}`}
              </div>
            )}
            {(filters.productTypes || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Types:</span> {filters.productTypes.join(', ')}
              </div>
            )}
            {(filters.genres || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Genres:</span> {filters.genres.join(', ')}
              </div>
            )}
            {(filters.languages || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Languages:</span> {filters.languages.join(', ')}
              </div>
            )}
            {(filters.tags || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Tags:</span> {filters.tags.join(', ')}
              </div>
            )}
            {(filters.categories || []).length > 0 && (
              <div className="text-sm text-white/70">
                <span className="font-medium">Categories:</span> {filters.categories.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}