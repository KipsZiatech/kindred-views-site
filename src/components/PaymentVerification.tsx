import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

interface PaymentVerificationProps {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
  packageId?: string;
  phoneNumber?: string;
  customerName?: string;
  paymentType?: string;
}

export default function PaymentVerification({ 
  amount = 0, 
  onSuccess, 
  onBack,
  packageId,
  phoneNumber,
  customerName,
  paymentType = 'Payment'
}: PaymentVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userPhone, setUserPhone] = useState(phoneNumber || '');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPollingPayment && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPollingPayment, countdown]);

  // Poll for payment status using direct query
  const pollPaymentStatus = async (requestId: string) => {
    setIsPollingPayment(true);
    setCountdown(120); // 2 minutes countdown
    const maxAttempts = 60; // Poll for 5 minutes (60 attempts x 5 seconds)
    let attempts = 0;

    const checkStatus = async (): Promise<void> => {
      try {
        // Query payment status directly (no authentication required)
        const response = await fetch(`https://xxfybuqajtejzthyszam.supabase.co/rest/v1/mpesa_payments?checkout_request_id=eq.${requestId}&select=payment_status,verified_at,amount`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZnlidXFhanRlanp0aHlzemFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTk3MDIsImV4cCI6MjA2OTg3NTcwMn0.aoIuzjssllzRnlDQRHTc3hfT8IF3y3XW7qkYHHt8p_M',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZnlidXFhanRlanp0aHlzemFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTk3MDIsImV4cCI6MjA2OTg3NTcwMn0.aoIuzjssllzRnlDQRHTc3hfT8IF3y3XW7qkYHHt8p_M',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Error checking payment status:', response.statusText);
          return;
        }

        const data = await response.json();
        
        // Check if we have data and verify payment completion
        if (data && Array.isArray(data) && data.length > 0) {
          const paymentData = data[0];
          const status = paymentData?.payment_status;
          const verifiedAt = paymentData?.verified_at;
          
          if (status === 'COMPLETED' && verifiedAt) {
            setPaymentSuccess(true);
            setIsPollingPayment(false);
            setCountdown(0);
            setTimeout(() => {
              onSuccess();
            }, 2000);
            return;
          } else if (status === 'FAILED' || status === 'CANCELLED') {
            setVerificationError('Payment was cancelled or failed. Please try again.');
            setIsPollingPayment(false);
            setCountdown(0);
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else {
          setVerificationError('Payment timeout. The M-Pesa prompt may have expired. Please try again.');
          setIsPollingPayment(false);
          setCountdown(0);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
        setVerificationError('Error checking payment status. Please try again.');
        setIsPollingPayment(false);
        setCountdown(0);
      }
    };

    checkStatus();
  };

  const initiateSTKPush = async () => {
    if (!userPhone.trim()) {
      setVerificationError('Please enter your phone number');
      return;
    }

    // Validate phone number format (Kenyan numbers)
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(userPhone)) {
      setVerificationError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setAttemptCount((prev) => prev + 1);

    try {
      // Format phone number to 254XXXXXXXXX
      let formattedPhone = userPhone.replace(/\s+/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '254' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('+254')) {
        formattedPhone = formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('254')) {
        formattedPhone = '254' + formattedPhone;
      }

      // Extract loan amount from packageId (format: loan-20000)
      const loanAmount = packageId?.replace('loan-', '') || '0';
      
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: formattedPhone,
          amount: amount,
          packageId: packageId,
          accountReference: `Excise Duty to get a loan of KES ${loanAmount}`,
          loanAmount: loanAmount,
          customerName: customerName || 'Unknown'
        }
      });

      if (error) {
        throw error;
      }

      console.log('STK Push invoke result:', { data, error });

      if (data.success) {
        setCheckoutRequestId(data.checkoutRequestId);
        setVerificationError('');
        // Start polling for payment status
        pollPaymentStatus(data.checkoutRequestId);
      } else {
        setVerificationError(data.message || 'STK Push failed. Please try again.');
      }
    } catch (error: any) {
      console.error('STK Push error:', error);
      const detail = error?.message || error?.context?.value?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      setVerificationError(`Failed to initiate payment: ${detail}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    setIsPollingPayment(false);
    setPaymentSuccess(false);
    setVerificationError('');
    setCheckoutRequestId('');
    setCountdown(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complete Your {paymentType}</h2>
        <p className="text-muted-foreground">
          Pay KES {amount?.toLocaleString() || '0'} via M-Pesa STK Push
        </p>
      </motion.div>

      {/* Payment Card */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>M-Pesa {paymentType}</span>
            <Badge variant="outline">KES {amount?.toLocaleString() || '0'}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {!paymentSuccess && !isPollingPayment ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Terms and Conditions */}
                <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 bg-accent/50 rounded-xl border border-border">
                  <Checkbox 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm">
                    I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a> and <a href="#" className="text-primary underline">Privacy Policy</a>
                  </span>
                </label>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone-number" className="text-sm">
                      M-Pesa Phone Number
                    </Label>
                    <input
                      id="phone-number"
                      type="tel"
                      placeholder="0712345678"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-input rounded-xl bg-background focus:border-primary focus:outline-none transition-colors"
                      disabled={isVerifying}
                    />
                  </div>
                  
                  <LoadingButton
                    onClick={initiateSTKPush}
                    disabled={!userPhone.trim() || isVerifying || !termsAccepted}
                    loading={isVerifying}
                    loadingText="Sending Payment Request..."
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    <Smartphone className="h-5 w-5 mr-2" />
                    Pay KES {amount?.toLocaleString() || '0'} Now
                  </LoadingButton>
                  
                  {!termsAccepted && (
                    <p className="text-xs text-muted-foreground text-center">
                      Please accept the terms and conditions to continue
                    </p>
                  )}

                  {attemptCount > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Attempt #{attemptCount + 1}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : isPollingPayment ? (
              <motion.div
                key="polling"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeDasharray={276.46}
                      strokeDashoffset={276.46 * (1 - countdown / 120)}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-primary mx-auto mb-1" />
                      <span className="text-lg font-bold">{formatTime(countdown)}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Check Your Phone Now!</h3>
                <p className="text-muted-foreground mb-2">
                  Enter your M-Pesa PIN to complete the payment
                </p>
                <p className="text-sm text-primary font-medium mb-4">
                  Waiting for confirmation...
                </p>
                
                <div className="bg-accent/50 rounded-lg p-4 text-left text-sm space-y-2">
                  <p className="font-medium">📱 Don't see the prompt?</p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Check if your phone has network</li>
                    <li>• Make sure M-Pesa is not blocked on your line</li>
                    <li>• Wait a few seconds, it may take time to arrive</li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cancel & Try Again
                </Button>
              </motion.div>
            ) : paymentSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <h3 className="text-xl font-bold text-success mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground mb-4">
                  Your payment of KES {amount?.toLocaleString()} has been received.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Redirecting...</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {verificationError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
              
              {!isPollingPayment && (
                <div className="mt-4 space-y-3">
                  <Button
                    onClick={handleRetry}
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Make sure you have enough M-Pesa balance and your phone is nearby
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isPollingPayment && !paymentSuccess && (
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
            disabled={isVerifying}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>🔒 Secure payment powered by M-PESA</p>
        <p>Having trouble? Call <a href="tel:+254700000000" className="text-primary underline">0700 000 000</a> for help</p>
      </div>
    </div>
  );
}
