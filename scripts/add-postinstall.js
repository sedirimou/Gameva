#!/usr/bin/env node
/**
 * Script to add postinstall script to package.json for Vercel deployment
 * Run with: node scripts/add-postinstall.js
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add postinstall script if it doesn't exist
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  if (!packageJson.scripts.postinstall) {
    packageJson.scripts.postinstall = 'prisma generate';
    console.log('✅ Added postinstall script to package.json');
  } else {
    console.log('⚠️ postinstall script already exists:', packageJson.scripts.postinstall);
  }
  
  // Write back to package.json with proper formatting
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json updated successfully');
  
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
  console.log('\n📝 Manual fix required:');
  console.log('Add this line to your package.json scripts section:');
  console.log('"postinstall": "prisma generate"');
}