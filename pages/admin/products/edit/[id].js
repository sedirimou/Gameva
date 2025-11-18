import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import AdminLayout from '../../../../components/layout/AdminLayout';
import ProductForm from '../../../../components/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [productExists, setProductExists] = useState(false);

  useEffect(() => {
    if (id) {
      checkProductExists();
    }
  }, [id]);

  const checkProductExists = async () => {
    try {
      const response = await fetch(`/api/admin/products/${id}`);
      const data = await response.json();
      if (data.success && data.product) {
        setProductExists(true);
      } else {
        alert('Product not found');
        router.push('/admin/all-products');
      }
    } catch (error) {
      console.error('Error checking product:', error);
      alert('Error loading product');
      router.push('/admin/all-products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Edit Product" title="Edit Product - Admin - Gamava">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!productExists) {
    return null;
  }

  return (
    <AdminLayout currentPage="Edit Product" title="Edit Product - Admin - Gamava">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/all-products')}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Update product information and settings.
          </p>
        </div>

        <ProductForm mode="edit" productId={id} />
      </div>


    </AdminLayout>
  );
}