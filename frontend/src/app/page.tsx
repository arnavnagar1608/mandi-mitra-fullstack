'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { crops as fallbackCrops, testimonials as fallbackTestimonials, Testimonial } from '@/lib/mock-data';
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
  TrendingUp, 
  Users, 
  Building2, 
  IndianRupee, 
  Smartphone, 
  ChevronRight, 
  Quote, 
  Star,
  LogIn
} from 'lucide-react';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [cropsList, setCropsList] = useState<any[]>(fallbackCrops);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>(fallbackTestimonials);

  useEffect(() => {
    async function loadData() {
      const [cropsRes, testRes] = await Promise.all([
        apiClient<{ crops: any[] }>('/crops'),
        apiClient<{ testimonials: Testimonial[] }>('/testimonials')
      ]);

      if (cropsRes.success && cropsRes.data?.crops?.length) {
        setCropsList(cropsRes.data.crops);
      }
      if (testRes.success && testRes.data?.testimonials?.length) {
        setTestimonialsList(testRes.data.testimonials);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E8DFD0]/60 bg-gradient-to-b from-[#FDF8F0] via-[#FAF3E6] to-[#F5EDE0]">
        
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4912A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#5B7F3B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5B7F3B]/10 border border-[#5B7F3B]/20 text-[#5B7F3B] text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-[#D4912A]" />
                <span>{language === 'hi' ? 'स्मार्ट कृषि खरीद प्रबंधन 2026' : 'Smart India Hackathon • Agricultural Innovation'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3D3426] tracking-tight leading-[1.15]">
                {language === 'hi' ? (
                  <>
                    फसल बेचना अब <span className="text-[#5B7F3B] underline decoration-[#D4912A] decoration-wavy decoration-2">आसान और तनावमुक्त</span>
                  </>
                ) : (
                  <>
                    Sell Your Crops with <span className="text-[#5B7F3B] underline decoration-[#D4912A] decoration-wavy decoration-2">Dignity, Clarity</span> & Zero Long Queues
                  </>
                )}
              </h1>

              <p className="text-lg sm:text-xl text-[#6B5D4A] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t('landing.hero.subtitle')}
              </p>

              {/* Action Buttons: Sign In / Register First, or View Centers */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isAuthenticated && user ? (
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#5B7F3B] hover:bg-[#466B2A] text-white font-bold text-base shadow-lg shadow-[#5B7F3B]/25 hover:shadow-xl hover:-translate-y-0.5 transition duration-200"
                  >
                    <span>{language === 'hi' ? `नमस्ते ${user.name}, डैशबोर्ड खोलें` : `Welcome ${user.name}, Open Dashboard`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#5B7F3B] hover:bg-[#466B2A] text-white font-bold text-base shadow-lg shadow-[#5B7F3B]/25 hover:shadow-xl hover:-translate-y-0.5 transition duration-200"
                  >
                    <LogIn className="w-5 h-5 text-[#E8DFD0]" />
                    <span>{language === 'hi' ? 'किसान लॉगिन / पंजीकरण करें' : 'Farmer Sign In / Register'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <Link
                  href="/centers"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#FFFDF9] hover:bg-[#F5EDE0] text-[#3D3426] border border-[#E8DFD0] font-semibold text-base shadow-xs hover:border-[#D4C8B5] transition"
                >
                  <MapPin className="w-5 h-5 text-[#D4912A]" />
                  <span>{language === 'hi' ? 'खरीद केंद्र व दरें देखें' : 'View Mandis & MSP Rates'}</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E8DFD0]/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#3D3426]">100%</div>
                  <div className="text-xs text-[#6B5D4A] font-medium">{language === 'hi' ? 'पारदर्शी एमएसपी' : 'Official MSP Rates'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#5B7F3B]">~20 min</div>
                  <div className="text-xs text-[#6B5D4A] font-medium">{language === 'hi' ? 'औसत प्रतीक्षा समय' : 'Avg. Token Wait'}</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#D4912A]">SMS/Voice</div>
                  <div className="text-xs text-[#6B5D4A] font-medium">{language === 'hi' ? 'बिना इंटरनेट के भी' : 'Works without Data'}</div>
                </div>
              </div>

            </div>

            {/* Right Card Mockup / Farmer Portrait */}
            <div className="lg:col-span-5 relative">
              
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Visual Frame */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-[#FFFDF9] shadow-2xl shadow-[#5B7F3B]/15 aspect-[4/5] bg-[#E8DFD0]">
                  <Image
                    src="/images/farmers/farmer1.jpg"
                    alt="Happy Farmer"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2B2318]/90 via-transparent to-transparent" />

                  {/* Floating Token Confirmation Badge */}
                  <div className="absolute top-6 left-6 right-6 p-4 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md border border-[#E8DFD0] shadow-lg flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#6B9F5B]/20 flex items-center justify-center text-[#5B7F3B] shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#6B5D4A]">
                        {language === 'hi' ? 'स्लॉट पुष्ट • टोकन #83' : 'Slot Confirmed • Token #83'}
                      </div>
                      <div className="text-sm font-bold text-[#3D3426]">
                        {language === 'hi' ? 'भोपाल सेंट्रल मंडी • 11:00 AM' : 'Bhopal Central Mandi • 11:00 AM'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info on the Photo */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <p className="text-sm italic text-[#F5EDE0]">
                      &quot;{language === 'hi' ? 'अब पूरे दिन धूप में खड़े होने की ज़रूरत नहीं।' : 'No more standing the entire day in the sun.'}&quot;
                    </p>
                    <p className="text-xs font-semibold text-[#E8A94D]">
                      — Ramesh Kumar, Jatpura Village
                    </p>
                  </div>

                </div>

                {/* Floating Decorative Card */}
                <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD0] shadow-xl items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4912A]/20 flex items-center justify-center text-[#D4912A]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-[#3D3426] block">₹2,275 / क्विंटल</span>
                    <span className="text-[#6B5D4A]">Wheat MSP 2026 Guaranteed</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS STRIP */}
      <section className="bg-[#5B7F3B] text-white py-8 border-y border-[#466B2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-[#FDF8F0]">
                <Users className="w-6 h-6 text-[#E8A94D]" />
                <span>12,450+</span>
              </div>
              <p className="text-xs sm:text-sm text-[#E8DFD0] font-medium">{t('landing.stats.farmersServed')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-[#FDF8F0]">
                <Building2 className="w-6 h-6 text-[#E8A94D]" />
                <span>89</span>
              </div>
              <p className="text-xs sm:text-sm text-[#E8DFD0] font-medium">{t('landing.stats.centersActive')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-[#FDF8F0]">
                <IndianRupee className="w-6 h-6 text-[#E8A94D]" />
                <span>₹28.4 Cr</span>
              </div>
              <p className="text-xs sm:text-sm text-[#E8DFD0] font-medium">{t('landing.stats.croresDisbursed')}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl font-black font-serif text-[#FDF8F0]">
                <Clock className="w-6 h-6 text-[#E8A94D]" />
                <span>78%</span>
              </div>
              <p className="text-xs sm:text-sm text-[#E8DFD0] font-medium">{t('landing.stats.avgWaitReduced')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THE 3 CORE PROBLEMS → TRANSFORMED */}
      <section className="py-20 bg-[#FDF8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-[#D4912A] uppercase bg-[#D4912A]/10 px-3 py-1 rounded-full">
              {language === 'hi' ? 'समस्या का समाधान' : 'The Problem vs Our Solution'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D3426] tracking-tight">
              {t('landing.problem.title')}
            </h2>
            <p className="text-base text-[#6B5D4A]">
              {language === 'hi' 
                ? 'पारंपरिक मंडियों में किसान कई अनिश्चितताओं से जूझते हैं। मंडी मित्र इन तीनों गंभीर बाधाओं को डिजिटल रूप से समाप्त करता है:' 
                : 'Farmers traditionally faced opaque schedules and painful queues. Here is how Mandi Mitra directly tackles all three core pain points:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Problem 1 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD0] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C75B3A]/10 text-[#C75B3A] flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#3D3426]">{t('landing.problem.waiting')}</h3>
                <p className="text-sm text-[#6B5D4A] leading-relaxed">{t('landing.problem.waitingDesc')}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-[#E8DFD0]/70 bg-[#F5EDE0]/40 -mx-8 -mb-8 p-6 rounded-b-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5B7F3B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'समाधान: 90-मिनट टाइम-स्लॉट बुकिंग' : 'Solution: 90-Minute Slot Appointments'}</span>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD0] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#D4912A]/10 text-[#D4912A] flex items-center justify-center">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#3D3426]">{t('landing.problem.info')}</h3>
                <p className="text-sm text-[#6B5D4A] leading-relaxed">{t('landing.problem.infoDesc')}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-[#E8DFD0]/70 bg-[#F5EDE0]/40 -mx-8 -mb-8 p-6 rounded-b-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5B7F3B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'समाधान: लाइव खरीद कैलेंडर व एसएमएस' : 'Solution: Live Schedule Calendar & SMS'}</span>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#E8DFD0] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#5B7F3B]/10 text-[#5B7F3B] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#3D3426]">{t('landing.problem.status')}</h3>
                <p className="text-sm text-[#6B5D4A] leading-relaxed">{t('landing.problem.statusDesc')}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-[#E8DFD0]/70 bg-[#F5EDE0]/40 -mx-8 -mb-8 p-6 rounded-b-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5B7F3B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'hi' ? 'समाधान: 8-चरणीय लाइव स्टेटस ट्रैकर' : 'Solution: 8-Stage Live Order-Style Tracking'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS (4 SIMPLE STEPS) */}
      <section className="py-20 bg-[#FAF3E6] border-y border-[#E8DFD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D3426]">
              {t('landing.solution.title')}
            </h2>
            <p className="text-base text-[#6B5D4A]">
              {language === 'hi' 
                ? 'चार सीधे चरणों में अपनी उपज बेचें — बिना किसी एजेंट या बिचौलिये के' 
                : 'Four transparent steps from your village home to bank account credit'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#5B7F3B] text-white flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h4 className="text-lg font-bold text-[#3D3426]">{t('landing.solution.step1')}</h4>
              <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('landing.solution.step1Desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#D4912A] text-white flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h4 className="text-lg font-bold text-[#3D3426]">{t('landing.solution.step2')}</h4>
              <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('landing.solution.step2Desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#5B7F3B] text-white flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h4 className="text-lg font-bold text-[#3D3426]">{t('landing.solution.step3')}</h4>
              <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('landing.solution.step3Desc')}</p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] relative space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#D4912A] text-white flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h4 className="text-lg font-bold text-[#3D3426]">{t('landing.solution.step4')}</h4>
              <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('landing.solution.step4Desc')}</p>
            </div>

          </div>

          <div className="text-center pt-4">
            <Link
              href="/centers"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#D4912A] hover:bg-[#B87A1F] text-white font-bold text-sm shadow-md transition"
            >
              <span>{language === 'hi' ? 'अपने निकटतम केंद्र खोजें' : 'Find Centers Near You'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. CURRENT MSP RATES SECTION */}
      <section className="py-20 bg-[#FDF8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[#5B7F3B] uppercase">
                {language === 'hi' ? 'सरकारी न्यूनतम समर्थन मूल्य' : 'Government Mandated Rates'}
              </span>
              <h2 className="text-3xl font-extrabold text-[#3D3426]">
                {language === 'hi' ? 'वर्तमान खरीद दरें (MSP 2026)' : 'Active Procurement Rates (MSP 2026)'}
              </h2>
            </div>
            <p className="text-xs text-[#6B5D4A] max-w-md">
              {language === 'hi' 
                ? 'सभी भुगतान सीधे आधार से जुड़े बैंक खाते में डीबीटी (DBT) द्वारा 48 से 72 घंटों में किए जाते हैं।' 
                : 'All payments disbursed directly via DBT into Aadhaar-linked accounts within 48 to 72 hours.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {cropsList.map((crop: any) => (
              <div 
                key={crop.type || crop.id} 
                className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD0] hover:border-[#D4912A] transition-all hover:-translate-y-1 shadow-xs"
              >
                <div className="text-3xl mb-2">{crop.emoji || '🌾'}</div>
                <div className="text-base font-bold text-[#3D3426]">
                  {language === 'hi' ? (crop.nameHi || crop.name) : (crop.nameEn || crop.name)}
                </div>
                <div className="text-xs text-[#6B5D4A] mb-3">
                  {language === 'hi' ? (crop.seasonHi || crop.season) : crop.season}
                </div>
                <div className="pt-3 border-t border-[#E8DFD0] flex items-baseline justify-between">
                  <span className="text-lg font-black text-[#5B7F3B]">₹{crop.mspRate}</span>
                  <span className="text-[11px] text-[#A89878]">/ {language === 'hi' ? 'क्विंटल' : 'quintal'}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. FARMER TESTIMONIALS (REAL VOICES & PHOTOS) */}
      <section className="py-20 bg-[#FAF3E6] border-t border-[#E8DFD0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#D4912A] uppercase">
              {language === 'hi' ? 'किसानों की ज़ुबानी' : 'Real Voices from the Ground'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D3426]">
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsList.map((item: any) => (
              <div 
                key={item.id} 
                className="bg-[#FFFDF9] rounded-3xl p-7 border border-[#E8DFD0] shadow-sm flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#D4912A]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[#3D3426] leading-relaxed italic">
                    &quot;{language === 'hi' ? item.quoteHi : item.quote}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-[#E8DFD0]">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#5B7F3B] shrink-0">
                    <Image
                      src={item.photo}
                      alt={item.farmerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#3D3426]">
                      {language === 'hi' ? item.farmerNameHi : item.farmerName}
                    </h5>
                    <p className="text-xs text-[#6B5D4A]">
                      {language === 'hi' ? item.villageHi : item.village}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="py-20 bg-[#5B7F3B] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif">
            {language === 'hi' 
              ? 'क्या आप अपनी अगली फसल बेचने के लिए तैयार हैं?' 
              : 'Ready to Experience Hassle-Free Procurement?'}
          </h2>
          <p className="text-base sm:text-lg text-[#E8DFD0] max-w-2xl mx-auto">
            {language === 'hi' 
              ? 'बिना किसी परेशानी के अपना समय तय करें और अपनी मेहनत का पूरा मूल्य पाएं।' 
              : 'Book your slot in under 2 minutes. Receive instant SMS token and arrive with confidence.'}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D4912A] hover:bg-[#B87A1F] text-white font-bold text-base shadow-lg transition"
              >
                {language === 'hi' ? 'मेरा डैशबोर्ड खोलें' : 'Go to My Dashboard'}
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D4912A] hover:bg-[#B87A1F] text-white font-bold text-base shadow-lg transition"
              >
                {language === 'hi' ? 'किसान लॉगिन / पंजीकरण' : 'Farmer Sign In / Register'}
              </Link>
            )}
            <Link
              href="/centers"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFFDF9] text-[#3D3426] hover:bg-[#F5EDE0] font-bold text-base transition"
            >
              {language === 'hi' ? 'खरीद केंद्र व अनुसूची' : 'View Procurement Centers'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
