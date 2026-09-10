'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { apiClient } from '@/lib/api-client';
import { 
  currentFarmer as defaultFarmer,
  activeBooking as fallbackActiveBooking, 
  procurementCenters, 
  crops, 
  notifications as fallbackNotifications, 
  procurementRecords, 
  formatCurrency, 
  formatDate,
  Booking,
  Notification
} from '@/lib/mock-data';
import { 
  CalendarCheck, 
  MapPin, 
  Clock, 
  CreditCard, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  FileText,
  Sparkles,
  Phone,
  QrCode
} from 'lucide-react';

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const currentFarmer = user || defaultFarmer;

  const [farmerBookings, setFarmerBookings] = useState<Booking[]>([fallbackActiveBooking]);
  const [farmerNotifs, setFarmerNotifs] = useState<Notification[]>(fallbackNotifications);

  useEffect(() => {
    async function loadDashboardData() {
      const [bookRes, notifRes] = await Promise.all([
        apiClient<{ bookings: Booking[] }>('/bookings/my'),
        apiClient<{ notifications: Notification[] }>('/farmers/me/notifications')
      ]);

      if (bookRes.success && bookRes.data?.bookings?.length) {
        setFarmerBookings(bookRes.data.bookings);
      }
      if (notifRes.success && notifRes.data?.notifications?.length) {
        setFarmerNotifs(notifRes.data.notifications);
      }
    }
    loadDashboardData();
  }, []);

  const activeBooking = farmerBookings.find(b => b.status === 'confirmed' || (b.status as string) === 'serving') || farmerBookings[0] || fallbackActiveBooking;
  const center = procurementCenters.find(c => c.id === activeBooking.centerId) || procurementCenters[0];
  const cropData = crops.find(c => c.type === activeBooking.cropType) || crops[0];

  return (
    <AuthGuard
      pageTitle={{ en: 'Farmer Dashboard', hi: 'किसान डैशबोर्ड' }}
      pageDescription={{ en: 'your personal dashboard, appointments, and crop status', hi: 'अपना व्यक्तिगत डैशबोर्ड, अपॉइंटमेंट और फसल स्थिति' }}
    >
      <div className="bg-[#FDF8F0] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Welcome Header */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E8DFD0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-[#5B7F3B] shadow-md shrink-0">
              <Image
                src={currentFarmer?.photo || '/images/farmers/farmer1.jpg'}
                alt={currentFarmer?.name || 'Farmer'}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#3D3426] font-serif">
                  {t('dashboard.welcome')}, {language === 'hi' ? currentFarmer.nameHi : currentFarmer.name} {t('dashboard.welcomeSuffix')}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-[#6B5D4A]">
                {language === 'hi' 
                  ? `${currentFarmer.villageHi}, ${currentFarmer.districtHi} • किसान आईडी: MP-${currentFarmer.aadhaarLast4}` 
                  : `${currentFarmer.village}, ${currentFarmer.district} • Farmer ID: MP-${currentFarmer.aadhaarLast4}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/centers"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#5B7F3B] hover:bg-[#466B2A] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t('dashboard.bookSlot')}</span>
            </Link>
          </div>
        </div>

        {/* ACTIVE BOOKING HIGHLIGHT CARD */}
        {activeBooking && (
          <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF3E6] rounded-3xl p-6 sm:p-8 border-2 border-[#5B7F3B] shadow-lg relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DFD0] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5B7F3B] text-white flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#5B7F3B] uppercase tracking-wider block">
                    {t('dashboard.activeBooking')}
                  </span>
                  <h3 className="text-xl font-black text-[#3D3426]">
                    {language === 'hi' ? center?.nameHi : center?.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-[#A89878] block uppercase font-bold">{t('dashboard.tokenNumber')}</span>
                  <span className="text-3xl font-black text-[#5B7F3B] font-mono">#{activeBooking.tokenNumber}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD0]">
                <span className="text-xs text-[#A89878] block">{language === 'hi' ? 'तारीख व समय' : 'Date & Time'}</span>
                <span className="text-sm font-bold text-[#3D3426] block mt-0.5">8 Sep • 11:00 AM</span>
              </div>
              <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD0]">
                <span className="text-xs text-[#A89878] block">{language === 'hi' ? 'फसल व मात्रा' : 'Crop & Est. Qty'}</span>
                <span className="text-sm font-bold text-[#3D3426] block mt-0.5">
                  {cropData?.emoji} {cropData?.nameEn} • {activeBooking.estimatedQuantity} Q
                </span>
              </div>
              <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD0]">
                <span className="text-xs text-[#A89878] block">{t('dashboard.queuePosition')}</span>
                <span className="text-sm font-black text-[#D4912A] block mt-0.5">5th in Queue</span>
              </div>
              <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD0]">
                <span className="text-xs text-[#A89878] block">{t('dashboard.estimatedWait')}</span>
                <span className="text-sm font-black text-[#5B7F3B] block mt-0.5">~35 {t('dashboard.minutes')}</span>
              </div>
            </div>

            {/* Live Progress Bar Stepper Snippet */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#6B5D4A]">
                <Sparkles className="w-4 h-4 text-[#D4912A]" />
                <span>
                  {language === 'hi' 
                    ? 'कृपया टोकन समय से 15 मिनट पहले केंद्र पर रिपोर्ट करें।' 
                    : 'Please report to the verification counter 15 minutes before slot time.'}
                </span>
              </div>

              <Link
                href="/queue"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#5B7F3B] text-white text-xs font-bold hover:bg-[#466B2A] transition"
              >
                <span>{language === 'hi' ? 'लाइव स्टेटस व टोकन ट्रैक करें' : 'Track Live Queue Status'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 4 QUICK ACTION TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <Link
            href="/centers"
            className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DFD0] hover:border-[#5B7F3B] hover:-translate-y-1 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#5B7F3B]/10 text-[#5B7F3B] flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#3D3426] mb-1">{t('dashboard.bookSlot')}</h4>
            <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('dashboard.bookSlotDesc')}</p>
          </Link>

          <Link
            href="/queue"
            className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DFD0] hover:border-[#D4912A] hover:-translate-y-1 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D4912A]/10 text-[#D4912A] flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#3D3426] mb-1">{t('dashboard.trackStatus')}</h4>
            <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('dashboard.trackStatusDesc')}</p>
          </Link>

          <Link
            href="/payments"
            className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DFD0] hover:border-[#5B7F3B] hover:-translate-y-1 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#5B7F3B]/10 text-[#5B7F3B] flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#3D3426] mb-1">{t('dashboard.payments')}</h4>
            <p className="text-xs text-[#6B5D4A] leading-relaxed">{t('dashboard.paymentsDesc')}</p>
          </Link>

          <Link
            href="/history"
            className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DFD0] hover:border-[#D4912A] hover:-translate-y-1 transition shadow-xs group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#D4912A]/10 text-[#D4912A] flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#3D3426] mb-1">{t('history.title')}</h4>
            <p className="text-xs text-[#6B5D4A] leading-relaxed">
              {language === 'hi' ? 'पिछली सभी खरीद रसीदें देखें' : 'View all previous procurement receipts'}
            </p>
          </Link>

        </div>

        {/* TWO COLUMN CONTENT: RECENT ACTIVITY & NOTIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Procurements Table / List */}
          <div className="lg:col-span-8 bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD0] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-4">
              <h3 className="text-lg font-bold text-[#3D3426] font-serif">
                {language === 'hi' ? 'हालिया खरीद रिकॉर्ड' : 'Recent Procurements'}
              </h3>
              <Link href="/history" className="text-xs font-bold text-[#5B7F3B] hover:underline flex items-center gap-1">
                <span>{t('common.viewAll')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {procurementRecords.map((item) => {
                const c = crops.find(crop => crop.type === item.cropType);
                const isPaid = item.status === 'payment-completed';

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#FDF8F0] border border-[#E8DFD0] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-2xl">{c?.emoji}</div>
                      <div>
                        <span className="text-sm font-bold text-[#3D3426] block">
                          {language === 'hi' ? c?.nameHi : c?.nameEn} ({item.quantityQuintals} {t('history.quintals')})
                        </span>
                        <span className="text-xs text-[#A89878]">
                          {formatDate(item.createdAt, language)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[#3D3426] block">
                        {formatCurrency(item.totalAmount)}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                        isPaid 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPaid 
                          ? (language === 'hi' ? 'भुगतान पूर्ण' : 'Payment Completed') 
                          : (language === 'hi' ? 'प्रक्रिया में' : 'In Progress')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="lg:col-span-4 bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD0] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4912A]" />
                <h3 className="text-lg font-bold text-[#3D3426] font-serif">
                  {language === 'hi' ? 'सूचनाएं' : 'Notifications'}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#5B7F3B]/10 text-[#5B7F3B] font-bold">
                {farmerNotifs.length}
              </span>
            </div>

            <div className="space-y-3.5">
              {farmerNotifs.map((n: Notification) => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition ${
                    n.read 
                      ? 'border-[#E8DFD0] bg-[#FFFDF9] text-[#6B5D4A]' 
                      : 'border-[#5B7F3B]/30 bg-[#5B7F3B]/5 text-[#3D3426]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{language === 'hi' ? n.titleHi : n.title}</span>
                    <span className="text-[10px] text-[#A89878]">SMS</span>
                  </div>
                  <p className="leading-relaxed">
                    {language === 'hi' ? n.messageHi : n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
