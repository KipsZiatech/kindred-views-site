import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function AdminNotificationPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const sendBulkNotifications = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('schedule-loan-notifications', {
        body: { manual: true }
      });

      if (error) {
        throw error;
      }

      setLastResult(data);
      
      toast({
        title: "✅ Notifications Sent",
        description: `Successfully processed ${data.processedCount} users with ${data.successCount} notifications sent.`,
      });

    } catch (error: any) {
      console.error('Error sending notifications:', error);
      toast({
        title: "❌ Failed to Send",
        description: error.message || "Failed to send bulk notifications",
        variant: "destructive"
      });
      setLastResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const setupScheduledNotifications = async () => {
    try {
      // In a real implementation, you would set up a cron job
      // For now, we'll just show instructions
      toast({
        title: "📋 Cron Setup Instructions",
        description: "Set up a cron job to call the schedule-loan-notifications function every hour.",
      });
      
      console.log(`
        To set up automated notifications, add this cron job:
        
        # Run every hour to send loan reminders
        0 * * * * curl -X POST "https://xxfybuqajtejzthyszam.supabase.co/functions/v1/schedule-loan-notifications" \\
          -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \\
          -H "Content-Type: application/json" \\
          -d '{}'
      `);
      
    } catch (error) {
      console.error('Error setting up scheduled notifications:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Push Notification Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Notification Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Send Bulk Notifications</span>
            </CardTitle>
            <CardDescription>
              Manually trigger loan reminder notifications for all pending applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={sendBulkNotifications}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Notifications Now
            </Button>

            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {lastResult.error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{lastResult.error}</AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p><strong>Processed:</strong> {lastResult.processedCount} users</p>
                        <p><strong>Successful:</strong> {lastResult.successCount}</p>
                        <p><strong>Failed:</strong> {lastResult.failureCount}</p>
                        <p><strong>Total Pending:</strong> {lastResult.totalPendingLoans}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Notifications Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Automated Notifications</span>
            </CardTitle>
            <CardDescription>
              Set up automatic hourly notifications for pending loans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Hourly Schedule</Badge>
                <span className="text-sm text-muted-foreground">Every hour at :00</span>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Finds users with pending loan payments</p>
                <p>✓ Avoids duplicate notifications (1 hour cooldown)</p>
                <p>✓ Sends personalized reminders</p>
                <p>✓ Tracks delivery status</p>
              </div>
            </div>

            <Button 
              onClick={setupScheduledNotifications}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Clock className="w-4 h-4 mr-2" />
              View Setup Instructions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Notification Statistics</span>
          </CardTitle>
          <CardDescription>
            Overview of push notification engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">--</div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-success">--</div>
              <p className="text-sm text-muted-foreground">Delivered Today</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-warning">--</div>
              <p className="text-sm text-muted-foreground">Click Rate</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-info">--</div>
              <p className="text-sm text-muted-foreground">Pending Loans</p>
            </div>
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Real-time statistics will be available once notifications are actively being sent.
              Use the "Send Bulk Notifications" button above to start sending reminders.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}