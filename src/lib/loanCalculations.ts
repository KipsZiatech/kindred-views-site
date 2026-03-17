// Centralized loan calculation utility - ensures consistency across the app

// Constants - adjust these to change rates across the entire app
export const LOAN_CONSTANTS = {
  MIN_LOAN_AMOUNT: 15000,
  MAX_LOAN_AMOUNT: 100000,
  INTEREST_RATE: 3.5,
  
  // Excise duty range (KSh) - between 99 and 180
  MIN_EXCISE_DUTY: 99,
  MAX_EXCISE_DUTY: 180,
  
  // Legacy names for backwards compatibility
  MIN_SAVINGS_DEPOSIT: 99,
  MAX_SAVINGS_DEPOSIT: 180,
  
  // Processing fee range (KSh)
  MIN_PROCESSING_FEE: 199,
  MAX_PROCESSING_FEE: 999,
  
  // User-specific offset range (for unique transaction amounts)
  MAX_USER_OFFSET: 50, // Max offset added per user (0-50)
  
  // Payment periods (days)
  SHORT_TERM_PERIOD: 30,
  LONG_TERM_PERIOD: 60,
  LOAN_THRESHOLD_FOR_LONG_TERM: 50000,
  
  // Minimum excise duty to qualify for direct loan
  MIN_SAVINGS_FOR_LOAN: 99,
  
  // Savings bonus calculation
  SAVINGS_BONUS_UNIT: 500, // Every KSh 500 saved
  SAVINGS_BONUS_PERCENTAGE: 10, // 10% bonus per unit
};

/**
 * Calculate excise duty based on loan amount (scales between 99-180 KES)
 */
export function calculateSavingsDeposit(loanAmount: number, qualifiedAmount: number): number {
  const { MIN_LOAN_AMOUNT, MIN_EXCISE_DUTY, MAX_EXCISE_DUTY } = LOAN_CONSTANTS;
  
  // Calculate loan ratio (0 to 1 based on position between min and max loan)
  const loanRange = qualifiedAmount - MIN_LOAN_AMOUNT;
  const loanRatio = loanRange > 0 ? Math.max(0, (loanAmount - MIN_LOAN_AMOUNT) / loanRange) : 0;
  
  // Calculate excise duty (99 to 180 based on loan ratio)
  const exciseRange = MAX_EXCISE_DUTY - MIN_EXCISE_DUTY;
  return Math.floor(MIN_EXCISE_DUTY + (exciseRange * loanRatio));
}

// Alias for new terminology
export const calculateExciseDuty = calculateSavingsDeposit;

export interface LoanDetails {
  loanAmount: number;
  repayableAmount: number;
  savingsDeposit: number;
  processingFee: number;
  paymentPeriod: number;
  interestAmount: number;
}

/**
 * Calculate all loan details based on loan amount and qualified amount
 */
export function calculateLoanDetails(
  loanAmount: number,
  qualifiedAmount: number
): LoanDetails {
  const { 
    MIN_LOAN_AMOUNT, 
    INTEREST_RATE,
    MIN_PROCESSING_FEE,
    MAX_PROCESSING_FEE,
    SHORT_TERM_PERIOD,
    LONG_TERM_PERIOD,
    LOAN_THRESHOLD_FOR_LONG_TERM
  } = LOAN_CONSTANTS;

  // Calculate interest
  const interestAmount = Math.round(loanAmount * (INTEREST_RATE / 100));
  const repayableAmount = loanAmount + interestAmount;

  // Calculate loan ratio (0 to 1 based on position between min and max loan)
  const loanRange = qualifiedAmount - MIN_LOAN_AMOUNT;
  const loanRatio = loanRange > 0 ? Math.max(0, (loanAmount - MIN_LOAN_AMOUNT) / loanRange) : 0;

  // Calculate savings deposit based on loan ratio
  const savingsDeposit = calculateSavingsDeposit(loanAmount, qualifiedAmount);

  // Calculate processing fee (MIN to MAX based on loan ratio)
  const processingFeeRange = MAX_PROCESSING_FEE - MIN_PROCESSING_FEE;
  let processingFee = Math.floor(MIN_PROCESSING_FEE + (processingFeeRange * loanRatio));
  
  // Ensure processing fee is different from savings deposit (M-Pesa rejects duplicates)
  if (processingFee === savingsDeposit) {
    processingFee += 51;
  }

  // Determine payment period
  const paymentPeriod = loanAmount <= LOAN_THRESHOLD_FOR_LONG_TERM 
    ? SHORT_TERM_PERIOD 
    : LONG_TERM_PERIOD;

  return {
    loanAmount: Math.round(loanAmount),
    repayableAmount: Math.round(repayableAmount),
    savingsDeposit,
    processingFee,
    paymentPeriod,
    interestAmount
  };
}

/**
 * Calculate loan limit bonus based on savings
 * Higher savings = Higher loan limit
 */
export function calculateSavingsBonus(savings: number, baseAmount: number = LOAN_CONSTANTS.MIN_LOAN_AMOUNT) {
  const { SAVINGS_BONUS_UNIT, SAVINGS_BONUS_PERCENTAGE, MAX_LOAN_AMOUNT } = LOAN_CONSTANTS;
  
  const bonusUnits = Math.floor(savings / SAVINGS_BONUS_UNIT);
  const bonusPercentage = bonusUnits * SAVINGS_BONUS_PERCENTAGE;
  const bonusAmount = (baseAmount * bonusPercentage) / 100;
  const totalLimit = Math.min(baseAmount + bonusAmount, MAX_LOAN_AMOUNT);
  const nextMilestone = ((bonusUnits + 1) * SAVINGS_BONUS_UNIT) - savings;

  return {
    bonusPercentage,
    bonusAmount,
    totalLimit,
    nextMilestone: Math.max(0, nextMilestone)
  };
}

/**
 * Check if user has sufficient savings to skip deposit step
 */
export function hasSufficientSavings(userSavings: number, requiredDeposit: number): boolean {
  return userSavings >= requiredDeposit;
}

/**
 * Check if user has minimum savings to qualify for a loan
 */
export function canApplyForLoan(userSavings: number): boolean {
  return userSavings >= LOAN_CONSTANTS.MIN_SAVINGS_FOR_LOAN;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}
