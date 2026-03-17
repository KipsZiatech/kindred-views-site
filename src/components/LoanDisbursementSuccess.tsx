import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoanDisbursementSuccessProps {
  loanAmount: number;
  onBackToHome: () => void;
}

export default function LoanDisbursementSuccess({ 
  loanAmount,
  onBackToHome
}: LoanDisbursementSuccessProps) {
  const handleContactSupport = () => {
    const email = 'shwarimmpesadisbursement@gmail.com';
    const subject = 'Loan Disbursement Support Request';
    const body = `Hello,\n\nI have successfully completed my loan application for KES ${loanAmount.toLocaleString()} and would like to follow up on the disbursement status.\n\nThank you.`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-success mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">
          Your savings deposit has been processed successfully.
        </p>
      </motion.div>

      {/* Disbursement Information */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-primary" />
            <span>Loan Disbursement Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-primary">
                  Your loan of KES {loanAmount.toLocaleString()} is being processed for disbursement.
                </p>
                <p>
                  Please allow <span className="font-semibold">24-48 hours</span> for the funds to reflect in your M-Pesa account.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our team is currently:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside mt-1 space-y-1">
                  <li>Verifying your payment with our banking partner</li>
                  <li>Processing final KYC compliance checks</li>
                  <li>Preparing loan documentation for your records</li>
                  <li>Coordinating with M-Pesa for secure fund transfer</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  These steps ensure the security of your funds and compliance with banking regulations. 
                  You will receive an SMS notification once the loan is disbursed.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="p-4 bg-accent rounded-lg">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Final verification of all payments and documentation</li>
              <li>• Background checks with credit bureaus and regulatory bodies</li>
              <li>• Approval from our loan disbursement committee</li>
              <li>• Processing through our banking partner's systems</li>
              <li>• Funds will be sent directly to your registered M-Pesa number</li>
              <li>• You'll receive an SMS confirmation with loan agreement details</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Note: The 24-48 hour timeline allows our team to ensure all regulatory requirements are met 
              and your loan is processed securely. Thank you for your patience.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleContactSupport}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <Mail className="h-4 w-4" />
          <span>Contact Support</span>
        </Button>

        <Button
          onClick={onBackToHome}
          className="w-full flex items-center justify-center space-x-2"
        >
          <span>Back to Home</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Support Information */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Need help? Contact us at:</p>
        <p className="font-medium text-primary">shwarimmpesadisbursement@gmail.com</p>
      </div>
    </div>
  );
}