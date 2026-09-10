'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { apiClient } from '@/lib/api-client';
import { 
  activeBooking as fallbackBooking, 
  procurementCenters, 
  crops, 
  currentFarmer 
} from '@/lib/mock-data';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  QrCode, 
  Sparkles,
  Phone,
  RefreshCw,
  FileCheck2,
  Scale,
  CreditCard,
  Building
} from 'lucide-react';

interface QueueStatusData {
  myToken?: number;
  currentServingToken?: number;
  tokensAhead?: number;
  estimatedWaitMinutes?: number;
  procurementStage?: string;
}

export default function QueuePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [currentServingToken, setCurrentServingToken] = useState<number>(78);
  const [myToken, setMyToken] = useState<number>(fallbackBooking.tokenNumber);
  const [tokensAhead, setTokensAhead] = useState<number>(5);
  const [procStage, setProcStage] = useState<string>('arrived');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [activeBookingObj, setActiveBookingObj] = useState<any>(null);
  const [hasNoActiveBooking, setHasNoActiveBooking] = useState<boolean>(false);

  const fetchLiveQueue = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch farmer's bookings from GET /api/bookings/my
      const myBookingsRes = await apiClient<{ bookings: any[] }>('/bookings/my');
      const bookings = myBookingsRes.data?.bookings || [];
      
      // 2. Identify active booking using exact backend status definition ('confirmed', 'arrived', 'serving')
      const ACTIVE_STATUSES = ['confirmed', 'arrived', 'serving'];
      const activeBooking = bookings.find((b: any) => ACTIVE_STATUSES.includes(b.status));

      // 3. If no active booking exists, handle gracefully without calling queue-status
      if (!activeBooking?.id) {
        setActiveBookingObj(null);
        setHasNoActiveBooking(true);
        return;
      }

      setActiveBookingObj(activeBooking);
      setHasNoActiveBooking(false);

      // 4. Single dynamic queue-status call using the real active booking ID
      const res = await apiClient<{ queueStatus: QueueStatusData }>(`/bookings/${activeBooking.id}/queue-status`);

      if (res.success && res.data?.queueStatus) {
        const q = res.data.queueStatus;
        if (typeof q.myToken === 'number') setMyToken(q.myToken);
        if (typeof q.currentServingToken === 'number') setCurrentServingToken(q.currentServingToken);
        if (typeof q.tokensAhead === 'number') setTokensAhead(q.tokensAhead);
        if (q.procurementStage) setProcStage(q.procurementStage);
      }
    } catch (err) {
      console.error('[Queue Page Fetch Error]:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
  }, []);

  const center = procurementCenters.find(c => c.id === (activeBookingObj?.centerId || fallbackBooking.centerId));
  const crop = crops.find(c => c.type === (activeBookingObj?.cropType || fallbackBooking.cropType));

  const handleRefresh = () => {
    fetchLiveQueue();
  };

  const stages = [
    { key: 'registered', label: t('queue.status.registered'), done: true, current: false },
    { key: 'slotConfirmed', label: t('queue.status.slotConfirmed'), done: true, current: false },
    { key: 'arrived', label: t('queue.status.arrived'), done: true, current: true },
    { key: 'qualityCheck', label: t('queue.status.qualityCheck'), done: false, current: false },
    { key: 'weighing', label: t('queue.status.weighing'), done: false, current: false },
    { key: 'accepted', label: t('queue.status.accepted'), done: false, current: false },
    { key: 'paymentProcessing', label: t('queue.status.paymentProcessing'), done: false, current: false },
    { key: 'paymentComplete', label: t('queue.status.paymentComplete'), done: false, current: false },
  ];

  return (
    <AuthGuard
      pageTitle={{ en: 'Live Queue & Token Status', hi: 'लाइव कतार एवं टोकन स्थिति' }}
      pageDescription={{ en: 'your active token sequence and real-time waiting estimate', hi: 'अपना सक्रिय टोकन नंबर और रीयल-टाइम कतार स्थिति' }}
    >
      <div className="bg-white min-h-screen py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532d]/10 text-[#14532d] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{language === 'hi' ? 'रीयल-टाइम कतार ट्रैकिंग' : 'Real-Time Queue Telemetry'}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif">
              {t('queue.title')}
            </h1>
          </div>

        {/* NO ACTIVE BOOKING BANNER */}
        {hasNoActiveBooking && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D4912A]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#D4912A] shrink-0" />
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {language === 'hi' ? 'कोई सक्रिय अपॉइंटमेंट नहीं मिला' : 'No Active Appointment Found'}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === 'hi' ? 'लाइव कतार देखने के लिए पहले खरीद केंद्र पर स्लॉट बुक करें।' : 'Please book a slot at a procurement center to view live queue position.'}
                </p>
              </div>
            </div>
            <Link
              href="/centers"
              className="px-5 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white text-xs font-bold shrink-0 transition"
            >
              {language === 'hi' ? 'स्लॉट बुक करें' : 'Book a Slot'}
            </Link>
          </div>
        )}

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:text-gray-900 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{language === 'hi' ? 'ताज़ा करें' : 'Refresh Live Status'}</span>
          </button>
        </div>

        {/* CROWD/QUEUE LIVE COUNTERS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">
                {t('queue.currentlyServing')}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-[#D4912A] font-mono">
                #{currentServingToken}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#14532d]/10 border border-[#14532d]/20">
              <span className="text-xs text-[#14532d] uppercase font-bold tracking-wider block mb-1">
                {t('queue.yourToken')}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-[#14532d] font-mono">
                #{myToken}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">
                {t('queue.yourPosition')}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-gray-900 font-mono">
                {tokensAhead} <span className="text-sm font-sans text-gray-600">ahead</span>
              </span>
            </div>

          </div>

          {/* Alert Notification */}
          <div className="p-4 rounded-2xl bg-[#D4912A]/10 border border-[#D4912A]/30 flex items-center gap-3.5">
            <Sparkles className="w-5 h-5 text-[#D4912A] shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-gray-900">
              {t('queue.turnApproaching')}
            </p>
          </div>
        </div>

        {/* 8-STAGE VERTICAL STEPPER (LIKE FOOD ORDER TRACKING) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-200 pb-4">
            {language === 'hi' ? 'खरीद चरण की स्थिति' : 'End-to-End Procurement Progress'}
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {stages.map((stage, idx) => {
              return (
                <div key={stage.key} className="relative flex items-start gap-4">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      stage.done
                        ? 'bg-[#14532d] text-white ring-4 ring-[#14532d]/20'
                        : stage.current
                        ? 'bg-[#D4912A] text-white ring-4 ring-[#D4912A]/20 animate-pulse'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {stage.done ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm sm:text-base font-bold ${
                        stage.current 
                          ? 'text-[#D4912A]' 
                          : stage.done 
                          ? 'text-gray-900' 
                          : 'text-gray-400'
                      }`}>
                        {stage.label}
                      </h4>
                      {stage.current && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4912A] text-white">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {stage.key === 'registered' && (language === 'hi' ? 'पंजीकरण पूर्ण हुआ' : 'Farmer details verified in system')}
                      {stage.key === 'slotConfirmed' && (language === 'hi' ? 'स्लॉट 8 सितंबर, 11:00 AM निर्धारित' : 'Appointment reserved for Sep 8, 11:00 AM')}
                      {stage.key === 'arrived' && (language === 'hi' ? 'गेट पर क्यूआर कोड सत्यापित हो गया' : 'QR code validated at center entry gate')}
                      {stage.key === 'qualityCheck' && (language === 'hi' ? 'नमी व दानों की सरकारी ग्रेडिंग' : 'Moisture & grain purity test (Grade A/B)')}
                      {stage.key === 'weighing' && (language === 'hi' ? 'इलेक्ट्रॉनिक धर्मकांटा तौल' : 'Certified electronic weighbridge measurement')}
                      {stage.key === 'accepted' && (language === 'hi' ? 'डिजिटल मंडी पर्ची जारी' : 'Final acceptance and digital receipt creation')}
                      {stage.key === 'paymentProcessing' && (language === 'hi' ? 'पीएफएमएस (PFMS) प्रणाली में भेजा गया' : 'Sent to PFMS banking gateway')}
                      {stage.key === 'paymentComplete' && (language === 'hi' ? 'डीबीटी द्वारा खाते में जमा' : 'Direct credit to bank account via DBT')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR & APPOINTMENT CARD DETAILS */}
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-base font-bold text-gray-900">
              {language === 'hi' ? 'केंद्र पर यह डिजिटल टोकन दिखाएं' : 'Present this Token at Verification Desk'}
            </h4>
            <p className="text-xs text-gray-600">
              {center?.name} • {fallbackBooking.slotTime}
            </p>
            <div className="pt-2">
              <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-900">
                {activeBookingObj?.qrCode || 'MM-TKN-SLOT-CONFIRMED'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <QrCode className="w-20 h-20 text-gray-900" />
          </div>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
