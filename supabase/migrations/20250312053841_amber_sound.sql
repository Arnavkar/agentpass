/*
  # Revert encryption changes
  
  1. Changes
    - Drop encryption_keys table and related functions
    - Revert credentials and user_settings tables to use plain values
*/

-- Drop encryption functions if they exist
DROP FUNCTION IF EXISTS decrypt_value;
DROP FUNCTION IF EXISTS encrypt_value;
DROP FUNCTION IF EXISTS generate_key_pair;

-- Drop encryption_keys table if it exists
DROP TABLE IF EXISTS encryption_keys;

-- Modify credentials table to use plain values
ALTER TABLE credentials 
  DROP COLUMN IF EXISTS encryption_key_id,
  DROP COLUMN IF EXISTS encrypted_value,
  ADD COLUMN IF NOT EXISTS value text NOT NULL;

-- Modify user_settings table
ALTER TABLE user_settings
  DROP COLUMN IF EXISTS encryption_key_id,
  DROP COLUMN IF EXISTS encrypted_api_key;