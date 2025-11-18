import { query } from '../../../lib/database';

export default async function handler(req, res) {
  console.log(`🔗 Commission Tiers API - ${req.method} request received`);
  
  if (req.method === 'GET') {
    try {
      console.log('📄 Fetching commission tiers from kinguin_commission_tiers table...');
      const result = await query('SELECT * FROM kinguin_commission_tiers ORDER BY min_price ASC');
      
      console.log(`✅ Found ${result.rows.length} commission tiers:`, result.rows);
      
      res.status(200).json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('❌ Error fetching commission tiers:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Database error while fetching commission tiers',
        error: error.message 
      });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const { tiers } = req.body;
      console.log('💾 Saving commission tiers:', tiers);

      if (!tiers || !Array.isArray(tiers)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid tiers data. Expected array of tier objects.' 
        });
      }

      // Validate tier data
      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        if (!tier.min_price || !tier.max_price || !tier.type || !tier.rate) {
          return res.status(400).json({ 
            success: false, 
            message: `Tier ${i + 1} is missing required fields (min_price, max_price, type, rate)` 
          });
        }
        if (tier.type !== 'Fixed' && tier.type !== 'Percent') {
          return res.status(400).json({ 
            success: false, 
            message: `Tier ${i + 1} has invalid type. Must be 'Fixed' or 'Percent'` 
          });
        }
      }

      // Clear existing tiers
      console.log('🗑️ Clearing existing commission tiers...');
      const deleteResult = await query('DELETE FROM kinguin_commission_tiers');
      console.log(`✅ Deleted ${deleteResult.rowCount} existing tiers`);
      
      // Insert new tiers
      const insertedTiers = [];
      for (const tier of tiers) {
        console.log(`📥 Inserting tier: ${tier.min_price}-${tier.max_price} (${tier.type}: ${tier.rate})`);
        const insertResult = await query(
          'INSERT INTO kinguin_commission_tiers (min_price, max_price, type, rate) VALUES ($1, $2, $3, $4) RETURNING *',
          [parseFloat(tier.min_price), parseFloat(tier.max_price), tier.type, parseFloat(tier.rate)]
        );
        insertedTiers.push(insertResult.rows[0]);
      }

      console.log(`✅ Successfully saved ${insertedTiers.length} commission tiers`);

      // Automatically trigger bulk price update for all products
      console.log('🔄 Triggering automatic bulk price update for all products...');
      try {
        const bulkUpdateResponse = await fetch('http://localhost:5000/api/admin/bulk-price-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (bulkUpdateResponse.ok) {
          const bulkUpdateResult = await bulkUpdateResponse.json();
          console.log('✅ Automatic bulk price update completed:', bulkUpdateResult);
        } else {
          console.log('⚠️ Bulk price update failed, but commission tiers were saved');
        }
      } catch (bulkError) {
        console.log('⚠️ Could not trigger automatic bulk price update:', bulkError.message);
      }

      res.status(200).json({ 
        success: true, 
        message: `Successfully saved ${insertedTiers.length} commission tiers and updated product prices`,
        data: insertedTiers
      });
    } catch (error) {
      console.error('❌ Error saving commission tiers:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Database error while saving commission tiers',
        error: error.message 
      });
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      const { id, min_price, max_price, type, rate } = req.body;
      console.log(`📝 Updating commission tier ${id}:`, { min_price, max_price, type, rate });

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tier ID is required for update' 
        });
      }

      const updateResult = await query(
        'UPDATE kinguin_commission_tiers SET min_price = $1, max_price = $2, type = $3, rate = $4 WHERE id = $5 RETURNING *',
        [parseFloat(min_price), parseFloat(max_price), type, parseFloat(rate), parseInt(id)]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: `Commission tier with ID ${id} not found` 
        });
      }

      console.log('✅ Commission tier updated:', updateResult.rows[0]);
      
      // Automatically trigger bulk price update for all products
      console.log('🔄 Triggering automatic bulk price update after tier modification...');
      try {
        const bulkUpdateResponse = await fetch('http://localhost:5000/api/admin/bulk-price-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (bulkUpdateResponse.ok) {
          const bulkUpdateResult = await bulkUpdateResponse.json();
          console.log('✅ Automatic bulk price update completed:', bulkUpdateResult);
        }
      } catch (bulkError) {
        console.log('⚠️ Could not trigger automatic bulk price update:', bulkError.message);
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Commission tier updated successfully and product prices recalculated',
        data: updateResult.rows[0]
      });
    } catch (error) {
      console.error('❌ Error updating commission tier:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Database error while updating commission tier',
        error: error.message 
      });
    }
  } 
  
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      console.log(`🗑️ Deleting commission tier ${id}`);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Tier ID is required for deletion' 
        });
      }

      const deleteResult = await query(
        'DELETE FROM kinguin_commission_tiers WHERE id = $1 RETURNING *',
        [parseInt(id)]
      );

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: `Commission tier with ID ${id} not found` 
        });
      }

      console.log('✅ Commission tier deleted:', deleteResult.rows[0]);
      res.status(200).json({ 
        success: true, 
        message: 'Commission tier deleted successfully',
        data: deleteResult.rows[0]
      });
    } catch (error) {
      console.error('❌ Error deleting commission tier:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Database error while deleting commission tier',
        error: error.message 
      });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed. Supported methods: GET, POST, PUT, DELETE` 
    });
  }
}