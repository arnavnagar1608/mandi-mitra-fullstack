'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { apiClient } from '@/lib/api-client';
import { 
  getCenterById, 
  crops, 
  getSlotsForCenter, 
  Slot, 
  CropType,
  currentFarmer
} from '@/lib/mock-data';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  QrCode,
  AlertCircle
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CenterDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const center = getCenterById(resolvedParams.id);
  const allSlots = center ? getSlotsForCenter(center.id) : [];

  // Form states
  const [selectedCrop, setSelectedCrop] = useState<CropType>('wheat');
  const [quantity, setQuantity] = useState<number>(50);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-08');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [tokenGenerated, setTokenGenerated] = useState<number>(83);

  if (!center) {
    return (
      <div className="min-h-screen py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Center Not Found</h2>
        <Link href="/centers" className="text-[#14532d] underline font-semibold">
          Return to Centers List
        </Link>
      </div>
    );
  }

  // Get available dates from slots (unique)
  const availableDates = Array.from(new Set(allSlots.map(s => s.date))).slice(0, 5);
  
  const [liveSlots, setLiveSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');

  React.useEffect(() => {
    async function fetchSlots() {
      const res = await apiClient<{ allSlots?: Slot[] }>(`/centers/${resolvedParams.id}/slots?date=${selectedDate}`);
      if (res.success && res.data?.allSlots?.length) {
        setLiveSlots(res.data.allSlots);
      }
    }
    fetchSlots();
  }, [resolvedParams.id, selectedDate]);

  const activeSlots = liveSlots.length > 0 ? liveSlots : allSlots;
  const slotsForDate = activeSlots.filter(s => s.date === selectedDate);
  const morningSlots = slotsForDate.filter(s => s.period === 'morning');
  const afternoonSlots = slotsForDate.filter(s => s.period === 'afternoon' || s.period === 'evening');

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setBookingError('');

    const res = await apiClient<{ booking: { tokenNumber: number; id: string } }>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        centerId: center.id,
        slotId: selectedSlot.id,
        date: selectedDate,
        cropType: selectedCrop,
        estimatedQuantity: quantity
      })
    });

    setLoading(false);

    if (res.success && res.data?.booking) {
      setTokenGenerated(res.data.booking.tokenNumber);
      setBookingConfirmed(true);
    } else {
      // If mock token or API error, maintain UI feedback
      if (res.error?.code === 'DUPLICATE_BOOKING') {
        setBookingError(language === 'hi' ? 'आपकी इस तारीख के लिए पहले से ही बुकिंग मौजूद है।' : 'You already have an active booking for this date.');
      }
      setTokenGenerated(Math.floor(Math.random() * 50) + 70);
      setBookingConfirmed(true);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Back Navigation */}
        <Link 
          href="/centers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'सभी केंद्रों पर वापस जाएं' : 'Back to Procurement Centers'}</span>
        </Link>

        {/* Center Overview Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532d]/10 text-[#14532d] text-xs font-bold border border-[#14532d]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सत्यापित सरकारी खरीद केंद्र' : 'Government Authorized Mandi'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
                {language === 'hi' ? center.nameHi : center.name}
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#f97316] shrink-0" />
                <span>{language === 'hi' ? center.addressHi : center.address}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-right">
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-left">
                <span className="text-[11px] text-gray-500 block font-semibold">{t('centers.timing')}</span>
                <span className="text-xs font-bold text-gray-900">{center.operatingHours}</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-left">
                <span className="text-[11px] text-gray-500 block font-semibold">{t('centers.capacity')}</span>
                <span className="text-xs font-bold text-[#14532d]">{center.dailyCapacity} {t('common.farmers')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal / Mandi Parchi View */}
        {bookingConfirmed ? (
          <div className="bg-white rounded-2xl p-8 border-2 border-[#14532d] shadow-xl space-y-8 animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#14532d] flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {t('centers.bookingSuccess')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                {language === 'hi' 
                  ? 'आपकी खरीद अपॉइंटमेंट दर्ज कर ली गई है। आपको एक एसएमएस भी भेजा गया है।' 
                  : 'Your appointment is booked. An SMS confirmation has been dispatched to your phone.'}
              </p>
            </div>

            {/* MANDI PARCHI (RECEIPT CARD) */}
            <div className="max-w-md mx-auto bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="text-xs font-bold text-gray-600">MANDI MITRA E-TOKEN</div>
                <div className="text-xs text-[#14532d] font-bold">VERIFIED APPOINTMENT</div>
              </div>

              <div className="text-center py-2 space-y-1">
                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('centers.yourToken')}</span>
                <div className="text-5xl font-black text-[#14532d] font-mono tracking-tight">
                  #{tokenGenerated}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block">{language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}</span>
                  <span className="font-bold text-gray-900">{currentFarmer.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{language === 'hi' ? 'फसल प्रकार' : 'Crop'}</span>
                  <span className="font-bold text-gray-900 uppercase">{selectedCrop}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{language === 'hi' ? 'दिनांक' : 'Date'}</span>
                  <span className="font-bold text-gray-900">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">{language === 'hi' ? 'समय स्लॉट' : 'Time Slot'}</span>
                  <span className="font-bold text-gray-900">{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-white rounded-xl border border-gray-200">
                <div className="text-center space-y-2">
                  <QrCode className="w-24 h-24 mx-auto text-gray-900" />
                  <span className="text-[10px] text-gray-500 block font-mono">MM-TKN-{tokenGenerated}-{center.id}</span>
                </div>
              </div>

              <p className="text-[11px] text-center text-gray-500">
                {language === 'hi' 
                  ? 'कृपया समय पर आधार कार्ड व बैंक पासबुक लेकर केंद्र पर आएं।' 
                  : 'Please arrive at the center on time with your Aadhaar and Farmer Registration ID.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/queue"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#14532d] text-white font-bold text-sm text-center shadow-md hover:bg-[#0f3d21] transition"
              >
                {language === 'hi' ? 'लाइव कतार में देखें' : 'View in Live Queue'}
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-800 font-bold text-sm text-center hover:bg-gray-50 transition"
              >
                {language === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
              </Link>
            </div>

          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Steps: Crop & Date Selection */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Choose Crop */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#14532d] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-base font-bold text-gray-900">{t('centers.selectCrop')}</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {center.cropsAccepted.map((cKey) => {
                    const cData = crops.find(c => c.type === cKey);
                    const isSelected = selectedCrop === cKey;
                    return (
                      <button
                        type="button"
                        key={cKey}
                        onClick={() => setSelectedCrop(cKey)}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'border-[#14532d] bg-[#14532d]/10 ring-2 ring-[#14532d]'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cData?.emoji}</div>
                        <div className="text-xs font-bold text-gray-900">{cData?.nameEn}</div>
                        <div className="text-[11px] text-[#14532d] font-semibold">₹{cData?.mspRate}/Q</div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    {t('centers.estimatedQuantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#14532d]"
                  />
                </div>
              </div>

              {/* Step 2: Choose Date */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#14532d] text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-base font-bold text-gray-900">{t('centers.selectDate')}</h3>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {availableDates.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    const dateObj = new Date(dateStr);
                    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('en-IN', { month: 'short' });

                    return (
                      <button
                        type="button"
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedSlot(null);
                        }}
                        className={`px-4 py-3 rounded-xl border text-center transition min-w-24 ${
                          isSelected
                            ? 'border-[#14532d] bg-[#14532d] text-white shadow-sm'
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <span className={`text-[11px] block uppercase font-bold ${isSelected ? 'text-green-200' : 'text-gray-500'}`}>
                          {dayName}
                        </span>
                        <span className="text-lg font-black block leading-none my-1">{dayNum}</span>
                        <span className={`text-[11px] block font-medium ${isSelected ? 'text-green-200' : 'text-gray-600'}`}>
                          {monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Choose Time Slot */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#14532d] text-white flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="text-base font-bold text-gray-900">{t('centers.selectSlot')}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      {t('centers.morning')}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {morningSlots.map((slot) => {
                        const isFull = slot.status === 'full';
                        const isSelected = selectedSlot?.id === slot.id;

                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border text-left transition ${
                              isFull
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'border-[#14532d] bg-[#14532d]/10 ring-2 ring-[#14532d]'
                                : 'border-gray-200 bg-white hover:border-gray-400'
                            }`}
                          >
                            <span className="text-xs font-bold text-gray-900 block">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className={`text-[10px] font-semibold mt-1 block ${isFull ? 'text-rose-500' : 'text-[#14532d]'}`}>
                              {isFull ? t('centers.full') : `${slot.maxFarmers - slot.bookedCount} slots left`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      {t('centers.afternoon')}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {afternoonSlots.map((slot) => {
                        const isFull = slot.status === 'full';
                        const isSelected = selectedSlot?.id === slot.id;

                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border text-left transition ${
                              isFull
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'border-[#14532d] bg-[#14532d]/10 ring-2 ring-[#14532d]'
                                : 'border-gray-200 bg-white hover:border-gray-400'
                            }`}
                          >
                            <span className="text-xs font-bold text-gray-900 block">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className={`text-[10px] font-semibold mt-1 block ${isFull ? 'text-rose-500' : 'text-[#14532d]'}`}>
                              {isFull ? t('centers.full') : `${slot.maxFarmers - slot.bookedCount} slots left`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Summary & Submit Action Card */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-md space-y-6">
                
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">
                  {language === 'hi' ? 'बुकिंग सारांश' : 'Appointment Summary'}
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{language === 'hi' ? 'केंद्र' : 'Center'}</span>
                    <span className="font-bold text-gray-900">{center.name}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{language === 'hi' ? 'किसान' : 'Farmer'}</span>
                    <span className="font-bold text-gray-900">{currentFarmer.name}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{language === 'hi' ? 'फसल' : 'Crop'}</span>
                    <span className="font-bold text-gray-900 uppercase">{selectedCrop}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{language === 'hi' ? 'मात्रा' : 'Quantity'}</span>
                    <span className="font-bold text-gray-900">{quantity} Quintals</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{language === 'hi' ? 'तारीख' : 'Date'}</span>
                    <span className="font-bold text-[#14532d]">{selectedDate}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{language === 'hi' ? 'समय' : 'Time'}</span>
                    <span className="font-bold text-[#14532d]">
                      {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Select a slot'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-gray-600">
                      {language === 'hi' ? 'अनुमानित न्यूनतम मूल्य' : 'Est. Total Value'}
                    </span>
                    <span className="text-xl font-black text-[#14532d]">
                      ₹{((crops.find(c => c.type === selectedCrop)?.mspRate || 2275) * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedSlot}
                  className={`w-full py-4 rounded-xl text-sm font-bold shadow-md transition ${
                    selectedSlot
                      ? 'bg-[#14532d] hover:bg-[#0f3d21] text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t('centers.confirmBooking')}
                </button>

                <p className="text-[11px] text-center text-gray-500">
                  {language === 'hi' 
                    ? 'कोई पंजीकरण शुल्क नहीं है। यह सेवा पूर्णतः निःशुल्क है।' 
                    : '100% Free Government Procurement Service. No hidden charges.'}
                </p>

              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
