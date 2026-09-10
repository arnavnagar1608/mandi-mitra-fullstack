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
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Welcome Header */}
          <div className="bg-white border-t-4 border-t-[#f97316] border border-gray-300 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 border border-gray-300 p-1 bg-white shrink-0">
                <Image
                  src={currentFarmer?.photo || '/images/farmers/farmer1.jpg'}
                  alt={currentFarmer?.name || 'Farmer'}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#14532d] uppercase">
                  {t('dashboard.welcome')}, {language === 'hi' ? currentFarmer.nameHi : currentFarmer.name} {t('dashboard.welcomeSuffix')}
                </h1>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>{language === 'hi' ? 'पता:' : 'Address:'}</strong> {language === 'hi' 
                    ? `${currentFarmer.villageHi}, ${currentFarmer.districtHi}` 
                    : `${currentFarmer.village}, ${currentFarmer.district}`} <br/>
                  <strong>{language === 'hi' ? 'किसान आईडी:' : 'Farmer ID:'}</strong> MP-{currentFarmer.aadhaarLast4}
                </p>
              </div>
            </div>

            <div>
              <Link
                href="/centers"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#14532d] text-white text-sm font-bold shadow-sm hover:bg-[#0f3d21] transition rounded-sm border border-[#0f3d21]"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{t('dashboard.bookSlot')}</span>
              </Link>
            </div>
          </div>

          {/* ACTIVE BOOKING HIGHLIGHT CARD */}
          {activeBooking && (
            <div className="bg-white border border-[#14532d] shadow-sm">
              <div className="bg-[#14532d] text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wide">
                  <Clock className="w-4 h-4" />
                  <span>{t('dashboard.activeBooking')}</span>
                </div>
                <div className="text-sm font-bold bg-white text-[#14532d] px-2 py-0.5 rounded-sm">
                  {t('dashboard.tokenNumber')}: {activeBooking.tokenNumber}
                </div>
              </div>
              
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                  {language === 'hi' ? center?.nameHi : center?.name}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{language === 'hi' ? 'तारीख व समय' : 'Date & Time'}</span>
                    <span className="text-sm font-bold text-gray-900 block mt-1">{language === 'hi' ? '8 सितं • 11:00 AM' : '8 Sep • 11:00 AM'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{language === 'hi' ? 'फसल व मात्रा' : 'Crop & Est. Qty'}</span>
                    <span className="text-sm font-bold text-gray-900 block mt-1">
                      {language === 'hi' ? cropData?.nameHi : cropData?.nameEn} • {activeBooking.estimatedQuantity} {language === 'hi' ? 'क्विंटल' : 'Q'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{t('dashboard.queuePosition')}</span>
                    <span className="text-sm font-bold text-[#ea580c] block mt-1">{language === 'hi' ? 'कतार में 5वें' : '5th in Queue'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">{t('dashboard.estimatedWait')}</span>
                    <span className="text-sm font-bold text-[#14532d] block mt-1">~35 {t('dashboard.minutes')}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-2">
                    <span className="font-bold">⚠️</span>
                    <span>
                      {language === 'hi' 
                        ? 'कृपया टोकन समय से 15 मिनट पहले केंद्र पर रिपोर्ट करें।' 
                        : 'Please report to the verification counter 15 minutes before slot time.'}
                    </span>
                  </div>
                  <Link
                    href="/queue"
                    className="shrink-0 px-4 py-2 bg-[#ea580c] text-white text-xs font-bold hover:bg-[#c2410c] transition rounded-sm shadow-sm"
                  >
                    {language === 'hi' ? 'लाइव स्टेटस व टोकन ट्रैक करें' : 'Track Live Queue Status'}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 4 QUICK ACTION TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link
              href="/centers"
              className="bg-white border border-gray-300 p-4 hover:bg-gray-50 transition shadow-sm flex items-start gap-3"
            >
              <div className="p-2 bg-[#14532d] text-white shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14532d] uppercase mb-1">{t('dashboard.bookSlot')}</h4>
                <p className="text-xs text-gray-600">{t('dashboard.bookSlotDesc')}</p>
              </div>
            </Link>

            <Link
              href="/queue"
              className="bg-white border border-gray-300 p-4 hover:bg-gray-50 transition shadow-sm flex items-start gap-3"
            >
              <div className="p-2 bg-[#ea580c] text-white shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#ea580c] uppercase mb-1">{t('dashboard.trackStatus')}</h4>
                <p className="text-xs text-gray-600">{t('dashboard.trackStatusDesc')}</p>
              </div>
            </Link>

            <Link
              href="/payments"
              className="bg-white border border-gray-300 p-4 hover:bg-gray-50 transition shadow-sm flex items-start gap-3"
            >
              <div className="p-2 bg-[#14532d] text-white shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#14532d] uppercase mb-1">{t('dashboard.payments')}</h4>
                <p className="text-xs text-gray-600">{t('dashboard.paymentsDesc')}</p>
              </div>
            </Link>

            <Link
              href="/history"
              className="bg-white border border-gray-300 p-4 hover:bg-gray-50 transition shadow-sm flex items-start gap-3"
            >
              <div className="p-2 bg-gray-700 text-white shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-1">{t('history.title')}</h4>
                <p className="text-xs text-gray-600">
                  {language === 'hi' ? 'पिछली सभी खरीद रसीदें देखें' : 'View all previous procurement receipts'}
                </p>
              </div>
            </Link>

          </div>

          {/* TWO COLUMN CONTENT: RECENT ACTIVITY & NOTIFICATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Procurements Table */}
            <div className="lg:col-span-2 bg-white border border-gray-300 shadow-sm">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800 uppercase">
                  {language === 'hi' ? 'हालिया खरीद रिकॉर्ड' : 'Recent Procurements'}
                </h3>
                <Link href="/history" className="text-xs font-bold text-[#14532d] hover:underline">
                  {t('common.viewAll')} &raquo;
                </Link>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-700">
                    <tr>
                      <th className="px-4 py-3">{language === 'hi' ? 'फसल' : 'Crop'}</th>
                      <th className="px-4 py-3">{language === 'hi' ? 'मात्रा' : 'Quantity'}</th>
                      <th className="px-4 py-3">{language === 'hi' ? 'दिनांक' : 'Date'}</th>
                      <th className="px-4 py-3 text-right">{language === 'hi' ? 'राशि' : 'Amount'}</th>
                      <th className="px-4 py-3 text-center">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {procurementRecords.map((item) => {
                      const c = crops.find(crop => crop.type === item.cropType);
                      const isPaid = item.status === 'payment-completed';

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {language === 'hi' ? c?.nameHi : c?.nameEn}
                          </td>
                          <td className="px-4 py-3">
                            {item.quantityQuintals} {t('history.quintals')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {formatDate(item.createdAt, language)}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 text-right">
                            {formatCurrency(item.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[11px] font-bold px-2 py-1 uppercase tracking-wide border ${
                              isPaid 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {isPaid 
                                ? (language === 'hi' ? 'भुगतान पूर्ण' : 'Payment Completed') 
                                : (language === 'hi' ? 'प्रक्रिया में' : 'In Progress')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
              <div className="bg-[#ea580c] text-white border-b border-[#c2410c] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase">
                    {language === 'hi' ? 'सूचनाएं' : 'Notifications'}
                  </h3>
                </div>
                <span className="text-xs px-2 py-0.5 bg-white text-[#ea580c] font-bold rounded-sm">
                  {farmerNotifs.length}
                </span>
              </div>

              <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
                {farmerNotifs.map((n: Notification) => (
                  <div 
                    key={n.id} 
                    className={`p-3 border-l-4 text-xs space-y-1 ${
                      n.read 
                        ? 'border-gray-300 bg-gray-50 text-gray-700' 
                        : 'border-[#14532d] bg-green-50 text-gray-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{language === 'hi' ? n.titleHi : n.title}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">SMS</span>
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
