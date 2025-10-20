-- Add image fields to teams table
-- Run this SQL in pgAdmin or psql

-- Add image_url column (for external URLs)
ALTER TABLE teams 
ADD COLUMN image_url VARCHAR(300) NULL;

-- Add image column (for uploaded files)
ALTER TABLE teams 
ADD COLUMN image VARCHAR(100) NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teams';
