

## Plan: Copy Code from `kindred-views-site` GitHub Repo

This is a **Shwari M-Pesa loan platform** -- a Kenyan fintech app with loan applications, savings, payments, admin dashboard, authentication, and push notifications. It uses Supabase, Framer Motion, OneSignal, and Capacitor.

### What needs to be done

The repo has ~40+ files that differ from the current project. I will fetch each file's raw content from GitHub and write it into this project. Here is the full inventory:

**New files to create:**
- `src/components/Homepage.tsx` (632 lines - main landing page)
- `src/components/AuthWrapper.tsx` (auth context provider)
- `src/components/AuthGuard.tsx`
- `src/components/SplashScreen.tsx`
- `src/components/AndroidLayout.tsx`, `AndroidTopBar.tsx`, `AndroidBottomNav.tsx`
- `src/components/AdminAuth.tsx`, `AdminDashboard.tsx`, `AdminNotificationPanel.tsx`
- `src/components/LoanEligibilityForm.tsx` (802 lines)
- `src/components/LoanDisbursement.tsx`, `LoanDisbursementSuccess.tsx`
- `src/components/LoanNotification.tsx`, `LoanResults.tsx`
- `src/components/OkoaExpressForm.tsx`
- `src/components/OneSignalSetup.tsx`, `ServiceWorkerRegistration.tsx`
- `src/components/PaymentVerification.tsx`, `PushNotificationSetup.tsx`
- `src/components/ui/loading-button.tsx`
- `src/pages/Admin.tsx`, `Auth.tsx`, `Payment.tsx`, `ProcessingFeePayment.tsx`
- `src/pages/LoanDisbursementSuccessPage.tsx`, `Savings.tsx`
- `src/integrations/supabase/client.ts`, `types.ts`
- `src/lib/loanCalculations.ts`, `notifications.ts`
- `src/hooks/usePushNotifications.ts`
- `src/assets/shwari-logo.png`, `google-play-badge.png` (binary - will need manual upload)

**Existing files to update:**
- `src/App.tsx` (new routes, AuthProvider, SplashScreen)
- `src/pages/Index.tsx` (now renders Homepage component)
- `src/pages/NotFound.tsx` (updated version)
- `src/index.css` (complete redesign - fintech theme)
- `src/main.tsx` (minor update)

**New dependencies to add:**
- `framer-motion` (animations)
- `react-onesignal` (push notifications)
- `@capacitor/*` (mobile app support)
- `@supabase/supabase-js` (database)

### Important notes

- **Binary assets** (`shwari-logo.png`, `google-play-badge.png`) cannot be fetched as raw text. You will need to upload these manually or I can use placeholder references.
- **Supabase connection**: The repo points to a specific Supabase instance. You will need to connect your own Supabase project in Lovable Cloud or update the credentials.
- **OneSignal**: Requires an API key configured as an environment variable.
- This is a large migration (~30+ files). I will process them in batches.

### Implementation order

1. Update `package.json` with new dependencies
2. Update `src/index.css` with new theme
3. Create `src/integrations/supabase/` files (client + types)
4. Create `src/lib/` utility files (loanCalculations, notifications)
5. Create all new components (auth, layout, loan, admin, etc.)
6. Create all new pages
7. Update `src/App.tsx` with new routes and providers
8. Update `src/pages/Index.tsx`
9. Handle assets (placeholder for binary files)

