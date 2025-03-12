/*
  # Create credentials and groups tables

  1. New Tables
    - `credentials`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `value` (text, required)
      - `type` (text, required)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)
    - `credential_groups`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

  2. Changes
    - Add `group_id` to credentials table referencing credential_groups

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create credentials table first
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS on credentials
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Create credential groups table
CREATE TABLE IF NOT EXISTS credential_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

-- Add group_id to credentials table
ALTER TABLE credentials 
ADD COLUMN group_id uuid REFERENCES credential_groups(id);

-- Enable RLS on credential_groups
ALTER TABLE credential_groups ENABLE ROW LEVEL SECURITY;

-- Policies for credential groups
CREATE POLICY "Users can create their own credential groups"
  ON credential_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own credential groups"
  ON credential_groups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credential groups"
  ON credential_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credential groups"
  ON credential_groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for credentials
CREATE POLICY "Users can create their own credentials"
  ON credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own credentials"
  ON credentials
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    group_id IN (
      SELECT id FROM credential_groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own credentials"
  ON credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);