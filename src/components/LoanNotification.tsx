import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CreditCard, Phone, User, DollarSign, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LoanApplication {
  id: string;
  full_name: string;
  phone_number: string;
  loan_amount_requested: number;
  excise_duty_amount: number;
  payment_status: string;
  created_at: string;
}

interface LoanNotificationProps {
  phoneNumber?: string;
}

export function LoanNotification({ phoneNumber }: LoanNotificationProps) {
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [dismissedPhones, setDismissedPhones] = useState<string[]>([]);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (phoneNumber) {
      fetchPendingLoans();
    }
  }, [phoneNumber]);

  // Play notification sound when new notifications arrive
  useEffect(() => {
    const uniquePhoneNumbers = getUniqueApplicationsByPhone(loanApplications);
    const visibleCount = uniquePhoneNumbers.filter(app => 
      !dismissedPhones.includes(app.phone_number)
    ).length;

    if (visibleCount > lastNotificationCount && lastNotificationCount > 0) {
      playNotificationSound();
    }
    setLastNotificationCount(visibleCount);
  }, [loanApplications, dismissedPhones, lastNotificationCount]);

  const playNotificationSound = () => {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const getUniqueApplicationsByPhone = (applications: LoanApplication[]) => {
    const phoneMap = new Map<string, LoanApplication>();
    
    applications.forEach(app => {
      const existing = phoneMap.get(app.phone_number);
      if (!existing || new Date(app.created_at) > new Date(existing.created_at)) {
        phoneMap.set(app.phone_number, app);
      }
    });
    
    return Array.from(phoneMap.values());
  };

  const fetchPendingLoans = async () => {
    if (!phoneNumber) return;
    
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('payment_status', 'pending')
        .eq('qualification_status', 'qualified')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching loan applications:', error);
        return;
      }

      setLoanApplications(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDismiss = (phoneNumber: string) => {
    setDismissedPhones(prev => [...prev, phoneNumber]);
  };

  const handlePayNow = (application: LoanApplication) => {
    // Navigate to payment with loan application data
    navigate('/payment', { 
      state: { 
        loanApplication: application,
        loanDetails: {
          loanAmount: application.loan_amount_requested,
          exciseDuty: application.excise_duty_amount,
          repayableAmount: application.loan_amount_requested * 1.035 // 3.5% interest
        }
      } 
    });
  };

  const handleInviteFriends = async () => {
    const shareData = {
      title: 'Shwari M-Pesa - Instant Mobile Loans',
      text: 'Need money fast? Apply now for unsecured mobile loans from Ksh 10,000 to 100,000 disbursed instantly to your M-Pesa account. No collateral, no guarantors needed!',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for desktop - copy to clipboard and show options
      const shareText = `${shareData.text} ${shareData.url}`;
      navigator.clipboard.writeText(shareText).then(() => {
        // You could show a toast here about the text being copied
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }).catch(() => {
        // If clipboard fails, just open WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    }
  };

  const visibleApplications = getUniqueApplicationsByPhone(loanApplications).filter(app => 
    !dismissedPhones.includes(app.phone_number)
  );

  if (visibleApplications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {visibleApplications.map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <Card className="border-2 border-success/20 bg-gradient-to-r from-success/10 via-primary/5 to-warning/10 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-success to-primary rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-success">
                        🎉 Loan Approved!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Complete payment to receive funds
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(application.phone_number)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-3 bg-background/60 rounded-lg">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Applicant</p>
                        <p className="font-semibold">{application.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 bg-background/60 rounded-lg">
                      <Phone className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-semibold">{application.phone_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Loan Amount</p>
                        <p className="font-bold text-primary">
                          Ksh {application.loan_amount_requested.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <DollarSign className="w-4 h-4 text-warning" />
                      <div>
                        <p className="text-xs text-muted-foreground">Excise Duty</p>
                        <p className="font-bold text-warning">
                          Ksh {application.excise_duty_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Badge variant="secondary" className="bg-success/20 text-success mb-3">
                      ✅ Qualified • Ready for Payment
                    </Badge>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={() => handlePayNow(application)}
                        className="w-full h-12 bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/90 text-white font-semibold shadow-md"
                        size="lg"
                      >
                        💳 Pay Excise Duty - Ksh {application.excise_duty_amount.toLocaleString()}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                    
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      💸 Funds will be processed to your M-Pesa within 3 to 4 hours after payment
                    </p>
                    
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Button 
                        onClick={handleInviteFriends}
                        variant="outline"
                        className="w-full h-10 border-primary/30 hover:bg-primary/10 text-primary font-medium"
                      >
                        🎯 Invite Friends & Unlock Higher Limits
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Need money fast? Apply now for unsecured mobile loans from Ksh 10,000 to 100,000 disbursed instantly to your M-Pesa account. No collateral, no guarantors needed. Earn up to Ksh 500 on referrals when your invitee repays their first loan.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}