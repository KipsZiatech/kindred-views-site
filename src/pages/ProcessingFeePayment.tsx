import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Shield, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AndroidLayout } from '@/components/AndroidLayout';
import PaymentVerification from '@/components/PaymentVerification';
import { notifyLoanDisbursed } from '@/lib/notifications';
import { calculateLoanDetails } from '@/lib/loanCalculations';

export default function ProcessingFeePayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loanApplication, loanDetails } = location.state || {};

  const handleSuccess = async () => {
    // Send loan disbursement notification
    if (loanApplication) {
      await notifyLoanDisbursed(
        loanApplication.phone_number,
        loanDetails.loanAmount,
        loanApplication.id
      );
    }
    
    navigate('/loan-disbursement-success', {
      state: {
        loanApplication,
        loanDetails: {
          ...loanDetails,
          processingFee
        }
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!loanApplication || !loanDetails) {
    return (
      <AndroidLayout title="Processing Fee" showBack onBackClick={handleBack} showBottomNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <p className="text-muted-foreground mb-4">No payment information found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </AndroidLayout>
    );
  }

  // Use centralized loan calculation utility
  const calculatedDetails = calculateLoanDetails(
    loanDetails.loanAmount, 
    loanDetails.qualifiedAmount || 100000
  );
  const processingFee = calculatedDetails.processingFee;

  return (
    <AndroidLayout title="Pay Processing Fee" showBack onBackClick={handleBack} showTopBar={true} showBottomNav={false}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pay Processing Fee</h2>
          <p className="text-muted-foreground">
            Final step to complete your loan application
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <Card className="shadow-medium bg-success/5 border-success/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-sm font-medium text-success">Savings Deposited</span>
              </div>
              <div className="h-px w-8 bg-border" />
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <span className="text-sm font-medium text-primary">Processing Fee</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Summary */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Loan Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Applicant</span>
              <span className="font-medium">{loanApplication.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone Number</span>
              <span className="font-medium">{loanApplication.phone_number}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Loan Amount</span>
              <span className="font-medium">KES {loanDetails.loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Repayable Amount</span>
              <span className="font-medium">KES {loanDetails.repayableAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Excise Duty (KRA)</span>
              <span className="font-medium text-success flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Paid
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Processing Fee</span>
              <span className="text-primary">KES {processingFee.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Processing Fee Info */}
        <Card className="shadow-medium border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Why Processing Fee?</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                The processing fee covers application verification, credit assessment, and administrative costs.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Loan disbursement within 2 to 3 hours after verification</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <PaymentVerification
          amount={processingFee}
          onSuccess={handleSuccess}
          onBack={handleBack}
          packageId={loanApplication.id}
          phoneNumber={loanApplication.mpesa_number || loanApplication.phone_number}
        />

        {/* Security Notice */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by M-PESA</span>
          </div>
        </div>
      </div>
    </AndroidLayout>
  );
}
