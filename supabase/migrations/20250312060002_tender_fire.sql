/*
  # Add modified_at column to credentials table

  1. Changes
    - Add modified_at timestamp column to credentials table
    - Add trigger to automatically update modified_at on row updates
    - Backfill existing rows with created_at as modified_at

  2. Technical Details
    - Uses timestamptz for timezone awareness
    - Trigger updates modified_at on any column change
    - Default value matches created_at for existing rows
*/

-- Add modified_at column
ALTER TABLE credentials 
ADD COLUMN modified_at timestamptz DEFAULT now();

-- Update existing rows to set modified_at = created_at
UPDATE credentials 
SET modified_at = created_at;

-- Make modified_at NOT NULL after backfill
ALTER TABLE credentials 
ALTER COLUMN modified_at SET NOT NULL;

-- Create function for updating modified_at
CREATE OR REPLACE FUNCTION update_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update modified_at
CREATE TRIGGER update_credentials_modified_at
    BEFORE UPDATE ON credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_at();