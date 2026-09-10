'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { crops as fallbackCrops } from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';
import { 
  CalendarCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  Users, 
  Building2, 
  IndianRupee, 
  ChevronRight, 
  LogIn
} from 'lucide-react';

import { NoticeTicker } from '@/components/home/NoticeTicker';
import { CitizenServices } from '@/components/home/CitizenServices';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [cropsList, setCropsList] = useState<any[]>(fallbackCrops);

  useEffect(() => {
    async function loadData() {
      const cropsRes = await apiClient<{ crops: any[] }>('/crops');
      if (cropsRes.success && cropsRes.data?.crops?.length) {
        setCropsList(cropsRes.data.crops);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white" id="main-content">
      
      {/* Government Announcement & Status Marquee */}
      <NoticeTicker />

      {/* 1. HERO SECTION (White Background, Zero Flashing Photo, Clean Government Layout) */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-gray-200 bg-white">
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          {/* Government Portal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14532d]/10 border border-[#14532d]/25 text-[#14532d] text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#f97316]" />
            <span>{language === 'hi' ? 'राष्ट्रीय कृषि ई-उपार्जन पोर्टल 2026' : 'National Agricultural E-Procurement Portal • MSP 2026'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            {language === 'hi' ? (
              <>
                फसल बेचना अब <span className="text-[#14532d] underline decoration-[#f97316] decoration-wavy decoration-2">आसान और तनावमुक्त</span>
              </>
            ) : (
              <>
                Sell Your Crops with <span className="text-[#14532d] underline decoration-[#f97316] decoration-wavy decoration-2">Dignity, Clarity</span> & Zero Long Queues
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-normal">
            {t('landing.hero.subtitle')}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-base shadow-md hover:shadow-lg transition duration-200"
              >
                <span>{language === 'hi' ? `नमस्ते ${user.name}, डैशबोर्ड खोलें` : `Welcome ${user.name}, Open Dashboard`}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-base shadow-md hover:shadow-lg transition duration-200"
              >
                <LogIn className="w-5 h-5 text-amber-300" />
                <span>{language === 'hi' ? 'किसान लॉगिन / पंजीकरण करें' : 'Farmer Sign In / Register'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/centers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-base shadow-xs hover:border-gray-400 transition"
            >
              <MapPin className="w-5 h-5 text-[#f97316]" />
              <span>{language === 'hi' ? 'खरीद केंद्र व दरें देखें' : 'View Mandis & MSP Rates'}</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-gray-200 max-w-lg mx-auto text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">100%</div>
              <div className="text-xs text-gray-600 font-medium">{language === 'hi' ? 'पारदर्शी एमएसपी' : 'Official MSP Rates'}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#14532d]">~20 min</div>
              <div className="text-xs text-gray-600 font-medium">{language === 'hi' ? 'औसत प्रतीक्षा समय' : 'Avg. Token Wait'}</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#ea580c]">SMS/Voice</div>
              <div className="text-xs text-gray-600 font-medium">{language === 'hi' ? 'बिना इंटरनेट के भी' : 'Works without Data'}</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CITIZEN SERVICES QUICK GRID (e-Uparjan Service Navigation) */}
      <CitizenServices />

      {/* 3. REAL-TIME STATS STRIP */}
      <section className="bg-[#14532d] text-white py-8 border-y border-[#0f3d21] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-white">
                <Users className="w-6 h-6 text-[#f97316]" />
                <span>12,450+</span>
              </div>
              <p className="text-xs sm:text-sm text-green-100 font-medium">{t('landing.stats.farmersServed')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-white">
                <Building2 className="w-6 h-6 text-[#f97316]" />
                <span>89</span>
              </div>
              <p className="text-xs sm:text-sm text-green-100 font-medium">{t('landing.stats.centersActive')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-white">
                <IndianRupee className="w-6 h-6 text-[#f97316]" />
                <span>₹28.4 Cr</span>
              </div>
              <p className="text-xs sm:text-sm text-green-100 font-medium">{t('landing.stats.croresDisbursed')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-white">
                <Clock className="w-6 h-6 text-[#f97316]" />
                <span>78%</span>
              </div>
              <p className="text-xs sm:text-sm text-green-100 font-medium">{t('landing.stats.avgWaitReduced')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE 3 CORE PROBLEMS → TRANSFORMED */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-[#14532d] uppercase bg-[#14532d]/10 px-3.5 py-1.5 rounded-full border border-[#14532d]/20">
              {language === 'hi' ? 'समस्या का समाधान' : 'The Problem vs Our Solution'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {t('landing.problem.title')}
            </h2>
            <p className="text-base text-gray-600">
              {language === 'hi' 
                ? 'पारंपरिक मंडियों में किसान कई अनिश्चितताओं से जूझते हैं। मंडी मित्र इन तीनों गंभीर बाधाओं को डिजिटल रूप से समाप्त करता है:' 
                : 'Farmers traditionally faced opaque schedules and painful queues. Here is how Mandi Mitra directly tackles all three core pain points:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Problem 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('landing.problem.waiting')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('landing.problem.waitingDesc')}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 -mb-8 p-6 rounded-b-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#14532d]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'समाधान: 90-मिनट टाइम-स्लॉट बुकिंग' : 'Solution: 90-Minute Slot Appointments'}</span>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('landing.problem.info')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('landing.problem.infoDesc')}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 -mb-8 p-6 rounded-b-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#14532d]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'समाधान: लाइव खरीद कैलेंडर व एसएमएस' : 'Solution: Live Schedule Calendar & SMS'}</span>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#14532d] flex items-center justify-center border border-emerald-100">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('landing.problem.status')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('landing.problem.statusDesc')}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 -mb-8 p-6 rounded-b-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#14532d]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'समाधान: 8-चरणीय लाइव स्टेटस ट्रैकर' : 'Solution: 8-Stage Live Order-Style Tracking'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS (4 SIMPLE STEPS) */}
      <section className="py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              {t('landing.solution.title')}
            </h2>
            <p className="text-base text-gray-600">
              {language === 'hi' 
                ? 'चार सीधे चरणों में अपनी उपज बेचें — बिना किसी एजेंट या बिचौलिये के' 
                : 'Four transparent steps from your village home to bank account credit'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#14532d] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-900">{t('landing.solution.step1')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('landing.solution.step1Desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-900">{t('landing.solution.step2')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('landing.solution.step2Desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#14532d] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-900">{t('landing.solution.step3')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('landing.solution.step3Desc')}</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                4
              </div>
              <h4 className="text-lg font-bold text-gray-900">{t('landing.solution.step4')}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{t('landing.solution.step4Desc')}</p>
            </div>

          </div>

          <div className="text-center pt-4">
            <Link
              href="/centers"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm shadow-md transition"
            >
              <span>{language === 'hi' ? 'अपने निकटतम केंद्र खोजें' : 'Find Centers Near You'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. CURRENT MSP RATES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#14532d] uppercase">
                {language === 'hi' ? 'सरकारी न्यूनतम समर्थन मूल्य' : 'Government Mandated Rates'}
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {language === 'hi' ? 'वर्तमान खरीद दरें (MSP 2026)' : 'Active Procurement Rates (MSP 2026)'}
              </h2>
            </div>
            <p className="text-xs text-gray-600 max-w-md">
              {language === 'hi' 
                ? 'सभी भुगतान सीधे आधार से जुड़े बैंक खाते में डीबीटी (DBT) द्वारा 48 से 72 घंटों में किए जाते हैं।' 
                : 'All payments disbursed directly via DBT into Aadhaar-linked accounts within 48 to 72 hours.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {cropsList.map((crop: any) => (
              <div 
                key={crop.type || crop.id} 
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-[#14532d] transition-all hover:-translate-y-1 shadow-xs"
              >
                <div className="text-3xl mb-2">{crop.emoji || '🌾'}</div>
                <div className="text-base font-bold text-gray-900">
                  {language === 'hi' ? (crop.nameHi || crop.name) : (crop.nameEn || crop.name)}
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  {language === 'hi' ? (crop.seasonHi || crop.season) : crop.season}
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
                  <span className="text-lg font-black text-[#14532d]">₹{crop.mspRate}</span>
                  <span className="text-[11px] text-gray-500">/ {language === 'hi' ? 'क्विंटल' : 'quintal'}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. BOTTOM CALL TO ACTION */}
      <section className="py-20 bg-[#14532d] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif">
            {language === 'hi' 
              ? 'क्या आप अपनी अगली फसल बेचने के लिए तैयार हैं?' 
              : 'Ready to Experience Hassle-Free Procurement?'}
          </h2>
          <p className="text-base sm:text-lg text-green-100 max-w-2xl mx-auto">
            {language === 'hi' 
              ? 'बिना किसी परेशानी के अपना समय तय करें और अपनी मेहनत का पूरा मूल्य पाएं।' 
              : 'Book your slot in under 2 minutes. Receive instant SMS token and arrive with confidence.'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base shadow-lg transition"
              >
                {language === 'hi' ? 'मेरा डैशबोर्ड खोलें' : 'Go to My Dashboard'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-base shadow-lg transition"
              >
                {language === 'hi' ? 'किसान लॉगिन / पंजीकरण' : 'Farmer Sign In / Register'}
              </Link>
            )}
            <Link
              href="/centers"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-[#14532d] hover:bg-gray-100 font-bold text-base transition"
            >
              {language === 'hi' ? 'खरीद केंद्र व अनुसूची' : 'View Procurement Centers'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
