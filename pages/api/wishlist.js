import { query } from '../../lib/database';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req, res) {
  const { user_id, session_id } = req.query;

  if (!user_id && !session_id) {
    return res.status(400).json({ error: 'user_id or session_id required' });
  }

  try {
    let wishlistQuery;
    let params;

    if (user_id) {
      wishlistQuery = `
        SELECT w.*, p.name, p.price, p.sale_price, p.platform, p.genres, p.images_cover_url, p.images_cover_thumbnail
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
      `;
      params = [user_id];
    } else {
      wishlistQuery = `
        SELECT w.*, p.name, p.price, p.sale_price, p.platform, p.genres, p.images_cover_url, p.images_cover_thumbnail
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.session_id = $1
        ORDER BY w.created_at DESC
      `;
      params = [session_id];
    }

    const result = await query(wishlistQuery, params);
    
    const wishlistItems = result.rows.map(item => {
      // Extract image URLs from JSON data
      const extractImageUrl = (imageData) => {
        if (!imageData) return '/placeholder-game.jpg';
        if (typeof imageData === 'string') return imageData;
        if (typeof imageData === 'object') {
          return imageData.url || imageData.large || imageData.medium || imageData.small || '/placeholder-game.jpg';
        }
        return '/placeholder-game.jpg';
      };

      // Calculate selling price (use sale_price if exists, otherwise use price)
      const sellingPrice = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price);
      
      return {
        id: item.product_id,
        name: item.name,
        price: parseFloat(item.price) || 0,
        sale_price: item.sale_price ? parseFloat(item.sale_price) : null,
        sellingPrice: sellingPrice || 0,
        finalPrice: sellingPrice || 0,
        coverUrl: extractImageUrl(item.images_cover_url),
        cover_url: extractImageUrl(item.images_cover_url),
        coverThumbnail: extractImageUrl(item.images_cover_thumbnail) || extractImageUrl(item.images_cover_url),
        platform: item.platform,
        genres: item.genres,
        addedAt: item.created_at
      };
    });

    return res.status(200).json({ wishlist: wishlistItems });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
}

async function handlePost(req, res) {
  const { user_id, session_id, product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id required' });
  }

  if (!user_id && !session_id) {
    return res.status(400).json({ error: 'user_id or session_id required' });
  }

  try {
    // Use UPSERT for faster operation - INSERT if not exists, do nothing if exists
    let insertQuery;
    let insertParams;

    // Check if already in wishlist first
    let checkQuery;
    let checkParams;

    if (user_id) {
      checkQuery = 'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2';
      checkParams = [user_id, product_id];
    } else {
      checkQuery = 'SELECT id FROM wishlist WHERE session_id = $1 AND product_id = $2';
      checkParams = [session_id, product_id];
    }

    const existingItem = await query(checkQuery, checkParams);
    if (existingItem.rows.length > 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Product already in wishlist',
        already_exists: true
      });
    }

    if (user_id) {
      insertQuery = 'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) RETURNING id';
      insertParams = [user_id, product_id];
    } else {
      insertQuery = 'INSERT INTO wishlist (session_id, product_id) VALUES ($1, $2) RETURNING id';
      insertParams = [session_id, product_id];
    }

    const result = await query(insertQuery, insertParams);
    
    // If no rows returned, item already existed
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'Product already in wishlist',
        already_exists: true
      });
    }
    
    return res.status(201).json({ 
      success: true, 
      message: 'Product added to wishlist',
      wishlist_id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    
    // Handle specific database errors
    if (error.code === '23503') {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Handle connection termination errors
    if (error.code === '57P01' || error.message.includes('terminating connection')) {
      console.warn('Database connection terminated, retrying...');
      // Try once more with a fresh connection
      try {
        const retryResult = await query(insertQuery, insertParams);
        return res.status(201).json({ 
          success: true, 
          message: 'Product added to wishlist',
          wishlist_id: retryResult.rows[0].id 
        });
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        return res.status(500).json({ error: 'Database connection issue, please try again' });
      }
    }
    
    return res.status(500).json({ error: 'Failed to add to wishlist' });
  }
}

async function handleDelete(req, res) {
  const { user_id, session_id, product_id, clear_all } = req.body;

  if (!user_id && !session_id) {
    return res.status(400).json({ error: 'user_id or session_id required' });
  }

  try {
    let deleteQuery;
    let deleteParams;

    // Handle clear all wishlist
    if (clear_all) {
      if (user_id) {
        deleteQuery = 'DELETE FROM wishlist WHERE user_id = $1 RETURNING id';
        deleteParams = [user_id];
      } else {
        deleteQuery = 'DELETE FROM wishlist WHERE session_id = $1 RETURNING id';
        deleteParams = [session_id];
      }

      const result = await query(deleteQuery, deleteParams);
      
      return res.status(200).json({ 
        success: true, 
        message: `Cleared ${result.rows.length} items from wishlist`,
        deletedCount: result.rows.length
      });
    }

    // Handle single product removal
    if (!product_id) {
      return res.status(400).json({ error: 'product_id required for single item removal' });
    }

    // Debug logging to track removal requests
    console.log('DELETE wishlist item:', {
      user_id,
      session_id,
      product_id,
      product_id_type: typeof product_id
    });

    if (user_id) {
      deleteQuery = 'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id';
      deleteParams = [user_id, parseInt(product_id)];
    } else {
      deleteQuery = 'DELETE FROM wishlist WHERE session_id = $1 AND product_id = $2 RETURNING id';
      deleteParams = [session_id, parseInt(product_id)];
    }

    const result = await query(deleteQuery, deleteParams);
    
    // Debug logging for delete result
    console.log('DELETE result:', {
      deleteQuery,
      deleteParams,
      rowsAffected: result.rows.length,
      deletedIds: result.rows.map(row => row.id)
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found in wishlist' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Product removed from wishlist' 
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
}