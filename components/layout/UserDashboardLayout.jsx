import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import MainLayout from './MainLayout';
import { useCurrency } from '../../hooks/useCurrency';
import { User, Gamepad2, CreditCard, HelpCircle, Calendar, Clock, Package, DollarSign, MessageCircle, Mail, Phone, BookOpen, Search, Trophy, Star, Zap, TrendingUp, Gift, Settings, Shield, Award, Target, ChevronDown } from 'lucide-react';

const UserDashboardLayout = ({ initialSection = 'profile', forceSection = null, customContent = null, title = null, description = null }) => {
  const router = useRouter();
  const { isLoggedIn, user, loading } = useAuth();
  const { formatPrice } = useCurrency();  
  
  // Set initial section based on props or URL
  const [activeSection, setActiveSection] = useState(() => {
    // If forceSection is provided, always use it and ignore everything else
    if (forceSection && ['profile', 'library', 'orders', 'help'].includes(forceSection)) {
      return forceSection;
    }
    // If initialSection prop is provided, use it (for direct user pages)
    if (initialSection && ['profile', 'library', 'orders', 'help'].includes(initialSection)) {
      return initialSection;
    }
    // Otherwise, check URL parameter (for dashboard route)
    const { section } = router.query;
    return ['profile', 'library', 'orders', 'help'].includes(section) ? section : 'profile';
  });

  // Update section when URL changes (only for dashboard route without forceSection)
  useEffect(() => {
    // If forceSection is set, never update from URL
    if (forceSection) {
      return;
    }
    // Only update from URL if we're on the dashboard route and no initialSection prop
    if (!initialSection && router.pathname === '/dashboard') {
      const { section } = router.query;
      const newSection = ['profile', 'library', 'orders', 'help'].includes(section) ? section : 'profile';
      setActiveSection(newSection);
    }
  }, [router.query.section, router.pathname, initialSection, forceSection]);

  // Only redirect after giving auth state time to load
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
            <p className="mt-4" style={{ color: 'var(--foreground)' }}>Loading...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const navigationItems = [
    {
      id: 'library',
      label: 'My Library',
      icon: Gamepad2
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: CreditCard
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: HelpCircle
    }
  ];

  const ProfileSection = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <User className="h-6 w-6 mr-3" />
            Profile Settings
          </h2>
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition-all duration-200 text-sm font-medium">
            Edit Profile
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="User avatar" 
                    className="w-full h-full object-cover"
                    style={{ objectFit: 'cover', width: '128px', height: '128px' }}
                  />
                ) : (
                  <User className="h-16 w-16 text-white" />
                )}
              </div>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition-all duration-200 text-sm">
                Change Avatar
              </button>
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">First Name</label>
                <input 
                  type="text" 
                  value={user?.first_name || ''} 
                  placeholder="First name not provided"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Last Name</label>
                <input 
                  type="text" 
                  value={user?.last_name || ''} 
                  placeholder="Last name not provided"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  placeholder="Email not provided"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm font-medium mb-2">Username</label>
                <input 
                  type="text" 
                  value={user?.username || ''} 
                  placeholder="Username not provided"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Games Owned</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <Gamepad2 className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <Package className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Member Since</p>
              <p className="text-2xl font-bold text-white">2024</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security & Privacy
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition-all duration-200 text-sm">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-white/60 text-sm">Receive updates about your orders and account</p>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="w-10 h-6 bg-green-500 rounded-full shadow-inner"></div>
                <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1 transition-transform"></div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Change Password</p>
              <p className="text-white/60 text-sm">Update your password to keep your account secure</p>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition-all duration-200 text-sm">
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LibrarySection = () => {
    const fakeGameKeys = [
      {
        id: 1,
        name: "Cyberpunk 2077",
        platform: "Steam",
        key: "XXXX-XXXX-XXXX-XXXX",
        purchaseDate: "2024-12-15",
        status: "Available"
      },
      {
        id: 2,
        name: "The Witcher 3: Wild Hunt",
        platform: "GOG",
        key: "YYYY-YYYY-YYYY-YYYY",
        purchaseDate: "2024-12-10",
        status: "Redeemed"
      },
      {
        id: 3,
        name: "Elden Ring",
        platform: "Steam",
        key: "ZZZZ-ZZZZ-ZZZZ-ZZZZ",
        purchaseDate: "2024-12-08",
        status: "Available"
      },
      {
        id: 4,
        name: "Red Dead Redemption 2",
        platform: "Epic Games",
        key: "AAAA-AAAA-AAAA-AAAA",
        purchaseDate: "2024-12-05",
        status: "Available"
      },
      {
        id: 5,
        name: "Grand Theft Auto V",
        platform: "Rockstar",
        key: "BBBB-BBBB-BBBB-BBBB",
        purchaseDate: "2024-12-01",
        status: "Redeemed"
      }
    ];

    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Gamepad2 className="h-6 w-6 mr-3" />
          My Library
        </h2>
        
        <div className="space-y-4">
          {fakeGameKeys.map((game) => (
            <div key={game.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 hover:bg-white/15 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  game.status === 'Available' 
                    ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                    : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                }`}>
                  {game.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Platform:</span>
                  <p className="text-white font-medium">{game.platform}</p>
                </div>
                <div>
                  <span className="text-white/60">Purchase Date:</span>
                  <p className="text-white font-medium">{new Date(game.purchaseDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-white/60">Game Key:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-white font-mono bg-white/10 px-2 py-1 rounded border border-white/20">
                      {game.key}
                    </code>
                    <button className="text-white/60 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {game.status === 'Available' && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/20 transition-all duration-200 text-sm font-medium">
                    Redeem Key
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between text-white/80">
            <span>Total Games in Library:</span>
            <span className="font-bold text-lg">{fakeGameKeys.length}</span>
          </div>
        </div>
      </div>
    );
  };

  const OrdersSection = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    const fakeOrders = [
      {
        id: "ORDER-462460",
        orderId: "gk8lxq5",
        date: "2025-01-04",
        status: "SUCCESS",
        total: 29.99,
        sellingPrice: 24.99,
        items: [
          { 
            name: "Call of Duty Modern Warfare II - 1 Hour 2XP + Burger King Operator Skin DLC (Global) - Multiplatform - Digital Key", 
            price: 29.99,
            sale_price: 24.99,
            platform: "Steam",
            image: "/api/placeholder/80/80",
            global: true
          }
        ]
      },
      {
        id: "ORD-2024-002",
        orderId: "pbvhYDz",
        date: "2024-12-10",
        status: "CANCELLED",
        total: 15.43,
        sellingPrice: 12.99,
        items: [
          { 
            name: "Palworld (Global) (PC) - Steam - Digital Key", 
            price: 15.43,
            sale_price: 12.99,
            platform: "Steam",
            image: "/api/placeholder/80/80",
            global: true
          }
        ]
      },
      {
        id: "ORD-2024-003",
        orderId: "xyz9876",
        date: "2024-12-08",
        status: "PENDING",
        total: 39.99,
        sellingPrice: 34.99,
        items: [
          { 
            name: "Grand Theft Auto V Premium Edition", 
            price: 39.99,
            sale_price: 34.99,
            platform: "Rockstar",
            image: "/api/placeholder/80/80",
            global: false
          }
        ]
      }
    ];

    const getStatusStyle = (status) => {
      switch (status) {
        case 'SUCCESS': return 'bg-green-500/20 text-green-300 border border-green-400/30';
        case 'CANCELLED': return 'bg-red-500/20 text-red-300 border border-red-400/30';
        case 'PENDING': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
        default: return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
      }
    };

    const filterTabs = [
      { key: 'all', label: 'All Orders' },
      { key: 'success', label: 'Successful Orders' },
      { key: 'cancelled', label: 'Unsuccessful & Refunded Orders' },
      { key: 'pending', label: 'Pending Orders' }
    ];

    const filteredOrders = fakeOrders.filter(order => {
      // Filter by status
      let statusMatch = true;
      if (activeFilter === 'success') statusMatch = order.status === 'SUCCESS';
      else if (activeFilter === 'cancelled') statusMatch = order.status === 'CANCELLED';
      else if (activeFilter === 'pending') statusMatch = order.status === 'PENDING';
      
      // Filter by date
      let dateMatch = true;
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.date);
        const currentDate = new Date();
        
        if (dateFilter === 'last30days') {
          const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
          dateMatch = orderDate >= thirtyDaysAgo;
        } else if (dateFilter === 'last3months') {
          const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
          dateMatch = orderDate >= threeMonthsAgo;
        } else if (dateFilter.match(/^\d{4}$/)) {
          // Year filter (2021, 2022, etc.)
          dateMatch = orderDate.getFullYear() === parseInt(dateFilter);
        }
      }
      
      // Filter by search term
      const searchMatch = searchTerm === '' || 
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && dateMatch && searchMatch;
    });

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-6">My Orders</h1>
          
          {/* Search Bar and Order Date Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-none sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search By Product Title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-800 text-white">Order Date</option>
                <option value="last30days" className="bg-gray-800 text-white">Last 30 days</option>
                <option value="last3months" className="bg-gray-800 text-white">Last 3 Months</option>
                <option value="2025" className="bg-gray-800 text-white">2025</option>
                <option value="2024" className="bg-gray-800 text-white">2024</option>
                <option value="2023" className="bg-gray-800 text-white">2023</option>
                <option value="2022" className="bg-gray-800 text-white">2022</option>
                <option value="2021" className="bg-gray-800 text-white">2021</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none" />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 sm:px-6 py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  activeFilter === tab.key
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="order-1">
                    <p className="text-white/60 text-sm mb-1">Order placed on</p>
                    <p className="text-white font-medium">{new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="order-2">
                    <p className="text-white/60 text-sm mb-1">Order Amount</p>
                    <p className="text-white font-medium">{formatPrice(order.sellingPrice || order.total)}</p>
                  </div>
                  <div className="order-3">
                    <p className="text-white/60 text-sm mb-1">Order ID</p>
                    <p className="text-white font-medium">{order.orderId}</p>
                  </div>
                  <div className="order-4 md:order-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-medium self-start ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <Link href={`/user/orders/${order.id}`} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20 w-full md:w-auto inline-block text-center">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              {order.items.map((item, index) => (
                <div key={index} className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-16 sm:w-20 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                      <Gamepad2 className="h-6 w-6 sm:h-8 sm:w-8 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm sm:text-lg mb-2 leading-tight">{item.name}</h3>
                      {item.global && (
                        <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium border border-blue-400/30">
                          GLOBAL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12 text-center">
            <Package className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
            <p className="text-white/60 mb-6">
              {searchTerm ? `No orders match "${searchTerm}"` : `No ${activeFilter} orders found`}
            </p>
            <Link href="/">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                Browse Store
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  };

  const HelpSection = () => {
    const [activeTab, setActiveTab] = useState('faq');
    const [searchQuery, setSearchQuery] = useState('');

    const faqData = [
      {
        category: "Account & Orders",
        questions: [
          {
            q: "How do I redeem my game key?",
            a: "Navigate to your Library section, find the game you purchased, and click 'Redeem Key'. Copy the provided key and paste it into your gaming platform (Steam, Epic Games, etc.) to activate your game."
          },
          {
            q: "Can I refund a digital game?",
            a: "Digital game keys can be refunded within 24 hours of purchase if the key hasn't been redeemed. Once activated on your gaming platform, refunds are not possible due to digital distribution policies."
          },
          {
            q: "Why is my order still processing?",
            a: "Orders typically process within 5-15 minutes. Delays may occur due to payment verification or high demand. Check your email for updates or contact support if processing exceeds 2 hours."
          }
        ]
      },
      {
        category: "Technical Issues",
        questions: [
          {
            q: "My game key isn't working",
            a: "Ensure you're redeeming the key on the correct platform (Steam, Epic Games, etc.). Check for typing errors and make sure the key hasn't expired. Contact support with your order number if issues persist."
          },
          {
            q: "I can't access my account",
            a: "Try resetting your password using the 'Forgot Password' link. Clear your browser cache and cookies. If problems continue, contact our support team with your registered email address."
          },
          {
            q: "Payment failed but money was charged",
            a: "Payment authorization may appear as a pending charge. If the order failed, the charge will be automatically reversed within 3-5 business days. Contact your bank if the charge doesn't disappear."
          }
        ]
      }
    ];

    const supportTickets = [
      {
        id: "TKT-2024-001",
        subject: "Game key activation issue",
        status: "resolved",
        date: "2024-12-15",
        response: "Issue resolved - replacement key provided"
      },
      {
        id: "TKT-2024-002", 
        subject: "Payment processing delay",
        status: "open",
        date: "2024-12-14",
        response: "Under investigation by payment team"
      }
    ];

    const getTicketStatusColor = (status) => {
      switch (status) {
        case 'resolved': return 'bg-green-500/20 text-green-300 border-green-400/30';
        case 'open': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
        case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
        default: return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      }
    };

    return (
      <div className="space-y-6">
        {/* Help Header */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <HelpCircle className="h-6 w-6 mr-3" />
            Help Center
          </h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'faq', label: 'FAQ', icon: BookOpen },
              { id: 'tickets', label: 'Support Tickets', icon: MessageCircle },
              { id: 'contact', label: 'Contact Us', icon: Mail }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">{category.category}</h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border border-white/10 rounded-lg overflow-hidden">
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                          <span className="text-white font-medium">{faq.q}</span>
                          <HelpCircle className="h-5 w-5 text-white/60 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="p-4 bg-white/5 border-t border-white/10">
                          <p className="text-white/80">{faq.a}</p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <Gift className="h-6 w-6 text-blue-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">Redeem Gift Card</p>
                    <p className="text-white/60 text-sm">Activate your gift card</p>
                  </div>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <Settings className="h-6 w-6 text-green-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">Account Settings</p>
                    <p className="text-white/60 text-sm">Manage your account</p>
                  </div>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <Target className="h-6 w-6 text-purple-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">Report Issue</p>
                    <p className="text-white/60 text-sm">Get technical support</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Your Support Tickets</h3>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
                  New Ticket
                </button>
              </div>

              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-white font-medium">{ticket.id}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTicketStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">{new Date(ticket.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-white mb-2">{ticket.subject}</p>
                    <p className="text-white/60 text-sm mb-3">{ticket.response}</p>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Email Support</p>
                      <p className="text-white/60 text-sm">support@gamava.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white font-medium">Live Chat</p>
                      <p className="text-white/60 text-sm">Available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Phone Support</p>
                      <p className="text-white/60 text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Send Message</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Subject</label>
                    <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" className="bg-gray-800 text-white">Select a topic</option>
                      <option value="order" className="bg-gray-800 text-white">Order Issue</option>
                      <option value="technical" className="bg-gray-800 text-white">Technical Problem</option>
                      <option value="account" className="bg-gray-800 text-white">Account Question</option>
                      <option value="other" className="bg-gray-800 text-white">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your issue or question..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Response Time Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Response Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <Clock className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Live Chat</p>
                  <p className="text-white/60 text-sm">Instant response</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <Mail className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Email</p>
                  <p className="text-white/60 text-sm">Within 24 hours</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <Phone className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Phone</p>
                  <p className="text-white/60 text-sm">Mon-Fri 9AM-6PM</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'library':
        return <LibrarySection />;
      case 'orders':
        return <OrdersSection />;
      case 'help':
        return <HelpSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <MainLayout title={title} description={description}>
      <div className="min-h-screen py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
                {/* Navigation Links */}
                <div className="p-4">
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeSection === item.id;
                      
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            // If we have forceSection, always navigate to user pages (static URLs)
                            if (forceSection) {
                              router.push(`/user/${item.id}`);
                            } else if (initialSection) {
                              // If we have an initialSection prop, we're on a user page - navigate to user pages
                              router.push(`/user/${item.id}`);
                            } else {
                              // We're on the dashboard route - use URL parameters and update state
                              setActiveSection(item.id);
                              router.push(`/dashboard?section=${item.id}`, undefined, { shallow: true });
                            }
                          }}
                          className={`
                            flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group
                            ${isActive 
                              ? 'bg-white/10 text-white border-l-4 border-white' 
                              : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }
                          `}
                        >
                          <IconComponent 
                            className={`
                              h-5 w-5 mr-3 transition-colors duration-200
                              ${isActive 
                                ? 'text-white' 
                                : 'text-white/60 group-hover:text-white'
                              }
                            `}
                          />
                          <span className="font-medium">{item.label}</span>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <div className="ml-auto">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                </div>

                {/* Footer Section */}
                <div className="border-t border-white/10 px-6 py-4 bg-white/5">
                  <p className="text-xs text-white/60 text-center">
                    Need help? Contact our support team
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {customContent || renderSection()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboardLayout;