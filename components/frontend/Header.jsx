import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, User, Search, Settings, X, Menu, ChevronDown, Gamepad2, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useCartWishlist } from '../../hooks/useCartWishlist';
import { useWishlist } from '../../hooks/useWishlist';
import { useSearch } from '../../hooks/useSearch';
import { useCategories } from '../../hooks/useAppPreloader';
import { useAuth } from '../../hooks/useAuth';
import { handleApiSuccess, handleApiError } from '../../lib/errorHandler';
import SearchDropdown from './SearchDropdown';
import DropdownMenu from './dropdown/DropdownMenu';
import UserDropdown from './UserDropdown';
import SettingsModal from '../SettingsModal';

// CategoryDropdownItem component for the dropdown menu
function CategoryDropdownItem({ category, isTablet = false }) {
  if (!category) return null;
  
  return (
    <div>
      <Link href={category.link || `/category/${category.slug}`}>
        <div className={`px-5 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700 flex items-center space-x-3 ${isTablet ? 'text-xs' : 'text-sm'}`}>
          {category.icon && category.icon.startsWith('data:') && (
            <img src={category.icon} alt="" className="w-4 h-4 object-cover rounded" />
          )}
          <span className="font-medium">{category.name}</span>
          {category.product_count > 0 && (
            <span className="text-gray-500 text-xs ml-auto">({category.product_count})</span>
          )}
        </div>
      </Link>
      {category.children && category.children.map((subCategory) => (
        <Link key={subCategory.id} href={subCategory.link || `/category/${subCategory.slug}`}>
          <div className={`px-8 py-1.5 hover:bg-gray-50 cursor-pointer text-gray-600 ${isTablet ? 'text-xs' : 'text-sm'}`}>
            {subCategory.name}
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Header({ cartCount = 0 }) {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoriesSidebar, setShowCategoriesSidebar] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('store');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [headerMenuPages, setHeaderMenuPages] = useState([]);
  
  // Scroll-based visibility states
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const floatingDropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  // Horizontal scroll states
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Hooks
  const { cartCount: cartItemCount } = useCartWishlist();
  const { wishlistCount } = useWishlist();
  const {
    searchTerm: searchQuery,
    searchResults,
    searchHistory,
    isSearching,
    showDropdown: isSearchDropdownVisible,
    error: searchError,
    handleSearchChange: onSearchChange,
    handleSearchSubmit,
    handleResultSelect,
    handleHistorySelect,
    showSearchDropdown: openSearchDropdown,
    hideSearchDropdown: closeSearchDropdown,
    clearSearch
  } = useSearch();
  const { categories, loading } = useCategories();
  const { user, isAuthenticated, logout } = useAuth();

  // Check if scroll buttons are needed
  const checkScrollNeeded = () => {
    if (scrollContainerRef.current && typeof window !== 'undefined') {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      const scrollWidth = container.scrollWidth;
      const scrollLeft = container.scrollLeft;
      const windowWidth = window.innerWidth;
      
      // Show buttons if content overflows AND screen is above 768px (tablet+)
      // Hide on mobile (below 768px) for native touch scrolling
      const isAboveTablet = windowWidth >= 768;
      const hasOverflow = scrollWidth > containerWidth + 5; // Add 5px buffer for edge cases
      
      // Debug logging
      console.log('Scroll Check:', {
        windowWidth,
        isAboveTablet,
        containerWidth,
        scrollWidth,
        hasOverflow,
        shouldShow: isAboveTablet && hasOverflow
      });
      
      setShowScrollButtons(isAboveTablet && hasOverflow);
      
      // Check scroll positions
      setCanScrollLeft(scrollLeft > 5); // Add small buffer
      setCanScrollRight(scrollLeft < scrollWidth - containerWidth - 5); // Add small buffer
    }
  };

  // Horizontal scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  // Monitor scroll changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => checkScrollNeeded();
      container.addEventListener('scroll', handleScroll);
      
      // Initial check with delay to ensure DOM is ready
      setTimeout(() => checkScrollNeeded(), 100);
      
      // ResizeObserver for dynamic content changes
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => checkScrollNeeded(), 50);
      });
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
      };
    }
  }, [headerMenuPages]);

  // Initial check when component mounts and when window resizes
  useEffect(() => {
    const handleWindowResize = () => {
      setTimeout(() => checkScrollNeeded(), 100);
    };
    
    // Initial check
    setTimeout(() => checkScrollNeeded(), 200);
    
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  // Scroll-based header visibility logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;
      
      // Determine if we're on desktop (lg breakpoint is 1024px+)
      const currentIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(currentIsDesktop);
      
      // Only apply scroll logic if we've scrolled more than 10px to avoid jitter
      if (Math.abs(scrollDifference) > 10) {
        if (currentIsDesktop) {
          // Desktop: Hide/show navigation bar based on scroll direction
          if (scrollDifference > 0) {
            // Scrolling down - hide nav bar
            setIsNavBarVisible(false);
          } else {
            // Scrolling up - show nav bar
            setIsNavBarVisible(true);
          }
        } else {
          // Mobile/Tablet: Hide/show search bar based on scroll direction
          if (scrollDifference > 0) {
            // Scrolling down - hide search bar
            setIsSearchBarVisible(false);
          } else {
            // Scrolling up - show search bar
            setIsSearchBarVisible(true);
          }
        }
        setLastScrollY(currentScrollY);
      }
    };

    const handleResize = () => {
      const currentIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(currentIsDesktop);
      // Reset visibility when switching between mobile/desktop
      setIsNavBarVisible(true);
      setIsSearchBarVisible(true);
      // Check scroll on resize - important for scroll button visibility
      setTimeout(() => checkScrollNeeded(), 100);
    };

    // Initial setup
    if (typeof window !== 'undefined') {
      setIsDesktop(window.innerWidth >= 1024);
      setLastScrollY(window.scrollY);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [lastScrollY]);

  // Fetch header menu pages
  useEffect(() => {
    const fetchHeaderMenuPages = async () => {
      try {
        const response = await fetch('/api/special-pages/header-menu');
        if (response.ok) {
          const data = await response.json();
          setHeaderMenuPages(data.pages || []);
        }
      } catch (error) {
        console.error('Error fetching header menu pages:', error);
      }
    };

    fetchHeaderMenuPages();
  }, []);

  // Menu item styling
  const getMenuItemStyle = (menuItem) => {
    const isActive = activeMenuItem === menuItem;
    return {
      background: isActive 
        ? 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
        : 'transparent'
    };
  };

  const handleMenuItemHover = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  // Categories sidebar handlers
  const openCategoriesSidebar = () => {
    setShowCategoriesSidebar(true);
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  };

  const closeCategoriesSidebar = () => {
    setShowCategoriesSidebar(false);
    setExpandedCategories(new Set()); // Reset expanded categories
    document.body.style.overflow = 'unset'; // Restore body scroll
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = (categoryId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle logout with proper notification
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      handleApiSuccess('You have been logged out successfully.');
    } else {
      handleApiError(new Error(result.error));
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onSearchChange(value);
    if (typeof value === 'string' && value.length >= 1) {
      openSearchDropdown();
    } else {
      closeSearchDropdown();
    }
  };

  // Search dropdown click outside handler
  const handleSearchClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target) && 
        inputRef.current && !inputRef.current.contains(event.target)) {
      closeSearchDropdown();
      setShowDropdown(false);
    }
  };



  useEffect(() => {
    if (isSearchDropdownVisible) {
      document.addEventListener('mousedown', handleSearchClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleSearchClickOutside);
      };
    }
  }, [isSearchDropdownVisible]);



  // Cleanup body scroll when component unmounts or sidebar closes
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!showCategoriesSidebar) {
      document.body.style.overflow = 'unset';
    }
  }, [showCategoriesSidebar]);

  return (
    <>
      {/* Unified Header Container */}
      <header 
        className="text-white z-[99999] fixed top-0 left-0 right-0 border-b border-white/10"
        style={{ backgroundColor: '#153e8f' }}
      >
        {/* Desktop Layout - Large screens (1024px+) */}
        <div className="hidden lg:block">
          {/* Top Header Section */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-[1400px] mx-auto px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/">
                  <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-xl font-bold">Gameva</span>
                  </div>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-12">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSearchSubmit(searchTerm);
                  }} className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={openSearchDropdown}
                      placeholder="Search for games, software, gift cards..."
                      className="w-full px-6 py-3 text-white bg-white/10 border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-white/50 pr-12 placeholder-white/70"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                      style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
                    >
                      <Search className="h-5 w-5" />
                    </button>

                    {/* Search Dropdown */}
                    {(showDropdown || isSearchDropdownVisible) && (
                      <div ref={searchRef}>
                        <SearchDropdown
                          searchResults={searchResults}
                          searchHistory={searchHistory}
                          isSearching={isSearching}
                          error={searchError}
                          searchTerm={searchTerm}
                          onResultSelect={handleResultSelect}
                          onHistorySelect={handleHistorySelect}
                          onClose={closeSearchDropdown}
                        />
                      </div>
                    )}
                  </form>
                </div>

                {/* Right Icons */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button 
                      onClick={() => setShowSettingsModal(true)}
                      className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    {isAuthenticated ? (
                      <UserDropdown user={user} logout={handleLogout} />
                    ) : (
                      <Link href="/auth/login" prefetch={true}>
                        <div className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all">
                          <User className="h-5 w-5" />
                        </div>
                      </Link>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Link href="/wishlist">
                      <div className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all">
                        <Heart className="h-5 w-5" />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                            {wishlistCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                  
                  <div className="relative">
                    <Link href="/cart">
                      <div 
                        className="p-2 rounded-full border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                        style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {cartItemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                            {cartItemCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Menu Navigation - Integrated within header */}
          <div 
            className={`text-white border-t border-white/10 transition-all duration-300 ${
              isNavBarVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0 h-0 overflow-hidden'
            }`} 
            style={{ backgroundColor: '#ffffff1a' }}
          >
            <div className="w-full flex justify-center bg-[#2c519b]">
              <div className="w-full max-w-[1400px] mx-auto px-8 py-3">
                <div className="flex items-center">
                  {/* Fixed Items - Categories and All Offers */}
                  <div className="flex items-center space-x-8 flex-none">
                    {/* Categories Button - Fixed */}
                    <div className="relative">
                      <div 
                        className="cursor-pointer hover:text-white/80 transition-colors font-medium flex items-center space-x-2"
                        onClick={openCategoriesSidebar}
                      >
                        <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
                        <span>Categories</span>
                      </div>
                    </div>
                    
                    {/* All Offers - Fixed */}
                    <Link href="/category/all-products">
                      <div 
                        className="cursor-pointer transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg" 
                        style={getMenuItemStyle('store')}
                        onMouseEnter={() => handleMenuItemHover('store')}
                        onClick={() => handleMenuItemClick('store')}
                      >
                        All Offers
                      </div>
                    </Link>
                  </div>

                  {/* Scrollable Container for Other Menu Items */}
                  <div className="relative flex-1 ml-8 overflow-hidden">
                    {/* Left Scroll Button */}
                    {showScrollButtons && canScrollLeft && (
                      <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#2c519b] hover:bg-[#1e3a5f] border border-white/20 rounded-full p-2 shadow-lg transition-all duration-200"
                        style={{ backdropFilter: 'blur(4px)' }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Scrollable Content */}
                    <div
                      ref={scrollContainerRef}
                      className="overflow-x-auto py-1 md:overflow-x-hidden"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingLeft: showScrollButtons && canScrollLeft ? '3rem' : '0',
                        paddingRight: showScrollButtons && canScrollRight ? '3rem' : '0',
                        // On mobile, enable touch scrolling; on desktop, rely on buttons
                        overflowX: typeof window !== 'undefined' && window.innerWidth < 768 ? 'auto' : showScrollButtons ? 'hidden' : 'auto'
                      }}
                    >
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      <div className="flex items-center space-x-6 whitespace-nowrap">
                        {/* Dynamic Special Pages */}
                        {headerMenuPages.map((page) => (
                          <Link key={page.id} href={`/${page.slug}`}>
                            <div 
                              className="cursor-pointer transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0" 
                              style={getMenuItemStyle(`special-${page.id}`)}
                              onMouseEnter={() => handleMenuItemHover(`special-${page.id}`)}
                              onClick={() => handleMenuItemClick(`special-${page.id}`)}
                            >
                              {page.header_button_title || page.title}
                            </div>
                          </Link>
                        ))}

                        <Link href="/deals">
                          <div 
                            className="cursor-pointer transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0" 
                            style={getMenuItemStyle('deals')}
                            onMouseEnter={() => handleMenuItemHover('deals')}
                            onClick={() => handleMenuItemClick('deals')}
                          >
                            Special Deals
                          </div>
                        </Link>
                        
                        <Link href="/category/new-releases">
                          <div 
                            className="cursor-pointer transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0" 
                            style={getMenuItemStyle('new-releases')}
                            onMouseEnter={() => handleMenuItemHover('new-releases')}
                            onClick={() => handleMenuItemClick('new-releases')}
                          >
                            New Releases
                          </div>
                        </Link>
                        
                        <Link href="/category/best-sellers">
                          <div 
                            className="cursor-pointer transition-all duration-300 font-medium px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0" 
                            style={getMenuItemStyle('best-sellers')}
                            onMouseEnter={() => handleMenuItemHover('best-sellers')}
                            onClick={() => handleMenuItemClick('best-sellers')}
                          >
                            Best Sellers
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Right Scroll Button */}
                    {showScrollButtons && canScrollRight && (
                      <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#2c519b] hover:bg-[#1e3a5f] border border-white/20 rounded-full p-2 shadow-lg transition-all duration-200"
                        style={{ backdropFilter: 'blur(4px)' }}
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Layout - Medium screens (768px - 1023px) */}
        <div className={`hidden md:block lg:hidden transition-all duration-300 ${
          isSearchBarVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0 h-0 overflow-hidden'
        }`}>
          {/* Top Header Section */}
          <div className="w-full px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-lg font-bold">Gameva</span>
                </div>
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-8">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit(searchTerm);
                }} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={openSearchDropdown}
                    placeholder="Search..."
                    className="w-full px-4 py-2 text-white bg-white/10 border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-white/50 pr-10 placeholder-white/70"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                    style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
                  >
                    <Search className="h-4 w-4" />
                  </button>

                  {/* Tablet Search Dropdown */}
                  {(showDropdown || isSearchDropdownVisible) && (
                    <SearchDropdown
                      searchResults={searchResults}
                      searchHistory={searchHistory}
                      isSearching={isSearching}
                      error={searchError}
                      searchTerm={searchTerm}
                      onResultSelect={handleResultSelect}
                      onHistorySelect={handleHistorySelect}
                      onClose={closeSearchDropdown}
                    />
                  )}
                </form>
              </div>

              {/* Right Icons */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                >
                  <Settings className="h-4 w-4" />
                </button>
                
                {isAuthenticated ? (
                  <UserDropdown user={user} logout={handleLogout} />
                ) : (
                  <Link href="/auth/login" prefetch={true}>
                    <div className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all">
                      <User className="h-4 w-4" />
                    </div>
                  </Link>
                )}
                
                <Link href="/wishlist">
                  <div className="p-2 rounded-full bg-white/10 border border-white/20 cursor-pointer hover:opacity-80 transition-all">
                    <Heart className="h-4 w-4" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                </Link>
                
                <Link href="/cart">
                  <div 
                    className="p-2 rounded-full border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                    style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Tablet Main Menu Navigation - Horizontal Touch Scrollable */}
          <div 
            className="text-white border-t border-white/10" 
            style={{ backgroundColor: '#ffffff1a' }}
          >
            <div className="w-full flex justify-center bg-[#2c519b]">
              <div className="w-full max-w-[1200px] mx-auto px-6 py-2">
                {/* Touch-scrollable container for tablet screens */}
                <div className="flex items-center space-x-6 overflow-x-auto touch-scroll-container" style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                  WebkitOverflowScrolling: 'touch', /* iOS smooth scrolling */
                }}>
                  <style jsx>{`
                    .touch-scroll-container::-webkit-scrollbar {
                      display: none; /* Chrome, Safari */
                    }
                    .touch-scroll-container {
                      scroll-behavior: smooth;
                    }
                  `}</style>
                  
                  {/* Categories Button - Fixed */}
                  <div 
                    className="cursor-pointer hover:text-white/80 transition-colors font-medium text-sm flex items-center space-x-2 flex-shrink-0 whitespace-nowrap"
                    onClick={openCategoriesSidebar}
                  >
                    <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                    <span>Categories</span>
                  </div>
                  
                  {/* Store Link - Scrollable */}
                  <Link href="/category/all-products">
                    <div 
                      className="cursor-pointer transition-all duration-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0 whitespace-nowrap" 
                      style={getMenuItemStyle('store')}
                      onMouseEnter={() => handleMenuItemHover('store')}
                      onClick={() => handleMenuItemClick('store')}
                    >
                      All Offers
                    </div>
                  </Link>

                  {/* Dynamic Special Pages - Scrollable */}
                  {headerMenuPages.map((page) => (
                    <Link key={page.id} href={`/${page.slug}`}>
                      <div 
                        className="cursor-pointer transition-all duration-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0 whitespace-nowrap" 
                        style={getMenuItemStyle(`special-${page.id}`)}
                        onMouseEnter={() => handleMenuItemHover(`special-${page.id}`)}
                        onClick={() => handleMenuItemClick(`special-${page.id}`)}
                      >
                        {page.header_button_title || page.title}
                      </div>
                    </Link>
                  ))}

                  <Link href="/deals">
                    <div 
                      className="cursor-pointer transition-all duration-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0 whitespace-nowrap" 
                      style={getMenuItemStyle('deals')}
                      onMouseEnter={() => handleMenuItemHover('deals')}
                      onClick={() => handleMenuItemClick('deals')}
                    >
                      Special Deals
                    </div>
                  </Link>
                  
                  <Link href="/category/new-releases">
                    <div 
                      className="cursor-pointer transition-all duration-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0 whitespace-nowrap" 
                      style={getMenuItemStyle('new-releases')}
                      onMouseEnter={() => handleMenuItemHover('new-releases')}
                      onClick={() => handleMenuItemClick('new-releases')}
                    >
                      New Releases
                    </div>
                  </Link>
                  
                  <Link href="/category/best-sellers">
                    <div 
                      className="cursor-pointer transition-all duration-300 font-medium text-sm px-3 py-1.5 rounded-lg hover:text-white hover:shadow-lg flex-shrink-0 whitespace-nowrap" 
                      style={getMenuItemStyle('best-sellers')}
                      onMouseEnter={() => handleMenuItemHover('best-sellers')}
                      onClick={() => handleMenuItemClick('best-sellers')}
                    >
                      Best Sellers
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout - Small screens (0-767px) */}
        <div className={`md:hidden transition-all duration-300 ${
          isSearchBarVisible ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0 h-0 overflow-hidden'
        }`}>
          {/* Top Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Icons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={openCategoriesSidebar}
                className="p-2 rounded-full bg-white/10 border border-white/20 hover:opacity-80 transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {isAuthenticated ? (
                <UserDropdown user={user} logout={handleLogout} />
              ) : (
                <Link href="/auth/login" prefetch={true}>
                  <div className="p-2 rounded-full bg-white/10 border border-white/20 hover:opacity-80 transition-all">
                    <User className="h-5 w-5" />
                  </div>
                </Link>
              )}
            </div>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-lg font-bold">Gameva</span>
              </div>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center space-x-2">
              <Link href="/wishlist">
                <div className="p-2 rounded-full bg-white/10 border border-white/20 hover:opacity-80 transition-all relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
              
              <Link href="/cart">
                <div 
                  className="p-2 rounded-full transition-colors relative"
                  style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search Section */}
          <div className="px-4 pb-3">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSearchSubmit(searchTerm);
            }} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={openSearchDropdown}
                placeholder="Search for games, software, gift cards..."
                className="w-full px-4 py-3 text-white bg-white/10 border border-white/30 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-white/50 pr-12 placeholder-white/70"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full border border-white/20 cursor-pointer hover:opacity-80 transition-all"
                style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Mobile Search Dropdown */}
              {(showDropdown || isSearchDropdownVisible) && (
                <SearchDropdown
                  searchResults={searchResults}
                  searchHistory={searchHistory}
                  isSearching={isSearching}
                  error={searchError}
                  searchTerm={searchTerm}
                  onResultSelect={handleResultSelect}
                  onHistorySelect={handleHistorySelect}
                  onClose={closeSearchDropdown}
                />
              )}
            </form>
          </div>
        </div>
      </header>





      {/* Left-sliding Categories Sidebar */}
      {showCategoriesSidebar && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999]"
            onClick={closeCategoriesSidebar}
          />
          
          {/* Sidebar */}
          <div 
            className="fixed top-0 left-0 h-full w-80 bg-[#153e8f] z-[9999999] transform transition-transform duration-300 ease-in-out shadow-2xl"
            style={{
              transform: showCategoriesSidebar ? 'translateX(0)' : 'translateX(-100%)'
            }}
          >
            {/* Header */}
            <div className="bg-[#1a4aa3] px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-white">Gameva</h2>
              </div>
              <button 
                onClick={closeCategoriesSidebar}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Categories List */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-6">
                {/* All Offers */}
                <Link href="/category/all-products">
                  <div 
                    className="flex items-center justify-between py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={closeCategoriesSidebar}
                  >
                    <span className="text-lg font-medium">All Offers</span>
                  </div>
                </Link>
                

                
                {/* Categories from database */}
                {Array.isArray(categories) && categories.map((category) => (
                  <div key={category.id}>
                    {/* Main Category */}
                    <div className="flex items-center">
                      <Link href={category.link || `/category/${category.slug}`} className="flex-1">
                        <div 
                          className="flex items-center justify-between py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer group"
                          onClick={closeCategoriesSidebar}
                        >
                          <span className="text-lg font-medium">{category.name}</span>
                        </div>
                      </Link>
                      
                      {/* Dropdown Arrow - Only for categories with children */}
                      {category.children && category.children.length > 0 && (
                        <button
                          onClick={(e) => toggleCategoryDropdown(category.id, e)}
                          className="p-2 text-white/60 hover:text-white transition-colors"
                        >
                          <svg 
                            className={`w-5 h-5 transition-transform duration-200 ${expandedCategories.has(category.id) ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Subcategories - Show only when expanded */}
                    {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
                      <div className="ml-4 border-l border-white/20">
                        {category.children.map((subcategory) => (
                          <Link key={subcategory.id} href={subcategory.link || `/category/${subcategory.slug}`}>
                            <div 
                              className="flex items-center justify-between py-2 px-4 text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer ml-2"
                              onClick={closeCategoriesSidebar}
                            >
                              <span className="text-base font-normal">{subcategory.name}</span>
                              {subcategory.product_count > 0 && (
                                <span className="text-xs text-white/50">
                                  ({subcategory.product_count})
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Additional menu items */}
                <Link href="/category/gift-cards">
                  <div 
                    className="flex items-center justify-between py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={closeCategoriesSidebar}
                  >
                    <span className="text-lg font-medium">eGift Cards</span>
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
                
                <Link href="/category/mobile-recharges">
                  <div 
                    className="flex items-center justify-between py-3 px-4 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={closeCategoriesSidebar}
                  >
                    <span className="text-lg font-medium">Mobile recharges</span>
                  </div>
                </Link>
                

              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </>
  );
}