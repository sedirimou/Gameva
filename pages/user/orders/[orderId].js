import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { useCurrency } from '../../../hooks/useCurrency';
import UserDashboardLayout from '../../../components/layout/UserDashboardLayout';
import { Download, Eye, Star, ArrowLeft, ExternalLink, ChevronRight, Home } from 'lucide-react';

export default function OrderDetailsPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Wait for auth check to complete before doing anything
    if (authLoading) return;
    
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Only fetch order details if we have orderId and user is authenticated
    if (orderId && user) {
      fetchOrderDetails();
    }
  }, [orderId, user, authLoading, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching order details for:', orderId, 'User:', user?.id);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Order API response status:', response.status);

      if (response.status === 401) {
        console.log('Authentication required - redirecting to login');
        router.push('/auth/login');
        return;
      }

      if (response.status === 404) {
        setError('Order not found or you don\'t have permission to view this order.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', response.status, errorData);
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      console.log('Order data received:', data);
      setOrderData(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement PDF receipt generation
    console.log('Download receipt for order:', orderId);
  };

  const handleViewKey = () => {
    setShowKey(!showKey);
  };

  const handleRateProduct = () => {
    // TODO: Implement product rating modal or redirect
    console.log('Rate product for order:', orderId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <UserDashboardLayout 
        title="Loading Order Details - Gamava" 
        description="Loading order details"
        customContent={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <UserDashboardLayout 
        title="Order Not Found - Gamava" 
        description="Order details not found"
        customContent={
          <div className="space-y-6">
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/user/orders" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </Link>
            </div>

            {/* Error Message */}
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <div className="text-red-400 text-lg font-semibold mb-2">Order Not Found</div>
              <p className="text-white/70 mb-6">{error}</p>
              <Link 
                href="/user/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Orders
              </Link>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <UserDashboardLayout 
      title={`Order #${orderId} - Gamava`} 
      description="Order details and transaction information"
      customContent={
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm text-white/60 mb-8">
            <Link href="/user/orders" className="hover:text-white transition-colors">
              My Orders
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Order Details</span>
          </div>

          {/* Order Summary Block */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
              <div>
                <p className="text-white/60 text-sm mb-1">Order placed on</p>
                <p className="text-white font-medium">{formatDate(orderData?.created_at)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Order Amount</p>
                <p className="text-white font-medium">{formatPrice(orderData?.total)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Order ID</p>
                <p className="text-white font-medium">{orderData?.id}</p>
              </div>
              <div className="flex justify-start lg:justify-end">
                <button 
                  onClick={handleDownloadReceipt}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          </div>

          {/* Product Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6 mb-6">
            {/* Bought from seller */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">Bought from</span>
                <span className="text-white font-medium">GAMAVA</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/60 text-sm">Rate Seller</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-white/40 hover:text-yellow-400 cursor-pointer transition-colors" />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex items-start space-x-4">
              <div className="w-20 h-24 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0" style={{ aspectRatio: '3/4' }}>
                {orderData?.product?.image ? (
                  <img 
                    src={orderData.product.image} 
                    alt={orderData.product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-medium text-lg mb-3">
                  {orderData?.product?.name || 'Call of Duty Modern Warfare II - 1 Hour 2XP + Burger King Operator Skin DLC (Global) - Multiplatform - Digital Key'}
                </h3>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium border border-blue-400/30">
                    GLOBAL
                  </span>
                  <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs font-medium border border-orange-400/30">
                    DLC
                  </span>
                  <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs font-medium border border-green-400/30">
                    DIGITAL KEY
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleViewKey}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
                  >
                    View Key
                  </button>
                  
                  <button 
                    onClick={handleRateProduct}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
                  >
                    Rate Product
                  </button>
                </div>

                {/* Product Key Display */}
                {showKey && (
                  <div className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-white/60 text-sm mb-2">Product Key:</p>
                    <p className="text-white font-mono text-sm bg-black/30 p-2 rounded border">
                      {orderData?.product_key || 'XXXX-XXXX-XXXX-XXXX'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Transaction Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Transaction Number</span>
                <span className="text-white font-medium">{orderData?.stripe_payment_intent_id || '367634757395'}</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Payment Mode</span>
                <span className="text-white font-medium">Credit or Debit Card</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Order Amount</span>
                <span className="text-white font-medium">{formatPrice(orderData?.sellingPrice || orderData?.total || 0.92)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Service Fee</span>
                <span className="text-white font-medium">{formatPrice(0.43)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Promo Amount</span>
                <span className="text-white font-medium">{formatPrice(0)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-white/60">Tax Amount</span>
                <span className="text-white font-medium">{formatPrice(0)}</span>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}