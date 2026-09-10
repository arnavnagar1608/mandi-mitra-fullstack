'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api-client';
import { NoticeTicker } from '@/components/home/NoticeTicker';
import { 
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Download,
  Search,
  Users,
  Truck,
  Database
} from 'lucide-react';

import { Booking } from '@/lib/mock-data';

export default function HomePage() {
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  
  const [appId, setAppId] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appId) {
      window.location.href = `/queue?id=${appId}`;
    }
  };

  const [farmerBookings, setFarmerBookings] = useState<Booking[]>([]);

  useEffect(() => {
    async function loadData() {
      if (isAuthenticated) {
        const bookRes = await apiClient<{ bookings: Booking[] }>('/bookings/my');
        if (bookRes.success && bookRes.data?.bookings?.length) {
          setFarmerBookings(bookRes.data.bookings);
        }
      }
    }
    loadData();
  }, [isAuthenticated]);

  const isRegistered = isAuthenticated && !!user;
  const hasLandDetails = isRegistered && !!user?.village;
  const activeBooking = farmerBookings.find(
    b => b.status === 'confirmed' || b.status === 'arrived' || b.status === 'in-progress'
  );
  const hasCenter = isRegistered && !!activeBooking?.centerId;
  const hasSlot = isRegistered && !!activeBooking?.slotId;

  // Calculate dynamic stepper state
  const steps = [
    { num: 1, label: language === 'hi' ? 'किसान पंजीकरण' : 'Farmer Registration', sub: language === 'hi' ? 'विवरण भरें' : 'Enter Details', active: !isRegistered, done: isRegistered, href: !isRegistered ? '/login' : undefined },
    { num: 2, label: language === 'hi' ? 'भूमि और फसल विवरण' : 'Land & Crop Details', sub: language === 'hi' ? 'खसरा लिंक करें' : 'Link Khasra', active: isRegistered && !hasLandDetails, done: hasLandDetails, href: isRegistered && !hasLandDetails ? '/dashboard' : undefined },
    { num: 3, label: language === 'hi' ? 'खरीद केंद्र का चयन करें' : 'Select Procurement Centre', sub: language === 'hi' ? 'मंडी चुनें' : 'Choose Mandi', active: hasLandDetails && !hasCenter, done: hasCenter, href: hasLandDetails && !hasCenter ? '/centers' : undefined },
    { num: 4, label: language === 'hi' ? 'खरीद स्लॉट बुक करें' : 'Book Procurement Slot', sub: language === 'hi' ? 'तारीख चुनें' : 'Pick Date', active: hasCenter && !hasSlot, done: hasSlot, href: hasCenter && !hasSlot ? '/centers' : undefined },
    { num: 5, label: language === 'hi' ? 'उपज लाएँ' : 'Bring Produce', sub: language === 'hi' ? 'तय समय पर' : 'On Schedule', active: hasSlot, done: false },
    { num: 6, label: language === 'hi' ? 'गुणवत्ता सत्यापन' : 'Quality Verification', sub: language === 'hi' ? 'ग्रेडिंग' : 'Grading', active: false, done: false },
    { num: 7, label: language === 'hi' ? 'तौल और खरीद' : 'Weighing & Procurement', sub: language === 'hi' ? 'वज़न' : 'Weighing', active: false, done: false },
    { num: 8, label: language === 'hi' ? 'भुगतान' : 'Payment', sub: language === 'hi' ? 'सीधे बैंक में' : 'Direct to Bank', active: false, done: false },
  ];

  // Determine progress bar width
  const progressSteps = steps.filter(s => s.done).length;
  const progressWidth = progressSteps === 0 ? '0%' : `${(progressSteps / (steps.length - 1)) * 100}%`;

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]" id="main-content">
      
      <NoticeTicker />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#165a31] text-white">
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 lg:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {language === 'hi' ? 'पारदर्शी और कुशल' : 'Transparent and Efficient'}<br/>
              <span className="text-[#f97316]">{language === 'hi' ? 'खाद्यान्न खरीद' : 'Foodgrain Procurement'}</span>
            </h1>
            
            <p className="text-lg text-green-50 max-w-2xl font-light leading-relaxed">
              {language === 'hi' ? 'फसल पंजीकरण, स्लॉट बुकिंग और आधार से जुड़े खातों में सीधे सुनिश्चित प्रत्यक्ष लाभ हस्तांतरण (डीबीटी) के लिए एक सहज डिजिटल प्लेटफॉर्म के साथ किसानों को सशक्त बनाना।' : 'Empowering farmers with a seamless digital platform for crop registration, slot booking, and assured Direct Benefit Transfers (DBT) directly into Aadhaar-linked accounts.'}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold rounded-sm transition"
              >
                <span>{language === 'hi' ? 'खरीद के लिए पंजीकरण करें' : 'Register for Procurement'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/payments"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white hover:bg-white/10 text-white font-semibold rounded-sm transition"
              >
                <span>{language === 'hi' ? 'भुगतान की स्थिति जांचें' : 'Track Payment Status'}</span>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-[380px] shrink-0">
            <div className="bg-[#246b41] rounded-lg p-6 border border-[#2e7c4f] shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-[#f97316]" />
                <h3 className="text-lg font-semibold text-[#f97316]">{language === 'hi' ? 'खरीद कैलेंडर' : 'Procurement Calendar'}</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{language === 'hi' ? 'खरीफ पंजीकरण' : 'Kharif Registration'}</span>
                  <span className="px-2 py-0.5 bg-[#22c55e] text-white text-[11px] font-bold rounded-sm">{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                </div>
                <div className="h-px bg-[#2e7c4f] w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{language === 'hi' ? 'स्लॉट बुकिंग' : 'Slot Booking'}</span>
                  <span className="px-2 py-0.5 bg-[#22c55e] text-white text-[11px] font-bold rounded-sm">{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. STEPPER SECTION */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="flex items-center justify-center mb-10">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-[#14532d]">{language === 'hi' ? 'प्रक्रिया के चरण' : 'Procurement Steps'}</h2>
              <p className="text-gray-500 text-sm mt-1">{language === 'hi' ? 'अपनी उपज बेचने के लिए इन चरणों का पालन करें' : 'Follow these steps to sell your produce'}</p>
              <div className="w-12 h-1 bg-[#f97316] mt-2"></div>
            </div>
          </div>

          {/* Stepper Visualization */}
          <div className="hidden md:flex items-start justify-between relative max-w-5xl mx-auto mb-12">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
            <div className="absolute top-5 left-0 h-0.5 bg-[#22c55e] z-0 transition-all duration-500" style={{ width: progressWidth }}></div>
            
            {steps.map((step, idx) => {
              if (step.href) {
                return (
                  <Link key={idx} href={step.href} className="relative z-10 flex flex-col items-center w-24 cursor-pointer hover:scale-105 transition-transform">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 bg-white transition-colors duration-300 ${
                      step.done ? 'border-[#22c55e] text-[#22c55e]' : 
                      step.active ? 'border-[#22c55e] text-[#22c55e] ring-4 ring-[#22c55e]/20' : 
                      'border-gray-300 text-gray-400'
                    }`}>
                      {step.done ? <Check className="w-5 h-5" /> : (step.active && step.num === 4 ? <Calendar className="w-5 h-5" /> : <span className="text-sm font-medium">{step.num}</span>)}
                    </div>
                    <div className="text-center">
                      <div className={`text-[10px] font-bold uppercase mb-0.5 transition-colors duration-300 ${step.active || step.done ? 'text-gray-500' : 'text-gray-400'}`}>{language === 'hi' ? 'चरण' : 'STEP'} {step.num}</div>
                      <div className={`text-xs font-semibold leading-tight transition-colors duration-300 ${step.active || step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{step.sub}</div>
                    </div>
                  </Link>
                );
              }
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center w-24">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 bg-white transition-colors duration-300 ${
                    step.done ? 'border-[#22c55e] text-[#22c55e]' : 
                    step.active ? 'border-[#22c55e] text-[#22c55e] ring-4 ring-[#22c55e]/20' : 
                    'border-gray-300 text-gray-400'
                  }`}>
                    {step.done ? <Check className="w-5 h-5" /> : (step.active && step.num === 4 ? <Calendar className="w-5 h-5" /> : <span className="text-sm font-medium">{step.num}</span>)}
                  </div>
                  <div className="text-center">
                    <div className={`text-[10px] font-bold uppercase mb-0.5 transition-colors duration-300 ${step.active || step.done ? 'text-gray-500' : 'text-gray-400'}`}>{language === 'hi' ? 'चरण' : 'STEP'} {step.num}</div>
                    <div className={`text-xs font-semibold leading-tight transition-colors duration-300 ${step.active || step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{step.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm rounded-sm uppercase tracking-wide transition"
            >
              {language === 'hi' ? 'पंजीकरण शुरू करें' : 'START REGISTRATION'}
            </Link>
            <Link
              href="/queue"
              className="px-6 py-2.5 border-2 border-[#14532d] text-[#14532d] hover:bg-gray-50 font-bold text-sm rounded-sm uppercase tracking-wide transition"
            >
              {language === 'hi' ? 'स्थिति जांचें' : 'TRACK PROCUREMENT'}
            </Link>
          </div>

        </div>
      </section>

      {/* 3. SCHEMES & TRACK STATUS */}
      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left: Important Schemes */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-[#f97316]"></div>
                <h2 className="text-xl font-bold text-[#14532d]">{language === 'hi' ? 'महत्वपूर्ण योजनाएं' : 'Important Schemes'}</h2>
              </div>

              <div className="space-y-4">
                {/* Scheme 1 */}
                <div className="bg-white border-l-4 border-l-[#22c55e] border border-gray-200 p-5 rounded-sm shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#14532d]">{language === 'hi' ? 'खरीफ खरीद योजना 2026-27' : 'Kharif Procurement Scheme 2026-27'}</h3>
                        <span className="px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-[10px] font-bold rounded-sm uppercase">{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{language === 'hi' ? 'न्यूनतम समर्थन मूल्य (MSP) पर धान, ज्वार, बाजरा की खरीद।' : 'Procurement of Paddy, Jowar, Bajra at Minimum Support Price (MSP).'}</p>
                      <div className="text-xs bg-gray-50 inline-block px-3 py-1.5 rounded-sm border border-gray-100">
                        <span className="font-semibold">{language === 'hi' ? 'पात्रता:' : 'Eligibility:'}</span> {language === 'hi' ? 'म.प्र. में पंजीकृत भूमि रिकॉर्ड वाले किसान' : 'Farmers with registered land records in MP'}
                      </div>
                    </div>
                    <Link href="/centers" className="px-4 py-2 border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/5 rounded-sm text-sm font-semibold transition whitespace-nowrap">
                      {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                    </Link>
                  </div>
                </div>

                {/* Scheme 2 */}
                <div className="bg-white border-l-4 border-l-gray-400 border border-gray-200 p-5 rounded-sm shadow-sm opacity-80">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#14532d]">{language === 'hi' ? 'रबी खरीद योजना 2025-26' : 'Rabi Procurement Scheme 2025-26'}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold rounded-sm uppercase">{language === 'hi' ? 'बंद' : 'Closed'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{language === 'hi' ? 'न्यूनतम समर्थन मूल्य (MSP) पर गेहूं, चना, मसूर और सरसों की खरीद।' : 'Procurement of Wheat, Gram, Lentils, and Mustard at MSP.'}</p>
                      <div className="text-xs bg-gray-50 inline-block px-3 py-1.5 rounded-sm border border-gray-100">
                        <span className="font-semibold">{language === 'hi' ? 'पात्रता:' : 'Eligibility:'}</span> {language === 'hi' ? 'अद्यतन गिरदावरी रिकॉर्ड वाले किसान' : 'Farmers with updated Girdawari records'}
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/5 rounded-sm text-sm font-semibold transition whitespace-nowrap">
                      {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Scheme 3 */}
                <div className="bg-white border-l-4 border-l-[#22c55e] border border-gray-200 p-5 rounded-sm shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[#14532d]">{language === 'hi' ? 'भावांतर भुगतान योजना' : 'Bhavantar Bhugtan Yojana'}</h3>
                        <span className="px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-[10px] font-bold rounded-sm uppercase">{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{language === 'hi' ? 'चयनित वाणिज्यिक फसलों के लिए मूल्य अंतर भुगतान योजना।' : 'Price deficiency payment scheme for selected commercial crops.'}</p>
                      <div className="text-xs bg-gray-50 inline-block px-3 py-1.5 rounded-sm border border-gray-100">
                        <span className="font-semibold">{language === 'hi' ? 'पात्रता:' : 'Eligibility:'}</span> {language === 'hi' ? 'स्वीकृत मंडियों में बेचने वाले पंजीकृत किसान' : 'Registered farmers selling in approved Mandis'}
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/5 rounded-sm text-sm font-semibold transition whitespace-nowrap">
                      {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Track Status */}
            <div className="w-full lg:w-[350px] shrink-0">
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-[#14532d] text-white px-4 py-3 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  <h3 className="font-bold">{language === 'hi' ? 'स्थिति जांचें' : 'Track Status'}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'hi' ? 'खरीद या भुगतान की स्थिति जांचने के लिए अपना पंजीकरण/आवेदन संख्या दर्ज करें।' : 'Enter your Registration/Application Number to track procurement or payment status.'}
                  </p>
                  <form onSubmit={handleTrackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {language === 'hi' ? 'आवेदन आईडी / मोबाइल नंबर' : 'Application ID / Mobile No.'}
                      </label>
                      <input 
                        type="text" 
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                        placeholder={language === 'hi' ? 'उदा. MP123456789' : 'e.g. MP123456789'}
                        className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#14532d]"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2.5 rounded-sm transition text-sm"
                    >
                      {language === 'hi' ? 'स्थिति जांचें' : 'Track Status'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. NOTIFICATIONS */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-[#f97316]"></div>
              <h2 className="text-xl font-bold text-[#14532d]">{language === 'hi' ? 'नवीनतम अधिसूचनाएं एवं परिपत्र' : 'Latest Notifications & Circulars'}</h2>
            </div>
            <button className="text-sm font-semibold text-[#14532d] hover:underline">
              {language === 'hi' ? 'सभी देखें' : 'View All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#f0fdf4] border-b border-gray-200">
                  <th className="px-4 py-3 font-bold text-[#14532d] w-16">{language === 'hi' ? 'क्र.सं.' : 'SR.NO'}</th>
                  <th className="px-4 py-3 font-bold text-[#14532d]">{language === 'hi' ? 'शीर्षक / विषय' : 'TITLE / SUBJECT'}</th>
                  <th className="px-4 py-3 font-bold text-[#14532d]">{language === 'hi' ? 'विभाग' : 'DEPARTMENT'}</th>
                  <th className="px-4 py-3 font-bold text-[#14532d]">{language === 'hi' ? 'दिनांक' : 'DATE'}</th>
                  <th className="px-4 py-3 font-bold text-[#14532d] text-center w-24">{language === 'hi' ? 'डाउनलोड' : 'DOWNLOAD'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">1</td>
                  <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                    <span className="w-4 h-4 text-green-600">📄</span> {language === 'hi' ? 'खरीफ खरीद 2026-27 के लिए दिशानिर्देश' : 'Guidelines for Kharif Procurement 2026-27'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? 'खाद्य एवं नागरिक आपूर्ति' : 'Food & Civil Supplies'}</td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? '05-सितंबर-2026' : '05-Sep-2026'}</td>
                  <td className="px-4 py-3 text-center text-red-500 hover:text-red-700 cursor-pointer">
                    <Download className="w-4 h-4 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">2</td>
                  <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                    <span className="w-4 h-4 text-green-600">📄</span> {language === 'hi' ? 'मोबाइल ऐप के माध्यम से स्लॉट बुकिंग के लिए संशोधित सामान्य प्रश्न' : 'Revised FAQ for Slot Booking via Mobile App'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? 'एनआईसी म.प्र.' : 'NIC MP'}</td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? '01-सितंबर-2026' : '01-Sep-2026'}</td>
                  <td className="px-4 py-3 text-center text-red-500 hover:text-red-700 cursor-pointer">
                    <Download className="w-4 h-4 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">3</td>
                  <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                    <span className="w-4 h-4 text-green-600">📄</span> {language === 'hi' ? 'आदेश: डीबीटी के लिए आधार लिंक करना अनिवार्य' : 'Order: Mandatory Aadhaar Linking for DBT'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? 'वित्त विभाग' : 'Finance Dept'}</td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? '28-अगस्त-2026' : '28-Aug-2026'}</td>
                  <td className="px-4 py-3 text-center text-red-500 hover:text-red-700 cursor-pointer">
                    <Download className="w-4 h-4 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">4</td>
                  <td className="px-4 py-3 text-gray-700 flex items-center gap-2">
                    <span className="w-4 h-4 text-green-600">📄</span> {language === 'hi' ? 'सक्रिय खरीद केंद्रों की सूची - भोपाल' : 'List of Active Procurement Centers - Bhopal'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? 'जिला प्रशासन' : 'District Admin'}</td>
                  <td className="px-4 py-3 text-gray-600">{language === 'hi' ? '25-अगस्त-2026' : '25-Aug-2026'}</td>
                  <td className="px-4 py-3 text-center text-red-500 hover:text-red-700 cursor-pointer">
                    <Download className="w-4 h-4 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. STATISTICS & FAQ */}
      <section className="py-12 bg-[#f8f9fa] border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Stats */}
          <div className="bg-white border border-gray-200 p-8 shadow-sm text-center rounded-sm">
            <h3 className="text-lg font-bold text-[#14532d] mb-8 inline-block border-b-2 border-[#f97316] pb-1">
              {language === 'hi' ? 'खरीद के आंकड़े (पिछले 5 वर्ष)' : 'Procurement Statistics (Last 5 Years)'}
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-[#14532d]" />
                </div>
                <div className="text-2xl font-black text-[#1f2937]">1.18 Cr+</div>
                <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{language === 'hi' ? 'पंजीकृत किसान' : 'Registered Farmers'}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-3">
                  <Truck className="w-6 h-6 text-[#14532d]" />
                </div>
                <div className="text-2xl font-black text-[#1f2937]">241.56 L</div>
                <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{language === 'hi' ? 'अनाज की खरीद (मीट्रिक टन)' : 'Grain Procured (MT)'}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-serif text-[#14532d]">₹</span>
                </div>
                <div className="text-2xl font-black text-[#1f2937]">69,111 Cr</div>
                <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{language === 'hi' ? 'कुल भुगतान (₹)' : 'Total Payment (₹)'}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-[#22c55e]/10 rounded-full flex items-center justify-center mb-3">
                  <Database className="w-6 h-6 text-[#14532d]" />
                </div>
                <div className="text-2xl font-black text-[#1f2937]">4,520</div>
                <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">{language === 'hi' ? 'सक्रिय केंद्र' : 'Active Centers'}</div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-[#f97316]"></div>
              <h2 className="text-xl font-bold text-[#14532d]">{language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}</h2>
            </div>
            
            <div className="space-y-2">
              {[
                { q: language === 'hi' ? 'खरीद के लिए पंजीकरण कैसे करें?' : 'faq_q1' },
                { q: language === 'hi' ? 'स्लॉट बुकिंग के लिए आवश्यक दस्तावेज' : 'faq_q2' },
                { q: language === 'hi' ? 'भुगतान प्रक्रिया में कितना समय लगता है?' : 'faq_q3' }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white border border-gray-200 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-sm">
                  <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer bar placeholder since the actual footer is in layout.tsx */}
      <div className="bg-[#14532d] h-12 w-full mt-auto"></div>

    </div>
  );
}
