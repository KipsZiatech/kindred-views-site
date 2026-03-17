import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateLoanDetails, LOAN_CONSTANTS } from '@/lib/loanCalculations';

interface UserInfo {
  fullName: string;
  phoneNumber: string;
  mpesaNumber: string;
  alternatePhone: string;
  nationalId: string;
  monthlyIncome: string;
  loanPurpose: string;
  county: string;
  subCounty: string;
}

interface LoanResultsProps {
  qualifiedAmount: number;
  onProceedToPayment: (loanDetails: { loanAmount: number; repayableAmount: number; savingsDeposit: number }) => void;
  userInfo: UserInfo;
  interestRate?: number;
}

export default function LoanResults({ 
  qualifiedAmount,
  onProceedToPayment,
  userInfo,
  interestRate = LOAN_CONSTANTS.INTEREST_RATE
}: LoanResultsProps) {
  const loanDetails = calculateLoanDetails(qualifiedAmount, qualifiedAmount);
  const firstName = userInfo.fullName.split(' ')[0];
  
  const handleWithdraw = () => {
    onProceedToPayment({
      loanAmount: qualifiedAmount,
      repayableAmount: loanDetails.repayableAmount,
      savingsDeposit: loanDetails.savingsDeposit
    });
  };

  return (
    <div className="space-y-4">
      {/* Green Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary text-primary-foreground rounded-xl p-6 text-center"
      >
        <h1 className="text-2xl font-bold mb-3">Loan Offer</h1>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>Trusted by Thousands</span>
          </div>
        </div>
      </motion.div>

      {/* Congratulations Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Congratulations, {firstName}!
            </h2>
            <p className="text-foreground mb-2">
              You have qualified for a loan of{' '}
              <span className="text-primary font-bold">Ksh {qualifiedAmount.toLocaleString()}</span>{' '}
              to your M-PESA.
            </p>
            <p className="text-muted-foreground text-sm mb-3">
              Your total repayment will be Ksh {loanDetails.repayableAmount.toLocaleString()}, 
              with a low interest rate of {interestRate}%, and a 
              withdrawal fee of Ksh {loanDetails.savingsDeposit}.
            </p>
            <p className="text-muted-foreground text-sm">
              Terms and conditions apply.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applicant Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Applicant Information</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Names</p>
                <p className="font-medium text-foreground">{userInfo.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">M-Pesa Number</p>
                <p className="font-medium text-foreground">{userInfo.mpesaNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">{userInfo.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eligible Loan Amount</p>
                <p className="font-medium text-primary">Ksh {qualifiedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Loan Offer Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Your Loan Offer</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-muted-foreground">Loan Amount</span>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">Ksh {qualifiedAmount.toLocaleString()}</p>
                  <Badge className="bg-primary text-primary-foreground mt-1">Approved</Badge>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-medium text-primary">{interestRate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Interest Amount</span>
                <span className="font-medium text-foreground">Ksh {loanDetails.interestAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-muted-foreground font-medium">Total Repayable</span>
                <span className="font-bold text-lg text-foreground">Ksh {loanDetails.repayableAmount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdraw Button Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-sm border-2 border-primary/20">
          <CardContent className="p-4">
            <Button
              onClick={handleWithdraw}
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
              size="lg"
            >
              Withdraw - Ksh {qualifiedAmount.toLocaleString()}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-center text-sm text-primary mt-3">
              Secure payment via M-Pesa
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}