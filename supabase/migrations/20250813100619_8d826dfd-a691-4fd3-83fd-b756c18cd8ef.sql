-- Add phone number and customer name columns to mpesa_payments table
ALTER TABLE public.mpesa_payments 
ADD COLUMN phone_number TEXT,
ADD COLUMN customer_name TEXT;