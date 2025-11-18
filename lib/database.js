import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Important for Neon database connections
  },
  // Enhanced connection pool settings for Neon auto-sleep handling
  max: 10, // Reduced max connections to prevent resource exhaustion
  min: 1,  // Minimum number of connections in the pool
  idleTimeoutMillis: 30000, // Keep idle connections longer for Neon
  connectionTimeoutMillis: 10000, // Increased to 10 seconds for Neon wake-up
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  query_timeout: 20000, // Increased query timeout to 20 seconds
  statement_timeout: 20000, // Increased statement timeout to 20 seconds
  application_name: 'gamava_app'
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Please check your environment variables.");
}



export async function query(text, params, retries = 2) {
  const start = Date.now();
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      const duration = Date.now() - start;
      
      // If this is the last attempt or a non-retryable error, throw it
      if (attempt === retries || !isRetryableError(error)) {
        console.error('Query failed after retries:', { text, duration, error: error.message });
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.warn(`Query attempt ${attempt + 1} failed, retrying in ${waitTime}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

function isRetryableError(error) {
  const retryableMessages = [
    'Connection terminated unexpectedly',
    'Connection terminated due to connection timeout',
    'Client has encountered a connection error',
    'Pool is ending',
    'timeout',
    'terminating connection due to administrator command', // Neon auto-sleep
    'server closed the connection unexpectedly',
    'connection to server was lost',
    'connection was reset',
    'database connection lost',
    'database system is shutting down',
    'database system is starting up'
  ];
  
  // Also check for specific Neon error codes
  const retryableCodes = ['57P01', '08006', '08000', '08003', '53300', '53400'];
  
  return retryableMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  ) || retryableCodes.includes(error.code);
}

export async function initializeStoreProductsTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS store_products (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(500) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        description TEXT,
        developers TEXT[],
        publishers TEXT[],
        genres TEXT[],
        platform VARCHAR(100) NOT NULL,
        release_date VARCHAR(50),
        qty INTEGER DEFAULT 0,
        price NUMERIC(10,2) DEFAULT 0,
        is_preorder BOOLEAN DEFAULT FALSE,
        metacritic_score NUMERIC(4,2),
        videos JSONB,
        languages TEXT[],
        system_requirements JSONB,
        tags TEXT[],
        age_rating VARCHAR(50),
        image_screenshot_url TEXT,
        image_cover_url TEXT,
        product_type VARCHAR(50) DEFAULT 'game',
        category VARCHAR(100) DEFAULT 'digital_games',
        slug VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_store_products_platform ON store_products(platform);
      CREATE INDEX IF NOT EXISTS idx_store_products_price ON store_products(price);
      CREATE INDEX IF NOT EXISTS idx_store_products_name ON store_products USING gin(to_tsvector('english', name));
      CREATE INDEX IF NOT EXISTS idx_store_products_genres ON store_products USING gin(genres);
      CREATE INDEX IF NOT EXISTS idx_store_products_category ON store_products(category);
    `);

    console.log('Store products table initialized successfully');
  } catch (error) {
    console.error('Error initializing store products tables:', error);
    throw error;
  }
}
