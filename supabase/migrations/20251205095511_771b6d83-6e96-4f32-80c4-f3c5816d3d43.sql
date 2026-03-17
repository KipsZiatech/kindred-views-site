-- Create user_savings table to track savings deposits
CREATE TABLE public.user_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  national_id TEXT,
  full_name TEXT,
  total_savings NUMERIC NOT NULL DEFAULT 0,
  loan_limit_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create savings_transactions table to track individual deposits
CREATE TABLE public.savings_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_savings_id UUID REFERENCES public.user_savings(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL DEFAULT 'deposit',
  loan_application_id UUID REFERENCES public.loan_applications(id),
  mpesa_transaction_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_savings
CREATE POLICY "Users can view their savings by phone" 
ON public.user_savings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow savings insertion" 
ON public.user_savings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow savings updates" 
ON public.user_savings 
FOR UPDATE 
USING (true);

-- RLS policies for savings_transactions
CREATE POLICY "Users can view their transactions by phone" 
ON public.savings_transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow transaction insertion" 
ON public.savings_transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow transaction updates" 
ON public.savings_transactions 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_savings_updated_at
BEFORE UPDATE ON public.user_savings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint on phone_number for user_savings
CREATE UNIQUE INDEX idx_user_savings_phone ON public.user_savings(phone_number);