import { supabase } from '@/integrations/supabase/client';
import OneSignal from 'react-onesignal';

export type NotificationType = 'loan_approved' | 'payment_due' | 'loan_disbursed' | 'payment_reminder' | 'custom';

interface SendNotificationParams {
  type: NotificationType;
  phone_number?: string;
  title?: string;
  message?: string;
  loan_id?: string;
  data?: Record<string, string>;
}

// Send push notification via edge function
export const sendPushNotification = async (params: SendNotificationParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('onesignal-notification', {
      body: params,
    });

    if (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }

    console.log('Notification sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, error };
  }
};

// Register user's phone number with OneSignal for targeted notifications
export const registerUserForNotifications = async (phoneNumber: string) => {
  try {
    // Login with phone number as external ID
    await OneSignal.login(phoneNumber);
    
    // Add phone number as tag for filtering
    await OneSignal.User.addTag('phone_number', phoneNumber);
    
    console.log('User registered for notifications:', phoneNumber);
    return true;
  } catch (error) {
    console.error('Error registering user for notifications:', error);
    return false;
  }
};

// Send notification when loan is approved
export const notifyLoanApproved = async (phoneNumber: string, amount: number, loanId?: string) => {
  return sendPushNotification({
    type: 'loan_approved',
    phone_number: phoneNumber,
    message: `Great news! Your loan of KSh ${amount.toLocaleString()} has been approved. Complete the payment to receive your funds.`,
    loan_id: loanId,
  });
};

// Send notification when loan is disbursed
export const notifyLoanDisbursed = async (phoneNumber: string, amount: number, loanId?: string) => {
  return sendPushNotification({
    type: 'loan_disbursed',
    phone_number: phoneNumber,
    message: `KSh ${amount.toLocaleString()} has been sent to your M-Pesa. Check your phone for the confirmation message.`,
    loan_id: loanId,
  });
};

// Send payment reminder
export const notifyPaymentDue = async (phoneNumber: string, amount: number, dueDate: string, loanId?: string) => {
  return sendPushNotification({
    type: 'payment_due',
    phone_number: phoneNumber,
    message: `Your loan repayment of KSh ${amount.toLocaleString()} is due on ${dueDate}. Please ensure timely payment.`,
    loan_id: loanId,
  });
};
