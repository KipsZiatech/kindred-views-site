import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { registerUserForNotifications, notifyLoanApproved } from '@/lib/notifications';
import { calculateLoanDetails, calculateSavingsBonus, LOAN_CONSTANTS } from '@/lib/loanCalculations';
import { 
  User, 
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Star,
  CreditCard,
  Calculator,
  Clock,
  PiggyBank,
  Plus,
  TrendingUp,
  Sparkles,
  Phone,
  IdCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AndroidLayout } from './AndroidLayout';

interface FormData {
  fullName: string;
  mpesaNumber: string;
  nationalId: string;
}

interface LoanOffer {
  qualifiedAmount: number;
}

type FlowStep = 'form' | 'loan-selection';

export default function LoanEligibilityForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillData = location.state as { prefillPhone?: string; hasSavings?: boolean; savingsAmount?: number } | null;
  
  const [flowStep, setFlowStep] = useState<FlowStep>('form');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mpesaNumber: prefillData?.prefillPhone || '',
    nationalId: ''
  });
  const [loanOffer, setLoanOffer] = useState<LoanOffer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showEligibilityAnimation, setShowEligibilityAnimation] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  
  // Loan selection state
  const [loanAmount, setLoanAmount] = useState(0);
  const [loanAmountInput, setLoanAmountInput] = useState('');
  const interestRate = LOAN_CONSTANTS.INTEREST_RATE;
  
  // Savings state
  const [userSavings, setUserSavings] = useState<number>(0);
  const [isLoadingSavings, setIsLoadingSavings] = useState(false);

  // Fetch user savings when phone number is available
  useEffect(() => {
    const fetchUserSavings = async () => {
      if (!formData.mpesaNumber || flowStep !== 'loan-selection') return;
      
      setIsLoadingSavings(true);
      try {
        const { data, error } = await supabase
          .from('user_savings')
          .select('total_savings')
          .eq('phone_number', formData.mpesaNumber)
          .maybeSingle();
        
        if (data && !error) {
          setUserSavings(Number(data.total_savings) || 0);
        }
      } catch (error) {
        console.error('Error fetching savings:', error);
      } finally {
        setIsLoadingSavings(false);
      }
    };
    
    fetchUserSavings();
  }, [formData.mpesaNumber, flowStep]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.mpesaNumber.trim()) errors.mpesaNumber = 'M-Pesa number is required';
    if (!formData.nationalId.trim()) errors.nationalId = 'National ID is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateLoanOffer = (): LoanOffer => {
    const baseQualifiedAmount = Math.floor(Math.random() * (LOAN_CONSTANTS.MAX_LOAN_AMOUNT - LOAN_CONSTANTS.MIN_LOAN_AMOUNT + 1)) + LOAN_CONSTANTS.MIN_LOAN_AMOUNT;
    // Apply savings bonus using centralized function
    const { totalLimit } = calculateSavingsBonus(userSavings, baseQualifiedAmount);
    return { qualifiedAmount: Math.round(totalLimit) };
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setShowEligibilityAnimation(true);
    setAnimationStep(0);
    
    const totalSteps = 6;
    const stepDuration = 5000 / totalSteps; // 5 seconds total
    
    for (let i = 0; i < totalSteps; i++) {
      setAnimationStep(i);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
    
    const offer = generateLoanOffer();
    setLoanOffer(offer);
    setLoanAmount(0);
    setLoanAmountInput('');
    setShowEligibilityAnimation(false);
    setFlowStep('loan-selection');
    setIsSubmitting(false);
  };

  // Use centralized loan calculation utility
  const loanDetails = loanOffer ? calculateLoanDetails(loanAmount, loanOffer.qualifiedAmount) : null;

  // Handle loan amount input change
  const handleLoanAmountChange = (value: string) => {
    setLoanAmountInput(value);
    const numValue = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(numValue) && loanOffer) {
      const clampedValue = Math.min(Math.max(numValue, LOAN_CONSTANTS.MIN_LOAN_AMOUNT), loanOffer.qualifiedAmount);
      setLoanAmount(clampedValue);
    }
  };

  const handleLoanAmountBlur = () => {
    if (loanOffer) {
      const clampedValue = Math.min(Math.max(loanAmount, LOAN_CONSTANTS.MIN_LOAN_AMOUNT), loanOffer.qualifiedAmount);
      setLoanAmount(clampedValue);
      setLoanAmountInput(clampedValue.toString());
    }
  };

  // Check if user has sufficient savings to skip deposit
  const hasSufficientSavings = userSavings >= (loanDetails?.savingsDeposit || 0);
  
  // Calculate remaining deposit needed (deduct existing savings)
  const remainingDeposit = Math.max(0, (loanDetails?.savingsDeposit || 0) - userSavings);
  const hasPartialSavings = userSavings > 0 && !hasSufficientSavings;
  
  // Check if loan amount is valid
  const isValidLoanAmount = loanAmount >= LOAN_CONSTANTS.MIN_LOAN_AMOUNT && loanOffer && loanAmount <= loanOffer.qualifiedAmount;

  const handleProceedToPayment = async () => {
    if (!loanDetails || !loanOffer || !isValidLoanAmount) return;
    
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          full_name: formData.fullName,
          phone_number: formData.mpesaNumber,
          mpesa_number: formData.mpesaNumber,
          national_id: formData.nationalId,
          loan_amount_requested: loanDetails.loanAmount,
          qualified_amount: loanOffer.qualifiedAmount,
          excise_duty_amount: loanDetails.savingsDeposit,
          interest_rate: interestRate,
          repayment_amount: loanDetails.repayableAmount,
          qualification_status: 'qualified',
          payment_status: hasSufficientSavings ? 'savings_verified' : 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving loan application:', error);
        return;
      }

      // Register user for push notifications and send loan approved notification
      await registerUserForNotifications(formData.mpesaNumber);
      await notifyLoanApproved(formData.mpesaNumber, loanDetails.loanAmount, data.id);

      // If user has sufficient savings, skip directly to processing fee
      if (hasSufficientSavings) {
        navigate('/processing-fee-payment', {
          state: {
            loanApplication: data,
            loanDetails: {
              loanAmount: loanDetails.loanAmount,
              repayableAmount: loanDetails.repayableAmount,
              exciseDuty: loanDetails.savingsDeposit,
              processingFee: loanDetails.processingFee,
              qualifiedAmount: loanOffer.qualifiedAmount
            }
          }
        });
      } else {
        // Otherwise, go to savings deposit page with remaining amount
        navigate('/payment', {
          state: {
            loanApplication: data,
            loanDetails: {
              loanAmount: loanDetails.loanAmount,
              repayableAmount: loanDetails.repayableAmount,
              exciseDuty: remainingDeposit, // Only pay the remaining amount
              originalDeposit: loanDetails.savingsDeposit, // Full required deposit
              existingSavings: userSavings, // User's current savings
              processingFee: loanDetails.processingFee,
              qualifiedAmount: loanOffer.qualifiedAmount
            }
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStartNewApplication = () => {
    setFlowStep('form');
    setFormData({ fullName: '', mpesaNumber: '', nationalId: '' });
    setLoanOffer(null);
    setLoanAmount(LOAN_CONSTANTS.MIN_LOAN_AMOUNT);
  };

  const getHeaderTitle = () => {
    if (flowStep === 'loan-selection') return 'Select Loan Amount';
    return 'Quick Loan Application';
  };

  // Eligibility Animation
  if (showEligibilityAnimation) {
    const animationSteps = [
      'Checking eligibility',
      'Verifying details',
      'Processing loan application',
      'Calculating loan amount',
      'Checking excise duty & fees',
      'Awarding loan limit'
    ];
    
    const progressPercentage = Math.min(Math.round(((animationStep + 1) / animationSteps.length) * 100), 100);
    
    return (
      <AndroidLayout title="Processing Application">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8 w-full max-w-sm"
          >
            {/* Circular Progress with Percentage */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary"
                  initial={{ strokeDasharray: "0 352" }}
                  animate={{ strokeDasharray: `${(progressPercentage / 100) * 352} 352` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{progressPercentage}%</span>
              </div>
            </div>
            
            {/* Current Step Display */}
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {animationSteps[animationStep] || 'Finalizing...'}
              </p>
              <p className="text-sm text-muted-foreground">Please wait while we process your application</p>
            </div>
            
            {/* Steps Checklist */}
            <div className="space-y-3 text-left bg-card p-4 rounded-lg border">
              {animationSteps.map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  {animationStep > index ? (
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  ) : animationStep === index ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <span className={`text-sm ${
                    animationStep > index 
                      ? 'text-success font-medium' 
                      : animationStep === index 
                        ? 'text-primary font-medium' 
                        : 'text-muted-foreground'
                  }`}>
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </AndroidLayout>
    );
  }

  return (
    <AndroidLayout 
      title={getHeaderTitle()}
      showBack={flowStep === 'loan-selection'}
      onBackClick={flowStep === 'loan-selection' ? () => setFlowStep('form') : undefined}
    >
      <div className="p-4 pb-32">
        {flowStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-medium">2 Min Process</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium">Trusted</span>
              </div>
            </div>

            {/* Upfront Cost Information */}
            <Card className="shadow-medium bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="py-4">
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  What to Expect (Full Transparency)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white/60 dark:bg-card rounded-lg p-2">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">Step 1</p>
                    <p className="text-muted-foreground">Pay Excise Duty</p>
                    <p className="text-[10px] text-emerald-600">(KES 99-180)</p>
                  </div>
                  <div className="bg-white/60 dark:bg-card rounded-lg p-2">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">Step 2</p>
                    <p className="text-muted-foreground">Withdraw Loan</p>
                    <p className="text-[10px] text-emerald-600">(Instant M-Pesa)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Simple Form Card */}
            <Card className="shadow-lg border-2 border-primary/10 overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-primary/10 to-emerald-500/5">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <span>Your Details</span>
                  </div>
                  {/* Progress indicator */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        ([formData.fullName, formData.mpesaNumber, formData.nationalId]
                          .filter(v => v.trim() !== '').length / 3) * 100
                      )}%
                    </span>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${([formData.fullName, formData.mpesaNumber, formData.nationalId]
                            .filter(v => v.trim() !== '').length / 3) * 100}%` 
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </CardTitle>
                {/* Full width progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Form Progress</span>
                    <span>{[formData.fullName, formData.mpesaNumber, formData.nationalId].filter(v => v.trim() !== '').length} of 3 fields</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary via-emerald-500 to-success rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${([formData.fullName, formData.mpesaNumber, formData.nationalId]
                          .filter(v => v.trim() !== '').length / 3) * 100}%` 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium flex items-center">
                    Full Name <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => updateFormData('fullName', e.target.value)}
                      className={`h-12 pl-12 bg-muted/30 ${validationErrors.fullName ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30' : ''}`}
                    />
                    {formData.fullName && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                    )}
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-sm text-destructive flex items-center"><span className="mr-1">⚠</span>{validationErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpesaNumber" className="text-sm font-medium flex items-center">
                    M-Pesa Number <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="mpesaNumber"
                      type="tel"
                      placeholder="0712345678"
                      value={formData.mpesaNumber}
                      onChange={(e) => updateFormData('mpesaNumber', e.target.value)}
                      className={`h-12 pl-12 bg-muted/30 ${validationErrors.mpesaNumber ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30' : ''}`}
                    />
                    {formData.mpesaNumber && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                    )}
                  </div>
                  {validationErrors.mpesaNumber && (
                    <p className="text-sm text-destructive flex items-center"><span className="mr-1">⚠</span>{validationErrors.mpesaNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-sm font-medium flex items-center">
                    National ID Number <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="nationalId"
                      type="text"
                      placeholder="Enter your ID number"
                      value={formData.nationalId}
                      onChange={(e) => updateFormData('nationalId', e.target.value)}
                      className={`h-12 pl-12 bg-muted/30 ${validationErrors.nationalId ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30' : ''}`}
                    />
                    {formData.nationalId && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                    )}
                  </div>
                  {validationErrors.nationalId && (
                    <p className="text-sm text-destructive flex items-center"><span className="mr-1">⚠</span>{validationErrors.nationalId}</p>
                  )}
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-12 text-base"
                >
                  Check My Loan Limit
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Security Note */}
            <div className="text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Your data is encrypted and secure</span>
              </div>
            </div>
          </motion.div>
        )}

        {flowStep === 'loan-selection' && loanOffer && loanDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Congratulations */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              </motion.div>
              <h2 className="text-xl font-bold text-success mb-2">
                Congratulations, {formData.fullName}!
              </h2>
              <p className="text-muted-foreground">
                You qualify for up to <span className="font-bold text-primary">KES {loanOffer.qualifiedAmount.toLocaleString()}</span>
              </p>
              {userSavings > 0 && (
                <Badge className="mt-2 bg-success/10 text-success border-success/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  +{Math.floor(userSavings / 500) * 10}% Savings Bonus Applied
                </Badge>
              )}
            </div>

            {/* Loan Amount Selection - Interactive */}
            <Card className="shadow-medium overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span>How much do you need?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Savings-Based Instant Loan Suggestions */}
                {userSavings > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-success flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        Instant - No Extra Deposit Needed
                      </Label>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                        Based on KES {userSavings.toLocaleString()} savings
                      </Badge>
                    </div>
                    
                    {(() => {
                      // Calculate max loan that current savings can cover (savings = 10% of loan)
                      const maxInstantLoan = Math.min(userSavings * 10, loanOffer.qualifiedAmount);
                      const instantAmounts = [10000, 15000, 20000, 25000, 30000, 40000, 50000]
                        .filter(amt => amt <= maxInstantLoan && amt <= loanOffer.qualifiedAmount);
                      
                      // Add the max instant amount if not already included
                      if (maxInstantLoan >= LOAN_CONSTANTS.MIN_LOAN_AMOUNT && !instantAmounts.includes(maxInstantLoan)) {
                        instantAmounts.push(maxInstantLoan);
                      }
                      
                      if (instantAmounts.length === 0) {
                        return (
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-sm text-muted-foreground">
                              Your savings of KES {userSavings.toLocaleString()} can cover loans up to KES {maxInstantLoan.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {instantAmounts.slice(0, 6).map((amount) => {
                            const isSelected = loanAmount === amount;
                            const isMaxInstant = amount === maxInstantLoan && maxInstantLoan < loanOffer.qualifiedAmount;
                            
                            return (
                              <motion.button
                                key={amount}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setLoanAmount(amount);
                                  setLoanAmountInput(amount.toString());
                                }}
                                className={`
                                  relative p-3 rounded-xl border-2 transition-all duration-200
                                  ${isSelected 
                                    ? 'border-success bg-success/20 shadow-md ring-2 ring-success/30' 
                                    : 'border-success/30 bg-success/5 hover:border-success hover:bg-success/10'
                                  }
                                  ${isMaxInstant ? 'col-span-3' : ''}
                                `}
                              >
                                {isMaxInstant && (
                                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] px-2">
                                    <Zap className="h-3 w-3 mr-1" />
                                    MAX INSTANT
                                  </Badge>
                                )}
                                <div className="flex items-center justify-center space-x-1">
                                  <Zap className={`h-3 w-3 ${isSelected ? 'text-success' : 'text-success/70'}`} />
                                  <p className={`font-bold ${isSelected ? 'text-success' : 'text-success/90'} ${isMaxInstant ? 'text-lg' : 'text-sm'}`}>
                                    KES {amount.toLocaleString()}
                                  </p>
                                </div>
                                {isMaxInstant && (
                                  <p className="text-xs text-success font-medium mt-1">Get this instantly!</p>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}

                {/* Divider if user has savings */}
                {userSavings > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or choose higher amount</span>
                    </div>
                  </div>
                )}

                {/* All Amount Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {userSavings > 0 ? 'All amounts (may require additional deposit)' : 'Quick select an amount'}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[10000, 20000, 30000, 50000, 75000, loanOffer.qualifiedAmount].map((amount) => {
                      const isMax = amount === loanOffer.qualifiedAmount;
                      const isSelected = loanAmount === amount;
                      const isDisabled = amount > loanOffer.qualifiedAmount;
                      const canGetInstantly = userSavings > 0 && userSavings >= (amount * 0.1);
                      
                      // Skip amounts that are already shown in instant section
                      if (userSavings > 0 && canGetInstantly && !isMax) return null;
                      
                      return (
                        <motion.button
                          key={amount}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!isDisabled) {
                              setLoanAmount(amount);
                              setLoanAmountInput(amount.toString());
                            }
                          }}
                          disabled={isDisabled}
                          className={`
                            relative p-3 rounded-xl border-2 transition-all duration-200
                            ${isSelected 
                              ? 'border-primary bg-primary/10 shadow-md' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }
                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            ${isMax ? 'col-span-3 bg-gradient-to-r from-primary/5 to-success/5' : ''}
                          `}
                        >
                          {isMax && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] px-2">
                              MAX LIMIT
                            </Badge>
                          )}
                          <p className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'} ${isMax ? 'text-lg' : 'text-sm'}`}>
                            KES {amount.toLocaleString()}
                          </p>
                          {isMax && (
                            <p className="text-xs text-success font-medium mt-1">Your full limit</p>
                          )}
                          {!isMax && userSavings > 0 && !canGetInstantly && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">+deposit needed</p>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Slider */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Or slide to adjust
                  </Label>
                  
                  <div className="relative pt-2 pb-4">
                    <input
                      type="range"
                      min={LOAN_CONSTANTS.MIN_LOAN_AMOUNT}
                      max={loanOffer.qualifiedAmount}
                      step={1000}
                      value={loanAmount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setLoanAmount(val);
                        setLoanAmountInput(val.toString());
                      }}
                      className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-primary
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb]:active:cursor-grabbing
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:hover:scale-110
                      "
                    />
                    {/* Progress fill */}
                    <div 
                      className="absolute top-2 left-0 h-3 bg-gradient-to-r from-primary to-success rounded-full pointer-events-none"
                      style={{ 
                        width: `${((loanAmount - LOAN_CONSTANTS.MIN_LOAN_AMOUNT) / (loanOffer.qualifiedAmount - LOAN_CONSTANTS.MIN_LOAN_AMOUNT)) * 100}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>KES {LOAN_CONSTANTS.MIN_LOAN_AMOUNT.toLocaleString()}</span>
                    <span>KES {loanOffer.qualifiedAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Custom Amount Input (collapsed by default) */}
                <details className="group">
                  <summary className="text-sm text-primary cursor-pointer hover:underline flex items-center space-x-1">
                    <Plus className="h-4 w-4" />
                    <span>Enter exact amount</span>
                  </summary>
                  <div className="mt-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">KES</span>
                      <Input
                        id="loanAmountInput"
                        type="number"
                        value={loanAmountInput}
                        onChange={(e) => handleLoanAmountChange(e.target.value)}
                        onBlur={handleLoanAmountBlur}
                        min={LOAN_CONSTANTS.MIN_LOAN_AMOUNT}
                        max={loanOffer.qualifiedAmount}
                        className="h-14 text-2xl font-bold text-primary text-center pl-16 pr-4"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>

            {/* Savings Insufficient Warning - Interactive Message */}
            {isValidLoanAmount && loanDetails && hasPartialSavings && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-medium border-2 border-warning/50 bg-gradient-to-br from-warning/10 to-orange-50 dark:from-warning/10 dark:to-orange-950/20">
                  <CardContent className="py-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-warning/20 rounded-full">
                        <PiggyBank className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-warning flex items-center space-x-2">
                          <span>Your savings need a boost!</span>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          For a loan of <span className="font-bold text-foreground">KES {loanAmount.toLocaleString()}</span>, you need:
                        </p>
                        
                        <div className="mt-3 space-y-2">
                          {/* Progress bar showing savings vs required */}
                          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((userSavings / loanDetails.savingsDeposit) * 100, 100)}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="absolute h-full bg-gradient-to-r from-success to-emerald-400 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {Math.round((userSavings / loanDetails.savingsDeposit) * 100)}% saved
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-white/60 dark:bg-card rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">Your Savings</p>
                              <p className="font-bold text-success">KES {userSavings.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/60 dark:bg-card rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">Required (10%)</p>
                              <p className="font-bold text-foreground">KES {loanDetails.savingsDeposit.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="bg-warning/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground mb-1">You need to deposit</p>
                            <p className="text-xl font-bold text-warning">KES {remainingDeposit.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">to proceed with this loan amount</p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-3 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-success" />
                          Your savings are refundable and earn interest!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Loan Terms Card - only show when valid amount entered */}
            {isValidLoanAmount && loanDetails && (
              <Card className="shadow-medium">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span>Loan Terms</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Loan Amount</span>
                    <span className="font-medium">KES {loanDetails.loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Interest ({interestRate}%)</span>
                    <span className="font-medium">KES {Math.round(loanDetails.loanAmount * (interestRate / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Repayment Period</span>
                    <span className="font-medium">{loanDetails.paymentPeriod} days</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Repayable</span>
                    <span className="text-primary">KES {loanDetails.repayableAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Your Savings Section */}
            <Card className={`shadow-medium border-primary/30 ${hasSufficientSavings ? 'bg-success/10 border-success/30' : 'bg-primary/5'}`}>
              <CardContent className="py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold flex items-center space-x-2 ${hasSufficientSavings ? 'text-success' : 'text-primary'}`}>
                    <PiggyBank className="h-5 w-5" />
                    <span>Your Savings</span>
                  </h4>
                  {hasSufficientSavings ? (
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sufficient
                    </Badge>
                  ) : userSavings > 0 ? (
                    <Badge variant="secondary" className="bg-warning/10 text-warning">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : null}
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <p className="text-sm text-muted-foreground mb-1">Current Savings Balance</p>
                  <p className={`text-3xl font-bold ${hasSufficientSavings ? 'text-success' : 'text-primary'}`}>
                    {isLoadingSavings ? '...' : `KES ${userSavings.toLocaleString()}`}
                  </p>
                </div>
                
                {userSavings >= 99 ? (
                  <div className="space-y-3">
                    {hasSufficientSavings ? (
                      <div className="bg-success/10 rounded-lg p-3 border border-success/20">
                        <p className="text-sm text-success font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          You have enough savings! Skip deposit and proceed directly.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                        <p className="text-sm text-primary font-medium flex items-center">
                          <PiggyBank className="h-4 w-4 mr-2" />
                          Use your savings to get a loan now!
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={handleProceedToPayment}
                      className={`w-full ${hasSufficientSavings ? 'bg-success hover:bg-success/90' : ''}`}
                      size="sm"
                      disabled={!isValidLoanAmount}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Get Your Loan Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasPartialSavings ? (
                      <>
                        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                          <p className="text-sm text-primary font-medium mb-2">
                            Your savings will be applied!
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Required Deposit</span>
                              <span>KES {loanDetails?.savingsDeposit?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-success">
                              <span>Your Savings (applied)</span>
                              <span>- KES {userSavings.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-primary border-t pt-1 mt-1">
                              <span>Amount to Pay</span>
                              <span>KES {remainingDeposit.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Excise Duty (KRA)</span>
                          <span className="font-medium">KES {loanDetails?.savingsDeposit?.toLocaleString() || '--'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          💡 Government excise duty required for loan processing
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button
              onClick={handleProceedToPayment}
              className={`w-full h-14 text-lg ${hasSufficientSavings ? 'bg-success hover:bg-success/90' : ''}`}
              size="lg"
              disabled={!isValidLoanAmount}
            >
              {!isValidLoanAmount ? (
                <>Enter a loan amount to continue</>
              ) : hasSufficientSavings ? (
                <>
                  Proceed
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  <PiggyBank className="h-5 w-5 mr-2" />
                  Deposit Savings - KES {remainingDeposit.toLocaleString()}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Start New Application */}
            <Button
              variant="outline"
              onClick={handleStartNewApplication}
              className="w-full shadow-lg shadow-primary/30 border-primary/50 hover:bg-primary/10"
            >
              Start New Application
            </Button>
          </motion.div>
        )}
      </div>
    </AndroidLayout>
  );
}
