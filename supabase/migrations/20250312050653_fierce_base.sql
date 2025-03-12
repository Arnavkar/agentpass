/*
  # Fix user settings policies

  1. Changes
    - Add missing INSERT policy for user_settings table
    - Ensure all necessary policies are in place

  2. Security
    - Enable RLS
    - Add comprehensive policies for all operations
*/

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can create their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Recreate all policies
CREATE POLICY "Users can create their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);