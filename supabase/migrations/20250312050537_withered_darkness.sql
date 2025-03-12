/*
  # Add INSERT policy for user settings

  1. Changes
    - Add INSERT policy for user_settings table to allow users to create their initial settings

  2. Security
    - Users can only create settings for themselves
*/

CREATE POLICY "Users can create their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);