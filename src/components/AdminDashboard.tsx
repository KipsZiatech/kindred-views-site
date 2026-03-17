import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, MessageSquare, TrendingUp, LogOut, RefreshCw, CalendarIcon, XCircle, CheckCircle, Download, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';

interface Payment {
  id: string;
  mpesa_message: string;
  amount: number;
  created_at: string;
  payment_status?: string;
  phone_number?: string;
  customer_name?: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [successTransactions, setSuccessTransactions] = useState(0);
  const [failedTransactions, setFailedTransactions] = useState(0);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let query = supabase
        .from('mpesa_payments')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date range filter if selected
      if (dateRange?.from) {
        const startDate = startOfDay(dateRange.from).toISOString();
        query = query.gte('created_at', startDate);
      }
      if (dateRange?.to) {
        const endDate = endOfDay(dateRange.to).toISOString();
        query = query.lte('created_at', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setPayments(data as Payment[] || []);
      
      // Calculate statistics
      const successPayments = (data as Payment[] || []).filter(p => p.payment_status === 'COMPLETED');
      const failedPayments = (data as Payment[] || []).filter(p => 
        p.payment_status === 'FAILED' || p.payment_status === 'CANCELLED'
      );
      
      setSuccessTransactions(successPayments.length);
      setFailedTransactions(failedPayments.length);
      
      // Calculate total amount from successful payments only
      const total = successPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      setTotalAmount(total);
    } catch (err: any) {
      setError('Failed to load payments: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [dateRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const exportToExcel = async (exportAll: boolean = false) => {
    try {
      // Fetch loan applications for export
      let query = supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply date range filter if selected
      if (dateRange?.from) {
        const startDate = startOfDay(dateRange.from).toISOString();
        query = query.gte('created_at', startDate);
      }
      if (dateRange?.to) {
        const endDate = endOfDay(dateRange.to).toISOString();
        query = query.lte('created_at', endDate);
      }

      const { data: loanData, error: loanError } = await query;

      if (loanError) {
        throw loanError;
      }

      let dataToExport = loanData || [];

      // If not exporting all, remove duplicates based on phone number (keep the most recent entry)
      if (!exportAll) {
        const uniqueLoans = dataToExport.reduce((acc, loan) => {
          const phone = loan.phone_number || '';
          if (!acc.has(phone)) {
            acc.set(phone, loan);
          }
          return acc;
        }, new Map());
        dataToExport = Array.from(uniqueLoans.values());
      }

      // Format data according to the template: Phone, Full Names, Loan Type, Principal Amount, Balance, Due Date
      const exportData = dataToExport.map(loan => ({
        'Phone': loan.phone_number || 'N/A',
        'Full Names': loan.full_name || 'N/A',
        'Loan Type': loan.loan_purpose || 'Personal Loan',
        'Principal Amount': (loan.loan_amount_requested || 0).toLocaleString(),
        'Balance': (loan.repayment_amount || 0).toLocaleString(),
        'Due Date': loan.repayment_date ? format(new Date(loan.repayment_date), 'M/d/yy') : 'N/A'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 },  // Phone
        { wch: 20 },  // Full Names
        { wch: 15 },  // Loan Type
        { wch: 18 },  // Principal Amount
        { wch: 15 },  // Balance
        { wch: 12 }   // Due Date
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Loan Applications');

      // Generate filename with date range if selected
      let filename = 'loan_applications';
      if (dateRange?.from) {
        filename += `_${format(dateRange.from, 'yyyy-MM-dd')}`;
        if (dateRange.to) {
          filename += `_to_${format(dateRange.to, 'yyyy-MM-dd')}`;
        }
      }
      filename += '.xlsx';

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (err: any) {
      setError('Failed to export: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                M-Pesa Payment Management 
                {dateRange?.from && (
                  <span>
                    {' - '}
                    {format(dateRange.from, 'PPP')}
                    {dateRange.to && ` to ${format(dateRange.to, 'PPP')}`}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[240px]",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Filter by date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  {dateRange && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDateRange(undefined)}
                        className="w-full"
                      >
                        Clear filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={isLoading || payments.length === 0}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportToExcel(false)}>
                    Unique Contacts Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToExcel(true)}>
                    All Loan Applications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                onClick={fetchPayments} 
                disabled={isLoading}
                className="cursor-pointer hover:bg-accent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="cursor-pointer hover:bg-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Transactions {dateRange?.from ? 'in Range' : 'Total'}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successTransactions}</div>
                <p className="text-xs text-muted-foreground">Completed payments</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount Earned</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatAmount(totalAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {dateRange?.from ? 'Earnings for selected range' : 'Total excise duty collected'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed/Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{failedTransactions}</div>
                <p className="text-xs text-muted-foreground">Unsuccessful transactions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {successTransactions > 0 ? formatAmount(totalAmount / successTransactions) : 'KES 0'}
                </div>
                <p className="text-xs text-muted-foreground">Per successful transaction</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>M-Pesa Payment Records</CardTitle>
              <p className="text-sm text-muted-foreground">
                All verified excise duty payments
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading payments...
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payments found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>M-Pesa Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow 
                          key={payment.id} 
                          className="hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            // Add click functionality for viewing payment details
                            console.log('Payment selected:', payment.id);
                          }}
                        >
                           <TableCell className="font-medium">
                             {formatDate(payment.created_at)}
                           </TableCell>
                           <TableCell className="font-medium">
                             {payment.customer_name || 'N/A'}
                           </TableCell>
                           <TableCell>
                             {payment.phone_number || 'N/A'}
                           </TableCell>
                           <TableCell>
                             <Badge 
                               variant={
                                 payment.payment_status === 'COMPLETED' ? 'default' :
                                 payment.payment_status === 'FAILED' || payment.payment_status === 'CANCELLED' ? 'destructive' :
                                 'secondary'
                               }
                               className="cursor-pointer"
                             >
                               {payment.payment_status || 'PENDING'}
                             </Badge>
                           </TableCell>
                           <TableCell>
                             <Badge variant="secondary" className="cursor-pointer">
                               {formatAmount(payment.amount)}
                             </Badge>
                           </TableCell>
                           <TableCell className="max-w-md">
                             <div className="text-sm bg-muted p-2 rounded text-wrap break-words hover:bg-muted/80 transition-colors">
                               {payment.mpesa_message}
                             </div>
                           </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}