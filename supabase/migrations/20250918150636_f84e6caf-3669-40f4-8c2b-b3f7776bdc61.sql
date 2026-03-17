-- Create table for storing user push notification subscriptions
CREATE TABLE public.user_push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for push subscriptions
CREATE POLICY "Anyone can insert push subscriptions" 
ON public.user_push_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view and update their own subscriptions by phone" 
ON public.user_push_subscriptions 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX idx_push_subscriptions_phone ON public.user_push_subscriptions(phone_number);
CREATE INDEX idx_push_subscriptions_active ON public.user_push_subscriptions(is_active);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.user_push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for notification logs and tracking
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  loan_application_id UUID,
  notification_type TEXT NOT NULL DEFAULT 'loan_reminder',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivery_status TEXT NOT NULL DEFAULT 'sent',
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notification logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for notification logs
CREATE POLICY "Service can manage notification logs" 
ON public.notification_logs 
FOR ALL 
USING (true);

-- Create indexes for notification logs
CREATE INDEX idx_notification_logs_phone ON public.notification_logs(phone_number);
CREATE INDEX idx_notification_logs_loan_app ON public.notification_logs(loan_application_id);
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs(sent_at);

-- Add foreign key reference to loan applications (optional, for tracking)
ALTER TABLE public.notification_logs 
ADD CONSTRAINT fk_notification_logs_loan_application 
FOREIGN KEY (loan_application_id) 
REFERENCES public.loan_applications(id) 
ON DELETE SET NULL;