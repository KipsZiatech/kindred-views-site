import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import shwariLogo from '@/assets/shwari-logo.png';
import { 
  Smartphone, 
  Zap, 
  Shield, 
  Eye, 
  Clock, 
  CheckCircle,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Award,
  Globe,
  Heart,
  Flag,
  Building,
  Phone,
  Mail,
  MapPin,
  Banknote,
  FileText,
  CreditCard,
  Download,
  ChevronDown,
  HelpCircle,
  Quote,
  MessageCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from 'react-router-dom';
import { AndroidLayout } from './AndroidLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Homepage = () => {

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Disbursement",
      description: "Funds sent to your M-Pesa instantly upon approval - no waiting",
      color: "text-emerald-600"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "No CRB Check Required",
      description: "Apply without perfect credit - we focus on your ability to repay",
      color: "text-blue-600"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "100% Mobile Experience",
      description: "Designed for Kenyan mobile users - works perfectly on any phone",
      color: "text-purple-600"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Full Transparency",
      description: "All costs shown upfront - no surprises or hidden charges",
      color: "text-orange-600"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Made for Kenyans",
      description: "Built by Kenyans for Kenyans - we understand your needs",
      color: "text-red-600"
    },
    {
      icon: <Flag className="h-6 w-6" />,
      title: "Kenyan Licensed",
      description: "Fully licensed and regulated by Kenyan financial authorities",
      color: "text-green-600"
    }
  ];

  const stats = [
    { value: "75,000+", label: "Kenyans Served", icon: <Users className="h-5 w-5" />, description: "Across all 47 counties" },
    { value: "KES 3.2B+", label: "Loans Disbursed", icon: <TrendingUp className="h-5 w-5" />, description: "Since 2022" },
    { value: "4.9", label: "Customer Rating", icon: <Star className="h-5 w-5" />, description: "Google Play Store" },
    { value: "2 min", label: "Average Approval", icon: <Clock className="h-5 w-5" />, description: "Record fast processing" }
  ];

  const trustBadges = [
    {
      icon: <Award className="h-8 w-8" />,
      title: "CBK Licensed",
      description: "Licensed money lender under Central Bank of Kenya regulations"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Data Protection",
      description: "Your personal information is encrypted and secure"
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: "Registered Company",
      description: "Incorporated in Kenya with physical offices in Nairobi"
    }
  ];

  const kenyanElements = [
    {
      emoji: "🇰🇪",
      title: "Proudly Kenyan",
      description: "Built in Kenya, for Kenyans"
    },
    {
      emoji: "📱",
      title: "M-Pesa Native",
      description: "Seamless integration with your M-Pesa wallet"
    },
    {
      emoji: "🏪",
      title: "From Kibera to Karen",
      description: "Serving all Kenyans regardless of location"
    }
  ];

  const faqs = [
    {
      question: "What is the excise duty fee?",
      answer: "The excise duty is a government-mandated fee (KES 99-180) required by the Kenya Revenue Authority (KRA) for loan processing. It's a one-time payment that enables us to process and disburse your loan."
    },
    {
      question: "How long does loan disbursement take?",
      answer: "Once you complete the excise duty and processing fee payments, your loan is disbursed instantly to your M-Pesa within 2-3 hours. No waiting, no delays!"
    },
    {
      question: "Is my personal information safe?",
      answer: "Absolutely! We use bank-level encryption to protect your data. We're licensed by CBK and comply with Kenya's Data Protection Act. We never share your information with third parties."
    },
    {
      question: "What is the processing fee for?",
      answer: "The processing fee covers loan administration, M-Pesa transaction costs, and our operational costs. It's a one-time fee separate from the excise duty."
    },
    {
      question: "Can I repay my loan early?",
      answer: "Yes! Early repayment is encouraged and there are no penalties. Repaying early can also improve your credit limit for future loans."
    },
    {
      question: "What are the loan limits?",
      answer: "You can borrow between KES 15,000 and KES 100,000 depending on your qualification. First-time borrowers typically start with lower limits that increase with successful repayments."
    }
  ];

  const testimonials = [
    {
      name: "Mary Wanjiku",
      location: "Nairobi",
      amount: "KES 35,000",
      quote: "I was skeptical at first about saving before getting a loan, but now I understand why. I've built real savings while accessing credit when I need it!",
      rating: 5
    },
    {
      name: "John Ochieng",
      location: "Kisumu",
      amount: "KES 50,000",
      quote: "The fastest loan I've ever received. From application to money in my M-Pesa took less than 5 minutes. Very transparent with all fees.",
      rating: 5
    },
    {
      name: "Grace Muthoni",
      location: "Nakuru",
      amount: "KES 25,000",
      quote: "What I love most is that my savings grow while I have access to loans. It's not just borrowing - it's building financial discipline.",
      rating: 5
    }
  ];

  const howItWorksSteps = [
    { 
      step: 1, 
      title: "Fill Application", 
      description: "Quick 2-minute form with your basic details",
      icon: <FileText className="h-6 w-6" />
    },
    { 
      step: 2, 
      title: "Pay Excise Duty", 
      description: "KES 99-180 government fee to KRA",
      icon: <Banknote className="h-6 w-6" />
    },
    { 
      step: 3, 
      title: "Pay Processing Fee", 
      description: "One-time fee for loan administration",
      icon: <CreditCard className="h-6 w-6" />
    },
    { 
      step: 4, 
      title: "Withdraw Loan", 
      description: "Instant disbursement to your M-Pesa",
      icon: <Smartphone className="h-6 w-6" />
    }
  ];

  return (
    <AndroidLayout 
      title="Shwari M-Pesa" 
      showTopBar={true}
      showBottomNav={true}
      showBack={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

        {/* Hero Section */}
        <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 lg:py-20">
          {/* Kenyan Flag Colors Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-black/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-8 lg:mb-12">
              <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 px-4 py-2 text-sm font-medium border border-emerald-200">
                  🇰🇪 Instant M-Pesa Loans in Kenya
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="block">
                  <span className="text-emerald-600">Shwari</span>{" "}
                  <span className="text-foreground">M-Pesa</span>
                </span>
                <span className="block">
                  <span className="text-muted-foreground">Instant</span>{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Mobile Loans
                  </span>
                </span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-muted-foreground font-normal mt-2">
                  Fast, Secure & Reliable
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Need money fast? Apply now for unsecured mobile loans from{" "}
                <span className="font-bold text-foreground">KES 10,000 to 100,000</span>{" "}
                disbursed instantly to your M-Pesa account. No collateral, no guarantors needed.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/apply" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl smooth-transition animate-button-pulse"
            >
                    Apply for Loan <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg border-2 hover:bg-muted smooth-hover">
            Learn More
          </Button>
              </motion.div>
            </div>

            {/* Hero Visual - Mobile Optimized */}
            <motion.div 
              className="relative mx-auto max-w-2xl lg:max-w-4xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 overflow-hidden shadow-2xl">
                {/* Kenyan-inspired patterns */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
                  <div className="absolute top-2 left-0 w-full h-2 bg-red-600"></div>
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-green-600"></div>
                </div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/30 mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-emerald-600 text-2xl sm:text-3xl lg:text-4xl font-bold">M</span>
                    </div>
                    <p className="text-white text-center font-semibold text-sm sm:text-base lg:text-lg">M-Pesa Integration</p>
                    <p className="text-white/80 text-center text-xs sm:text-sm mt-1">Instant & Secure</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 mt-4">
                    {kenyanElements.map((element, index) => (
                      <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-2 border border-white/20">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg sm:text-xl">{element.emoji}</span>
                          <span className="text-white text-xs sm:text-sm font-medium">{element.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Floating Kenyan-inspired elements */}
                <div className="absolute top-4 right-4 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full opacity-40 animate-pulse"></div>
                <div className="absolute bottom-6 left-6 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full opacity-40 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-8 w-3 h-3 sm:w-4 sm:h-4 bg-black rounded-full opacity-30 animate-pulse delay-500"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Trust & Stats Section */}
      <section className="bg-card/50 border-t border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          {/* Trust Badges */}
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">Trusted by Kenyans Nationwide</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're not just another loan app. We're a licensed, regulated financial services provider 
              committed to empowering Kenyans with accessible credit.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-center mb-4 text-emerald-600">
                    {badge.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Stats Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-4 lg:p-6 bg-card rounded-xl border border-border hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-center mb-3 text-emerald-600">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 lg:py-20">
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
              Why 75,000+ Kenyans Choose Shwari M-Pesa
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Built specifically for Kenyan needs with features that matter most to you - 
              speed, affordability, transparency, and accessibility.
            </p>
          </motion.div>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full group hover:shadow-xl transition-all duration-300 border-border hover:border-emerald-200 bg-card">
                <CardContent className="p-6 lg:p-8">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 ${feature.color} bg-muted group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg lg:text-xl mb-3 text-center text-foreground group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-center text-sm lg:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Kenyan Culture Integration */}
        <motion.div 
          className="mt-16 text-center bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl p-8 lg:p-12 border border-emerald-200 dark:border-emerald-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">
              🇰🇪 Designed for Kenya, By Kenyans
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              "Umoja ni nguvu, utengano ni udhaifu" - Together we're stronger. 
              We understand Kenyan challenges and have built solutions that work for our people.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full border border-emerald-200">🏪 All 47 Counties</span>
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full border border-emerald-200">📱 Kiswahili Support</span>
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full border border-emerald-200">💚 Community First</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Loan Details Section - Google Ads Compliance */}
      <section id="rates" className="bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
                Clear, Honest Pricing - No Hidden Fees
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We believe in complete transparency. Here's exactly what you'll pay - 
                no surprises, no fine print, no hidden charges.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Required Loan Terms */}
              <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-card shadow-lg">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center mb-6">
                    <Banknote className="h-6 w-6 text-emerald-600 mr-3" />
                    <h3 className="text-xl lg:text-2xl font-bold text-emerald-700 dark:text-emerald-400">Loan Terms</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground font-medium">Loan Amounts:</span>
                      <span className="font-bold text-foreground text-lg">KES 10,000 – KES 100,000</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground font-medium">Repayment Period:</span>
                      <span className="font-bold text-foreground text-lg">3 months (90 days)</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground font-medium">Monthly Interest Rate:</span>
                      <span className="font-bold text-foreground text-lg">3.6% per month</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-red-50 dark:bg-red-950/20 px-4 rounded-lg">
                      <span className="text-muted-foreground font-medium">APR (Annual):</span>
                      <span className="font-bold text-lg text-red-600">43.2% per annum</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Representative Example */}
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-card shadow-lg">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center mb-6">
                    <FileText className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-400">Example Calculation</h3>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 lg:p-6 rounded-xl mb-4">
                    <p className="font-bold text-center mb-4 text-foreground text-lg">
                      For a loan of KES 10,000 repaid over 3 months:
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Principal Amount:</span>
                        <span className="font-bold text-foreground">KES 10,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Interest (3.6% monthly):</span>
                        <span className="font-bold text-foreground">KES 1,080</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Excise Duty (one-time):</span>
                        <span className="font-bold text-foreground">KES 207</span>
                      </div>
                      <div className="border-t border-border pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground text-lg">Total Repayable:</span>
                          <span className="font-bold text-red-600 text-xl">KES 11,287</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    * All fees are disclosed upfront. No hidden charges whatsoever.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Excise Duty Explanation */}
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-card shadow-lg mb-8">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center mb-6">
                  <Globe className="h-6 w-6 text-orange-600 mr-3" />
                  <h3 className="text-xl lg:text-2xl font-bold text-orange-700 dark:text-orange-400">
                    Understanding Excise Duty
                  </h3>
                </div>
                <div className="prose prose-sm lg:prose-base max-w-none">
                  <p className="text-muted-foreground mb-4">
                    <strong className="text-foreground">What is Excise Duty?</strong> This is a mandatory government tax 
                    imposed by the Kenya Revenue Authority (KRA) on all financial services, including loans.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                      <h4 className="font-bold text-foreground mb-2">Legal Requirement</h4>
                      <p className="text-sm text-muted-foreground">
                        Mandated by the Finance Act and collected by all licensed lenders in Kenya
                      </p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                      <h4 className="font-bold text-foreground mb-2">Government Revenue</h4>
                      <p className="text-sm text-muted-foreground">
                        Goes directly to the government to fund public services and infrastructure
                      </p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-yellow-600">💡 Important:</span> This fee is NOT profit for Shwari M-Pesa. 
                      It's remitted directly to KRA as required by Kenyan law. All licensed lenders must collect this fee.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Important Disclosures */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center mb-6">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-xl lg:text-2xl font-bold text-green-800 dark:text-green-400">
                    Our Commitment to You
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Minimum repayment period: 90 days (3 months)</p>
                        <p className="text-sm text-muted-foreground">We don't offer predatory short-term loans</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Maximum repayment period: 90 days (3 months)</p>
                        <p className="text-sm text-muted-foreground">Clear, predictable repayment timeline</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">No loans under 61 days offered</p>
                        <p className="text-sm text-muted-foreground">Compliant with Google Ads and CBK guidelines</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">All fees disclosed upfront</p>
                        <p className="text-sm text-muted-foreground">No hidden charges, ever</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Instant M-Pesa disbursement</p>
                        <p className="text-sm text-muted-foreground">Money in your account within minutes</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Licensed money lending services</p>
                        <p className="text-sm text-muted-foreground">Regulated and compliant with all laws</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid sm:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <Shield className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h4 className="font-bold text-foreground mb-2">Secure & Licensed</h4>
                <p className="text-sm text-muted-foreground">Regulated financial services under CBK oversight</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <Zap className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h4 className="font-bold text-foreground mb-2">Lightning Fast</h4>
                <p className="text-sm text-muted-foreground">Average approval time under 2 minutes</p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <Eye className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <h4 className="font-bold text-foreground mb-2">Crystal Clear</h4>
                <p className="text-sm text-muted-foreground">All costs and terms clearly disclosed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Section */}
      <section id="trust" className="container mx-auto px-4 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-foreground">
            Why Kenyans Trust Shwari M-Pesa
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-card p-6 lg:p-8 rounded-xl border border-border shadow-sm">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Government Licensed</h3>
              <p className="text-muted-foreground text-sm">
                Licensed by Central Bank of Kenya and registered with relevant authorities
              </p>
            </div>
            
            <div className="bg-card p-6 lg:p-8 rounded-xl border border-border shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Data Protection</h3>
              <p className="text-muted-foreground text-sm">
                Your personal and financial data is encrypted and protected
              </p>
            </div>
            
            <div className="bg-card p-6 lg:p-8 rounded-xl border border-border shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Community Impact</h3>
              <p className="text-muted-foreground text-sm">
                Supporting Kenyan entrepreneurs and families for over 2 years
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 p-8 lg:p-12 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              "Hongera! 🎉 You've found Kenya's most trusted loan platform"
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Join the thousands of Kenyans who have successfully improved their lives with Shwari M-Pesa. 
              From small business owners in Kibera to farmers in Kiambu, we're here to help you achieve your goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full">✅ No Hidden Fees</span>
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full">✅ Instant Approval</span>
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full">✅ M-Pesa Integration</span>
              <span className="bg-white/70 dark:bg-card px-4 py-2 rounded-full">✅ Kenyan Licensed</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Steps Section */}
      <section id="how-it-works" className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-t border-border">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 px-4 py-1">
                Simple Process
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-foreground">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your loan in 4 easy steps. Complete transparency, no hidden charges.
              </p>
            </motion.div>
            
            {/* Steps Grid */}
            <div className="relative">
              {/* Connecting Line - Desktop */}
              <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-800 dark:via-emerald-600 dark:to-emerald-800" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
                {howItWorksSteps.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Step Number Circle */}
                    <div className="relative z-10 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-2xl font-bold text-white">{item.step}</span>
                      </div>
                      {/* Pulse Animation */}
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                    </div>
                    
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                      {item.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    
                    {/* Mobile Arrow */}
                    {index < howItWorksSteps.length - 1 && (
                      <div className="lg:hidden mt-6 mb-2">
                        <ChevronDown className="h-6 w-6 text-emerald-400 animate-bounce" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Bottom CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <div className="inline-flex items-center gap-3 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-6 py-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                  Excise duty is a one-time government fee (KES 99-180) for loan processing
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-4 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Real stories from Kenyans who trust Shwari M-Pesa
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-emerald-200 mb-3" />
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-emerald-200">
                        Loan: {testimonial.amount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Got questions? We've got answers.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-emerald-300"
                >
                  <AccordionTrigger className="text-left font-semibold hover:text-emerald-600 hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Still have questions?</p>
              <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Umehitaji Pesa? Apply Sasa! 🚀
              </h2>
              <p className="text-xl lg:text-2xl mb-4 text-emerald-100">
                Ready to get your instant loan?
              </p>
              <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
                Join over 75,000 Kenyans who trust Shwari M-Pesa for quick, reliable, and transparent financial solutions.
                Your loan is just 2 minutes away!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to="/apply" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Apply Now - Get KES 10,000+ <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Check Rates
                </Button>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">2 min</div>
                  <div className="text-sm text-emerald-100">Average Approval</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">0</div>
                  <div className="text-sm text-emerald-100">Hidden Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold">24/7</div>
                  <div className="text-sm text-emerald-100">Available</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer - Business Transparency Compliance */}
      <footer id="contact" className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Information */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={shwariLogo} 
                  alt="Shwari M-Pesa" 
                  className="w-10 h-10 object-contain rounded-xl"
                />
                <div>
                  <h3 className="text-xl font-bold text-foreground">Shwari M-Pesa Kenya</h3>
                  <p className="text-sm text-muted-foreground">🇰🇪 Empowering Kenyans since 2022</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Physical Address:</p>
                    <p className="text-muted-foreground">Shwari M-Pesa Limited</p>
                    <p className="text-muted-foreground">ABC Place, Waiyaki Way</p>
                    <p className="text-muted-foreground">Westlands, Nairobi, Kenya</p>
                    <p className="text-muted-foreground">P.O. Box 12345-00100, Nairobi</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">+254 700 123 456</p>
                    <p className="text-muted-foreground">Customer Support</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">support@shwaripesa.co.ke</p>
                    <p className="text-muted-foreground">24/7 Email Support</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legal & Compliance */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Legal & Compliance</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground">License:</p>
                  <p className="text-muted-foreground">Money Lending License ML/2024/001</p>
                </div>
                <div className="mt-6 space-y-2">
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                  <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                © 2024 Shwari M-Pesa Limited. Licensed by Central Bank of Kenya. All rights reserved.
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Badge variant="outline" className="text-xs">🏛️ CBK Licensed</Badge>
                <Badge variant="outline" className="text-xs">🇰🇪 Made in Kenya</Badge>
                <Badge variant="outline" className="text-xs">🔒 Secure Platform</Badge>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </AndroidLayout>
  );
};

export default Homepage;