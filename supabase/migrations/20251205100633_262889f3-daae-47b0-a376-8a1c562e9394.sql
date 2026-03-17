-- Add column to track if referred user completed a loan repayment
ALTER TABLE public.referrals ADD COLUMN loan_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.referrals ADD COLUMN loan_completed_at TIMESTAMP WITH TIME ZONE;

-- Update default bonus amount to 300
ALTER TABLE public.referrals ALTER COLUMN bonus_amount SET DEFAULT 300;