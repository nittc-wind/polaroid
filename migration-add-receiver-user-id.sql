-- Migration: Add receiver_user_id column to photos table
-- Date: 2025-01-21
-- Description: Add receiver_user_id to support authenticated user photo receiving

-- Add receiver_user_id column
ALTER TABLE photos 
ADD COLUMN receiver_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_photos_receiver_user_id ON photos(receiver_user_id);

-- Add constraint to ensure either receiver_user_id or receiver_name is set (but not both)
-- when photo is received
ALTER TABLE photos 
ADD CONSTRAINT chk_receiver_exclusive 
CHECK (
  (is_received = false) OR
  (is_received = true AND (
    (receiver_user_id IS NOT NULL AND receiver_name IS NULL) OR
    (receiver_user_id IS NULL AND receiver_name IS NOT NULL)
  ))
);

-- Comment the columns for documentation
COMMENT ON COLUMN photos.receiver_user_id IS 'User ID of authenticated user who received the photo';
COMMENT ON COLUMN photos.receiver_name IS 'Name of unauthenticated user who received the photo';
