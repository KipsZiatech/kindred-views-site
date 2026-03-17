-- Create referrals table to track referral relationships and bonuses
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_phone TEXT NOT NULL,
  referred_phone TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  bonus_amount NUMERIC NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_phone)
);

-- Add referral_code column to user_savings for each user's unique code
ALTER TABLE public.user_savings ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE public.user_savings ADD COLUMN referral_earnings NUMERIC NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals
CREATE POLICY "Users can view their referrals by phone" 
ON public.referrals 
FOR SELECT 
USING (true);

CREATE POLICY "Allow referral insertion" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow referral updates" 
ON public.referrals 
FOR UPDATE 
USING (true);