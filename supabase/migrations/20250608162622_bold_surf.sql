/*
  # Add authenticated user write policy for contact submissions

  1. Security Updates
    - Add policy for authenticated users to insert contact submissions
    - This allows the form to work when users are authenticated
    - Maintains existing anonymous insert policy for public form access

  2. Policy Details
    - Authenticated users can insert new contact submissions
    - No restrictions on the data they can submit
    - Complements existing anonymous insert policy
*/

-- Add policy for authenticated users to insert contact submissions
CREATE POLICY IF NOT EXISTS "Authenticated users can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the policy is properly applied
COMMENT ON POLICY "Authenticated users can submit contact form" ON contact_submissions 
IS 'Allows authenticated users to submit contact form data';