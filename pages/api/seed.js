import { query } from '../../lib/database';

const sampleProducts = [
  {
    name: "Cyberpunk 2077 Steam Key",
    slug: "cyberpunk-2077-steam",
    description: "Experience Night City like never before in this open-world action-adventure RPG. Navigate a sprawling urban metropolis filled with countless stories, choices, and possibilities.",
    price: 59.99,
    finalPrice: 29.99,
    discountPercentage: 50,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Steam",
    region: "Global",
    productType: "Digital Key",
    categories: ["Action", "RPG", "Adventure"],
    genres: ["Cyberpunk", "Open World", "Futuristic"],
    developers: ["CD Projekt RED"],
    publishers: ["CD Projekt"],
    languages: ["English", "French", "German", "Spanish", "Italian"],
    regions: ["Global"],
    inStock: true,
    stock: 150,
    releaseDate: new Date("2020-12-10"),
    featured: true,
    bestseller: true,
    ageRating: "M"
  },
  {
    name: "Elden Ring Steam Key",
    slug: "elden-ring-steam",
    description: "A vast world full of mystery and adventure awaits. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
    price: 59.99,
    finalPrice: 39.99,
    discountPercentage: 33,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Steam",
    region: "Global",
    productType: "Digital Key",
    categories: ["Action", "RPG", "Adventure"],
    genres: ["Fantasy", "Open World", "Souls-like"],
    developers: ["FromSoftware"],
    publishers: ["Bandai Namco Entertainment"],
    languages: ["English", "Japanese", "French", "German", "Spanish"],
    regions: ["Global"],
    inStock: true,
    stock: 200,
    releaseDate: new Date("2022-02-25"),
    featured: true,
    bestseller: true,
    ageRating: "M"
  },
  {
    name: "The Witcher 3: Wild Hunt GOTY",
    slug: "witcher-3-wild-hunt-goty",
    description: "The most award-winning game of a generation, now enhanced for the next! Experience Geralt's defining adventure in this epic open-world fantasy.",
    price: 39.99,
    finalPrice: 19.99,
    discountPercentage: 50,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Steam",
    region: "Global",
    productType: "Digital Key",
    categories: ["RPG", "Adventure"],
    genres: ["Fantasy", "Open World", "Medieval"],
    developers: ["CD Projekt RED"],
    publishers: ["CD Projekt"],
    languages: ["English", "Polish", "French", "German", "Spanish", "Italian"],
    regions: ["Global"],
    inStock: true,
    stock: 300,
    releaseDate: new Date("2015-05-19"),
    featured: false,
    bestseller: true,
    ageRating: "M"
  },
  {
    name: "Red Dead Redemption 2",
    slug: "red-dead-redemption-2",
    description: "An epic tale of life in America's unforgiving heartland. The game's vast and atmospheric world provides the foundation for a brand new online multiplayer experience.",
    price: 59.99,
    finalPrice: 29.99,
    discountPercentage: 50,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Steam",
    region: "Global",
    productType: "Digital Key",
    categories: ["Action", "Adventure"],
    genres: ["Western", "Open World", "Story-Rich"],
    developers: ["Rockstar Games"],
    publishers: ["Rockstar Games"],
    languages: ["English", "Spanish", "French", "German", "Italian"],
    regions: ["Global"],
    inStock: true,
    stock: 180,
    releaseDate: new Date("2018-10-26"),
    featured: true,
    bestseller: false,
    ageRating: "M"
  },
  {
    name: "Call of Duty: Modern Warfare",
    slug: "call-of-duty-modern-warfare",
    description: "The stakes have never been higher as players take on the role of lethal Tier One operators in a heart-racing saga that will affect the global balance of power.",
    price: 59.99,
    finalPrice: 34.99,
    discountPercentage: 42,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Battle.net",
    region: "Global",
    productType: "Digital Key",
    categories: ["Action", "Shooter"],
    genres: ["FPS", "Military", "Multiplayer"],
    developers: ["Infinity Ward"],
    publishers: ["Activision"],
    languages: ["English", "Spanish", "French", "German", "Russian"],
    regions: ["Global"],
    inStock: true,
    stock: 120,
    releaseDate: new Date("2019-10-25"),
    featured: false,
    bestseller: true,
    ageRating: "M"
  },
  {
    name: "Grand Theft Auto V",
    slug: "gta-v-premium-edition",
    description: "Experience Rockstar Games' critically acclaimed open world game, Grand Theft Auto V. The world is yours in GTA Online, the ever-evolving world of GTA V.",
    price: 29.99,
    finalPrice: 14.99,
    discountPercentage: 50,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Steam",
    region: "Global",
    productType: "Digital Key",
    categories: ["Action", "Adventure"],
    genres: ["Open World", "Crime", "Racing"],
    developers: ["Rockstar North"],
    publishers: ["Rockstar Games"],
    languages: ["English", "Spanish", "French", "German", "Italian", "Russian"],
    regions: ["Global"],
    inStock: true,
    stock: 250,
    releaseDate: new Date("2013-09-17"),
    featured: true,
    bestseller: true,
    ageRating: "M"
  },
  {
    name: "Assassin's Creed Valhalla",
    slug: "assassins-creed-valhalla",
    description: "Become Eivor, a mighty Viking raider and lead your clan from the harsh shores of Norway to a new home amid the lush farmlands of ninth-century England.",
    price: 59.99,
    finalPrice: 24.99,
    discountPercentage: 58,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Uplay",
    region: "Global",
    productType: "Digital Key",
    categories: ["Action", "Adventure", "RPG"],
    genres: ["Historical", "Open World", "Viking"],
    developers: ["Ubisoft Montreal"],
    publishers: ["Ubisoft"],
    languages: ["English", "French", "German", "Spanish", "Italian", "Russian"],
    regions: ["Global"],
    inStock: true,
    stock: 160,
    releaseDate: new Date("2020-11-10"),
    featured: false,
    bestseller: false,
    ageRating: "M"
  },
  {
    name: "FIFA 24 Standard Edition",
    slug: "fifa-24-standard",
    description: "EA SPORTS FC 24 welcomes you to The World's Game - the most authentic football experience ever with HyperMotionV, PlayStyles optimized by Opta, and a revolutionized Frostbite Engine.",
    price: 69.99,
    finalPrice: 49.99,
    discountPercentage: 29,
    coverUrl: "/placeholder-game.svg",
    coverThumbnail: "/placeholder-game.svg",
    platform: "Origin",
    region: "Global",
    productType: "Digital Key",
    categories: ["Sports"],
    genres: ["Football", "Simulation", "Multiplayer"],
    developers: ["EA Sports"],
    publishers: ["Electronic Arts"],
    languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese"],
    regions: ["Global"],
    inStock: true,
    stock: 90,
    releaseDate: new Date("2023-09-29"),
    featured: true,
    bestseller: false,
    ageRating: "E"
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Connecting to PostgreSQL...');
    await query('SELECT 1'); // Test connection
    console.log('Connected to PostgreSQL successfully!');

    // Clear existing store products
    console.log('Clearing existing store products...');
    await query('DELETE FROM store_products');
    console.log('Existing store products cleared.');

    // Insert sample products
    console.log('Inserting sample products...');
    let insertedCount = 0;
    
    for (const product of sampleProducts) {
      await query(`
        INSERT INTO store_products (
          name, slug, description, price, final_price, discount_percentage,
          image_cover_url, image_screenshot_url, platform, region, product_type,
          categories, genres, developers, publishers, languages, regions_available,
          in_stock, stock, release_date, featured, bestseller, age_rating
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      `, [
        product.name, product.slug, product.description, product.price, product.finalPrice,
        product.discountPercentage, product.coverUrl, product.coverThumbnail,
        product.platform, product.region, product.productType,
        JSON.stringify(product.categories), JSON.stringify(product.genres),
        JSON.stringify(product.developers), JSON.stringify(product.publishers),
        JSON.stringify(product.languages), JSON.stringify(product.regions),
        product.inStock, product.stock, product.releaseDate,
        product.featured, product.bestseller, product.ageRating
      ]);
      insertedCount++;
    }
    
    console.log(`Successfully inserted ${insertedCount} products!`);

    return res.status(200).json({
      success: true,
      message: `Database seeded successfully with ${insertedCount} products!`,
      count: insertedCount
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: error.message
    });
  }
}