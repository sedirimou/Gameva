/**
 * Create Admin User Script
 * Creates or updates the Gamava admin user with secure hashed password
 * Usage: node scripts/create-admin-user.js
 * 
 * Required environment variables:
 * - ADMIN_EMAIL: Admin email address
 * - ADMIN_PASSWORD: Admin password (will be hashed)
 */

import { query } from '../lib/database.js';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('🔧 Creating/updating admin user...');
    
    // Get admin credentials from environment variables (REQUIRED)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required');
    }
    
    console.log(`📧 Admin email: ${adminEmail}`);
    
    // Hash the password
    console.log('🔒 Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin user already exists
    const existingUserResult = await query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [adminEmail.toLowerCase().trim()]
    );
    
    if (existingUserResult.rows.length > 0) {
      const existingUser = existingUserResult.rows[0];
      console.log(`✅ Admin user already exists with ID: ${existingUser.id}`);
      
      // Update password and ensure admin role
      await query(
        `UPDATE users 
         SET password_hash = $1, 
             role = 'admin', 
             is_active = true, 
             email_verified = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [passwordHash, existingUser.id]
      );
      
      console.log('🔐 Admin password updated and role verified');
      console.log('✅ Admin user setup complete!');
      return existingUser.id;
    }
    
    // Create new admin user
    console.log('📝 Creating new admin user...');
    const insertResult = await query(
      `INSERT INTO users (
        email, 
        username, 
        first_name, 
        last_name, 
        password_hash, 
        role, 
        is_active, 
        email_verified,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, username, role`,
      [
        adminEmail.toLowerCase().trim(),
        'gamava_admin',
        'Gamava',
        'Admin',
        passwordHash,
        'admin',
        true,
        true
      ]
    );
    
    const newUser = insertResult.rows[0];
    console.log(`✅ Admin user created successfully!`);
    console.log(`   User ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Username: ${newUser.username}`);
    console.log(`   Role: ${newUser.role}`);
    
    return newUser.id;
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✅ Admin user setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to setup admin user:', error);
    process.exit(1);
  });
