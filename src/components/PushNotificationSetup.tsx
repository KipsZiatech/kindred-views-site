import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationSetupProps {
  phoneNumber?: string;
  onSetupComplete?: (success: boolean) => void;
}

export function PushNotificationSetup({ phoneNumber, onSetupComplete }: PushNotificationSetupProps) {
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification
  } = usePushNotifications();

  const handleSubscribe = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number first to enable notifications.",
        variant: "destructive"
      });
      return;
    }

    const success = await subscribeToNotifications(phoneNumber);
    
    if (success) {
      toast({
        title: "🎉 Notifications Enabled!",
        description: "You'll now receive instant loan reminders and updates.",
      });
      
      // Send a test notification
      setTimeout(() => {
        sendTestNotification(phoneNumber);
      }, 1000);
      
      onSetupComplete?.(true);
    } else {
      toast({
        title: "Setup Failed",
        description: error || "Failed to enable notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnsubscribe = async () => {
    if (!phoneNumber) return;

    const success = await unsubscribeFromNotifications(phoneNumber);
    
    if (success) {
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications.",
      });
      onSetupComplete?.(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Don't show if notifications are not supported
  if (!isSupported) {
    return null;
  }

  // Show compact notification status if already subscribed
  if (isSubscribed && !showSetup) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-success animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-success">🔔 Notifications Active</p>
                <p className="text-sm text-muted-foreground">You'll get instant loan updates</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSetup(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Stay Updated on Your Loan</CardTitle>
          </div>
          <CardDescription>
            Enable notifications to get instant reminders about your loan status and payment deadlines.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Instant loan approval alerts</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Payment deadline reminders</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Disbursement confirmations</span>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            {!isSubscribed ? (
              <>
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading || !phoneNumber}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4 mr-2" />
                  )}
                  Enable Notifications
                </Button>
                {!phoneNumber && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter your phone number first to enable notifications
                  </p>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BellOff className="w-4 h-4 mr-2" />
                  )}
                  Disable Notifications
                </Button>
                
                <Button
                  onClick={() => phoneNumber && sendTestNotification(phoneNumber)}
                  disabled={isLoading || !phoneNumber}
                  variant="secondary"
                  className="flex-1"
                >
                  Send Test
                </Button>
              </>
            )}
          </div>

          {showSetup && isSubscribed && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSetup(false)}
                className="w-full text-muted-foreground"
              >
                Hide Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}