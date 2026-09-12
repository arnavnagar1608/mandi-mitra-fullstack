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
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Header */}
          <div className="bg-white border border-gray-300 shadow-sm p-4 rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#ea580c]/10 text-[#ea580c] text-xs font-bold border border-[#ea580c]/30 rounded-sm mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
                  <span>{language === 'hi' ? 'लाइव स्थिति' : 'Live Token Status'}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase">
                  {t('queue.title')}
                </h1>
              </div>

              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{language === 'hi' ? 'ताज़ा करें' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* NO ACTIVE BOOKING BANNER */}
          {hasNoActiveBooking && (
            <div className="bg-white p-4 border-l-4 border-l-[#ea580c] border border-gray-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 rounded-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-[#ea580c] shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase">
                    {language === 'hi' ? 'कोई सक्रिय अपॉइंटमेंट नहीं मिला' : 'No Active Appointment Found'}
                  </h3>
                  <p className="text-xs text-gray-700 mt-1">
                    {language === 'hi' ? 'लाइव कतार देखने के लिए पहले खरीद केंद्र पर स्लॉट बुक करें।' : 'Please book a slot at a procurement center to view live queue position.'}
                  </p>
                </div>
              </div>
              <Link
                href="/centers"
                className="px-4 py-2 bg-[#14532d] hover:bg-[#115e32] text-white text-xs font-bold rounded-sm shrink-0 uppercase"
              >
                {language === 'hi' ? 'स्लॉट बुक करें' : 'Book a Slot'}
              </Link>
            </div>
          )}

          {/* CROWD/QUEUE LIVE COUNTERS */}
          <div className="bg-white border border-gray-300 shadow-sm p-4 rounded-sm">
            <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 bg-gray-50 px-2 py-1">{language === 'hi' ? 'टोकन स्थिति बोर्ड' : 'Token Status Board'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-gray-300 rounded-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-r border-gray-300 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-600 uppercase font-bold mb-2">
                  {t('queue.currentlyServing')}
                </span>
                <span className="text-4xl font-bold text-[#ea580c] font-mono">
                  {currentServingToken}
                </span>
              </div>

              <div className="p-4 bg-white border-r border-gray-300 flex flex-col items-center justify-center text-center shadow-inner">
                <span className="text-xs text-[#14532d] uppercase font-bold mb-2">
                  {t('queue.yourToken')}
                </span>
                <span className="text-5xl font-bold text-[#14532d] font-mono">
                  {myToken}
                </span>
              </div>

              <div className="p-4 bg-gray-50 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-gray-600 uppercase font-bold mb-2">
                  {t('queue.yourPosition')}
                </span>
                <span className="text-4xl font-bold text-gray-900 font-mono">
                  {tokensAhead}
                </span>
                <span className="text-xs text-gray-500 uppercase mt-1">{language === 'hi' ? 'आगे' : 'Ahead'}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#ea580c]/10 border border-[#ea580c]/30 rounded-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#ea580c]" />
              <p className="text-xs font-bold text-gray-800 uppercase">
                {t('queue.turnApproaching')}
              </p>
            </div>
          </div>

          {/* 8-STAGE VERTICAL STEPPER */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm p-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase bg-gray-50 px-2 py-1 border-b border-gray-300 mb-4">
              {language === 'hi' ? 'खरीद चरण की स्थिति' : 'Procurement Status Timeline'}
            </h3>

            <div className="border border-gray-300 rounded-sm p-0 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b border-r border-gray-300">{language === 'hi' ? 'चरण' : 'Stage'}</th>
                    <th className="px-4 py-2 border-b border-r border-gray-300">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                    <th className="px-4 py-2 border-b border-gray-300">{language === 'hi' ? 'विवरण' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((stage, idx) => (
                    <tr key={stage.key} className={`border-b border-gray-300 last:border-0 ${stage.current ? 'bg-[#ea580c]/5' : (stage.done ? 'bg-gray-50' : 'bg-white')}`}>
                      <td className="px-4 py-2 border-r border-gray-300 font-medium text-gray-900">
                        {idx + 1}. {stage.label}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-300 text-xs font-bold">
                        {stage.done ? (
                          <span className="text-[#14532d] flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {language === 'hi' ? 'पूर्ण' : 'COMPLETED'}</span>
                        ) : stage.current ? (
                          <span className="text-[#ea580c] animate-pulse">{language === 'hi' ? 'प्रगति पर' : 'IN PROGRESS'}</span>
                        ) : (
                          <span className="text-gray-400">{language === 'hi' ? 'लंबित' : 'PENDING'}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {stage.key === 'registered' && (language === 'hi' ? 'पंजीकरण पूर्ण हुआ' : 'Farmer details verified in system')}
                        {stage.key === 'slotConfirmed' && (language === 'hi' ? 'स्लॉट 8 सितंबर, 11:00 AM निर्धारित' : 'Appointment reserved')}
                        {stage.key === 'arrived' && (language === 'hi' ? 'गेट पर क्यूआर कोड सत्यापित' : 'QR code validated at center')}
                        {stage.key === 'qualityCheck' && (language === 'hi' ? 'नमी व दानों की ग्रेडिंग' : 'Moisture & grain purity test')}
                        {stage.key === 'weighing' && (language === 'hi' ? 'इलेक्ट्रॉनिक धर्मकांटा तौल' : 'Electronic weighbridge measurement')}
                        {stage.key === 'accepted' && (language === 'hi' ? 'डिजिटल मंडी पर्ची जारी' : 'Final acceptance')}
                        {stage.key === 'paymentProcessing' && (language === 'hi' ? 'पीएफएमएस प्रणाली में भेजा गया' : 'Sent to PFMS banking gateway')}
                        {stage.key === 'paymentComplete' && (language === 'hi' ? 'खाते में जमा' : 'Direct credit to bank via DBT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* QR & APPOINTMENT CARD DETAILS */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-sm font-bold text-gray-900 uppercase">
                {language === 'hi' ? 'टोकन विवरण' : 'Token Verification Details'}
              </h4>
              <div className="text-xs text-gray-700 bg-gray-100 p-2 border border-gray-300 rounded-sm inline-block">
                <span className="font-bold">{language === 'hi' ? 'केंद्र:' : 'Center:'}</span> {center?.name} <br/>
                <span className="font-bold">{language === 'hi' ? 'स्लॉट:' : 'Slot:'}</span> {fallbackBooking.slotTime}
              </div>
              <div className="pt-2">
                <span className="text-sm font-mono font-bold bg-white px-3 py-1 border-2 border-gray-800 text-gray-900 inline-block uppercase">
                  {activeBookingObj?.qrCode || 'MM-TKN-SLOT-CONFIRMED'}
                </span>
              </div>
            </div>

            <div className="p-2 bg-white border-2 border-gray-800 rounded-sm text-center">
              <button 
                onClick={() => window.print()}
                className="w-full px-4 py-2 bg-[#14532d] text-white text-sm font-bold rounded-sm shadow-sm border border-[#0f3f22] hover:bg-[#0f3f22] transition"
              >
                {language === 'hi' ? 'रसीद प्रिंट करें' : 'PRINT RECEIPT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
