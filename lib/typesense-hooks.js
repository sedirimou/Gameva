/**
 * Real-time Typesense Indexing Hooks
 * Automatically indexes products when they are created, updated, or deleted via Prisma
 */

import { indexProduct, deleteProduct } from './typesense';

// Hook to be called after product creation
export async function afterProductCreate(product) {
  try {
    await indexProduct(product);
    console.log(`🔍 Auto-indexed new product: ${product.name} (ID: ${product.id})`);
  } catch (error) {
    console.error(`❌ Failed to auto-index new product ${product.id}:`, error);
  }
}

// Hook to be called after product update
export async function afterProductUpdate(product) {
  try {
    await indexProduct(product);
    console.log(`🔍 Auto-reindexed updated product: ${product.name} (ID: ${product.id})`);
  } catch (error) {
    console.error(`❌ Failed to auto-reindex updated product ${product.id}:`, error);
  }
}

// Hook to be called after product deletion
export async function afterProductDelete(productId) {
  try {
    await deleteProduct(productId);
    console.log(`🔍 Auto-removed product from index: ${productId}`);
  } catch (error) {
    console.error(`❌ Failed to remove product ${productId} from index:`, error);
  }
}

// Wrapper function for Prisma operations that need indexing
export function withTypesenseIndexing(prismaOperation) {
  return async function(...args) {
    const result = await prismaOperation.apply(this, args);
    
    // Handle different operation types
    if (prismaOperation.name === 'create' && result) {
      await afterProductCreate(result);
    } else if (prismaOperation.name === 'update' && result) {
      await afterProductUpdate(result);
    } else if (prismaOperation.name === 'delete' && args[0]?.where?.id) {
      await afterProductDelete(args[0].where.id);
    }
    
    return result;
  };
}