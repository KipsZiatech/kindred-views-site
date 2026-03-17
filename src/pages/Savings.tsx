import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PiggyBank, 
  TrendingUp, 
  Plus, 
  History, 
  ArrowRight, 
  Shield, 
  Sparkles,
  Phone,
  RefreshCw,
  Gift,
  Copy,
  Share2,
  Users,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AndroidLayout } from '@/components/AndroidLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PaymentVerification from '@/components/PaymentVerification';
import { calculateLoanDetails, calculateSavingsBonus, LOAN_CONSTANTS } from '@/lib/loanCalculations';

interface SavingsTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  status: string;
  created_at: string;
}

interface UserSavings {
  id: string;
  total_savings: number;
  phone_number: string;
  full_name: string | null;
  national_id: string | null;
  referral_code: string | null;
  referral_earnings: number;
}

interface Referral {
  id: string;
  referred_phone: string;
  bonus_amount: number;
  status: string;
  created_at: string;
  loan_completed: boolean;
  loan_completed_at: string | null;
}

export default function Savings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingLoan, setIsProcessingLoan] = useState(false);
  const [userSavings, setUserSavings] = useState<UserSavings | null>(null);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Generate unique referral code
  const generateReferralCode = (phone: string) => {
    const suffix = phone.slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SHWARI${suffix}${random}`;
  };

  const fetchSavings = async () => {
    if (!phoneNumber) return;
    
    setIsLoading(true);
    try {
      // Fetch user savings
      const { data: savingsData, error: savingsError } = await supabase
        .from('user_savings')
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

      if (savingsError) throw savingsError;

      if (savingsData) {
        // Generate referral code if not exists
        if (!savingsData.referral_code) {
          const newCode = generateReferralCode(phoneNumber);
          await supabase
            .from('user_savings')
            .update({ referral_code: newCode })
            .eq('id', savingsData.id);
          savingsData.referral_code = newCode;
        }
        
        setUserSavings(savingsData as UserSavings);
        
        // Fetch transactions
        const { data: txData, error: txError } = await supabase
          .from('savings_transactions')
          .select('*')
          .eq('phone_number', phoneNumber)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!txError && txData) {
          setTransactions(txData);
        }

        // Fetch referrals made by this user
        const { data: referralData } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_phone', phoneNumber)
          .order('created_at', { ascending: false });

        if (referralData) {
          setReferrals(referralData as Referral[]);
        }
      } else {
        setUserSavings(null);
        setTransactions([]);
        setReferrals([]);
      }
    } catch (error) {
      console.error('Error fetching savings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch savings data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (userSavings?.referral_code) {
      navigator.clipboard.writeText(userSavings.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const shareReferralCode = async () => {
    if (userSavings?.referral_code && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Shwari M-Pesa Loans',
          text: `Use my referral code ${userSavings.referral_code} to get KES 300 bonus savings when you join Shwari M-Pesa Loans!`,
          url: 'https://www.shwarimpesa.co.ke/',
        });
      } catch (error) {
        copyReferralCode();
      }
    } else {
      copyReferralCode();
    }
  };

  // Calculate referral bonus based on completed referrals
  const calculateReferralBonus = (completedReferrals: number) => {
    // KES 500 bonus if 10+ successful referrals (borrowed and repaid)
    return completedReferrals >= 10 ? 500 : 300;
  };

  const completedReferrals = referrals.filter(r => r.loan_completed).length;

  const applyReferralCode = async () => {
    if (!referralCodeInput || !phoneNumber) return;
    
    try {
      // Check if user already used a referral
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_phone', phoneNumber)
        .maybeSingle();

      if (existingReferral) {
        toast({
          title: "Already Used",
          description: "You have already used a referral code",
          variant: "destructive"
        });
        return;
      }

      // Find referrer by code
      const { data: referrer } = await supabase
        .from('user_savings')
        .select('*')
        .eq('referral_code', referralCodeInput.toUpperCase())
        .maybeSingle();

      if (!referrer) {
        toast({
          title: "Invalid Code",
          description: "Referral code not found",
          variant: "destructive"
        });
        return;
      }

      if (referrer.phone_number === phoneNumber) {
        toast({
          title: "Invalid",
          description: "You cannot use your own referral code",
          variant: "destructive"
        });
        return;
      }

      // Check referrer's completed referrals to determine bonus
      const { data: referrerReferrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_phone', referrer.phone_number)
        .eq('loan_completed', true);

      const referrerCompletedCount = referrerReferrals?.length || 0;
      const bonusAmount = referrerCompletedCount >= 10 ? 500 : 300;

      // Create referral record (pending until referred user completes a loan)
      await supabase
        .from('referrals')
        .insert({
          referrer_phone: referrer.phone_number,
          referred_phone: phoneNumber,
          referral_code: referralCodeInput.toUpperCase(),
          bonus_amount: bonusAmount,
          status: 'pending',
          loan_completed: false
        });

      // Credit referred user immediately with KES 300 bonus
      // Referrer gets bonus when referred user completes loan repayment
      // Credit referrer
      await supabase
        .from('user_savings')
        .update({
          total_savings: Number(referrer.total_savings) + bonusAmount,
          referral_earnings: Number(referrer.referral_earnings || 0) + bonusAmount
        })
        .eq('id', referrer.id);

      // Credit referred user (if they have savings)
      if (userSavings) {
        await supabase
          .from('user_savings')
          .update({
            total_savings: Number(userSavings.total_savings) + 300
          })
          .eq('id', userSavings.id);
      }

      toast({
        title: "Bonus Applied!",
        description: "KES 300 has been added to your savings!",
      });

      setShowReferralInput(false);
      setReferralCodeInput('');
      fetchSavings();
    } catch (error) {
      console.error('Error applying referral:', error);
      toast({
        title: "Error",
        description: "Failed to apply referral code",
        variant: "destructive"
      });
    }
  };

  // Handle direct loan application for users with savings
  const handleGetLoan = async () => {
    if (!userSavings || !loanBonus) return;
    
    setIsProcessingLoan(true);
    
    try {
      // Check for existing pending loan application
      const { data: existingLoan } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .in('payment_status', ['pending', 'savings_verified', 'completed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingLoan) {
        // If processing fee is paid, go to success
        if (existingLoan.payment_status === 'completed' && existingLoan.disbursement_status === 'completed') {
          navigate('/loan-disbursement-success', {
            state: {
              loanApplication: existingLoan,
              loanDetails: {
                loanAmount: existingLoan.loan_amount_requested,
                repayableAmount: existingLoan.repayment_amount,
                processingFee: 0
              }
            }
          });
          return;
        }
        
        // If has pending loan, go to processing fee payment
        const calculatedDetails = calculateLoanDetails(
          existingLoan.loan_amount_requested, 
          existingLoan.qualified_amount || loanBonus.totalLimit
        );
        
        navigate('/processing-fee-payment', {
          state: {
            loanApplication: existingLoan,
            loanDetails: {
              loanAmount: existingLoan.loan_amount_requested,
              repayableAmount: existingLoan.repayment_amount,
              exciseDuty: existingLoan.excise_duty_amount,
              processingFee: calculatedDetails.processingFee,
              qualifiedAmount: existingLoan.qualified_amount
            }
          }
        });
        return;
      }

      // Create new loan application using centralized calculations
      const loanAmount = loanBonus.totalLimit;
      const loanCalc = calculateLoanDetails(loanAmount, loanBonus.totalLimit);

      const { data: newLoan, error } = await supabase
        .from('loan_applications')
        .insert({
          full_name: userSavings.full_name || 'Customer',
          phone_number: phoneNumber,
          mpesa_number: phoneNumber,
          national_id: userSavings.national_id || null,
          loan_amount_requested: loanAmount,
          qualified_amount: loanBonus.totalLimit,
          excise_duty_amount: loanCalc.savingsDeposit,
          interest_rate: LOAN_CONSTANTS.INTEREST_RATE,
          repayment_amount: loanCalc.repayableAmount,
          qualification_status: 'qualified',
          payment_status: 'savings_verified' // Skip savings since they already have it
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating loan:', error);
        toast({
          title: "Error",
          description: "Failed to create loan application",
          variant: "destructive"
        });
        return;
      }

      // Navigate to processing fee payment
      navigate('/processing-fee-payment', {
        state: {
          loanApplication: newLoan,
          loanDetails: {
            loanAmount: loanAmount,
            repayableAmount: loanCalc.repayableAmount,
            exciseDuty: loanCalc.savingsDeposit,
            processingFee: loanCalc.processingFee,
            qualifiedAmount: loanBonus.totalLimit
          }
        }
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingLoan(false);
    }
  };

  const handleAddSavings = () => {
    const amount = Number(addAmount);
    if (amount < 99 || amount > 180) {
      toast({
        title: "Invalid Amount",
        description: "Savings deposit must be between KES 99 and KES 180",
        variant: "destructive"
      });
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    const amount = Number(addAmount);
    
    try {
      if (userSavings) {
        // Update existing savings
        await supabase
          .from('user_savings')
          .update({
            total_savings: Number(userSavings.total_savings) + amount
          })
          .eq('id', userSavings.id);

        // Record transaction
        await supabase
          .from('savings_transactions')
          .insert({
            user_savings_id: userSavings.id,
            phone_number: phoneNumber,
            amount: amount,
            transaction_type: 'deposit',
            status: 'completed'
          });
      } else {
        // Create new savings record
        const { data: newSavings } = await supabase
          .from('user_savings')
          .insert({
            phone_number: phoneNumber,
            total_savings: amount
          })
          .select()
          .single();

        if (newSavings) {
          await supabase
            .from('savings_transactions')
            .insert({
              user_savings_id: newSavings.id,
              phone_number: phoneNumber,
              amount: amount,
              transaction_type: 'deposit',
              status: 'completed'
            });
        }
      }

      toast({
        title: "Savings Added!",
        description: `KES ${amount.toLocaleString()} has been added to your savings.`,
      });

      setShowPayment(false);
      setShowAddSavings(false);
      setAddAmount('');
      fetchSavings();
    } catch (error) {
      console.error('Error adding savings:', error);
    }
  };

  const loanBonus = userSavings ? calculateSavingsBonus(Number(userSavings.total_savings)) : null;

  // If showing payment form
  if (showPayment && addAmount) {
    return (
      <AndroidLayout title="Add Savings" showBack onBackClick={() => setShowPayment(false)} showBottomNav={false}>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <PiggyBank className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold">Add to Savings</h2>
            <p className="text-muted-foreground">Amount: KES {Number(addAmount).toLocaleString()}</p>
          </div>
          
          <PaymentVerification
            amount={Number(addAmount)}
            onSuccess={handlePaymentSuccess}
            onBack={() => setShowPayment(false)}
            packageId={`savings-add-${Date.now()}`}
            phoneNumber={phoneNumber}
          />
        </div>
      </AndroidLayout>
    );
  }

  return (
    <AndroidLayout title="My Savings" showBack onBackClick={() => navigate('/')}>
      <div className="p-4 pb-32 space-y-6">
        {/* Phone Number Input (if not loaded) */}
        {!userSavings && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>View Your Savings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter your M-Pesa Number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g., 0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button 
                  onClick={fetchSavings} 
                  disabled={!phoneNumber || isLoading}
                  className="w-full h-12"
                >
                  {isLoading ? 'Loading...' : 'View Savings'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {userSavings && (
          <>
            {/* Savings Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-medium bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PiggyBank className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Total Savings</p>
                    <p className="text-4xl font-bold text-primary mb-2">
                      KES {Number(userSavings.total_savings).toLocaleString()}
                    </p>
                    {userSavings.full_name && (
                      <p className="text-sm text-muted-foreground">{userSavings.full_name}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Loan Limit Bonus Card */}
            {loanBonus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-medium border-success/20 bg-success/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center space-x-2 text-success">
                      <Sparkles className="h-5 w-5" />
                      <span>Loan Limit Bonus</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-success">+{loanBonus.bonusPercentage}%</p>
                        <p className="text-xs text-muted-foreground">Bonus Earned</p>
                      </div>
                      <div className="bg-background rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-primary">KES {loanBonus.totalLimit.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Your Loan Limit</p>
                      </div>
                    </div>
                    
                    <div className="bg-background rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress to next bonus</span>
                        <span className="font-medium">KES {loanBonus.nextMilestone.toLocaleString()} more</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-success rounded-full h-2 transition-all"
                          style={{ width: `${((500 - loanBonus.nextMilestone) / 500) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Save KES 500 more to get +10% loan limit bonus!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Single Primary Action Button - Context-Aware */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              {loanBonus && Number(userSavings.total_savings) >= 99 ? (
                // User has enough savings - show Get Loan button
                <Button
                  onClick={handleGetLoan}
                  disabled={isProcessingLoan}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  {isProcessingLoan ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Get Your Loan Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                // User needs more savings - show deposit button
                !showAddSavings ? (
                  <Button 
                    onClick={() => setShowAddSavings(true)}
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    <PiggyBank className="h-5 w-5 mr-2" />
                    Deposit Savings - KES {99 - Number(userSavings.total_savings)} more needed
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                ) : (
                  <Card className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Plus className="h-5 w-5 text-primary" />
                        <span>Add Savings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Amount to Add (KSh)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 99"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="h-12"
                          min="99"
                          max="180"
                        />
                        <p className="text-xs text-muted-foreground">Amount: KSh 99 - 180</p>
                      </div>
                      
                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {[99, 150, 180].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setAddAmount(amount.toString())}
                            className={addAmount === amount.toString() ? 'border-primary bg-primary/10' : ''}
                          >
                            KSh {amount}
                          </Button>
                        ))}
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowAddSavings(false);
                            setAddAmount('');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddSavings}
                          disabled={!addAmount || Number(addAmount) < 99 || Number(addAmount) > 180}
                          className="flex-1"
                        >
                          Proceed to Pay
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </motion.div>

            {/* Secondary Action - Start New Application */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Button 
                variant="outline"
                onClick={() => navigate('/apply')}
                className="w-full h-12 border-muted-foreground/30"
              >
                Start New Application
              </Button>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-primary" />
                    <span>Savings History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No transactions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.transaction_type === 'deposit' ? 'bg-success/20' : 'bg-warning/20'
                            }`}>
                              {tx.transaction_type === 'deposit' ? (
                                <TrendingUp className="h-5 w-5 text-success" />
                              ) : (
                                <TrendingUp className="h-5 w-5 text-warning rotate-180" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium capitalize">{tx.transaction_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${tx.transaction_type === 'deposit' ? 'text-success' : 'text-warning'}`}>
                              {tx.transaction_type === 'deposit' ? '+' : '-'}KSh {Number(tx.amount).toLocaleString()}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {tx.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Refresh Button */}
            <Button 
              variant="outline" 
              onClick={fetchSavings}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </>
        )}

        {/* No Savings Found */}
        {!isLoading && phoneNumber && !userSavings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-medium">
              <CardContent className="py-8 text-center">
                <PiggyBank className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Savings Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start saving today to unlock higher loan limits!
                </p>
                <Button onClick={() => navigate('/apply')}>
                  Apply for a Loan
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Section */}
        <Card className="shadow-medium border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">How Savings Bonuses Work</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Save KSh 500 → Get 10% loan limit bonus</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Save KSh 1,000 → Get 20% loan limit bonus</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>More savings = Higher borrowing power!</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AndroidLayout>
  );
}