/**
 * Test Typesense Integration
 * Initialize and test the Typesense search functionality
 */

const { 
  initializeCollection, 
  indexProducts, 
  searchProducts, 
  getStats 
} = require('../lib/typesense');

async function testTypesense() {
  console.log('🔄 Testing Typesense integration...');
  
  try {
    // Initialize collection
    console.log('1. Initializing collection...');
    await initializeCollection();
    
    // Test with some sample products
    const sampleProducts = [
      {
        id: 1,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        platform: 'Steam',
        price: 59.99,
        final_price: 49.99,
        genres: ['RPG', 'Action'],
        images_cover_url: '/images/cyberpunk.jpg',
        description: 'Open-world action-adventure RPG',
        type: 'Base Game',
        created_at: new Date()
      },
      {
        id: 2,
        name: 'Grand Theft Auto V',
        slug: 'gta-v',
        platform: 'Steam',
        price: 29.99,
        final_price: 24.99,
        genres: ['Action', 'Adventure'],
        images_cover_url: '/images/gta5.jpg',
        description: 'Action-adventure game set in Los Santos',
        type: 'Base Game',
        created_at: new Date()
      },
      {
        id: 3,
        name: 'Call of Duty: Modern Warfare',
        slug: 'cod-mw',
        platform: 'Battle.net',
        price: 39.99,
        final_price: 34.99,
        genres: ['FPS', 'Action'],
        images_cover_url: '/images/cod.jpg',
        description: 'First-person shooter game',
        type: 'Base Game',
        created_at: new Date()
      }
    ];
    
    // Index products
    console.log('2. Indexing sample products...');
    await indexProducts(sampleProducts);
    
    // Test search
    console.log('3. Testing search functionality...');
    const searchResults = await searchProducts('Cyberpunk', { limit: 5 });
    console.log(`   Found ${searchResults.totalHits} results for "Cyberpunk"`);
    
    const gamesResults = await searchProducts('game', { limit: 5 });
    console.log(`   Found ${gamesResults.totalHits} results for "game"`);
    
    // Get stats
    console.log('4. Getting collection statistics...');
    const stats = await getStats();
    console.log(`   Total documents: ${stats?.totalDocuments || 0}`);
    
    console.log('✅ Typesense integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Typesense test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testTypesense();
}

module.exports = { testTypesense };