-- Add user_id column to associate payments with users
ALTER TABLE public.mpesa_payments 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing payments to have a placeholder user_id (you may want to handle this differently)
-- For now, we'll leave existing records with NULL user_id

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.mpesa_payments;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.mpesa_payments;

-- Create secure RLS policies that only allow users to see their own payments
CREATE POLICY "Users can insert their own payments" 
ON public.mpesa_payments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payments" 
ON public.mpesa_payments 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
ON public.mpesa_payments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all payments (optional - remove if not needed)
-- CREATE POLICY "Admins can view all payments" 
-- ON public.mpesa_payments 
-- FOR ALL 
-- TO authenticated
-- USING (EXISTS (
--   SELECT 1 FROM auth.users 
--   WHERE auth.users.id = auth.uid() 
--   AND auth.users.raw_user_meta_data->>'role' = 'admin'
-- ));