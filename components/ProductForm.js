import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getProductScreenshots } from '../lib/imageUtils';

// Modern Popup Component
const ModernPopup = ({ show, type, title, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 ${type === 'error' ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'}`}>
          <div className="flex items-center">
            {type === 'error' ? (
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            ) : (
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}`}>
                {title}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'error' 
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ProductForm({ mode = 'add', productId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  // Popup state management
  const [popup, setPopup] = useState({
    show: false,
    type: 'success', // 'success' or 'error'
    title: '',
    message: ''
  });

  const showPopup = (type, title, message) => {
    setPopup({ show: true, type, title, message });
  };

  const closePopup = () => {
    setPopup({ show: false, type: 'success', title: '', message: '' });
  };

  // Function to reload Kinguin data (price, product ID, regions) for Kinguin products
  const reloadKinguinData = async () => {
    if (mode !== 'edit' || !productId) {
      showPopup('error', 'Error', 'Can only reload Kinguin data for existing products.');
      return;
    }

    setFetchingData(true);
    
    try {
      const response = await fetch(`/api/admin/products/${productId}/reload-kinguin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showPopup('success', 'Kinguin Data Reloaded', 
          `Successfully reloaded Kinguin price, Product ID, and regions for "${formData.name}".`
        );
        
        // Refresh form data to show updated values
        setTimeout(() => {
          fetchProduct();
        }, 1500);
      } else {
        showPopup('error', 'Reload Failed', result.error || 'Failed to reload Kinguin data');
      }
    } catch (error) {
      console.error('Error reloading Kinguin data:', error);
      showPopup('error', 'Error', 'Network error while reloading Kinguin data');
    } finally {
      setFetchingData(false);
    }
  };

  // Function to fetch real data for existing products
  const fetchRealData = async () => {
    if (!formData.name || formData.name.trim() === '') {
      showPopup('error', 'Error', 'Please enter a product name to fetch real data.');
      return;
    }

    setFetchingData(true);
    
    try {
      const response = await fetch('/api/admin/fetch-real-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId || 'new',
          gameName: formData.name
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showPopup('success', 'Real Data Fetched', 
          `Successfully updated pricing and metadata for "${formData.name}". ` +
          `Price: €${result.data.realPrice}`
        );
        
        // If editing existing product, refresh form data
        if (mode === 'edit' && productId) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        showPopup('error', 'Fetch Failed', result.error || 'Failed to fetch real data');
      }
    } catch (error) {
      console.error('Error fetching real data:', error);
      showPopup('error', 'Error', 'Network error while fetching real data');
    } finally {
      setFetchingData(false);
    }
  };


  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sale_price: '',
    product_id: mode === 'add' ? 'AUTO_GENERATED' : '',
    kinguinid: '',
    kinguin_price: '',
    qty: 0,
    limit_per_basket: '',
    shipping_time_value: '0',
    shipping_time_unit: 'Instant Delivery', // Default to Instant Delivery
    release_date: '',
    ean: '',
    sku: '',
    automater: '',
    category_id: '',
    subcategory_id: '',
    selected_categories: [], // Array of category IDs for many-to-many relationship
    platform: '',

    meta_score: '',
    genres: [],
    languages: [],
    developers: [],
    publishers: [],
    regions: [],
    tags: [],
    description: '',
    activation_details: '',
    cover_url: '',
    screenshots: [],
    images: [], // Legacy field for backward compatibility
    // SEO Fields
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    slug: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    system_requirements: [
      {
        id: 1,
        name: 'Windows',
        requirements: [
          { type: 'OS', value: '' },
          { type: 'Processor', value: '' },
          { type: 'Memory', value: '' },
          { type: 'Graphics', value: '' },
          { type: 'DirectX', value: '' },
          { type: 'Storage', value: '' },
          { type: 'Sound Card', value: '' }
        ]
      }
    ]
  });

  const [seoSectionOpen, setSeoSectionOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    genres: [],
    languages: [],
    developers: [],
    publishers: [],
    regions: [],
    platforms: []
  });

  const [searchTerms, setSearchTerms] = useState({
    tags: '',
    genres: '',
    languages: '',
    developers: '',
    publishers: '',
    regions: ''
  });

  // Manual CKEditor refresh function
  const refreshCKEditor = () => {
    if (typeof window === 'undefined' || !window.CKEDITOR) {
      showPopup('error', 'CKEditor Not Available', 'CKEditor is not loaded yet. Please wait a moment and try again.');
      return;
    }

    try {
      // Destroy existing instances
      ['description', 'activation_details'].forEach(fieldId => {
        try {
          if (window.CKEDITOR.instances[fieldId]) {
            window.CKEDITOR.instances[fieldId].destroy(true);
          }
        } catch (error) {
          console.log(`Error destroying ${fieldId}:`, error);
        }
      });

      // Wait a moment and reinitialize
      setTimeout(() => {
        const editorConfig = {
          height: 200,
          toolbar: 'Standard',
          versionCheck: false,
          notification_aggregationTimeout: 0,
          removePlugins: 'notification'
        };

        const smallEditorConfig = {
          height: 150,
          toolbar: [
            ['Bold', 'Italic', 'Underline'],
            ['NumberedList', 'BulletedList'],
            ['Link', 'Unlink'],
            ['Source']
          ],
          versionCheck: false,
          notification_aggregationTimeout: 0,
          removePlugins: 'notification'
        };

        // Reinitialize description editor
        const descElement = document.getElementById('description');
        if (descElement) {
          const descEditor = window.CKEDITOR.replace('description', editorConfig);
          if (descEditor) {
            descEditor.on('instanceReady', function() {
              this.setData(formData.description || '');
            });
            descEditor.on('change', function() {
              const data = this.getData();
              setFormData(prev => ({ ...prev, description: data }));
            });
          }
        }

        // Reinitialize activation details editor
        const activationElement = document.getElementById('activation_details');
        if (activationElement) {
          const activationEditor = window.CKEDITOR.replace('activation_details', smallEditorConfig);
          if (activationEditor) {
            activationEditor.on('instanceReady', function() {
              this.setData(formData.activation_details || '');
            });
            activationEditor.on('change', function() {
              const data = this.getData();
              setFormData(prev => ({ ...prev, activation_details: data }));
            });
          }
        }

        showPopup('success', 'CKEditor Refreshed', 'CKEditor has been manually refreshed and should now be working properly.');
      }, 500);
    } catch (error) {
      console.error('Error refreshing CKEditor:', error);
      showPopup('error', 'Refresh Failed', 'Failed to refresh CKEditor. Please refresh the page.');
    }
  };

  // Auto-generate slug from product name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  // Update slug when product name changes
  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }));
    }
  }, [formData.name]);

  useEffect(() => {
    fetchCategories();
    fetchFilterOptions();
    if (mode === 'edit' && productId) {
      fetchProduct();
    }
  }, [mode, productId]);





  // Initialize CKEditor for Description and Activation Details fields
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 15;
    let initializationTimeout;

    const initializeCKEditor = () => {
      retryCount++;
      
      if (typeof window === 'undefined') {
        console.log('Window undefined, skipping CKEditor initialization');
        return;
      }

      if (!window.CKEDITOR) {
        console.log(`CKEditor not available yet (attempt ${retryCount}/${maxRetries}), retrying...`);
        if (retryCount < maxRetries) {
          initializationTimeout = setTimeout(initializeCKEditor, 500);
        } else {
          console.error('CKEditor failed to load after maximum retries');
        }
        return;
      }

      console.log('CKEditor available, initializing editors...');

      try {
        // Configure CKEditor settings for Standard version
        const editorConfig = {
          height: 200,
          toolbar: 'Standard',
          versionCheck: false,
          notification_aggregationTimeout: 0,
          removePlugins: 'notification',
          allowedContent: true,
          extraAllowedContent: '*(*){*};*[*]'
        };

        const smallEditorConfig = {
          height: 150,
          toolbar: [
            ['Bold', 'Italic', 'Underline'],
            ['NumberedList', 'BulletedList'],
            ['Link', 'Unlink'],
            ['Source']
          ],
          versionCheck: false,
          notification_aggregationTimeout: 0,
          removePlugins: 'notification',
          allowedContent: true
        };

        // Destroy existing instances safely
        ['description', 'activation_details'].forEach(fieldId => {
          try {
            if (window.CKEDITOR.instances[fieldId]) {
              window.CKEDITOR.instances[fieldId].destroy(true);
              console.log(`Destroyed existing ${fieldId} editor instance`);
            }
          } catch (error) {
            console.log(`Error destroying ${fieldId} editor:`, error);
          }
        });

        // Wait a moment for cleanup
        setTimeout(() => {
          // Initialize Description Editor
          const descElement = document.getElementById('description');
          if (descElement) {
            console.log('Initializing description editor...');
            try {
              const descEditor = window.CKEDITOR.replace('description', editorConfig);
              
              if (descEditor) {
                descEditor.on('instanceReady', function() {
                  console.log('Description editor ready');
                  try {
                    this.setData(formData.description || '');
                  } catch (error) {
                    console.error('Error setting description data:', error);
                  }
                });

                descEditor.on('change', function() {
                  try {
                    const data = this.getData();
                    setFormData(prev => ({ ...prev, description: data }));
                  } catch (error) {
                    console.error('Error getting description data:', error);
                  }
                });

                descEditor.on('key', function() {
                  try {
                    const data = this.getData();
                    setFormData(prev => ({ ...prev, description: data }));
                  } catch (error) {
                    console.error('Error on description key event:', error);
                  }
                });
              }
            } catch (error) {
              console.error('Error initializing description editor:', error);
            }
          }

          // Initialize Activation Details Editor
          const activationElement = document.getElementById('activation_details');
          if (activationElement) {
            console.log('Initializing activation details editor...');
            try {
              const activationEditor = window.CKEDITOR.replace('activation_details', smallEditorConfig);
              
              if (activationEditor) {
                activationEditor.on('instanceReady', function() {
                  console.log('Activation details editor ready');
                  try {
                    this.setData(formData.activation_details || '');
                  } catch (error) {
                    console.error('Error setting activation details data:', error);
                  }
                });

                activationEditor.on('change', function() {
                  try {
                    const data = this.getData();
                    setFormData(prev => ({ ...prev, activation_details: data }));
                  } catch (error) {
                    console.error('Error getting activation details data:', error);
                  }
                });

                activationEditor.on('key', function() {
                  try {
                    const data = this.getData();
                    setFormData(prev => ({ ...prev, activation_details: data }));
                  } catch (error) {
                    console.error('Error on activation details key event:', error);
                  }
                });
              }
            } catch (error) {
              console.error('Error initializing activation details editor:', error);
            }
          }
        }, 100);
      } catch (error) {
        console.error('Error in CKEditor initialization:', error);
      }
    };

    // Wait for DOM to be ready and CKEditor to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initializationTimeout = setTimeout(initializeCKEditor, 500);
      });
    } else {
      initializationTimeout = setTimeout(initializeCKEditor, 500);
    }

    return () => {
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      // Cleanup on unmount
      if (typeof window !== 'undefined' && window.CKEDITOR) {
        ['description', 'activation_details'].forEach(fieldId => {
          try {
            if (window.CKEDITOR.instances[fieldId]) {
              window.CKEDITOR.instances[fieldId].destroy(true);
            }
          } catch (error) {
            console.log(`Error destroying ${fieldId} on cleanup:`, error);
          }
        });
      }
    };
  }, []);

  // Synchronize platform/region selection when both product data and filter options are loaded
  useEffect(() => {
    if (!filterOptions.platforms || !filterOptions.regions || 
        filterOptions.platforms.length === 0 || filterOptions.regions.length === 0) {
      return; // Wait for all filter options to load
    }

    // Only process if we have product data loaded (edit mode)
    if (mode === 'edit' && productId && formData.id) {
      let needsUpdate = false;
      let updatedFormData = { ...formData };

      // Process platforms: if we have platform relationships but no selected_platforms
      if (formData.platform_relationships && formData.platform_relationships.length > 0 && 
          (!formData.selected_platforms || formData.selected_platforms.length === 0)) {
        
        const platformIds = formData.platform_relationships.map(p => p.id);
        updatedFormData.selected_platforms = platformIds;
        needsUpdate = true;
        
        console.log('Setting platforms from relationships:', platformIds);
      }

      // Process regions: if we have region relationships but no selected_regions  
      if (formData.region_relationships && formData.region_relationships.length > 0 && 
          (!formData.selected_regions || formData.selected_regions.length === 0)) {
        
        const regionIds = formData.region_relationships.map(r => r.id);
        updatedFormData.selected_regions = regionIds;
        needsUpdate = true;
        
        console.log('Setting regions from relationships:', regionIds);
      }

      // Fallback: try to match platform by name if still no selected platforms
      if (formData.platform && (!updatedFormData.selected_platforms || updatedFormData.selected_platforms.length === 0)) {
        const matchingPlatform = filterOptions.platforms.find(platform => 
          platform.title && platform.title.toLowerCase().includes(formData.platform.toLowerCase())
        );
        
        if (matchingPlatform) {
          updatedFormData.selected_platforms = [matchingPlatform.id];
          needsUpdate = true;
          console.log('Matched platform by name:', matchingPlatform.title);
        }
      }

      if (needsUpdate) {
        setFormData(updatedFormData);
      }
    }
  }, [filterOptions.platforms, filterOptions.regions, formData.platform_relationships, formData.region_relationships, formData.id, mode, productId]);

  // Update CKEditor content when formData changes (for edit mode)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.CKEDITOR && (formData.description || formData.activation_details)) {
      // Only log in non-test environments
      const isTestEnv = process.env.NODE_ENV === 'test' || typeof jest !== 'undefined';
      if (!isTestEnv) {
        console.log('FormData changed, updating CKEditor content:', {
          description: formData.description,
          activation_details: formData.activation_details,
          descriptionEditor: !!window.CKEDITOR.instances.description,
          activationEditor: !!window.CKEDITOR.instances.activation_details
        });
      }

      const updateEditorContent = () => {
        if (window.CKEDITOR.instances.description && formData.description !== window.CKEDITOR.instances.description.getData()) {
          window.CKEDITOR.instances.description.setData(formData.description || '');
          if (!isTestEnv) {
            console.log('Updated description editor with:', formData.description);
          }
        }

        if (window.CKEDITOR.instances.activation_details && formData.activation_details !== window.CKEDITOR.instances.activation_details.getData()) {
          window.CKEDITOR.instances.activation_details.setData(formData.activation_details || '');
          if (!isTestEnv) {
            console.log('Updated activation details editor with:', formData.activation_details);
          }
        }
      };

      // Try immediately and with a slight delay
      updateEditorContent();
      setTimeout(updateEditorContent, 100);
    }
  }, [formData.description, formData.activation_details]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/product-categories?hierarchical=false');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }

  const fetchSubcategories = async (categoryId) => {
    console.log('🔄 fetchSubcategories called with categoryId:', categoryId);
    if (!categoryId) {
      console.log('❌ No categoryId provided, clearing subcategories');
      setSubcategories([]);
      return;
    }
    try {
      console.log('📡 Fetching subcategories for categoryId:', categoryId);
      const response = await fetch(`/api/admin/product-categories?parent_id=${categoryId}`);
      const data = await response.json();
      console.log('✅ Subcategories API response:', data);
      console.log('📋 Setting subcategories:', data.categories || []);
      setSubcategories(data.categories || []);
    } catch (error) {
      console.error('❌ Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/admin/filter-options');
      if (!response || !response.json) {
        console.error('Invalid API response for filter options:', response);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data);
      } else {
        // Handle direct data format (non-wrapped response)
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      console.log(`Fetching product data for ID: ${productId}...`);
      const response = await fetch(`/api/admin/products/${productId}`);
      const data = await response.json();
      
      if (data.success && data.product) {
        console.log('✓ Product data fetched successfully:', data.product.name);
        console.log('Raw product data:', data.product);
        console.log('📋 Categories array from API:', data.product.categories);
        console.log('📋 Main category_id from API:', data.product.category_id);
        console.log('💰 KinguinID:', data.product.kinguinid, 'Kinguin Price:', data.product.kinguin_price);
        
        // Comprehensive field mapping with all database columns
        const productData = {
          // Core identification fields
          name: data.product.name || '',
          price: (() => {
            // Handle pricing logic for manual vs Kinguin products
            const kinguinId = data.product.kinguinid;
            const kinguinIdStr = kinguinId ? String(kinguinId).trim() : '';
            
            // Check if this is a manual product (short/simple KinguinID like "20")
            if (!kinguinIdStr || kinguinIdStr.length <= 5 && !kinguinIdStr.includes('-')) {
              // Manual product - use the stored price directly (manual price)
              console.log('💰 Manual product - using stored price:', data.product.price);
              return parseFloat(data.product.price) || '';
            } else {
              // Kinguin product - use calculated customer price (price field contains final calculated price)
              console.log('💰 Kinguin product - using calculated price:', data.product.price);
              return parseFloat(data.product.price) || '';
            }
          })(),
          sale_price: parseFloat(data.product.sale_price) || '',
          product_id: data.product.product_id || data.product.productid || '',
          kinguinid: data.product.kinguinid || '',
          kinguin_price: (() => {
            // Only show kinguin_price for products imported from Kinguin API
            // Manual products should have empty kinguin_price field
            const kinguinId = data.product.kinguinid;
            const kinguinPrice = data.product.kinguin_price;
            
            // Convert kinguinId to string and check if it's a real Kinguin import
            const kinguinIdStr = kinguinId ? String(kinguinId).trim() : '';
            
            // Check if this is a real Kinguin import (Kinguin IDs are typically longer UUIDs or specific format)
            // Manual/test products often have simple numeric IDs like "20", "1", etc.
            if (kinguinIdStr && kinguinPrice && 
                (kinguinIdStr.length > 5 || kinguinIdStr.includes('-'))) {
              // Product appears to be a real Kinguin import
              return parseFloat(kinguinPrice) || '';
            } else {
              // Manual product or test product - kinguin_price should remain empty
              console.log('🚫 Kinguin Price hidden for manual product. KinguinID:', kinguinIdStr);
              return '';
            }
          })(),

          // Inventory and shipping
          qty: parseInt(data.product.qty) || 0,
          stock_quantity: parseInt(data.product.stock_quantity) || '',
          limit_per_basket: parseInt(data.product.limit_per_basket) || '',
          shipping_time_value: data.product.shipping_time_unit === 'Instant Delivery' ? '0' : (data.product.shipping_time_value || '0'),
          shipping_time_unit: data.product.shipping_time_unit || 'Minutes',
          
          // Product metadata
          release_date: data.product.release_date || data.product.releasedate || '',
          ean: data.product.ean || '',
          sku: data.product.sku || '',
          automater: data.product.automater || data.product.automater_id || '',
          platform: data.product.platform || '',
          short_description: data.product.short_description || '',
          
          // Categories and classification - process from categories array
          category_id: (() => {
            // Extract main category (parent_id is null) from existing product category
            if (data.product.category_id) {
              return data.product.category_id; // Use the main category from API query
            }
            return '';
          })(),
          subcategory_id: '', // Will be set after fetching subcategories
          selected_categories: Array.isArray(data.product.categories) ? data.product.categories : [],
          
          // Platform handling - supports both direct field and relationship data
          platform: data.product.platform || '', // Direct platform field (e.g., "Ubisoft")
          selected_platforms: (() => {
            console.log('Processing platforms from:', {
              platform_field: data.product.platform,
              platform_relationships: data.product.platform_relationships,
              platforms_ids: data.product.platforms_ids
            });
            
            // Priority 1: Use relationship data if available
            if (Array.isArray(data.product.platform_relationships) && data.product.platform_relationships.length > 0) {
              return data.product.platform_relationships.map(p => p.id);
            }
            
            // Priority 2: Use platforms_ids array if available
            if (Array.isArray(data.product.platforms_ids) && data.product.platforms_ids.length > 0) {
              return data.product.platforms_ids;
            }
            
            // Priority 3: Try to find platform by name match if direct field exists
            if (data.product.platform && data.product.platform.trim()) {
              console.log('Platform field contains:', data.product.platform);
              // This will be populated when platform options are loaded
              return [];
            }
            
            return [];
          })(),
          
          // Product flags
          downloadable: Boolean(data.product.downloadable),
          virtual: Boolean(data.product.virtual),
          manage_stock: Boolean(data.product.manage_stock),
          featured: Boolean(data.product.featured),
          visibility: data.product.visibility || 'visible',

          // Ratings and scores
          meta_score: data.product.metacriticscore || data.product.metacritic_score || data.product.meta_score || '',
          age_rating: data.product.agerating || data.product.age_rating || '',
          
          // SEO and metadata fields
          meta_title: data.product.meta_title || '',
          meta_description: data.product.meta_description || '',
          meta_keywords: data.product.meta_keywords || '',
          slug: data.product.slug || '',
          og_title: data.product.og_title || '',
          og_description: data.product.og_description || '',
          og_image_url: data.product.og_image_url || '',
          
          // Array fields with proper type checking
          tags: Array.isArray(data.product.tags) ? data.product.tags : [],
          genres: Array.isArray(data.product.genres) ? data.product.genres : [],
          languages: Array.isArray(data.product.languages) ? data.product.languages : [],
          developers: Array.isArray(data.product.developers) ? data.product.developers : [],
          publishers: Array.isArray(data.product.publishers) ? data.product.publishers : [],
          
          // Regions handling - store region names for display, IDs for backend
          regions: (() => {
            console.log('Processing regions from:', {
              region_relationships: data.product.region_relationships,
              regions_array: data.product.regions
            });
            
            // Priority 1: Use relationship data if available (store names for display)
            if (Array.isArray(data.product.region_relationships) && data.product.region_relationships.length > 0) {
              return data.product.region_relationships.map(r => r.name);
            }
            
            // Priority 2: Use direct regions array (convert IDs to names using filterOptions)
            if (Array.isArray(data.product.regions)) {
              return data.product.regions; // Will be converted to names after filterOptions load
            }
            
            return [];
          })(),
          
          // Store region IDs separately for backend operations
          selected_regions: (() => {
            if (Array.isArray(data.product.region_relationships) && data.product.region_relationships.length > 0) {
              return data.product.region_relationships.map(r => r.id);
            }
            if (Array.isArray(data.product.regions)) {
              return data.product.regions;
            }
            return [];
          })(),
          // Process cover image with comprehensive fallback chain
          cover_url: (() => {
            console.log('Processing cover image from:', {
              cover_url: data.product.cover_url,
              images_cover_url: data.product.images_cover_url,
              images: data.product.images
            });
            
            // Priority 1: Use images_cover_url field
            if (data.product.images_cover_url) {
              return data.product.images_cover_url;
            }
            
            // Priority 2: Use cover_url field
            if (data.product.cover_url) {
              return data.product.cover_url;
            }
            
            // Priority 3: Extract from images JSON field
            if (data.product.images) {
              try {
                let imageData = data.product.images;
                if (typeof imageData === 'string') {
                  imageData = JSON.parse(imageData);
                }
                
                if (imageData && imageData.cover) {
                  if (typeof imageData.cover === 'string') {
                    return imageData.cover;
                  } else if (imageData.cover.url) {
                    return imageData.cover.url;
                  }
                }
              } catch (e) {
                console.log('Could not parse cover data from images field');
              }
            }
            
            return '';
          })(),
          
          // Use screenshots parsed by admin API (data.product.screenshots)
          screenshots: (() => {
            console.log('Processing screenshots from API:', {
              api_screenshots: data.product.screenshots,
              images_screenshots: data.product.images_screenshots,
              centralized_function: getProductScreenshots(data.product)
            });
            
            // Priority 1: Use screenshots already parsed by admin API
            if (Array.isArray(data.product.screenshots) && data.product.screenshots.length > 0) {
              const validScreenshots = data.product.screenshots.filter(url => url && url.trim() !== '');
              console.log('Using admin API parsed screenshots:', validScreenshots.length);
              return validScreenshots.slice(0, 6);
            }
            
            // Priority 2: Use centralized extraction as fallback
            const fallbackScreenshots = getProductScreenshots(data.product);
            console.log('Using fallback screenshots:', fallbackScreenshots.length);
            return fallbackScreenshots.slice(0, 6);
          })(),
          
          // Keep legacy images field for backward compatibility (empty for new structure)
          images: [],
          // Ensure text fields are handled
          description: data.product.description || '',
          activation_details: data.product.activation_details || '',
          // Process system requirements from database format
          system_requirements: (() => {
            if (!data.product.system_requirements) return [];
            
            try {
              let sysReqs = data.product.system_requirements;
              
              // If it's a string, parse it
              if (typeof sysReqs === 'string') {
                sysReqs = JSON.parse(sysReqs);
              }
              
              // Convert database format to form format
              if (Array.isArray(sysReqs) && sysReqs.length > 0) {
                return sysReqs.map((req, index) => {
                  // Handle database format: {system: "Windows", requirement: ["combined text"]}
                  if (req.system && req.requirement) {
                    const requirements = [];
                    
                    // Parse combined requirement text into individual fields
                    if (Array.isArray(req.requirement) && req.requirement[0]) {
                      const reqText = req.requirement[0];
                      
                      // Extract individual requirements using keywords
                      const osMatch = reqText.match(/OS:\s*([^:]+?)(?:\s+(?:Processor|Memory|Graphics|DirectX|Storage|Sound|Additional)|$)/i);
                      const processorMatch = reqText.match(/Processor:\s*([^:]+?)(?:\s+(?:Memory|Graphics|DirectX|Storage|Sound|Additional)|$)/i);
                      const memoryMatch = reqText.match(/Memory:\s*([^:]+?)(?:\s+(?:Graphics|DirectX|Storage|Sound|Additional)|$)/i);
                      const graphicsMatch = reqText.match(/Graphics:\s*([^:]+?)(?:\s+(?:DirectX|Storage|Sound|Additional)|$)/i);
                      const directxMatch = reqText.match(/DirectX:\s*([^:]+?)(?:\s+(?:Storage|Sound|Additional)|$)/i);
                      const storageMatch = reqText.match(/Storage:\s*([^:]+?)(?:\s+(?:Sound|Additional)|$)/i);
                      const soundMatch = reqText.match(/Sound Card:\s*([^:]+?)(?:\s+(?:Additional)|$)/i);
                      
                      requirements.push(
                        { type: 'OS', value: osMatch ? osMatch[1].trim() : '' },
                        { type: 'Processor', value: processorMatch ? processorMatch[1].trim() : '' },
                        { type: 'Memory', value: memoryMatch ? memoryMatch[1].trim() : '' },
                        { type: 'Graphics', value: graphicsMatch ? graphicsMatch[1].trim() : '' },
                        { type: 'DirectX', value: directxMatch ? directxMatch[1].trim() : '' },
                        { type: 'Storage', value: storageMatch ? storageMatch[1].trim() : '' },
                        { type: 'Sound Card', value: soundMatch ? soundMatch[1].trim() : '' }
                      );
                    } else {
                      // Default empty requirements
                      requirements.push(
                        { type: 'OS', value: '' },
                        { type: 'Processor', value: '' },
                        { type: 'Memory', value: '' },
                        { type: 'Graphics', value: '' },
                        { type: 'DirectX', value: '' },
                        { type: 'Storage', value: '' },
                        { type: 'Sound Card', value: '' }
                      );
                    }
                    
                    return {
                      id: index + 1,
                      name: req.system || 'Windows',
                      requirements: requirements
                    };
                  }
                  
                  // Handle already processed format
                  return req;
                });
              }
              
              // Return default if no valid data
              return [{
                id: 1,
                name: 'Windows',
                requirements: [
                  { type: 'OS', value: '' },
                  { type: 'Processor', value: '' },
                  { type: 'Memory', value: '' },
                  { type: 'Graphics', value: '' },
                  { type: 'DirectX', value: '' },
                  { type: 'Storage', value: '' },
                  { type: 'Sound Card', value: '' }
                ]
              }];
            } catch (error) {
              console.error('Error processing system requirements:', error);
              return [{
                id: 1,
                name: 'Windows',
                requirements: [
                  { type: 'OS', value: '' },
                  { type: 'Processor', value: '' },
                  { type: 'Memory', value: '' },
                  { type: 'Graphics', value: '' },
                  { type: 'DirectX', value: '' },
                  { type: 'Storage', value: '' },
                  { type: 'Sound Card', value: '' }
                ]
              }];
            }
          })(),
          // SEO Fields
          meta_title: data.product.meta_title || '',
          meta_description: data.product.meta_description || '',
          meta_keywords: data.product.meta_keywords || '',
          slug: data.product.slug || '',
          og_title: data.product.og_title || '',
          og_description: data.product.og_description || '',
          og_image_url: data.product.og_image_url || ''
        };
        
        console.log('Processed product data:', productData);
        console.log('Setting form data with qty:', productData.qty);
        console.log('Relationship data received:', {
          tags: productData.tags,
          genres: productData.genres,
          languages: productData.languages,
          developers: productData.developers,
          publishers: productData.publishers,
          regions: productData.regions
        });
        setFormData(productData);
        
        // If product has a category, fetch subcategories and set the subcategory_id
        if (productData.category_id) {
          console.log('🔄 Product has category_id:', productData.category_id, 'fetching subcategories...');
          await fetchSubcategories(productData.category_id);
          
          // After fetching subcategories, find and set the subcategory_id from the product's categories
          if (Array.isArray(data.product.categories) && data.product.categories.length > 0) {
            console.log('🔍 All product categories:', data.product.categories);
            console.log('🔍 Main category:', productData.category_id);
            
            // Find the subcategory (any category that's not the main category)
            const subcategoryId = data.product.categories.find(catId => catId !== productData.category_id);
            
            if (subcategoryId) {
              console.log('✅ Found subcategory ID:', subcategoryId);
              setFormData(prev => ({
                ...prev,
                subcategory_id: subcategoryId.toString()
              }));
            } else {
              console.log('ℹ️ No subcategory found for this product');
            }
          }
        }

        // Update CKEditor instances with fetched data - improved timing and error handling
        const updateCKEditors = (retryCount = 0) => {
          const maxRetries = 5;
          
          if (typeof window === 'undefined' || !window.CKEDITOR) {
            if (retryCount < maxRetries) {
              setTimeout(() => updateCKEditors(retryCount + 1), 500);
            }
            return;
          }

          console.log('Updating CKEditor with data (attempt ' + (retryCount + 1) + '):', {
            description: productData.description ? 'Has data' : 'Empty',
            activation_details: productData.activation_details ? 'Has data' : 'Empty',
            descriptionEditor: !!window.CKEDITOR.instances.description,
            activationEditor: !!window.CKEDITOR.instances.activation_details
          });
          
          let updated = false;
          
          // Update description editor
          if (window.CKEDITOR.instances.description) {
            try {
              window.CKEDITOR.instances.description.setData(productData.description || '');
              console.log('✓ Description editor updated successfully');
              updated = true;
            } catch (error) {
              console.error('Error updating description editor:', error);
            }
          }
          
          // Update activation details editor
          if (window.CKEDITOR.instances.activation_details) {
            try {
              // Always set the data, even if empty - CKEditor can handle empty content
              const activationContent = productData.activation_details || '';
              window.CKEDITOR.instances.activation_details.setData(activationContent);
              if (activationContent.trim()) {
                console.log('✓ Activation details editor updated with content:', activationContent.substring(0, 50) + '...');
              } else {
                console.log('✓ Activation details editor updated with empty content (as expected for this product)');
              }
              updated = true;
            } catch (error) {
              console.error('Error updating activation details editor:', error);
            }
          }
          
          // Retry if editors aren't ready yet
          if (!updated && retryCount < maxRetries) {
            console.log('CKEditor instances not ready, retrying...');
            setTimeout(() => updateCKEditors(retryCount + 1), 1000);
          }
        };
        
        // Try immediately and then with progressive delays
        updateCKEditors();
        setTimeout(() => updateCKEditors(), 1000);
        setTimeout(() => updateCKEditors(), 2000);
        setTimeout(() => updateCKEditors(), 3000);
        
        // Fetch SEO data separately
        await fetchProductSEO();
        
        // Handle platform name matching after filter options are loaded
        if (productData.platform && productData.selected_platforms.length === 0) {
          // Find platform by name match
          const platformMatch = filterOptions.platforms?.find(p => 
            p.title?.toLowerCase().includes(productData.platform.toLowerCase()) ||
            productData.platform.toLowerCase().includes(p.title?.toLowerCase())
          );
          if (platformMatch) {
            console.log('✓ Found platform match:', platformMatch.title);
            setFormData(prev => ({
              ...prev,
              selected_platforms: [platformMatch.id]
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchProductSEO = async () => {
    try {
      const response = await fetch(`/api/admin/products/seo?productId=${productId}`);
      const data = await response.json();
      
      // Handle successful SEO data
      if (data.success && data.seo) {
        console.log('✓ SEO data loaded successfully');
        setFormData(prev => ({
          ...prev,
          meta_title: data.seo.meta_title || '',
          meta_description: data.seo.meta_description || '',
          meta_keywords: data.seo.meta_keywords || '',
          slug: data.seo.slug || '',
          og_title: data.seo.og_title || '',
          og_description: data.seo.og_description || '',
          og_image_url: data.seo.og_image_url || ''
        }));
      } else if (data.error && data.error.includes('product_seo') && data.error.includes('does not exist')) {
        // Handle missing product_seo table gracefully
        console.log('ℹ️ SEO table not available - SEO fields will use default values');
      } else {
        console.log('ℹ️ No SEO data found for this product');
      }
    } catch (error) {
      console.log('ℹ️ SEO data fetch skipped:', error.message);
      // Don't throw error, just continue without SEO data
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });

    // Reset subcategory when category changes and fetch subcategories
    if (name === 'category_id') {
      console.log('🔄 Category changed to:', value);
      setFormData(prev => ({
        ...prev,
        subcategory_id: ''
      }));
      fetchSubcategories(value);
    }
  };

  // Get main categories (no parent)
  const getMainCategories = () => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.filter(cat => !cat.parent_id);
  };

  // Get subcategories for selected main category
  const getSubcategories = () => {
    if (!subcategories || !Array.isArray(subcategories)) return [];
    return subcategories;
  };

  const handleTagInput = (field, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !formData[field].includes(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field], value]
        }));
        e.target.value = '';
      }
    }
  };

  const removeTag = (field, tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Remove all client-side validation to allow flexible product creation

    // Sync CKEditor data before submission
    let updatedFormData = { ...formData };
    if (typeof window !== 'undefined' && window.CKEDITOR) {
      try {
        if (window.CKEDITOR.instances.description) {
          const descriptionData = window.CKEDITOR.instances.description.getData();
          updatedFormData.description = descriptionData;
          console.log('Synced description data:', descriptionData.substring(0, 100) + '...');
        }
      } catch (error) {
        console.error('Error syncing description data:', error);
      }

      try {
        if (window.CKEDITOR.instances.activation_details) {
          const activationData = window.CKEDITOR.instances.activation_details.getData();
          updatedFormData.activation_details = activationData;
          console.log('Synced activation details data:', activationData.substring(0, 100) + '...');
        }
      } catch (error) {
        console.error('Error syncing activation details data:', error);
      }
    }

    try {
      const url = mode === 'edit' ? `/api/admin/products/${productId}` : '/api/admin/products';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      // Prepare data for API - handle arrays vs JSON fields based on database schema
      const apiData = {
        ...updatedFormData,
        // Keep as arrays for PostgreSQL ARRAY columns
        genres: updatedFormData.genres || [],
        developers: updatedFormData.developers || [],
        publishers: updatedFormData.publishers || [],
        languages: updatedFormData.languages || [],
        regions: updatedFormData.regions || [],
        tags: updatedFormData.tags || [],
        // Convert to JSON strings for JSONB columns
        system_requirements: JSON.stringify(updatedFormData.system_requirements || []),
        images: JSON.stringify([
          updatedFormData.cover_url || '',
          ...(updatedFormData.screenshots || [])
        ].filter(Boolean)), // Remove empty strings and convert to JSON
        // Keep screenshots as array for compatibility
        screenshots: updatedFormData.screenshots || []
      };
      
      console.log('Sending API data:', apiData);
      console.log('Form validation - Name:', apiData.name, 'Price:', apiData.price);
      console.log('📋 Category data being sent:', {
        category_id: apiData.category_id,
        subcategory_id: apiData.subcategory_id,
        category_id_type: typeof apiData.category_id,
        subcategory_id_type: typeof apiData.subcategory_id
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        if (response.status === 413) {
          showPopup('error', 'File Too Large', 'The uploaded images are too large. Please use smaller images (under 500KB each) and try again.');
          return;
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      if (response.ok && data.message && data.message.includes('successfully')) {
        console.log('Success Response:', data);
        
        // Save SEO data separately if in edit mode
        if (mode === 'edit') {
          await saveSEOData(productId);
        }
        
        showPopup('success', 'Success!', `Product ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
        setTimeout(() => {
          router.push('/admin/all-products');
        }, 2000);
      } else {
        console.error('API Error Response:', data);
        console.error('Response Status:', response.status);
        const errorMessage = data.details ? 
          (Array.isArray(data.details) ? data.details.join(', ') : data.details) : 
          (data.error || 'Please check the form data and try again.');
        showPopup('error', 'Validation Error', errorMessage);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showPopup('error', 'Error', `Network error occurred while ${mode === 'edit' ? 'updating' : 'creating'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const saveSEOData = async (productId) => {
    try {
      const seoData = {
        productId,
        meta_title: formData.meta_title,
        meta_keywords: formData.meta_keywords,
        slug: formData.slug,
        meta_description: formData.meta_description,
        og_title: formData.og_title,
        og_description: formData.og_description,
        og_image_url: formData.og_image_url
      };

      const response = await fetch('/api/admin/products/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoData),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Error saving SEO data:', data.error);
      }
    } catch (error) {
      console.error('Error saving SEO data:', error);
    }
  };

  // Database-safe image compression - ultra aggressive to prevent index size errors
  const convertToBase64 = (file, maxWidth = 400, quality = 0.4) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Very aggressive sizing for database compatibility
        let { width, height } = img;
        
        // Force maximum dimensions to prevent large images
        const maxDimension = Math.min(maxWidth, 400);
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with very low quality for database safety
        ctx.drawImage(img, 0, 0, width, height);
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Ultra-aggressive compression - ensure under 50KB for database indexes
        let attempts = 0;
        while (compressedDataUrl.length > 50000 && quality > 0.02 && attempts < 10) {
          quality -= 0.03;
          attempts++;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        // Final fallback - extremely small size for database compatibility
        if (compressedDataUrl.length > 50000) {
          canvas.width = 150;
          canvas.height = 150;
          ctx.drawImage(img, 0, 0, 150, 150);
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.05);
        }
        
        // Emergency fallback if still too large
        if (compressedDataUrl.length > 50000) {
          canvas.width = 100;
          canvas.height = 100;
          ctx.drawImage(img, 0, 0, 100, 100);
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.02);
        }
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      
      // Convert file to image
      const reader = new FileReader();
      reader.onload = (e) => img.src = e.target.result;
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const base64Images = await Promise.all(files.map(file => convertToBase64(file)));
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...base64Images].slice(0, 7)
    }));
  };

  const handleSingleFileSelect = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const base64Image = await convertToBase64(file);
      setFormData(prev => {
        const newImages = [...(prev.images || [])];
        newImages[index] = base64Image;
        return { ...prev, images: newImages };
      });
    }
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const base64Images = await Promise.all(imageFiles.map(file => convertToBase64(file)));
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...base64Images].slice(0, 7)
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const moveImage = (fromIndex, toIndex) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return { ...prev, images: newImages };
    });
  };

  const openImagePreview = (index) => {
    if (formData.images && formData.images[index]) {
      window.open(formData.images[index], '_blank');
    }
  };

  // Cover Image handlers
  const handleCoverImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size before processing
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      showPopup('error', 'File Too Large', 'Please select an image smaller than 2MB.');
      e.target.value = ''; // Clear the input
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      
      // Final size check - strict database compatibility
      if (base64.length > 50000) { // ~50KB in base64 to prevent database index issues
        showPopup('error', 'Image Too Large', 'Image must be under 50KB for database compatibility. Please use a smaller image or remove images to save the product.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        cover_url: base64
      }));
      
      showPopup('success', 'Success', 'Cover image uploaded successfully!');
    } catch (error) {
      console.error('Error converting cover image:', error);
      showPopup('error', 'Upload Error', 'Error uploading cover image. Please try again.');
      e.target.value = ''; // Clear the input
    }
  };

  // Screenshot handlers
  const handleScreenshotSelect = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      setFormData(prev => {
        const screenshots = [...(prev.screenshots || [])];
        screenshots[index] = base64;
        return {
          ...prev,
          screenshots: screenshots
        };
      });
    } catch (error) {
      console.error('Error converting screenshot:', error);
      showPopup('error', 'Upload Error', 'Error uploading screenshot. Please try again.');
    }
  };

  const removeScreenshot = (index) => {
    setFormData(prev => {
      const screenshots = [...(prev.screenshots || [])];
      screenshots.splice(index, 1);
      return {
        ...prev,
        screenshots: screenshots
      };
    });
  };

  // System Requirements handlers
  const addSystemRequirement = () => {
    const systemNames = ['Windows', 'Mac OS', 'Linux', 'PlayStation', 'Xbox', 'Nintendo Switch'];
    const existingNames = (formData.system_requirements || []).map(sr => sr.name);
    const availableName = systemNames.find(name => !existingNames.includes(name)) || 'Mac OS';
    
    const newId = Math.max(...(formData.system_requirements || []).map(sr => sr.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      system_requirements: [
        ...(prev.system_requirements || []),
        {
          id: newId,
          name: availableName,
          requirements: [
            { type: 'OS', value: '' },
            { type: 'Processor', value: '' },
            { type: 'Memory', value: '' },
            { type: 'Graphics', value: '' },
            { type: 'DirectX', value: '' },
            { type: 'Storage', value: '' },
            { type: 'Sound Card', value: '' }
          ]
        }
      ]
    }));
  };

  const removeSystemRequirement = (systemId) => {
    setFormData(prev => ({
      ...prev,
      system_requirements: (prev.system_requirements || []).filter(sr => sr.id !== systemId)
    }));
  };

  const addRequirementRow = (systemId) => {
    setFormData(prev => ({
      ...prev,
      system_requirements: (prev.system_requirements || []).map(sr => 
        sr.id === systemId 
          ? { ...sr, requirements: [...(sr.requirements || []), { type: '', value: '' }] }
          : sr
      )
    }));
  };

  const removeRequirementRow = (systemId, requirementIndex) => {
    setFormData(prev => ({
      ...prev,
      system_requirements: (prev.system_requirements || []).map(sr => 
        sr.id === systemId 
          ? { 
              ...sr, 
              requirements: (sr.requirements || []).filter((_, index) => index !== requirementIndex) 
            }
          : sr
      )
    }));
  };

  const updateRequirement = (systemId, requirementIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      system_requirements: (prev.system_requirements || []).map(sr => 
        sr.id === systemId 
          ? {
              ...sr,
              requirements: (sr.requirements || []).map((req, index) => 
                index === requirementIndex 
                  ? { ...req, [field]: value }
                  : req
              )
            }
          : sr
      )
    }));
  };

  // SEO Auto-generation functions
  const generateAllSEO = () => {
    const generatedSlug = generateSlug(formData.name);
    const truncatedDescription = formData.description ? formData.description.substring(0, 160) : '';
    const mainImageUrl = formData.images && formData.images[0] ? formData.images[0] : '';
    
    setFormData(prev => ({
      ...prev,
      slug: generatedSlug,
      meta_title: formData.name ? formData.name.substring(0, 60) : '',
      meta_description: truncatedDescription,
      og_title: formData.name || '',
      og_description: truncatedDescription,
      og_image_url: mainImageUrl,
      meta_keywords: [
        ...(formData.genres || []).slice(0, 3),
        ...(formData.tags || []).slice(0, 2),
        formData.platform ? formData.platform.toLowerCase() : 'gaming'
      ].filter(Boolean).join(', ')
    }));
  };

  // Update OG Image when main image changes
  useEffect(() => {
    if (formData.images && formData.images[0] && !formData.og_image_url) {
      setFormData(prev => ({
        ...prev,
        og_image_url: prev.images[0]
      }));
    }
  }, [formData.images]);



  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
          </div>
        <div className="px-6 py-4 space-y-6">
          {/* Row 1: Product Name (2 cols), SKU (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                id="product-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Microsoft Windows 11 Home"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="WIN11-HOME-001"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Kinguin Price, Price, Sale Price */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="kinguin-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kinguin Price (EUR)
              </label>
              <div className="text-xs text-gray-500 mb-1">Only for Kinguin imports - leave empty for manual products</div>
              <input
                type="number"
                step="0.01"
                id="kinguin-price"
                name="kinguin_price"
                value={formData.kinguin_price || ''}
                onChange={handleInputChange}
                placeholder="Leave empty for manual products"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price
                <span className="text-xs text-gray-500 block mt-1">Customer price (EUR)</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sale Price
                <span className="text-xs text-gray-500 block mt-1">Discounted price (optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="sale_price"
                id="sale_price"
                value={formData.sale_price || ''}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

          </div>
          
          {/* Row 3: Product ID, Total Qty, Limit Per Basket */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product ID
              </label>
              <input
                type="text"
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                placeholder="AUTO_GENERATED"
                disabled={mode === 'add'}
                className={`w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm ${
                  mode === 'add' 
                    ? 'text-gray-500 bg-gray-100 dark:bg-gray-600 cursor-not-allowed' 
                    : 'text-gray-900 dark:text-white bg-white dark:bg-gray-700'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Qty
              </label>
              <input
                type="number"
                name="qty"
                value={formData.qty || 0}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">Current value: {JSON.stringify(formData.qty)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Limit Per Basket
              </label>
              <input
                type="number"
                name="limit_per_basket"
                value={formData.limit_per_basket}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Row 4: Shipping Time, Release Date, EAN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shipping Time
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="shipping_time_value"
                  value={formData.shipping_time_value}
                  onChange={handleInputChange}
                  placeholder="2"
                  disabled={formData.shipping_time_unit === 'Instant Delivery'}
                  className={`w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm ${
                    formData.shipping_time_unit === 'Instant Delivery' 
                      ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed' 
                      : 'text-gray-900 dark:text-white bg-white dark:bg-gray-700'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  style={{ width: '30%' }}
                />
                <select
                  name="shipping_time_unit"
                  value={formData.shipping_time_unit}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      shipping_time_unit: newUnit,
                      // Clear value when Instant Delivery is selected
                      shipping_time_value: newUnit === 'Instant Delivery' ? '0' : prev.shipping_time_value
                    }));
                  }}
                  className="h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ width: '70%' }}
                >
                  <option value="seconds">seconds</option>
                  <option value="Minutes">minutes</option>
                  <option value="hour">hour</option>
                  <option value="hours">hours</option>
                  <option value="Day">day</option>
                  <option value="Days">days</option>
                  <option value="Instant Delivery">Instant Delivery</option>
                </select>
              </div>
              {formData.shipping_time_unit === 'Instant Delivery' && (
                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  ✓ Instant delivery - no time value needed
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Release Date
              </label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                EAN
              </label>
              <input
                type="text"
                name="ean"
                value={formData.ean}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Row 5: Automater, Category, Subcategory */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Automater
              </label>
              <input
                type="text"
                name="automater"
                value={formData.automater}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {getMainCategories().map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id || ''}
                onChange={handleInputChange}
                disabled={!formData.category_id}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select subcategory</option>
                {getSubcategories().map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>



        </div>
      </div>

      {/* Attributes Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attributes</h3>
        </div>
        <div className="px-6 py-4 space-y-6">
          {/* Row 1: Platform, Meta Score, Age Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform
              </label>
              <select
                name="platform"
                value={formData.selected_platforms && formData.selected_platforms.length > 0 ? String(formData.selected_platforms[0]) : ''}
                onChange={(e) => {
                  const platformId = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    selected_platforms: platformId ? [parseInt(platformId)] : [],
                    platform: platformId ? filterOptions.platforms.find(p => p.id === parseInt(platformId))?.title || '' : ''
                  }));
                }}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Platform</option>
                {filterOptions.platforms && filterOptions.platforms.map((platform, index) => (
                  <option key={`platform-${platform.id}-${index}`} value={String(platform.id)}>
                    {platform.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Critic Score
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                name="meta_score"
                id="meta_score"
                value={formData.meta_score}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age Rating
              </label>
              <select
                name="age_rating"
                value={formData.age_rating}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Age Rating</option>
                <option value="PEGI 3">PEGI 3</option>
                <option value="PEGI 7">PEGI 7</option>
                <option value="PEGI 12">PEGI 12</option>
                <option value="PEGI 16">PEGI 16</option>
                <option value="PEGI 18">PEGI 18</option>
                <option value="ESRB E">ESRB E (Everyone)</option>
                <option value="ESRB E10+">ESRB E10+ (Everyone 10+)</option>
                <option value="ESRB T">ESRB T (Teen)</option>
                <option value="ESRB M">ESRB M (Mature 17+)</option>
                <option value="ESRB AO">ESRB AO (Adults Only)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Tags, Genres, Languages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="relative">
                <div className="w-full min-h-[40px] border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 flex flex-wrap items-center gap-1">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={`tag-${tag}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchTerms.tags || ''}
                    onChange={(e) => {
                      setSearchTerms(prev => ({ ...prev, tags: e.target.value }));
                    }}
                    placeholder={formData.tags.length === 0 ? "Select tags..." : ""}
                    onFocus={(e) => {
                      const dropdown = e.target.nextElementSibling;
                      if (dropdown) dropdown.style.display = 'block';
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        const dropdown = e.target.nextElementSibling;
                        if (dropdown) dropdown.style.display = 'none';
                      }, 200);
                    }}
                    className="flex-1 border-0 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none min-w-[100px]"
                  />
                  <div
                    className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
                    style={{ display: 'none' }}
                  >
                    {filterOptions.tags && Array.isArray(filterOptions.tags) ? filterOptions.tags
                      .filter(tag => !formData.tags.includes(tag.name))
                      .filter(tag => !searchTerms.tags || tag.name.toLowerCase().includes(searchTerms.tags.toLowerCase()))
                      .map(tag => (
                        <div
                          key={tag.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag.name]
                            }));
                            setSearchTerms(prev => ({ ...prev, tags: '' }));
                          }}
                          className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          {tag.name}
                        </div>
                      )) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      const dropdown = e.target.previousElementSibling;
                      if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genres
              </label>
              <div className="relative">
                <div className="w-full min-h-[40px] border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 flex flex-wrap items-center gap-1">
                  {formData.genres.map((genre, index) => (
                    <span
                      key={`genre-${genre}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-blue-200"
                    >
                      {genre}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            genres: prev.genres.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchTerms.genres || ''}
                    onChange={(e) => {
                      setSearchTerms(prev => ({ ...prev, genres: e.target.value }));
                    }}
                    placeholder={formData.genres.length === 0 ? "Select genres..." : ""}
                    onFocus={(e) => {
                      const dropdown = e.target.nextElementSibling;
                      if (dropdown) dropdown.style.display = 'block';
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        const dropdown = e.target.nextElementSibling;
                        if (dropdown) dropdown.style.display = 'none';
                      }, 200);
                    }}
                    className="flex-1 border-0 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none min-w-[100px]"
                  />
                  <div
                    className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
                    style={{ display: 'none' }}
                  >
                    {filterOptions.genres
                      .filter(genre => !formData.genres.includes(genre.name))
                      .filter(genre => !searchTerms.genres || genre.name.toLowerCase().includes(searchTerms.genres.toLowerCase()))
                      .map(genre => (
                        <div
                          key={genre.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              genres: [...prev.genres, genre.name]
                            }));
                            setSearchTerms(prev => ({ ...prev, genres: '' }));
                          }}
                          className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          {genre.name}
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      const dropdown = e.target.previousElementSibling;
                      if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Languages
              </label>
              <div className="relative">
                <div className="w-full min-h-[40px] border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 flex flex-wrap items-center gap-1">
                  {formData.languages.map((language, index) => (
                    <span
                      key={`language-${language}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-600 dark:text-green-200"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            languages: prev.languages.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 text-green-600 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchTerms.languages || ''}
                    onChange={(e) => {
                      setSearchTerms(prev => ({ ...prev, languages: e.target.value }));
                    }}
                    placeholder={formData.languages.length === 0 ? "Select languages..." : ""}
                    onFocus={(e) => {
                      const dropdown = e.target.nextElementSibling;
                      if (dropdown) dropdown.style.display = 'block';
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        const dropdown = e.target.nextElementSibling;
                        if (dropdown) dropdown.style.display = 'none';
                      }, 200);
                    }}
                    className="flex-1 border-0 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none min-w-[100px]"
                  />
                  <div
                    className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
                    style={{ display: 'none' }}
                  >
                    {filterOptions.languages
                      .filter(language => !formData.languages.includes(language.name))
                      .filter(language => !searchTerms.languages || language.name.toLowerCase().includes(searchTerms.languages.toLowerCase()))
                      .map(language => (
                        <div
                          key={language.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              languages: [...prev.languages, language.name]
                            }));
                            setSearchTerms(prev => ({ ...prev, languages: '' }));
                          }}
                          className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          {language.name}
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      const dropdown = e.target.previousElementSibling;
                      if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Developers, Publishers, Regions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Developers
              </label>
              <div className="relative">
                <div className="w-full min-h-[40px] border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 flex flex-wrap items-center gap-1">
                  {formData.developers.map((developer, index) => (
                    <span
                      key={`developer-${developer}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-purple-200"
                    >
                      {developer}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            developers: prev.developers.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchTerms.developers || ''}
                    onChange={(e) => {
                      setSearchTerms(prev => ({ ...prev, developers: e.target.value }));
                    }}
                    placeholder={formData.developers.length === 0 ? "Select developers..." : ""}
                    onFocus={(e) => {
                      const dropdown = e.target.nextElementSibling;
                      if (dropdown) dropdown.style.display = 'block';
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        const dropdown = e.target.nextElementSibling;
                        if (dropdown) dropdown.style.display = 'none';
                      }, 200);
                    }}
                    className="flex-1 border-0 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none min-w-[100px]"
                  />
                  <div
                    className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
                    style={{ display: 'none' }}
                  >
                    {filterOptions.developers
                      .filter(developer => !formData.developers.includes(developer.name))
                      .filter(developer => !searchTerms.developers || developer.name.toLowerCase().includes(searchTerms.developers.toLowerCase()))
                      .map(developer => (
                        <div
                          key={developer.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              developers: [...prev.developers, developer.name]
                            }));
                            setSearchTerms(prev => ({ ...prev, developers: '' }));
                          }}
                          className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          {developer.name}
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      const dropdown = e.target.previousElementSibling;
                      if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publishers
              </label>
              <div className="relative">
                <div className="w-full min-h-[40px] border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 flex flex-wrap items-center gap-1">
                  {formData.publishers.map((publisher, index) => (
                    <span
                      key={`publisher-${publisher}-${index}`}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-100 text-orange-800 dark:bg-orange-600 dark:text-orange-200"
                    >
                      {publisher}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            publishers: prev.publishers.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-1 text-orange-600 hover:text-orange-800 dark:text-orange-300 dark:hover:text-orange-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchTerms.publishers || ''}
                    onChange={(e) => {
                      setSearchTerms(prev => ({ ...prev, publishers: e.target.value }));
                    }}
                    placeholder={formData.publishers.length === 0 ? "Select publishers..." : ""}
                    onFocus={(e) => {
                      const dropdown = e.target.nextElementSibling;
                      if (dropdown) dropdown.style.display = 'block';
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        const dropdown = e.target.nextElementSibling;
                        if (dropdown) dropdown.style.display = 'none';
                      }, 200);
                    }}
                    className="flex-1 border-0 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none min-w-[100px]"
                  />
                  <div
                    className="absolute top-full left-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto"
                    style={{ display: 'none' }}
                  >
                    {filterOptions.publishers
                      .filter(publisher => !formData.publishers.includes(publisher.name))
                      .filter(publisher => !searchTerms.publishers || publisher.name.toLowerCase().includes(searchTerms.publishers.toLowerCase()))
                      .map(publisher => (
                        <div
                          key={publisher.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              publishers: [...prev.publishers, publisher.name]
                            }));
                            setSearchTerms(prev => ({ ...prev, publishers: '' }));
                          }}
                          className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          {publisher.name}
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      const dropdown = e.target.previousElementSibling;
                      if (dropdown) {
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Region
              </label>
              <select
                name="region"
                value={formData.selected_regions && formData.selected_regions.length > 0 ? String(formData.selected_regions[0]) : ''}
                onChange={(e) => {
                  const regionId = e.target.value;
                  const regionName = regionId ? filterOptions.regions.find(r => r.id === parseInt(regionId))?.name || '' : '';
                  setFormData(prev => ({
                    ...prev,
                    selected_regions: regionId ? [parseInt(regionId)] : [],
                    regions: regionId ? [parseInt(regionId)] : [] // API expects region IDs, not names
                  }));
                }}
                className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Region</option>
                {filterOptions.regions && filterOptions.regions.map((region, index) => (
                  <option key={`region-${region.id}-${index}`} value={String(region.id)}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div></div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
          <button
            type="button"
            onClick={refreshCKEditor}
            className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
          >
            Refresh CKEditor
          </button>
        </div>
        <div className="px-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter detailed product description..."
            />
          </div>
        </div>
      </div>



      {/* Activation Details Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activation Details</h3>
        </div>
        <div className="px-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activation Instructions
            </label>
            <textarea
              id="activation_details"
              name="activation_details"
              value={formData.activation_details}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter activation instructions, system requirements, or redemption details..."
            />
          </div>
        </div>
      </div>

      {/* Image Cover URL Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Image Cover URL</h3>
            {formData.cover_url && (
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, cover_url: '' }));
                  showPopup('success', 'Cover Image Cleared', 'Cover image has been removed.');
                }}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Clear Cover Image
              </button>
            )}
          </div>
        </div>
        <div className="px-6 py-4">
          {/* Drag and Drop Area */}
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors"
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                Drag photos here or{' '}
                <label className="text-blue-500 hover:text-blue-600 cursor-pointer underline">
                  load from disk
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
            </div>
          </div>

          {/* Product Cover Section */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PRODUCT COVER
            </div>
            
            <div className="w-48">
              <div className="relative">
                <div className="aspect-square border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-blue-400 transition-colors">
                  {formData.cover_url ? (
                    <>
                      <img
                        src={formData.cover_url}
                        alt="Product cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-game.svg';
                        }}
                      />
                      {/* Cover Controls */}
                      <div className="absolute top-1 right-1">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => window.open(formData.cover_url, '_blank')}
                            className="w-6 h-6 bg-gray-800 bg-opacity-70 text-white rounded text-xs hover:bg-opacity-90"
                            title="Preview"
                          >
                            👁
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, cover_url: '' }))}
                            className="w-6 h-6 bg-red-600 bg-opacity-70 text-white rounded text-xs hover:bg-opacity-90"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600">
                      <div className="text-xs text-center">
                        <div className="mb-1">📁</div>
                        <div>Upload Cover</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCoverImageSelect(e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  Main Cover Image
                  {formData.cover_url && (
                    <div className={`font-medium ${formData.cover_url.length > 50000 ? 'text-red-500' : 'text-green-600'}`}>
                      Size: {Math.round(formData.cover_url.length / 1024)}KB
                      {formData.cover_url.length > 50000 && ' (Too Large for Database!)'}
                      {formData.cover_url.length <= 50000 && ' (Database Safe)'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Screenshot Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Image Screenshot</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Screenshots import automatically from Kinguin API
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          {/* Screenshot Images Section */}
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SCREENSHOT IMAGES
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="relative">
                  <div className="aspect-video border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-blue-400 transition-colors">
                    {formData.screenshots && formData.screenshots[index] ? (
                      <>
                        <img
                          src={formData.screenshots[index]}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.warn(`Screenshot ${index + 1} failed to load:`, formData.screenshots[index]);
                            // Replace broken image with placeholder
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                          onLoad={(e) => {
                            e.target.style.display = 'block';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'none';
                            }
                          }}
                        />
                        {/* Fallback placeholder for broken images */}
                        <div 
                          className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-600"
                          style={{ display: 'none' }}
                        >
                          <div className="text-xs text-center">
                            <div className="mb-1">❌</div>
                            <div>Image Failed</div>
                          </div>
                        </div>
                        {/* Screenshot Controls */}
                        <div className="absolute top-1 right-1">
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => window.open(formData.screenshots[index], '_blank')}
                              className="w-6 h-6 bg-gray-800 bg-opacity-70 text-white rounded text-xs hover:bg-opacity-90"
                              title="Preview"
                            >
                              👁
                            </button>
                            <button
                              type="button"
                              onClick={() => removeScreenshot(index)}
                              className="w-6 h-6 bg-red-600 bg-opacity-70 text-white rounded text-xs hover:bg-opacity-90"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600">
                        <div className="text-xs text-center">
                          <div className="mb-1">🖼</div>
                          <div>Add Screenshot</div>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleScreenshotSelect(e, index)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                    Screenshot {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Requirements</h3>
        </div>
        <div className="px-6 py-4 space-y-6">
          {(formData.system_requirements || []).map((systemReq, systemIndex) => (
            <div key={systemReq.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              {/* System Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                  {systemReq.name}
                </h4>
                {(formData.system_requirements || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSystemRequirement(systemReq.id)}
                    className="w-6 h-6 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    title="Remove System"
                  >
                    🗑
                  </button>
                )}
              </div>

              {/* Requirements Grid */}
              <div className="space-y-3">
                {(systemReq.requirements || []).map((requirement, reqIndex) => (
                  <div key={reqIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                    {/* Requirement Type */}
                    <div className="relative">
                      <input
                        type="text"
                        value={requirement.type}
                        onChange={(e) => updateRequirement(systemReq.id, reqIndex, 'type', e.target.value)}
                        placeholder="Requirement Type"
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    {/* Requirement Value with Delete Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={requirement.value}
                        onChange={(e) => updateRequirement(systemReq.id, reqIndex, 'value', e.target.value)}
                        placeholder="Requirement Value"
                        className="flex-1 h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirementRow(systemReq.id, reqIndex)}
                        className="w-10 h-10 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                        title="Remove Requirement"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Requirement Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => addRequirementRow(systemReq.id)}
                  className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  + Add Requirement
                </button>
              </div>
            </div>
          ))}

          {/* Add System Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={addSystemRequirement}
              className="px-6 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Add System
            </button>
          </div>
        </div>
      </div>

      {/* SEO Settings Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mt-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSeoSectionOpen(!seoSectionOpen)}
              className="flex items-center text-left"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">SEO Settings</h3>
              <span className="text-gray-500 ml-2">
                {seoSectionOpen ? '−' : '+'}
              </span>
            </button>
            <button
              type="button"
              onClick={generateAllSEO}
              className="px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              title="Auto-generate all SEO fields from product data"
            >
              Generate All
            </button>
          </div>
        </div>
        
        {seoSectionOpen && (
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                  placeholder={formData.name || "Enter SEO title"}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength="60"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.meta_title.length}/60 characters
                </div>
              </div>

              {/* Meta Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({...formData, meta_keywords: e.target.value})}
                  placeholder="gaming, action, adventure"
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Comma-separated keywords
                </div>
              </div>

              {/* Slug / URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug / URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="product-name"
                    className="flex-1 h-10 border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, slug: generateSlug(formData.name)})}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 text-xs"
                    title="Auto-generate from name"
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Meta Description */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                  placeholder={formData.description ? formData.description.substring(0, 160) : "Enter meta description"}
                  rows="3"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength="160"
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.meta_description.length}/160 characters
                </div>
              </div>

              {/* OG Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OG Title <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.og_title}
                  onChange={(e) => setFormData({...formData, og_title: e.target.value})}
                  placeholder={formData.meta_title || formData.name || "Social media title"}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* OG Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OG Image URL <span className="text-gray-500">(optional)</span>
                </label>
                <div className="space-y-2">
                  {/* Current OG Image Preview */}
                  {(formData.og_image_url || (formData.images && formData.images[0])) && (
                    <div className="relative w-20 h-20 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <img
                        src={formData.og_image_url || formData.images[0]}
                        alt="OG Image Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-game.svg';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, og_image_url: ''})}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        title="Clear OG Image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  {/* Input and Upload Options */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.og_image_url}
                      onChange={(e) => setFormData({...formData, og_image_url: e.target.value})}
                      placeholder={formData.images && formData.images[0] ? "Using main image" : "https://example.com/image.jpg"}
                      className="flex-1 h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const base64 = await convertToBase64(e.target.files[0]);
                          setFormData({...formData, og_image_url: base64});
                        }
                      }}
                      className="hidden"
                      id="og-image-upload"
                    />
                    <label
                      htmlFor="og-image-upload"
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 text-xs cursor-pointer"
                      title="Upload OG image"
                    >
                      Upload
                    </label>
                    {formData.images && formData.images[0] && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, og_image_url: formData.images[0]})}
                        className="px-3 py-2 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600"
                        title="Use main image"
                      >
                        Use Main
                      </button>
                    )}
                  </div>
                </div>
              </div>



              {/* OG Description */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OG Description <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={formData.og_description}
                  onChange={(e) => setFormData({...formData, og_description: e.target.value})}
                  placeholder={formData.meta_description || formData.description || "Social media description"}
                  rows="2"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={fetchRealData}
            disabled={fetchingData || loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchingData ? 'Fetching Real Data...' : 'Fetch Real Data'}
          </button>
          
          {/* Reload Kinguin Data button - only for Kinguin products in edit mode */}
          {mode === 'edit' && formData.kinguinid && String(formData.kinguinid).trim() !== '' && (
            <button
              type="button"
              onClick={reloadKinguinData}
              disabled={fetchingData || loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchingData ? 'Reloading Kinguin Data...' : '⚡ Reload Kinguin Data'}
            </button>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/all-products')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || fetchingData}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>

      {/* Modern Popup Component */}
      <ModernPopup
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={closePopup}
      />
    </form>
    </div>
  );
}