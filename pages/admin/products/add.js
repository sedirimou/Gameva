import { useState } from 'react';
import { useRouter } from 'next/router';

import AdminLayout from '../../../components/layout/AdminLayout';
import ProductForm from '../../../components/ProductForm';

export default function AddProductPage() {
  const router = useRouter();

  return (
    <AdminLayout>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new product listing for your store.
          </p>
        </div>

        <ProductForm mode="add" />
      </div>


    </AdminLayout>
  );
}