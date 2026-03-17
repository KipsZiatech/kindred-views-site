import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign, Clock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoanDisbursementProps {
  loanAmount: number;
  repayableAmount: number;
  onStartNewApplication: () => void;
}

export default function LoanDisbursement({ 
  loanAmount, 
  repayableAmount, 
  onStartNewApplication 
}: LoanDisbursementProps) {
  const currentDate = new Date();
  const disbursementDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="h-12 w-12 text-success" />
        </motion.div>
        <h2 className="text-3xl font-bold text-success mb-2">Loan Approved!</h2>
        <p className="text-lg text-muted-foreground">
          Your payment has been verified and your loan is ready for disbursement
        </p>
      </motion.div>

      {/* Loan Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <span>Loan Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Loan Amount */}
            <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
              <p className="text-sm opacity-90 mb-2">Loan Amount</p>
              <p className="text-3xl font-bold">KES {loanAmount.toLocaleString()}</p>
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                Disbursing Soon
              </Badge>
            </div>

            {/* Repayment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Repayable</p>
                <p className="text-xl font-bold">KES {repayableAmount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
                <p className="text-xl font-bold">3.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Disbursement Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-primary" />
              <span>Disbursement Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Funds will be sent to your M-PESA within 24 hours</strong>
                <br />
                Expected disbursement: {disbursementDate.toLocaleDateString('en-KE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Wait for Disbursement</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an M-PESA notification once funds are sent
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Repayment Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    We'll contact you with repayment instructions and schedule
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Build Your Credit</p>
                  <p className="text-sm text-muted-foreground">
                    Timely repayment helps you qualify for larger loans in the future
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={onStartNewApplication}
          variant="outline"
          className="w-full md:w-auto"
        >
          Start New Application
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Thank you for choosing Shwari M-Pesa. We're committed to your financial success!</p>
      </div>
    </div>
  );
}