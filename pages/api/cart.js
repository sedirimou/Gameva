import { query } from '../../lib/database.js';

export default async function handler(req, res) {
  // Check authentication
  const sessionId = req.cookies.session_id;
  if (!sessionId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Get user from session
  const userResult = await query(`
    SELECT us.user_id, us.expires_at, u.id, u.first_name, u.last_name, u.email, u.avatar_url, u.discord_id
    FROM user_sessions us
    JOIN users u ON us.user_id = u.id
    WHERE us.session_id = $1 AND us.expires_at > NOW()
  `, [sessionId]);

  if (userResult.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const user = userResult.rows[0];

  if (req.method === 'GET') {
    try {
      // Get cart items with product details
      const cartResult = await query(`
        SELECT 
          ci.id,
          ci.product_id as "productId",
          ci.quantity,
          ci.created_at as "addedAt",
          p.name as product_name,
          p.price as product_price,
          p.sale_price as product_sale_price,
          p.images_cover_url as product_image_url,
          p.platform as product_platform
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1
        ORDER BY ci.created_at DESC
      `, [user.id]);

      const cartItems = cartResult.rows.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        addedAt: item.addedAt,
        product: {
          name: item.product_name,
          price: parseFloat(item.product_price),
          sale_price: item.product_sale_price ? parseFloat(item.product_sale_price) : null,
          imageUrl: item.product_image_url,
          platform: item.product_platform
        }
      }));

      res.status(200).json({
        cart: {
          items: cartItems,
          totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        }
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Check if product exists
      const productResult = await query('SELECT id FROM products WHERE id = $1', [productId]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if item already exists in cart
      const existingItem = await query(
        'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [user.id, productId]
      );

      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;
        await query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newQuantity, existingItem.rows[0].id]
        );
      } else {
        // Insert new item
        await query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
          [user.id, productId, quantity]
        );
      }

      res.status(200).json({ message: 'Item added to cart' });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { itemId, quantity } = req.body;

      if (!itemId || !quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid item ID or quantity' });
      }

      // Update quantity
      const result = await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
        [quantity, itemId, user.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.status(200).json({ message: 'Quantity updated' });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ error: 'Failed to update cart item' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { itemId } = req.query;

      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      // Delete item
      const result = await query(
        'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
        [itemId, user.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing cart item:', error);
      res.status(500).json({ error: 'Failed to remove cart item' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}