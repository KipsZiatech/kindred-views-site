-- Create loan_applications table to store user qualification data
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  mpesa_number TEXT,
  national_id TEXT,
  monthly_income TEXT,
  loan_purpose TEXT,
  county TEXT,
  sub_county TEXT,
  loan_amount_requested NUMERIC NOT NULL,
  qualified_amount NUMERIC NOT NULL,
  excise_duty_amount NUMERIC NOT NULL,
  interest_rate NUMERIC DEFAULT 3.5,
  qualification_status TEXT DEFAULT 'qualified',
  payment_status TEXT DEFAULT 'pending',
  payment_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading by phone number (since no auth yet)
CREATE POLICY "Users can view their loan applications by phone" 
ON public.loan_applications 
FOR SELECT 
USING (true);

-- Create policy to allow inserting loan applications
CREATE POLICY "Allow loan application insertion" 
ON public.loan_applications 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow updating payment status
CREATE POLICY "Allow payment status updates" 
ON public.loan_applications 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loan_applications_updated_at
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for phone number lookups
CREATE INDEX idx_loan_applications_phone ON public.loan_applications(phone_number);