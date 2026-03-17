-- Update RLS policy to allow unauthenticated inserts for payment verification
-- but keep view access restricted to authenticated users only
DROP POLICY IF EXISTS "Only authenticated users can insert payments" ON public.mpesa_payments;

CREATE POLICY "Anyone can insert payments" 
ON public.mpesa_payments 
FOR INSERT 
WITH CHECK (true);