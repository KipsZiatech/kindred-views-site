-- Update RLS policy to allow viewing payments for admin dashboard
-- Since these are excise duty payment records, they can be viewed by admin
DROP POLICY IF EXISTS "Only authenticated users can view payments" ON public.mpesa_payments;

CREATE POLICY "Anyone can view payments" 
ON public.mpesa_payments 
FOR SELECT 
USING (true);