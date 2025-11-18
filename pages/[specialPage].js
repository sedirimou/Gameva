import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/frontend/ProductCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, faTimes, faDesktop, faServer, faLaptop, faCode, faGift, faGamepad, faTrophy, 
  faStar, faHeart, faShield, faCog, faHome, faUser, faEnvelope, faPhone, faMapMarker,
  faCalendar, faClock, faSearch, faShoppingCart, faDownload, faPlay, faPause, faStop,
  faVolume, faMusic, faCamera, faImage, faVideo, faFile, faFolder, faEdit, faTrash,
  faSave, faPrint, faShare, faLink, faLock, faUnlock, faEye, faEyeSlash, faComment,
  faThumbsUp, faThumbsDown, faBookmark, faTag, faFlag, faBell, faQuestion, faInfo,
  faWarning, faExclamation, faCheck, faPlus, faMinus, faArrowUp,
  faArrowDown, faArrowLeft, faArrowRight, faChevronUp, faChevronDown, faChevronLeft,
  faChevronRight, faBars, faEllipsis, faGripVertical, faGripHorizontal, faExpand,
  faCompress, faMaximize, faMinimize, faRefresh, faSpinner, faCircle, faSquare,
  faDatabase, faCloud, faWifi, faBluetooth, faMobile, faTablet, faLaptopCode,
  faHeadphones, faMicrophone, faKeyboard, faMouse, faCalculator, faClipboard,
  faHourglass, faSun, faMoon, faSnowflake, faUmbrella, faRain
} from '@fortawesome/free-solid-svg-icons';
import { 
  faMicrosoft, faWindows, faApple, faLinux, faPlaystation, faXbox, faSteam, faGoogle, 
  faAndroid, faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube, faTiktok,
  faSnapchat, faDiscord, faSlack, faSkype, faWhatsapp, faTelegram, faViber,
  faSpotify, faAmazon, faEbay, faPaypal, faStripe, faBitcoin,
  faEthereum, faGithub, faGitlab, faBitbucket, faStackOverflow, faReddit, faPinterest,
  faTumblr, faMedium, faBehance, faDribbble, faCodepen, faFigma, faSketch, faAdobe,
  faFirefox, faChrome, faSafari, faEdge, faOpera,
  faDropbox, faWordpress, faDrupal, faJoomla, faMagento, faShopify,
  faAngular, faReact, faVue, faNodeJs, faPython, faJava, faPhp, faLaravel,
  faSymfony, faRuby, faGo, faRust, faSwift, faKotlin, faDart, faFlutter,
  faUnity, faBlender, faTrello, faAsana, faNotion
} from '@fortawesome/free-brands-svg-icons';

