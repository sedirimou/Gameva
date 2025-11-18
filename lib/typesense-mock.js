/**
 * Mock Typesense Server for Development
 * Provides similar functionality to real Typesense for development/testing
 */

// In-memory storage for the mock
let mockCollection = {
  name: 'products',
  documents: new Map(),
  initialized: false
};

class MockTypesenseClient {
  constructor(config) {
    this.config = config;
  }

  // Fuzzy matching for typo tolerance
  fuzzyMatch(searchTerm, text) {
    if (!searchTerm || !text) return false;
    
    const maxDistance = Math.floor(searchTerm.length / 3);
    
    // Check all substrings of the text
    for (let i = 0; i <= text.length - searchTerm.length + maxDistance; i++) {
      const substring = text.substr(i, searchTerm.length + maxDistance);
      if (this.levenshteinDistance(searchTerm, substring) <= maxDistance) {
        return true;
      }
    }
    
    return false;
  }

  // Levenshtein distance calculation
  levenshteinDistance(a, b) {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  collections(name) {
    if (name === 'products') {
      return {
        retrieve: async () => {
          if (!mockCollection.initialized) {
            throw { httpStatus: 404 };
          }
          return {
            name: mockCollection.name,
            num_documents: mockCollection.documents.size,
            created_at: Date.now()
          };
        },
        documents: () => ({
          upsert: async (document) => {
            mockCollection.documents.set(document.id, document);
            return { id: document.id };
          },
          import: async (documents) => {
            documents.forEach(doc => {
              mockCollection.documents.set(doc.id, doc);
            });
            return documents.map(doc => ({ id: doc.id, success: true }));
          },
          search: async (params) => {
            const query = params.q || '';
            const page = params.page || 1;
            const perPage = params.per_page || 20;
            
            let results = Array.from(mockCollection.documents.values());
            
            // Apply intelligent search filtering
            if (query && query !== '*') {
              const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
              
              results = results.map(doc => {
                let score = 0;
                const name = doc.name.toLowerCase();
                const description = (doc.description || '').toLowerCase();
                const platform = doc.platform.toLowerCase();
                const genres = Array.isArray(doc.genres) ? doc.genres.join(' ').toLowerCase() : '';
                
                // Exact match (highest score)
                if (name === query.toLowerCase()) score += 100;
                
                // Prefix matching for product names
                if (name.startsWith(query.toLowerCase())) score += 90;
                
                // Contains matching in name
                if (name.includes(query.toLowerCase())) score += 80;
                
                // Multi-word query matching
                let wordMatches = 0;
                searchTerms.forEach(term => {
                  if (name.includes(term)) wordMatches += 3;
                  if (description.includes(term)) wordMatches += 2;
                  if (platform.includes(term)) wordMatches += 2;
                  if (genres.includes(term)) wordMatches += 1;
                  
                  // Fuzzy matching (typo tolerance)
                  if (this.fuzzyMatch(term, name)) wordMatches += 2;
                  if (this.fuzzyMatch(term, description)) wordMatches += 1;
                });
                
                score += wordMatches * 5;
                
                // Platform and genre exact matching
                if (platform.includes(query.toLowerCase())) score += 40;
                if (genres.includes(query.toLowerCase())) score += 30;
                
                // Description matching
                if (description.includes(query.toLowerCase())) score += 50;
                
                return { ...doc, _score: score };
              })
              .filter(doc => doc._score > 0)
              .sort((a, b) => b._score - a._score);
            }

            // Apply filters
            if (params.filter_by) {
              const filters = params.filter_by.split(' && ');
              filters.forEach(filter => {
                const [field, operator, value] = filter.split(/[:=]/);
                if (field === 'platform' && operator === '=') {
                  results = results.filter(doc => doc.platform === value);
                }
                if (field === 'final_price') {
                  const price = parseFloat(value);
                  if (operator === '>=') {
                    results = results.filter(doc => doc.final_price >= price);
                  } else if (operator === '<=') {
                    results = results.filter(doc => doc.final_price <= price);
                  }
                }
              });
            }

            // Pagination
            const start = (page - 1) * perPage;
            const paginatedResults = results.slice(start, start + perPage);

            return {
              hits: paginatedResults.map(doc => ({
                document: doc,
                highlight: {
                  name: doc.name,
                  description: doc.description
                }
              })),
              found: results.length,
              page: page,
              facet_counts: []
            };
          },
          delete: async (filters) => {
            if (filters.filter_by === 'id:>0') {
              mockCollection.documents.clear();
            }
            return { num_deleted: mockCollection.documents.size };
          }
        }),
        delete: async (id) => {
          return mockCollection.documents.delete(id);
        }
      };
    }
    throw new Error('Collection not found');
  }
}

// Mock functions that match the real Typesense API
const mockClient = new MockTypesenseClient();

async function initializeCollection() {
  try {
    await mockClient.collections('products').retrieve();
    console.log('✅ Mock Typesense products collection already exists');
  } catch (error) {
    if (error.httpStatus === 404) {
      mockCollection.initialized = true;
      console.log('✅ Mock Typesense products collection created successfully');
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

    Object.keys(document).forEach(key => {
      if (document[key] === undefined) {
        delete document[key];
      }
    });

    await mockClient.collections('products').documents().upsert(document);
    console.log(`✅ Mock indexed product: ${product.name} (ID: ${product.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Error mock indexing product ${product.id}:`, error);
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

    await mockClient.collections('products').documents().import(documents);
    console.log(`✅ Mock indexed ${documents.length} products in batch`);
    return documents.map(doc => ({ id: doc.id, success: true }));
  } catch (error) {
    console.error('❌ Error mock batch indexing products:', error);
    throw error;
  }
}

async function searchProducts(query, options = {}) {
  try {
    const searchParameters = {
      q: query || '*',
      page: options.page || 1,
      per_page: options.limit || 20,
      filter_by: options.filters
    };

    const result = await mockClient.collections('products').documents().search(searchParameters);
    
    return {
      hits: result.hits.map(hit => ({
        ...hit.document,
        _formatted: hit.highlight
      })),
      totalHits: result.found,
      page: result.page,
      totalPages: Math.ceil(result.found / searchParameters.per_page),
      facets: result.facet_counts || []
    };
  } catch (error) {
    console.error('❌ Error mock searching products:', error);
    throw error;
  }
}

async function deleteProduct(productId) {
  try {
    await mockClient.collections('products').delete(productId.toString());
    console.log(`✅ Mock deleted product from index: ${productId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error mock deleting product ${productId}:`, error);
    return false;
  }
}

async function clearProducts() {
  try {
    await mockClient.collections('products').documents().delete({ filter_by: 'id:>0' });
    console.log('✅ Mock cleared all products from index');
    return true;
  } catch (error) {
    console.error('❌ Error mock clearing products:', error);
    return false;
  }
}

async function getStats() {
  try {
    const collection = await mockClient.collections('products').retrieve();
    return {
      totalDocuments: collection.num_documents,
      name: collection.name,
      created: collection.created_at
    };
  } catch (error) {
    console.error('❌ Error getting mock stats:', error);
    return null;
  }
}

module.exports = {
  client: mockClient,
  initializeCollection,
  indexProduct,
  indexProducts,
  searchProducts,
  deleteProduct,
  clearProducts,
  getStats,
  productSchema: {
    name: 'products',
    fields: []
  }
};