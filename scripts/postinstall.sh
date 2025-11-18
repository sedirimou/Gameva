#!/bin/bash
# Prisma postinstall script for Vercel deployment
echo "Running Prisma generate for deployment..."
npx prisma generate
echo "Prisma client generated successfully!"