export default function DynamicSpecialPage() {
  const router = useRouter();
  const { specialPage } = router.query;
  
  const [pageData, setPageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState('');

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [backgroundIcons, setBackgroundIcons] = useState([]);
  const [pageHeight, setPageHeight] = useState(0);

  // Dynamic height calculation and icon redistribution
  const updatePageHeight = () => {
    if (typeof window === 'undefined') return;
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    setPageHeight(height);
  };

  // Generate background icons based on placement pattern using admin-configured icons
  const generateBackgroundIcons = (currentPageHeight = null) => {
    if (!pageData) return [];

    // Get icon list from admin settings
    let adminIcons = [];
    if (pageData?.icon_list) {
      if (Array.isArray(pageData.icon_list)) {
        adminIcons = pageData.icon_list;
      } else if (typeof pageData.icon_list === 'string') {
        try {
          adminIcons = JSON.parse(pageData.icon_list);
        } catch (error) {
          // If JSON parsing fails, try splitting as comma-separated string
          adminIcons = pageData.icon_list.split(',').map(icon => icon.trim()).filter(icon => icon.length > 0);
        }
      }
    }
    
    // Fallback to default icons if no admin icons configured
    const defaultIcons = ['fa-solid fa-desktop', 'fa-brands fa-windows', 'fa-brands fa-apple'];
    const iconList = adminIcons.length > 0 ? adminIcons : defaultIcons;
    
    // Create comprehensive FontAwesome icon objects mapping
    const iconMapping = {
      // Solid Icons
      'fa-solid fa-desktop': faDesktop,
      'fa-solid fa-server': faServer,
      'fa-solid fa-laptop': faLaptop,
      'fa-solid fa-code': faCode,
      'fa-solid fa-gift': faGift,
      'fa-solid fa-gamepad': faGamepad,
      'fa-solid fa-trophy': faTrophy,
      'fa-solid fa-star': faStar,
      'fa-solid fa-heart': faHeart,
      'fa-solid fa-shield': faShield,
      'fa-solid fa-cog': faCog,
      'fa-solid fa-home': faHome,
      'fa-solid fa-user': faUser,
      'fa-solid fa-envelope': faEnvelope,
      'fa-solid fa-phone': faPhone,
      'fa-solid fa-calendar': faCalendar,
      'fa-solid fa-clock': faClock,
      'fa-solid fa-search': faSearch,
      'fa-solid fa-shopping-cart': faShoppingCart,
      'fa-solid fa-download': faDownload,
      'fa-solid fa-play': faPlay,
      'fa-solid fa-pause': faPause,
      'fa-solid fa-stop': faStop,
      'fa-solid fa-volume': faVolume,
      'fa-solid fa-music': faMusic,
      'fa-solid fa-camera': faCamera,
      'fa-solid fa-image': faImage,
      'fa-solid fa-video': faVideo,
      'fa-solid fa-file': faFile,
      'fa-solid fa-folder': faFolder,
      'fa-solid fa-edit': faEdit,
      'fa-solid fa-trash': faTrash,
      'fa-solid fa-save': faSave,
      'fa-solid fa-print': faPrint,
      'fa-solid fa-share': faShare,
      'fa-solid fa-link': faLink,
      'fa-solid fa-lock': faLock,
      'fa-solid fa-unlock': faUnlock,
      'fa-solid fa-eye': faEye,
      'fa-solid fa-eye-slash': faEyeSlash,
      'fa-solid fa-comment': faComment,
      'fa-solid fa-thumbs-up': faThumbsUp,
      'fa-solid fa-thumbs-down': faThumbsDown,
      'fa-solid fa-bookmark': faBookmark,
      'fa-solid fa-tag': faTag,
      'fa-solid fa-flag': faFlag,
      'fa-solid fa-bell': faBell,
      'fa-solid fa-question': faQuestion,
      'fa-solid fa-info': faInfo,
      'fa-solid fa-warning': faWarning,
      'fa-solid fa-exclamation': faExclamation,
      'fa-solid fa-check': faCheck,
      'fa-solid fa-plus': faPlus,
      'fa-solid fa-minus': faMinus,
      'fa-solid fa-arrow-up': faArrowUp,
      'fa-solid fa-arrow-down': faArrowDown,
      'fa-solid fa-arrow-left': faArrowLeft,
      'fa-solid fa-arrow-right': faArrowRight,
      'fa-solid fa-chevron-up': faChevronUp,
      'fa-solid fa-chevron-down': faChevronDown,
      'fa-solid fa-chevron-left': faChevronLeft,
      'fa-solid fa-chevron-right': faChevronRight,
      'fa-solid fa-bars': faBars,
      'fa-solid fa-ellipsis': faEllipsis,
      'fa-solid fa-grip-vertical': faGripVertical,
      'fa-solid fa-grip-horizontal': faGripHorizontal,
      'fa-solid fa-expand': faExpand,
      'fa-solid fa-compress': faCompress,
      'fa-solid fa-maximize': faMaximize,
      'fa-solid fa-minimize': faMinimize,
      'fa-solid fa-refresh': faRefresh,
      'fa-solid fa-spinner': faSpinner,
      'fa-solid fa-circle': faCircle,
      'fa-solid fa-square': faSquare,
      'fa-solid fa-database': faDatabase,
      'fa-solid fa-cloud': faCloud,
      'fa-solid fa-wifi': faWifi,
      'fa-solid fa-bluetooth': faBluetooth,
      'fa-solid fa-mobile': faMobile,
      'fa-solid fa-tablet': faTablet,
      'fa-solid fa-laptop-code': faLaptopCode,
      'fa-solid fa-headphones': faHeadphones,
      'fa-solid fa-microphone': faMicrophone,
      'fa-solid fa-keyboard': faKeyboard,
      'fa-solid fa-mouse': faMouse,
      'fa-solid fa-calculator': faCalculator,
      'fa-solid fa-clipboard': faClipboard,
      'fa-solid fa-hourglass': faHourglass,
      'fa-solid fa-sun': faSun,
      'fa-solid fa-moon': faMoon,
      'fa-solid fa-snowflake': faSnowflake,
      'fa-solid fa-umbrella': faUmbrella,
      'fa-solid fa-rain': faRain,
      
      // Brand Icons
      'fa-brands fa-windows': faWindows,
      'fa-brands fa-apple': faApple,
      'fa-brands fa-linux': faLinux,
      'fa-brands fa-microsoft': faMicrosoft,
      'fa-brands fa-playstation': faPlaystation,
      'fa-brands fa-xbox': faXbox,
      'fa-brands fa-steam': faSteam,
      'fa-brands fa-google': faGoogle,
      'fa-brands fa-android': faAndroid,
      'fa-brands fa-facebook': faFacebook,
      'fa-brands fa-twitter': faTwitter,
      'fa-brands fa-instagram': faInstagram,
      'fa-brands fa-linkedin': faLinkedin,
      'fa-brands fa-youtube': faYoutube,
      'fa-brands fa-tiktok': faTiktok,
      'fa-brands fa-snapchat': faSnapchat,
      'fa-brands fa-discord': faDiscord,
      'fa-brands fa-slack': faSlack,
      'fa-brands fa-skype': faSkype,
      'fa-brands fa-whatsapp': faWhatsapp,
      'fa-brands fa-telegram': faTelegram,
      'fa-brands fa-viber': faViber,
      'fa-brands fa-spotify': faSpotify,
      'fa-brands fa-amazon': faAmazon,
      'fa-brands fa-ebay': faEbay,
      'fa-brands fa-paypal': faPaypal,
      'fa-brands fa-stripe': faStripe,
      'fa-brands fa-bitcoin': faBitcoin,
      'fa-brands fa-ethereum': faEthereum,
      'fa-brands fa-github': faGithub,
      'fa-brands fa-gitlab': faGitlab,
      'fa-brands fa-bitbucket': faBitbucket,
      'fa-brands fa-stack-overflow': faStackOverflow,
      'fa-brands fa-reddit': faReddit,
      'fa-brands fa-pinterest': faPinterest,
      'fa-brands fa-tumblr': faTumblr,
      'fa-brands fa-medium': faMedium,
      'fa-brands fa-behance': faBehance,
      'fa-brands fa-dribbble': faDribbble,
      'fa-brands fa-codepen': faCodepen,
      'fa-brands fa-figma': faFigma,
      'fa-brands fa-sketch': faSketch,
      'fa-brands fa-adobe': faAdobe,
      'fa-brands fa-firefox': faFirefox,
      'fa-brands fa-chrome': faChrome,
      'fa-brands fa-safari': faSafari,
      'fa-brands fa-edge': faEdge,
      'fa-brands fa-opera': faOpera,
      'fa-brands fa-dropbox': faDropbox,
      'fa-brands fa-wordpress': faWordpress,
      'fa-brands fa-drupal': faDrupal,
      'fa-brands fa-joomla': faJoomla,
      'fa-brands fa-magento': faMagento,
      'fa-brands fa-shopify': faShopify,
      'fa-brands fa-angular': faAngular,
      'fa-brands fa-react': faReact,
      'fa-brands fa-vue': faVue,
      'fa-brands fa-node-js': faNodeJs,
      'fa-brands fa-python': faPython,
      'fa-brands fa-java': faJava,
      'fa-brands fa-php': faPhp,
      'fa-brands fa-laravel': faLaravel,
      'fa-brands fa-symfony': faSymfony,
      'fa-brands fa-ruby': faRuby,
      'fa-brands fa-golang': faGo,
      'fa-brands fa-rust': faRust,
      'fa-brands fa-swift': faSwift,
      'fa-brands fa-kotlin': faKotlin,
      'fa-brands fa-dart': faDart,
      'fa-brands fa-flutter': faFlutter,
      'fa-brands fa-unity': faUnity,
      'fa-brands fa-blender': faBlender,
      'fa-brands fa-trello': faTrello,
      'fa-brands fa-asana': faAsana,
      'fa-brands fa-notion': faNotion,

      
      // Short format support (without fa- prefix)
      'gamepad': faGamepad,
      'trophy': faTrophy,
      'star': faStar,
      'heart': faHeart,
      'steam': faSteam,
      'windows': faWindows,
      'apple': faApple,
      'linux': faLinux,
      'desktop': faDesktop,
      'laptop': faLaptop,
      'server': faServer,
      'code': faCode,
      'gift': faGift
    };
    
    const result = [];
    const positions = [];
    
    // Get settings from database
    const iconCount = pageData?.icon_quantity || 6;
    const iconSize = pageData?.icon_size || 35;
    const iconHeight = pageData?.icon_height || 48;
    const iconOpacity = (pageData?.icon_opacity || 20) / 100;
    const iconColor = pageData?.icon_color || '#ffffff';

    // Generate positions based on placement pattern
    const placementPattern = pageData?.icon_distribution_pattern || 'random';
    
    if (placementPattern === 'grid' || placementPattern === 'random') {
      // Use grid-based placement
      const GRID_ROWS = pageData?.icon_grid_rows || 5;
      const GRID_COLUMNS = pageData?.icon_grid_columns || 5;
      const totalCells = GRID_ROWS * GRID_COLUMNS;
      
      // Calculate actual page dimensions
      const fullPageHeight = currentPageHeight || pageHeight || (typeof window !== 'undefined' ? Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      ) : 2000);
      
      const pageWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const headerOffset = 150; // Header height in pixels
      const footerOffset = 100; // Footer buffer in pixels
      const usablePageHeight = fullPageHeight - headerOffset - footerOffset;
      
      // Create array of all grid cells
      const availableCells = [];
      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLUMNS; col++) {
          availableCells.push({ row, col });
        }
      }
      
      // Shuffle cells for random selection
      const shuffledCells = availableCells.sort(() => Math.random() - 0.5);
      
      // Place icons in random cells across the full page height
      const iconsToPlace = Math.min(iconCount, totalCells);
      for (let i = 0; i < iconsToPlace; i++) {
        const cell = shuffledCells[i];
        
        // Calculate cell dimensions in pixels
        const cellWidth = (pageWidth * 0.9) / GRID_COLUMNS; // 90% of page width
        const cellHeight = usablePageHeight / GRID_ROWS; // Divide usable height into grid rows
        
        // Random position within the cell (in pixels)
        const x = (pageWidth * 0.05) + (cell.col * cellWidth) + (Math.random() * cellWidth * 0.8) + (cellWidth * 0.1);
        const y = headerOffset + (cell.row * cellHeight) + (Math.random() * cellHeight * 0.8) + (cellHeight * 0.1);
        
        // Use pixel-based absolute positioning
        positions.push({
          top: `${Math.min(y, fullPageHeight - footerOffset)}px`,
          left: `${Math.min(x, pageWidth * 0.95)}px`
        });
      }
    }
    
    // Create icon elements with positions
    for (let i = 0; i < Math.min(iconCount, positions.length); i++) {
      const iconKey = iconList[i % iconList.length];
      const iconObject = iconMapping[iconKey] || faDesktop; // Fallback icon
      const rotation = Math.random() * 30 - 15; // Random rotation between -15° and +15°
      
      result.push({
        id: i,
        size: iconSize,
        height: iconHeight,
        opacity: iconOpacity,
        color: iconColor,
        icon: iconObject,
        position: { ...positions[i], rotation }
      });
    }
    
    return result;
  };

  // Fetch page data by slug
  const fetchPageData = async () => {
    if (!specialPage) return;
    
    try {
      const response = await fetch(`/api/special-pages/by-slug/${specialPage}`);
      if (response.ok) {
        const data = await response.json();
        setPageData(data);
        return data;
      } else if (response.status === 404) {
        // If page not found, redirect to 404
        router.push('/404');
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
      router.push('/404');
    }
    return null;
  };

  // Fetch categories and subcategories for this specific page
  const fetchCategories = async (pageSlug) => {
    if (!pageSlug) return;
    
    try {
      const response = await fetch(`/api/special-pages/subcategories?slug=${pageSlug}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.allCategories || []);
          setSubcategories(data.subcategories || []);
        } else {
          setCategories([]);
          setSubcategories([]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setSubcategories([]);
    }
  };

  // Fetch products based on page categories
  const fetchProducts = async (page = 1, categoryFilter = '', append = false) => {
    if (!pageData) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      
      // Get selected categories from page data
      const selectedCategoryIds = Array.isArray(pageData.selected_categories) 
        ? pageData.selected_categories 
        : JSON.parse(pageData.selected_categories || '[]');
      
      if (categoryFilter) {
        params.set('categories', categoryFilter);
      } else if (selectedCategoryIds.length > 0) {
        params.set('categories', selectedCategoryIds.join(','));
      }

      const url = `/api/products-with-relationships?${params.toString()}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle response format from products-with-relationships API
        let products = [];
        let total = 0;
        let hasMore = false;
        
        if (data.success && data.products) {
          products = Array.isArray(data.products) ? data.products : [];
          total = data.pagination?.totalProducts || data.total || 0;
          hasMore = (page * 20) < total;
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
          total = data.total || 0;
          hasMore = (page * 20) < total;
        }
        
        if (append) {
          setProducts(prev => Array.isArray(prev) ? [...prev, ...products] : products);
        } else {
          setProducts(products);
        }
        
        setTotalProducts(total);
        setHasMore(hasMore);
        setCurrentPage(page);
      } else {
        setProducts([]);
        setTotalProducts(0);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalProducts(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle category filter changes  
  const handleFilterChange = (categoryId) => {
    setSelectedFilter(categoryId);
    setProducts([]);
    setCurrentPage(1);
  };

  // Handle load more products
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      fetchProducts(nextPage, selectedFilter, true); // true for append mode
    }
  };

  // Initialize page data and categories
  useEffect(() => {
    if (specialPage) {
      fetchPageData().then((data) => {
        if (data) {
          fetchCategories(specialPage);
        }
      });
    }
  }, [specialPage]);

  // Initialize height tracking and icon generation
  useEffect(() => {
    if (typeof window !== 'undefined' && pageData) {
      updatePageHeight();
      
      const icons = generateBackgroundIcons();
      setBackgroundIcons(icons);
    }
  }, [pageData]);

  // Monitor page height changes and redistribute icons
  useEffect(() => {
    if (typeof window === 'undefined' || !pageData) return;

    let resizeTimeout;
    
    // Create ResizeObserver to monitor page content changes
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updatePageHeight();
        const newHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        // Regenerate icons with new page height
        const icons = generateBackgroundIcons(newHeight);
        setBackgroundIcons(icons);
      }, 100); // Debounce to avoid excessive updates
    });

    // Observe body for content changes
    resizeObserver.observe(document.body);

    // Also listen for window resize
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updatePageHeight();
        const newHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        const icons = generateBackgroundIcons(newHeight);
        setBackgroundIcons(icons);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [pageData, pageHeight]);

  // Redistribute icons when products change (e.g., Load More Products)
  useEffect(() => {
    if (pageData && products.length > 0) {
      // Delay to allow DOM to update
      setTimeout(() => {
        updatePageHeight();
        const newHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        if (newHeight !== pageHeight) {
          const icons = generateBackgroundIcons(newHeight);
          setBackgroundIcons(icons);
        }
      }, 300);
    }
  }, [products.length, pageData]);

  // Set default filter to main category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && pageData?.selected_categories && selectedFilter === '') {
      const mainCategory = categories.find(cat => 
        pageData.selected_categories.includes(cat.id) && !cat.parent_id
      );
      if (mainCategory) {
        setSelectedFilter(mainCategory.id.toString());
      }
    }
  }, [categories, pageData]);

  // Fetch products when page data is loaded or filter changes
  useEffect(() => {
    if (pageData) {
      fetchProducts(1, selectedFilter);
    }
  }, [pageData, selectedFilter]);




  // Loading state while fetching page data
  if (!pageData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: pageData?.background_color || '#153e8f' }}>
        
        {/* Background Icons */}
        {backgroundIcons.map((iconData) => (
          <div
            key={iconData.id}
            className="absolute pointer-events-none select-none"
            style={{
              top: iconData.position.top,
              left: iconData.position.left,
              transform: `rotate(${iconData.position.rotation}deg)`,
              zIndex: 1
            }}
          >
            <FontAwesomeIcon
              icon={iconData.icon}
              style={{
                fontSize: `${iconData.size}px`,
                width: `${iconData.size}px`,
                height: `${iconData.height}px`,
                color: iconData.color,
                opacity: iconData.opacity
              }}
            />
          </div>
        ))}

        {/* Main Content */}
        <div className="relative z-10">
          {/* Page Title and Banner */}
          <div className="w-full" style={{ maxWidth: `${pageData?.page_max_width || 1400}px`, margin: '0 auto' }}>
            
            {/* Title Section */}
            <div className="text-center py-16 px-4">
              {pageData?.top_banner && (
                <div 
                  className="mb-8 rounded-lg overflow-hidden mx-auto"
                  style={{
                    backgroundImage: `url(${pageData.top_banner})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: `${pageData?.banner_height || 300}px`,
                    opacity: (pageData?.banner_opacity || 100) / 100,
                    maxWidth: '100%'
                  }}
                >
                  <div className="w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-center">
                      <h1 
                        className="text-white font-bold mb-4"
                        style={{ fontSize: `${pageData?.title_font_size || 48}px` }}
                      >
                        {pageData?.title}
                      </h1>
                      {pageData?.motivation_title && (
                        <p 
                          className="text-white"
                          style={{ fontSize: `${pageData?.motivation_font_size || 20}px` }}
                        >
                          {pageData.motivation_title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {!pageData?.top_banner && (
                <div>
                  <h1 
                    className="text-white font-bold mb-4"
                    style={{ fontSize: `${pageData?.title_font_size || 48}px` }}
                  >
                    {pageData?.title}
                  </h1>
                  {pageData?.motivation_title && (
                    <p 
                      className="text-white"
                      style={{ fontSize: `${pageData?.motivation_font_size || 20}px` }}
                    >
                      {pageData.motivation_title}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Categories and Subcategories Display - Responsive Grid Layout */}
            {pageData?.selected_categories && pageData.selected_categories.length > 0 && (
              <div className="px-4 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
                  {/* Main Categories */}
                  {categories
                    .filter(cat => pageData.selected_categories.includes(cat.id) && !cat.parent_id)
                    .map((mainCategory) => (
                      <button
                        key={mainCategory.id}
                        onClick={() => handleFilterChange(mainCategory.id.toString())}
                        className={`h-12 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap text-sm font-medium ${
                          selectedFilter === mainCategory.id.toString()
                            ? 'text-white shadow-lg' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        style={selectedFilter === mainCategory.id.toString() ? {
                          background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                        } : {}}
                      >
                        {mainCategory.name}
                      </button>
                    ))}
                  
                  {/* Subcategories */}
                  {categories
                    .filter(cat => pageData.selected_categories.includes(cat.parent_id))
                    .map((subCategory) => (
                      <button
                        key={subCategory.id}
                        onClick={() => handleFilterChange(subCategory.id.toString())}
                        className={`h-12 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap text-sm font-medium ${
                          selectedFilter === subCategory.id.toString()
                            ? 'text-white shadow-lg' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        style={selectedFilter === subCategory.id.toString() ? {
                          background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                        } : {}}
                      >
                        {subCategory.name}
                      </button>
                    ))}
                </div>
              </div>
            )}







            {/* Products Grid */}
            <div className="px-4 pb-16">
              {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white/10 animate-pulse rounded-lg h-64"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    {Array.isArray(products) && products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: loading 
                            ? 'linear-gradient(131deg, rgba(153, 180, 118, 0.5) 0%, rgba(41, 173, 178, 0.5) 100%)' 
                            : 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                        }}
                      >
                        {loading ? 'Loading...' : 'Load More Products'}
                      </button>
                      
                      {/* Product Count Display */}
                      {totalProducts > 0 && (
                        <div className="mt-4">
                          <div className="text-white/80 text-sm">
                            Showing {products.length} of {totalProducts} products
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Count Display - When no more products to load */}
                  {!hasMore && totalProducts > 0 && (
                    <div className="text-center">
                      <div className="text-white/80 text-sm">
                        Showing all {totalProducts} products
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Description Section - like Microsoft page */}
            {pageData?.bottom_description && (
              <div className="px-4 pb-16">
                <div 
                  className="mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                  style={{ maxWidth: `${pageData?.bottom_description_width || 1400}px` }}
                >

                  
                  <div 
                    className={`prose prose-invert max-w-none text-white leading-relaxed transition-all duration-300 ${
                      showFullDescription ? '' : 'line-clamp-5'
                    }`}
                    style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.8',
                      display: showFullDescription ? 'block' : '-webkit-box',
                      WebkitLineClamp: showFullDescription ? 'none' : 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: showFullDescription ? 'visible' : 'hidden'
                    }}
                    dangerouslySetInnerHTML={{ __html: pageData.bottom_description }}
                  />
                  
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {showFullDescription ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}