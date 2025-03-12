/*
  # Add RLS policies for credential_groups table

  1. Security
    - Enable RLS on credential_groups table
    - Add policies for authenticated users to:
      - Create their own groups
      - View their own groups
      - Update their own groups
      - Delete their own groups
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own credential groups" ON credential_groups;
DROP POLICY IF EXISTS "Users can view their own credential groups" ON credential_groups;
DROP POLICY IF EXISTS "Users can update their own credential groups" ON credential_groups;
DROP POLICY IF EXISTS "Users can delete their own credential groups" ON credential_groups;

-- Enable RLS
ALTER TABLE credential_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
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