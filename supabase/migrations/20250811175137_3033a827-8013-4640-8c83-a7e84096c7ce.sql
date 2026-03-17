-- Update mpesa_payments table structure for non-authenticated payments
-- Remove user_id requirement and add new fields for paybill payments

-- First, drop existing RLS policies that require authentication
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.mpesa_payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.mpesa_payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.mpesa_payments;

-- Add new columns for paybill payment verification
ALTER TABLE public.mpesa_payments 
ADD COLUMN IF NOT EXISTS transaction_code TEXT,
ADD COLUMN IF NOT EXISTS account_name TEXT,
ADD COLUMN IF NOT EXISTS paybill_number TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS package_id TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- Make user_id nullable since we're removing authentication requirement
ALTER TABLE public.mpesa_payments ALTER COLUMN user_id DROP NOT NULL;

-- Create new RLS policies for public access (no authentication required)
CREATE POLICY "Anyone can insert payments" 
ON public.mpesa_payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view payments" 
ON public.mpesa_payments 
FOR SELECT 
USING (true);

-- Add index for better performance on transaction_code lookups
CREATE INDEX IF NOT EXISTS idx_mpesa_payments_transaction_code ON public.mpesa_payments(transaction_code);
CREATE INDEX IF NOT EXISTS idx_mpesa_payments_paybill_number ON public.mpesa_payments(paybill_number);