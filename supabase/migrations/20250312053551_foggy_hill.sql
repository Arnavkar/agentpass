/*
  # Add encryption functions
  
  1. New Functions
    - `generate_key_pair`: Creates a new encryption key pair for a user
    - `encrypt_value`: Encrypts a value using a specific key
    - `decrypt_value`: Decrypts a value using a specific key
    
  2. Security
    - Functions are only accessible to authenticated users
    - Users can only encrypt/decrypt with their own keys
*/

-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table for storing encryption keys
CREATE TABLE IF NOT EXISTS encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  private_key text NOT NULL,
  public_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on encryption_keys
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for encryption_keys
CREATE POLICY "Users can only access their own keys"
  ON encryption_keys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate a new key pair
CREATE OR REPLACE FUNCTION generate_key_pair(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_key_id uuid;
BEGIN
  -- Verify the user is operating on their own keys
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Generate key pair
  WITH new_keys AS (
    SELECT 
      gen_random_uuid() AS id,
      encode(gen_random_bytes(32), 'base64') AS private_key,
      encode(gen_random_bytes(32), 'base64') AS public_key
  )
  INSERT INTO encryption_keys (id, user_id, private_key, public_key)
  SELECT 
    id,
    user_id,
    private_key,
    public_key
  FROM new_keys
  RETURNING id INTO new_key_id;

  RETURN new_key_id;
END;
$$;

-- Function to encrypt a value
CREATE OR REPLACE FUNCTION encrypt_value(value text, key_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key encryption_keys%ROWTYPE;
BEGIN
  -- Get the encryption key and verify ownership
  SELECT * INTO encryption_key
  FROM encryption_keys
  WHERE id = key_id AND user_id = auth.uid();
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Key not found or not authorized';
  END IF;

  -- Encrypt the value using pgcrypto
  RETURN encode(
    encrypt_iv(
      value::bytea,
      decode(encryption_key.private_key, 'base64'),
      decode(encryption_key.public_key, 'base64'),
      'aes-cbc'
    ),
    'base64'
  );
END;
$$;

-- Function to decrypt a value
CREATE OR REPLACE FUNCTION decrypt_value(encrypted_value text, key_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key encryption_keys%ROWTYPE;
BEGIN
  -- Get the encryption key and verify ownership
  SELECT * INTO encryption_key
  FROM encryption_keys
  WHERE id = key_id AND user_id = auth.uid();
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Key not found or not authorized';
  END IF;

  -- Decrypt the value using pgcrypto
  RETURN convert_from(
    decrypt_iv(
      decode(encrypted_value, 'base64'),
      decode(encryption_key.private_key, 'base64'),
      decode(encryption_key.public_key, 'base64'),
      'aes-cbc'
    ),
    'utf8'
  );
END;
$$;