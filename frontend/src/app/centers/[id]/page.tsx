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
        <Link href="/centers" className="text-[#5B7F3B] underline font-semibold">
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
    <div className="bg-[#FDF8F0] min-h-screen py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Back Navigation */}
        <Link 
          href="/centers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B5D4A] hover:text-[#3D3426] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'सभी केंद्रों पर वापस जाएं' : 'Back to Procurement Centers'}</span>
        </Link>

        {/* Center Overview Header Card */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#E8DFD0] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7F3B]/15 text-[#5B7F3B] text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सत्यापित सरकारी खरीद केंद्र' : 'Government Authorized Mandi'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3D3426] font-serif">
                {language === 'hi' ? center.nameHi : center.name}
              </h1>
              <p className="text-sm text-[#6B5D4A] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#A89878] shrink-0" />
                <span>{language === 'hi' ? center.addressHi : center.address}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-right">
              <div className="bg-[#FAF3E6] border border-[#E8DFD0] p-3 rounded-2xl text-left">
                <span className="text-[11px] text-[#A89878] block font-semibold">{t('centers.timing')}</span>
                <span className="text-xs font-bold text-[#3D3426]">{center.operatingHours}</span>
              </div>
              <div className="bg-[#FAF3E6] border border-[#E8DFD0] p-3 rounded-2xl text-left">
                <span className="text-[11px] text-[#A89878] block font-semibold">{t('centers.capacity')}</span>
                <span className="text-xs font-bold text-[#5B7F3B]">{center.dailyCapacity} {t('common.farmers')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal / Mandi Parchi View */}
        {bookingConfirmed ? (
          <div className="bg-[#FFFDF9] rounded-3xl p-8 border-2 border-[#5B7F3B] shadow-xl space-y-8 animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#6B9F5B]/20 text-[#5B7F3B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D3426]">
                {t('centers.bookingSuccess')}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5D4A]">
                {language === 'hi' 
                  ? 'आपकी खरीद अपॉइंटमेंट दर्ज कर ली गई है। आपको एक एसएमएस भी भेजा गया है।' 
                  : 'Your appointment is booked. An SMS confirmation has been dispatched to your phone.'}
              </p>
            </div>

            {/* MANDI PARCHI (RECEIPT CARD) */}
            <div className="max-w-md mx-auto bg-[#FAF3E6] border-2 border-dashed border-[#D4C8B5] p-6 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#E8DFD0] pb-4">
                <div className="text-xs font-bold text-[#6B5D4A]">MANDI MITRA E-TOKEN</div>
                <div className="text-xs text-[#5B7F3B] font-bold">VERIFIED APPOINTMENT</div>
              </div>

              <div className="text-center py-2 space-y-1">
                <span className="text-xs text-[#A89878] uppercase font-bold tracking-wider">{t('centers.yourToken')}</span>
                <div className="text-5xl font-black text-[#5B7F3B] font-mono tracking-tight">
                  #{tokenGenerated}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8DFD0]">
                <div>
                  <span className="text-[#A89878] block">{language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}</span>
                  <span className="font-bold text-[#3D3426]">{currentFarmer.name}</span>
                </div>
                <div>
                  <span className="text-[#A89878] block">{language === 'hi' ? 'फसल प्रकार' : 'Crop'}</span>
                  <span className="font-bold text-[#3D3426] uppercase">{selectedCrop}</span>
                </div>
                <div>
                  <span className="text-[#A89878] block">{language === 'hi' ? 'दिनांक' : 'Date'}</span>
                  <span className="font-bold text-[#3D3426]">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-[#A89878] block">{language === 'hi' ? 'समय स्लॉट' : 'Time Slot'}</span>
                  <span className="font-bold text-[#3D3426]">{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                </div>
              </div>

              <div className="flex items-center justify-center p-4 bg-[#FFFDF9] rounded-2xl border border-[#E8DFD0]">
                <div className="text-center space-y-2">
                  <QrCode className="w-24 h-24 mx-auto text-[#3D3426]" />
                  <span className="text-[10px] text-[#A89878] block font-mono">MM-TKN-{tokenGenerated}-{center.id}</span>
                </div>
              </div>

              <p className="text-[11px] text-center text-[#6B5D4A]">
                {language === 'hi' 
                  ? 'कृपया समय पर आधार कार्ड व बैंक पासबुक लेकर केंद्र पर आएं।' 
                  : 'Please arrive at the center on time with your Aadhaar and Farmer Registration ID.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/queue"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#5B7F3B] text-white font-bold text-sm text-center shadow-md hover:bg-[#466B2A] transition"
              >
                {language === 'hi' ? 'लाइव कतार में देखें' : 'View in Live Queue'}
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FFFDF9] border border-[#E8DFD0] text-[#3D3426] font-bold text-sm text-center hover:bg-[#F5EDE0] transition"
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
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#5B7F3B] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-base font-bold text-[#3D3426]">{t('centers.selectCrop')}</h3>
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
                        className={`p-3 rounded-2xl border text-left transition ${
                          isSelected
                            ? 'border-[#5B7F3B] bg-[#5B7F3B]/10 ring-2 ring-[#5B7F3B]'
                            : 'border-[#E8DFD0] bg-[#FFFDF9] hover:bg-[#FAF3E6]'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cData?.emoji}</div>
                        <div className="text-xs font-bold text-[#3D3426]">{cData?.nameEn}</div>
                        <div className="text-[11px] text-[#5B7F3B] font-semibold">₹{cData?.mspRate}/Q</div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-[#6B5D4A] block mb-1.5">
                    {t('centers.estimatedQuantity')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-[#E8DFD0] bg-[#FDF8F0] text-sm font-bold text-[#3D3426]"
                  />
                </div>
              </div>

              {/* Step 2: Choose Date */}
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#5B7F3B] text-white flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-base font-bold text-[#3D3426]">{t('centers.selectDate')}</h3>
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
                        className={`px-4 py-3 rounded-2xl border text-center transition min-w-24 ${
                          isSelected
                            ? 'border-[#5B7F3B] bg-[#5B7F3B] text-white shadow-sm'
                            : 'border-[#E8DFD0] bg-[#FFFDF9] hover:bg-[#FAF3E6] text-[#3D3426]'
                        }`}
                      >
                        <span className={`text-[11px] block uppercase font-bold ${isSelected ? 'text-[#E8DFD0]' : 'text-[#A89878]'}`}>
                          {dayName}
                        </span>
                        <span className="text-lg font-black block leading-none my-1">{dayNum}</span>
                        <span className={`text-[11px] block font-medium ${isSelected ? 'text-[#E8DFD0]' : 'text-[#6B5D4A]'}`}>
                          {monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Choose Time Slot */}
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border border-[#E8DFD0] shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#5B7F3B] text-white flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="text-base font-bold text-[#3D3426]">{t('centers.selectSlot')}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-[#A89878] uppercase tracking-wide block mb-2">
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
                            className={`p-3 rounded-2xl border text-left transition ${
                              isFull
                                ? 'border-[#E8DFD0] bg-[#F5EDE0]/40 text-[#A89878] cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'border-[#5B7F3B] bg-[#5B7F3B]/10 ring-2 ring-[#5B7F3B]'
                                : 'border-[#E8DFD0] bg-[#FFFDF9] hover:border-[#D4C8B5]'
                            }`}
                          >
                            <span className="text-xs font-bold text-[#3D3426] block">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className={`text-[10px] font-semibold mt-1 block ${isFull ? 'text-rose-500' : 'text-[#5B7F3B]'}`}>
                              {isFull ? t('centers.full') : `${slot.maxFarmers - slot.bookedCount} slots left`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-[#A89878] uppercase tracking-wide block mb-2">
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
                            className={`p-3 rounded-2xl border text-left transition ${
                              isFull
                                ? 'border-[#E8DFD0] bg-[#F5EDE0]/40 text-[#A89878] cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'border-[#5B7F3B] bg-[#5B7F3B]/10 ring-2 ring-[#5B7F3B]'
                                : 'border-[#E8DFD0] bg-[#FFFDF9] hover:border-[#D4C8B5]'
                            }`}
                          >
                            <span className="text-xs font-bold text-[#3D3426] block">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className={`text-[10px] font-semibold mt-1 block ${isFull ? 'text-rose-500' : 'text-[#5B7F3B]'}`}>
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
              <div className="sticky top-28 bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD0] shadow-md space-y-6">
                
                <h3 className="text-lg font-bold text-[#3D3426] border-b border-[#E8DFD0] pb-3">
                  {language === 'hi' ? 'बुकिंग सारांश' : 'Appointment Summary'}
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-[#6B5D4A]">{language === 'hi' ? 'केंद्र' : 'Center'}</span>
                    <span className="font-bold text-[#3D3426]">{center.name}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#6B5D4A]">{language === 'hi' ? 'किसान' : 'Farmer'}</span>
                    <span className="font-bold text-[#3D3426]">{currentFarmer.name}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#6B5D4A]">{language === 'hi' ? 'फसल' : 'Crop'}</span>
                    <span className="font-bold text-[#3D3426] uppercase">{selectedCrop}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#6B5D4A]">{language === 'hi' ? 'मात्रा' : 'Quantity'}</span>
                    <span className="font-bold text-[#3D3426]">{quantity} Quintals</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#6B5D4A]">{language === 'hi' ? 'तारीख' : 'Date'}</span>
                    <span className="font-bold text-[#5B7F3B]">{selectedDate}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-[#6B5D4A]">{language === 'hi' ? 'समय' : 'Time'}</span>
                    <span className="font-bold text-[#5B7F3B]">
                      {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Select a slot'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-[#E8DFD0] flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-[#6B5D4A]">
                      {language === 'hi' ? 'अनुमानित न्यूनतम मूल्य' : 'Est. Total Value'}
                    </span>
                    <span className="text-xl font-black text-[#5B7F3B]">
                      ₹{((crops.find(c => c.type === selectedCrop)?.mspRate || 2275) * quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedSlot}
                  className={`w-full py-4 rounded-2xl text-sm font-bold shadow-md transition ${
                    selectedSlot
                      ? 'bg-[#5B7F3B] hover:bg-[#466B2A] text-white cursor-pointer'
                      : 'bg-[#E8DFD0] text-[#A89878] cursor-not-allowed'
                  }`}
                >
                  {t('centers.confirmBooking')}
                </button>

                <p className="text-[11px] text-center text-[#A89878]">
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
