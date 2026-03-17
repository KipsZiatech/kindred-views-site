import { useNavigate, useLocation } from 'react-router-dom';
import LoanDisbursementSuccess from '@/components/LoanDisbursementSuccess';
import { AndroidLayout } from '@/components/AndroidLayout';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function LoanDisbursementSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loanApplication, loanDetails } = location.state || {};
  const loanAmount = loanDetails?.loanAmount || 0;

  const handleBackToHome = () => {
    navigate('/');
  };

  // If no loan amount is provided, show a fallback
  if (!loanAmount) {
    return (
      <AndroidLayout title="Loan Success" showBack={true} onBackClick={handleBackToHome}>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">No Loan Information Found</h2>
            <p className="text-muted-foreground">
              Please complete the loan application process first.
            </p>
            <Button onClick={handleBackToHome} className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Button>
          </div>
        </div>
      </AndroidLayout>
    );
  }

  return (
    <AndroidLayout title="Loan Disbursement" showBack={true} onBackClick={handleBackToHome}>
      <div className="min-h-screen p-4">
        <LoanDisbursementSuccess 
          loanAmount={loanAmount}
          onBackToHome={handleBackToHome}
        />
      </div>
    </AndroidLayout>
  );
}
