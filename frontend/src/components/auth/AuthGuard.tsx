'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { Lock, LogIn, Sparkles, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  pageTitle: { en: string; hi: string };
  pageDescription: { en: string; hi: string };
}

export function AuthGuard({ children, pageTitle, pageDescription }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#14532d] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-600">
            {language === 'hi' ? 'सत्यापन किया जा रहा है...' : 'Checking farmer credentials...'}
          </span>
        </div>
      </div>
    );
  }

  // If user is authenticated, show their personal dashboard/page content!
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If NOT authenticated, show a clean Lock Screen prompting them to login
  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-2xl p-8 sm:p-10 border border-gray-200 shadow-lg text-center space-y-6">
        
        {/* Lock Badge */}
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto border border-emerald-100">
          <Lock className="w-10 h-10 text-[#14532d]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532d]/10 text-[#14532d] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'व्यक्तिगत किसान सुरक्षा' : 'Personal Farmer Portal'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
            {language === 'hi' ? pageTitle.hi : pageTitle.en}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            {language === 'hi'
              ? `${pageDescription.hi} देखने के लिए कृपया पहले अपने मोबाइल नंबर या आधार से लॉगिन/रजिस्टर करें।`
              : `To access ${pageDescription.en}, please first identify yourself using your Mobile Number or Aadhaar.`}
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-3 text-left py-4 px-5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <UserCheck className="w-4 h-4 text-[#14532d]" />
            <span>{language === 'hi' ? 'आपका व्यक्तिगत टोकन' : 'Your Personal Token'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Sparkles className="w-4 h-4 text-[#f97316]" />
            <span>{language === 'hi' ? 'डीबीटी बैंक भुगतान' : 'DBT Payment History'}</span>
          </div>
        </div>

        {/* Primary CTA: Go to Login */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm shadow-md transition"
          >
            <LogIn className="w-4 h-4" />
            <span>{language === 'hi' ? 'किसान लॉगिन / रजिस्टर करें' : 'Sign In / Register Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition"
          >
            <span>{language === 'hi' ? 'वेबसाइट की जानकारी देखें' : 'Explore Website First'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
