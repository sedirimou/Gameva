/**
 * Typesense Configuration and Client
 * Replaces Meilisearch with Typesense for better search functionality
 */

// Use mock implementation for development when Typesense server is not available
const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.TYPESENSE_HOST;

if (USE_MOCK) {
  console.log('🔧 Using mock Typesense implementation for development');
  module.exports = require('./typesense-mock');
} else {
  const Typesense = require('typesense');

  // Typesense client configuration
  const client = new Typesense.Client({
    nodes: [{
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: process.env.TYPESENSE_PORT || 8108,
      protocol: process.env.TYPESENSE_PROTOCOL || 'http'
    }],
    apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
    connectionTimeoutSeconds: 2
  });

  // Product collection schema
  const productSchema = {
    name: 'products',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string', index: true },
      { name: 'slug', type: 'string', index: true },
      { name: 'platform', type: 'string', facet: true },
      { name: 'price', type: 'float', facet: true },
      { name: 'sale_price', type: 'float', facet: true, optional: true },
      { name: 'final_price', type: 'float', facet: true },
      { name: 'genres', type: 'string[]', facet: true },
      { name: 'images_cover_url', type: 'string', optional: true },
      { name: 'images_cover_thumbnail', type: 'string', optional: true },
      { name: 'description', type: 'string', index: true, optional: true },
      { name: 'type', type: 'string', facet: true, optional: true },
      { name: 'age_rating', type: 'string', facet: true, optional: true },
      { name: 'release_date', type: 'string', optional: true },
      { name: 'created_at', type: 'int64' }
    ]
  };

  async function initializeCollection() {
    try {
      await client.collections('products').retrieve();
      console.log('✅ Typesense products collection already exists');
    } catch (error) {
      if (error.httpStatus === 404) {
        await client.collections().create(productSchema);
        console.log('✅ Typesense products collection created successfully');
      } else {
        throw error;
      }
    }
  }

  async function indexProduct(product) {
    try {
      const document = {
        id: product.id.toString(),
        name: product.name || '',
        slug: product.slug || '',
        platform: product.platform || '',
        price: parseFloat(product.price) || 0,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : undefined,
        final_price: parseFloat(product.final_price) || parseFloat(product.price) || 0,
        genres: Array.isArray(product.genres) ? product.genres : (product.genres ? [product.genres] : []),
        images_cover_url: product.images_cover_url || '',
        images_cover_thumbnail: product.images_cover_thumbnail || '',
        description: product.description || '',
        type: product.type || '',
        age_rating: product.age_rating || '',
        release_date: product.release_date || '',
        created_at: Math.floor(new Date(product.created_at || Date.now()).getTime() / 1000)
      };

      // Remove undefined values
      Object.keys(document).forEach(key => {
        if (document[key] === undefined) {
          delete document[key];
        }
      });

      await client.collections('products').documents().upsert(document);
      console.log(`✅ Indexed product: ${product.name} (ID: ${product.id})`);
      return true;
    } catch (error) {
      console.error(`❌ Error indexing product ${product.id}:`, error);
      return false;
    }
  }

  async function indexProducts(products) {
    try {
      const documents = products.map(product => ({
        id: product.id.toString(),
        name: product.name || '',
        slug: product.slug || '',
        platform: product.platform || '',
        price: parseFloat(product.price) || 0,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : undefined,
        final_price: parseFloat(product.final_price) || parseFloat(product.price) || 0,
        genres: Array.isArray(product.genres) ? product.genres : (product.genres ? [product.genres] : []),
        images_cover_url: product.images_cover_url || '',
        images_cover_thumbnail: product.images_cover_thumbnail || '',
        description: product.description || '',
        type: product.type || '',
        age_rating: product.age_rating || '',
        release_date: product.release_date || '',
        created_at: Math.floor(new Date(product.created_at || Date.now()).getTime() / 1000)
      })).map(doc => {
        Object.keys(doc).forEach(key => {
          if (doc[key] === undefined) {
            delete doc[key];
          }
        });
        return doc;
      });

      const importResult = await client.collections('products').documents().import(documents);
      console.log(`✅ Indexed ${documents.length} products in batch`);
      return importResult;
    } catch (error) {
      console.error('❌ Error batch indexing products:', error);
      throw error;
    }
  }

  async function searchProducts(query, options = {}) {
    try {
      const searchParameters = {
        q: query || '*',
        query_by: 'name,description,platform,genres',
        page: options.page || 1,
        per_page: options.limit || 20,
        filter_by: options.filters,
        sort_by: options.sort
      };

      const result = await client.collections('products').documents().search(searchParameters);
      
      return {
        hits: result.hits.map(hit => hit.document),
        totalHits: result.found,
        page: result.page,
        totalPages: Math.ceil(result.found / searchParameters.per_page),
        processingTimeMs: result.search_time_ms,
        facets: result.facet_counts || []
      };
    } catch (error) {
      console.error('❌ Error searching products:', error);
      throw error;
    }
  }

  async function deleteProduct(productId) {
    try {
      await client.collections('products').documents(productId.toString()).delete();
      console.log(`✅ Deleted product from index: ${productId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting product ${productId}:`, error);
      return false;
    }
  }

  async function clearProducts() {
    try {
      await client.collections('products').documents().delete({ filter_by: 'id:>0' });
      console.log('✅ Cleared all products from index');
      return true;
    } catch (error) {
      console.error('❌ Error clearing products:', error);
      return false;
    }
  }

  async function getStats() {
    try {
      const collection = await client.collections('products').retrieve();
      return {
        totalDocuments: collection.num_documents,
        name: collection.name,
        created: collection.created_at
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return null;
    }
  }

  module.exports = {
    client,
    initializeCollection,
    indexProduct,
    indexProducts,
    searchProducts,
    deleteProduct,
    clearProducts,
    getStats,
    productSchema
  };
}