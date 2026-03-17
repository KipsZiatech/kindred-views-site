import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Users, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FormData {
  nationalId: string;
  loanType: string;
  education: string;
  employment: string;
  income: string;
  refereeName: string;
  refereePhone: string;
  refereeRelation: string;
}

const steps = [
  { 
    id: 1, 
    title: 'Personal Info', 
    icon: User,
    description: 'Basic identification details'
  },
  { 
    id: 2, 
    title: 'Loan Details', 
    icon: CreditCard,
    description: 'Loan type and preferences'
  },
  { 
    id: 3, 
    title: 'Background', 
    icon: Briefcase,
    description: 'Education and employment'
  },
  { 
    id: 4, 
    title: 'Reference', 
    icon: Users,
    description: 'Emergency contact details'
  }
];

const loanTypes = [
  { value: 'student', label: 'Student Loan', description: 'Education financing' },
  { value: 'personal', label: 'Personal Loan', description: 'General purpose' },
  { value: 'agriculture', label: 'Agriculture Loan', description: 'Farm investments' },
  { value: 'car', label: 'Car Loan', description: 'Vehicle financing' },
  { value: 'education', label: 'Education Loan', description: 'Training courses' },
  { value: 'emergency', label: 'Emergency Loan', description: 'Urgent needs' },
  { value: 'rental', label: 'Rental Loan', description: 'Property deposits' }
];

export default function ShwariMPesaForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nationalId: '',
    loanType: '',
    education: '',
    employment: '',
    income: '',
    refereeName: '',
    refereePhone: '',
    refereeRelation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to the apply page
    window.location.href = 'https://shwarimpesa.co.ke/apply.php';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nationalId" className="text-sm font-medium">
                National ID Number
              </Label>
              <Input
                id="nationalId"
                type="text"
                placeholder="Enter your ID number"
                value={formData.nationalId}
                onChange={(e) => updateFormData('nationalId', e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Please enter a valid ID number (6 to 12 digits)
              </p>
            </div>

          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Choose Loan Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loanTypes.map((loan) => (
                  <motion.div
                    key={loan.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 ${
                        formData.loanType === loan.value 
                          ? 'ring-2 ring-primary bg-accent' 
                          : 'hover:shadow-medium'
                      }`}
                      onClick={() => updateFormData('loanType', loan.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{loan.label}</h4>
                            <p className="text-xs text-muted-foreground">{loan.description}</p>
                          </div>
                          {formData.loanType === loan.value && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Education Level</Label>
              <Select value={formData.education} onValueChange={(value) => updateFormData('education', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondary">Secondary / High School</SelectItem>
                  <SelectItem value="diploma">Diploma / Certificate</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Employment Status</Label>
              <Select value={formData.employment} onValueChange={(value) => updateFormData('employment', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="self-employed">Self-Employed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Monthly Income</Label>
              <Select value={formData.income} onValueChange={(value) => updateFormData('income', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-10000">0–10,000 KES</SelectItem>
                  <SelectItem value="10000-25000">10,000–25,000 KES</SelectItem>
                  <SelectItem value="25000-35000">25,000–35,000 KES</SelectItem>
                  <SelectItem value="35000-45000">35,000–45,000 KES</SelectItem>
                  <SelectItem value="50000+">50,000+ KES</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="refereeName" className="text-sm font-medium">
                Referee Full Name
              </Label>
              <Input
                id="refereeName"
                type="text"
                placeholder="Enter referee's full name"
                value={formData.refereeName}
                onChange={(e) => updateFormData('refereeName', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refereePhone" className="text-sm font-medium">
                Referee Phone Number
              </Label>
              <Input
                id="refereePhone"
                type="tel"
                placeholder="e.g., 0712345678"
                value={formData.refereePhone}
                onChange={(e) => updateFormData('refereePhone', e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Relationship to Referee</Label>
              <Select value={formData.refereeRelation} onValueChange={(value) => updateFormData('refereeRelation', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="brother">Brother</SelectItem>
                  <SelectItem value="sister">Sister</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-hero text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Shwari M-Pesa Eligibility
              </h1>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Trusted by Thousands</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Step {currentStep} of {steps.length}
              </h2>
              <Badge variant="secondary" className="px-3 py-1">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2 mb-6" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-primary text-white shadow-glow' : 
                        isCompleted ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-primary" })}
                  <span>{steps[currentStep - 1].title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  {currentStep === steps.length ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 gradient-primary"
                    >
                      {isSubmitting ? 'Checking...' : 'Check Eligibility'}
                      {!isSubmitting && <CheckCircle className="h-4 w-4" />}
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">100% Secure</h3>
                <p className="text-xs text-muted-foreground">Your data is protected</p>
              </Card>
              <Card className="text-center p-4">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Instant Results</h3>
                <p className="text-xs text-muted-foreground">Get approved quickly</p>
              </Card>
              <Card className="text-center p-4">
                <Star className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Top Rated</h3>
                <p className="text-xs text-muted-foreground">Thousands of satisfied customers</p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}