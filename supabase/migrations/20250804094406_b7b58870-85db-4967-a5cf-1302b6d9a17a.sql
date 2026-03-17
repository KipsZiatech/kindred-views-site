-- Create table for storing verified M-Pesa payments
CREATE TABLE public.mpesa_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mpesa_message TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mpesa_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only authenticated users to view payments
CREATE POLICY "Only authenticated users can view payments" 
ON public.mpesa_payments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policy to allow only authenticated users to insert payments
CREATE POLICY "Only authenticated users can insert payments" 
ON public.mpesa_payments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mpesa_payments_updated_at
BEFORE UPDATE ON public.mpesa_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on amount queries
CREATE INDEX idx_mpesa_payments_amount ON public.mpesa_payments(amount);
CREATE INDEX idx_mpesa_payments_created_at ON public.mpesa_payments(created_at DESC);