import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../../context/AppContext';
import { AuthContext } from '../../context/AuthContext';
import sellerAuthService from '../../services/sellerAuthService';
import NexCartLogo from '../../components/NexCartLogo';

import Step1Account from '../../components/seller/onboarding/Step1Account';
import Step2Profile from '../../components/seller/onboarding/Step2Profile';
import Step3Identity from '../../components/seller/onboarding/Step3Identity';
import Step4Payment from '../../components/seller/onboarding/Step4Payment';
import Step5Agreement from '../../components/seller/onboarding/Step5Agreement';

const steps = [
  { id: 1, title: 'Account' },
  { id: 2, title: 'Profile' },
  { id: 3, title: 'Identity' },
  { id: 4, title: 'Payment' },
  { id: 5, title: 'Agreement' },
];

const SellerOnboarding = () => {
  const { showToast } = useContext(AppContext);
  const { sellerRegister, sellerLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerData, setSellerData] = useState({});

  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;

    const fetchStatus = async () => {
      try {
        const res = await sellerAuthService.getProfile();
        if (res.success && res.data?.seller) {
          const seller = res.data.seller;
          const previousData = {
            ...seller.accountInfo,
            ...seller.profile,
          };
          setSellerData(previousData);

          if (seller.onboardingStep) {
            const nextStep = seller.onboardingStep + 1;
            setCurrentStep(nextStep > 5 ? 5 : nextStep);
          }
        }
      } catch {
        console.log('No existing seller profile found, starting fresh.');
      }
    };

    fetchStatus();
  }, []);

  const ensureSellerEntry = async () => {
    try {
      await sellerAuthService.createSellerEntry();
    } catch (error) {
      if (error?.statusCode !== 409 && error?.message !== 'Seller profile already exists.') {
        throw error;
      }
    }
  };

  const handleNext = async (data) => {
    try {
      const updatedData = { ...sellerData, ...data };
      setSellerData(updatedData);

      if (currentStep === 1) {
        setIsSubmitting(true);

        try {
          const username =
            updatedData.username ||
            `${(updatedData.firstName || '').trim()}${(updatedData.lastName || '').trim()}`.toLowerCase() ||
            updatedData.email?.split('@')[0];

          const registerResult = await sellerRegister(
            updatedData.firstName,
            updatedData.lastName,
            updatedData.email,
            updatedData.password,
            updatedData.phone,
            username
          );

          if (!registerResult.success) {
            const loginResult = await sellerLogin(updatedData.email, updatedData.password);
            if (!loginResult.success) {
              throw new Error(registerResult.message || loginResult.message || 'Registration failed');
            }
          }

          await ensureSellerEntry();

          await sellerAuthService.saveStep1({
            displayName: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
            businessType: updatedData.businessType || '',
            phone: updatedData.phone,
            email: updatedData.email,
          });
        } finally {
          setIsSubmitting(false);
        }

        setCurrentStep(2);
      } else if (currentStep === 2) {
        setIsSubmitting(true);
        try {
          await sellerAuthService.updateProfile({
            shopName: data.displayName || '',
            description: data.bio || '',
            address: data.address?.pickupAddress || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            pincode: data.address?.pincode || '',
          });
        } finally {
          setIsSubmitting(false);
        }
        setCurrentStep(3);
      } else if (currentStep === 3) {
        setIsSubmitting(true);
        try {
          await sellerAuthService.uploadIdentity({
            idType: data.idType,
            aadhaarNumber: data.aadhaarNumber,
            pan: data.pan,
            gst: data.gst,
            frontImage: data.frontImage,
            backImage: data.backImage,
          });
        } finally {
          setIsSubmitting(false);
        }
        setCurrentStep(4);
      } else if (currentStep === 4) {
        setIsSubmitting(true);
        try {
          await sellerAuthService.submitPayment({
            accountHolder: data.bank?.accountHolder || '',
            accountNumber: data.bank?.accountNumber || '',
            ifsc: data.bank?.ifsc || '',
            upiId: data.upiId || '',
          });
        } finally {
          setIsSubmitting(false);
        }
        setCurrentStep(5);
      } else if (currentStep === 5) {
        setIsSubmitting(true);
        try {
          await sellerAuthService.agreeTerms();
        } finally {
          setIsSubmitting(false);
        }
        showToast('Registration complete! Verification pending.', 'success');
        navigate('/seller/verification-status');
      }
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = typeof error === 'string' ? error : error?.message || error?.error || 'An error occurred. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070B12] text-gray-900 dark:text-white flex flex-col relative overflow-hidden">
      <nav className="flex justify-between items-center p-6 lg:px-12 relative z-10 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-[#0c111d]/50 backdrop-blur-xl">
        <NexCartLogo />
        <div className="text-xs font-bold text-gray-500 tracking-widest uppercase">Seller Onboarding</div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-white/10 -z-10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep >= step.id
                      ? 'bg-primary text-black shadow-[0_0_15px_rgba(255,193,7,0.4)]'
                      : 'bg-gray-200 dark:bg-[#1a2235] text-gray-400'
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-bold ${
                    currentStep >= step.id ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xl">
          <div className="glass-card p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && <Step1Account onNext={handleNext} isSubmitting={isSubmitting} />}
                {currentStep === 2 && <Step2Profile onNext={handleNext} onBack={handleBack} initialData={sellerData} />}
                {currentStep === 3 && <Step3Identity onNext={handleNext} onBack={handleBack} initialData={sellerData} />}
                {currentStep === 4 && <Step4Payment onNext={handleNext} onBack={handleBack} initialData={sellerData} />}
                {currentStep === 5 && <Step5Agreement onNext={handleNext} onBack={handleBack} isSubmitting={isSubmitting} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <div className="fixed top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
};

export default SellerOnboarding;
