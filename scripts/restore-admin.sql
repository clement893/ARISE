-- Script SQL to restore admin permissions for clement@clementroy.work
-- Run this directly on your PostgreSQL database

-- First, check current status
SELECT id, email, "firstName", "lastName", role, "isActive" 
FROM "User" 
WHERE email = 'clement@clementroy.work';

-- Update to admin
UPDATE "User" 
SET role = 'admin', "isActive" = true
WHERE email = 'clement@clementroy.work';

-- Verify the update
SELECT id, email, "firstName", "lastName", role, "isActive" 
FROM "User" 
WHERE email = 'clement@clementroy.work';

