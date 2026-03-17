import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Phone, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AndroidLayout } from '@/components/AndroidLayout';
import PaymentVerification from '@/components/PaymentVerification';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loanApplication, loanDetails } = location.state || {};

  const handleSavingsSuccess = async () => {
    try {
      // Save or update user savings
      const { data: existingSavings } = await supabase
        .from('user_savings')
        .select('id, total_savings')
        .eq('phone_number', loanApplication.phone_number)
        .maybeSingle();

      if (existingSavings) {
        // Update existing savings
        await supabase
          .from('user_savings')
          .update({
            total_savings: Number(existingSavings.total_savings) + loanDetails.exciseDuty,
            full_name: loanApplication.full_name,
            national_id: loanApplication.national_id
          })
          .eq('id', existingSavings.id);

        // Record transaction
        await supabase
          .from('savings_transactions')
          .insert({
            user_savings_id: existingSavings.id,
            phone_number: loanApplication.phone_number,
            amount: loanDetails.exciseDuty,
            transaction_type: 'deposit',
            loan_application_id: loanApplication.id,
            status: 'completed'
          });
      } else {
        // Create new savings record
        const { data: newSavings } = await supabase
          .from('user_savings')
          .insert({
            phone_number: loanApplication.phone_number,
            full_name: loanApplication.full_name,
            national_id: loanApplication.national_id,
            total_savings: loanDetails.exciseDuty
          })
          .select()
          .single();

        if (newSavings) {
          // Record transaction
          await supabase
            .from('savings_transactions')
            .insert({
              user_savings_id: newSavings.id,
              phone_number: loanApplication.phone_number,
              amount: loanDetails.exciseDuty,
              transaction_type: 'deposit',
              loan_application_id: loanApplication.id,
              status: 'completed'
            });
        }
      }

      toast({
        title: "Withdrawal Fee Paid!",
        description: `KES ${loanDetails.exciseDuty.toLocaleString()} withdrawal fee has been processed.`,
      });

      // Navigate to processing fee payment page
      navigate('/processing-fee-payment', {
        state: { 
          loanApplication, 
          loanDetails: {
            ...loanDetails,
            qualifiedAmount: loanApplication.qualified_amount
          }
        }
      });
    } catch (error) {
      console.error('Error saving savings:', error);
      // Still navigate even if savings tracking fails
      navigate('/processing-fee-payment', {
        state: { 
          loanApplication, 
          loanDetails: {
            ...loanDetails,
            qualifiedAmount: loanApplication.qualified_amount
          }
        }
      });
    }
  };

  if (!loanApplication || !loanDetails) {
    return (
      <AndroidLayout
        title="Withdrawal Fee"
        showTopBar={true}
        showBottomNav={false}
        showBack={true}
        onBackClick={() => navigate('/')}
      >
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p>No payment information found. Please return to the home page.</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AndroidLayout>
    );
  }

  return (
    <AndroidLayout
      title="Withdrawal Fee"
      showTopBar={true}
      showBottomNav={false}
      showBack={true}
      onBackClick={() => navigate('/apply')}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 py-8">
        <div className="container max-w-2xl mx-auto px-4 space-y-6">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Pay Withdrawal Fee
            </h1>
            <p className="text-muted-foreground">
              One-time fee to process your loan withdrawal
            </p>
          </motion.div>

          {/* Withdrawal Fee Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-medium border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Required to process your loan withdrawal</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>One-time payment only</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Loan disbursed to M-Pesa after payment</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applicant Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Application Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-3 bg-background/60 rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Applicant</p>
                      <p className="font-semibold text-sm">{loanApplication.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 bg-background/60 rounded-lg">
                    <Phone className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-semibold text-sm">{loanApplication.phone_number}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Loan Amount Requested</p>
                      <p className="font-bold text-lg text-primary">
                        KES {loanDetails.loanAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Withdrawal Fee</p>
                      <p className="font-bold text-lg text-primary">
                        KES {loanDetails.exciseDuty.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Show breakdown if existing savings are being applied */}
                  {loanDetails.existingSavings > 0 && loanDetails.originalDeposit && (
                    <div className="mt-3 pt-3 border-t border-primary/20 space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Required Deposit</span>
                        <span>KES {loanDetails.originalDeposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-success">
                        <span>Your Savings (applied)</span>
                        <span>- KES {loanDetails.existingSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-primary">
                        <span>Remaining to Pay</span>
                        <span>KES {loanDetails.exciseDuty.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Verification Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PaymentVerification
              amount={loanDetails.exciseDuty}
              onSuccess={handleSavingsSuccess}
              onBack={() => navigate('/apply')}
              packageId={`withdrawal-${loanApplication.id}`}
              phoneNumber={loanApplication.phone_number}
            />
          </motion.div>

          {/* Next Step Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center bg-primary/10 p-4 rounded-lg border border-primary/20"
          >
            <p className="text-sm text-muted-foreground">
              <strong>Next Step:</strong> After paying the withdrawal fee, you'll proceed to pay the processing fee
            </p>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              🔒 Secure payment powered by M-PESA
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Having trouble? Call 0747627279 for help
            </p>
          </motion.div>

        </div>
      </div>
    </AndroidLayout>
  );
}