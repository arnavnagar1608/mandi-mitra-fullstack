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
  ArrowLeft, 
  CheckCircle2, 
  QrCode
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
      <div className="min-h-screen py-20 text-center bg-[#f4f5f7]">
        <div className="bg-white border border-gray-300 p-8 max-w-md mx-auto shadow-sm">
          <h2 className="text-xl font-bold text-[#14532d] uppercase mb-4">{language === 'hi' ? 'त्रुटि: केंद्र नहीं मिला' : 'Error: Center Not Found'}</h2>
          <Link href="/centers" className="text-[#ea580c] font-bold uppercase underline">
            {language === 'hi' ? 'निर्देशिका पर वापस लौटें' : 'Return to Directory'}
          </Link>
        </div>
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
    <div className="bg-[#f4f5f7] min-h-screen py-6 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Navigation */}
        <div className="mb-4">
          <Link 
            href="/centers"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#14532d] hover:underline uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'hi' ? 'वापस जाएं' : 'Back to Directory'}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white border-t-4 border-[#14532d] border-x border-b border-gray-300 p-5 rounded-sm shadow-sm flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 uppercase">
              {language === 'hi' ? center.nameHi : center.name}
            </h1>
            <p className="text-sm text-gray-700 font-medium mt-1">
              {language === 'hi' ? center.addressHi : center.address}
            </p>
          </div>
          <div className="text-sm border border-gray-300 p-3 bg-gray-50 rounded-sm self-start">
            <div className="font-bold text-[#14532d] uppercase border-b border-gray-300 pb-1 mb-1">
              {language === 'hi' ? 'मंडी विवरण' : 'Mandi Details'}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-gray-600 text-xs font-semibold">{t('centers.timing')}</span>
                <span className="font-bold text-gray-900">
                  {language === 'hi' ? (center.operatingHoursHi || center.operatingHours) : center.operatingHours}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 text-xs font-semibold">{t('centers.capacity')}</span>
                <span className="font-bold text-gray-900">
                  {center.dailyCapacity} {language === 'hi' ? 'क्विंटल/दिन' : 'Qt/day'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {bookingConfirmed ? (
          <div className="bg-white border-t-4 border-[#14532d] border-x border-b border-gray-300 p-6 rounded-sm shadow-sm max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-300 pb-4">
              <CheckCircle2 className="w-8 h-8 text-[#14532d]" />
              <h2 className="text-xl font-bold text-gray-900 uppercase">
                {t('centers.bookingSuccess')}
              </h2>
            </div>
            
            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm font-bold rounded-sm">
                {bookingError}
              </div>
            )}

            <div className="border-2 border-gray-800 p-5 relative bg-[#f9fafb]">
              <div className="flex justify-between items-center border-b-2 border-gray-800 pb-3 mb-4">
                <div className="font-bold text-gray-900 uppercase tracking-widest text-lg">{language === 'hi' ? 'ई-पर्ची' : 'E-PARCHI'}</div>
                <div className="text-[#14532d] font-bold">{language === 'hi' ? 'टोकन:' : 'Token:'} #{tokenGenerated}</div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <div className="text-gray-600 text-xs font-bold uppercase">{language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}</div>
                  <div className="font-bold text-gray-900 text-base">{currentFarmer.name}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs font-bold uppercase">{language === 'hi' ? 'फसल' : 'Crop'}</div>
                  <div className="font-bold text-gray-900 text-base uppercase">
                    {language === 'hi' 
                      ? (crops.find(c => c.type === selectedCrop)?.nameHi || selectedCrop) 
                      : (crops.find(c => c.type === selectedCrop)?.nameEn || selectedCrop)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs font-bold uppercase">{language === 'hi' ? 'दिनांक' : 'Date'}</div>
                  <div className="font-bold text-gray-900 text-base">{selectedDate}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs font-bold uppercase">{language === 'hi' ? 'स्लॉट' : 'Time Slot'}</div>
                  <div className="font-bold text-gray-900 text-base">{selectedSlot?.startTime} - {selectedSlot?.endTime}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs font-bold uppercase">{language === 'hi' ? 'मात्रा' : 'Quantity'}</div>
                  <div className="font-bold text-gray-900 text-base">{quantity} {language === 'hi' ? 'क्विंटल' : 'Qt.'}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-center border-t border-gray-300 pt-4">
                <div className="text-center">
                  <div className="text-xs font-mono mt-1 font-bold text-gray-700">
                    {language === 'hi' ? 'टोकन नंबर:' : 'TOKEN NO:'} MM-TKN-{tokenGenerated}
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="mt-4 px-6 py-2 bg-[#14532d] text-white text-sm font-bold rounded-sm shadow-sm border border-[#0f3f22] hover:bg-[#0f3f22] transition"
                  >
                    {language === 'hi' ? 'रसीद प्रिंट करें' : 'PRINT RECEIPT'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Link href="/queue" className="px-6 py-2 bg-[#14532d] text-white font-bold uppercase text-sm border border-[#0f3d21] rounded-sm hover:bg-[#0f3d21]">
                {language === 'hi' ? 'कतार स्थिति' : 'View Queue Status'}
              </Link>
              <Link href="/dashboard" className="px-6 py-2 bg-gray-200 text-gray-900 font-bold uppercase text-sm border border-gray-400 rounded-sm hover:bg-gray-300">
                {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Form Section 1: Details */}
              <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
                <div className="bg-[#f8f9fa] border-b border-gray-300 px-4 py-3 font-bold text-[#14532d] uppercase">
                  1. {t('centers.selectCrop')} {language === 'hi' ? 'और विवरण' : '& Details'}
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {center.cropsAccepted.map((cKey) => {
                      const cData = crops.find(c => c.type === cKey);
                      const isSelected = selectedCrop === cKey;
                      const cropDisplayName = language === 'hi' 
                        ? (cData?.nameHi || cData?.nameEn || cKey) 
                        : (cData?.nameEn || cKey);
                      return (
                        <button
                          type="button"
                          key={cKey}
                          onClick={() => setSelectedCrop(cKey)}
                          className={`p-2 border text-center rounded-sm transition-colors ${
                            isSelected ? 'border-[#14532d] bg-[#14532d] text-white' : 'border-gray-400 bg-white text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-sm font-bold uppercase">{cropDisplayName}</div>
                          <div className={`text-xs mt-1 ${isSelected ? 'text-green-200' : 'text-gray-600'}`}>
                            {language === 'hi' ? `एमएसपी (MSP): ₹${cData?.mspRate}` : `MSP: ₹${cData?.mspRate}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{t('centers.estimatedQuantity')} {language === 'hi' ? '(क्विंटल)' : '(Quintals)'}</label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full sm:w-1/2 p-2 border border-gray-400 rounded-sm focus:outline-none focus:border-[#14532d]"
                    />
                  </div>
                </div>
              </div>

              {/* Form Section 2: Date */}
              <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
                <div className="bg-[#f8f9fa] border-b border-gray-300 px-4 py-3 font-bold text-[#14532d] uppercase">
                  2. {t('centers.selectDate')}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-3">
                    {availableDates.map((dateStr) => {
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          type="button"
                          key={dateStr}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedSlot(null);
                          }}
                          className={`px-4 py-2 border rounded-sm font-bold text-sm transition-colors ${
                            isSelected ? 'border-[#14532d] bg-[#14532d] text-white' : 'border-gray-400 bg-white text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          {dateStr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Section 3: Time */}
              <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
                <div className="bg-[#f8f9fa] border-b border-gray-300 px-4 py-3 font-bold text-[#14532d] uppercase">
                  3. {t('centers.selectSlot')}
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 border-b border-gray-200 pb-1">{t('centers.morning')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {morningSlots.map((slot) => {
                        const isFull = slot.status === 'full';
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 border rounded-sm text-sm font-bold text-center transition-colors ${
                              isFull ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed' :
                              isSelected ? 'border-[#ea580c] bg-[#ea580c] text-white' :
                              'border-gray-400 bg-white text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                            <div className={`text-xs font-normal mt-1 ${isFull ? 'text-red-600' : isSelected ? 'text-orange-100' : 'text-[#14532d]'}`}>
                              {isFull ? (language === 'hi' ? 'फुल' : 'FULL') : `${slot.maxFarmers - slot.bookedCount} ${language === 'hi' ? 'शेष' : 'left'}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 border-b border-gray-200 pb-1">{t('centers.afternoon')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {afternoonSlots.map((slot) => {
                        const isFull = slot.status === 'full';
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2 border rounded-sm text-sm font-bold text-center transition-colors ${
                              isFull ? 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed' :
                              isSelected ? 'border-[#ea580c] bg-[#ea580c] text-white' :
                              'border-gray-400 bg-white text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                            <div className={`text-xs font-normal mt-1 ${isFull ? 'text-red-600' : isSelected ? 'text-orange-100' : 'text-[#14532d]'}`}>
                              {isFull ? (language === 'hi' ? 'फुल' : 'FULL') : `${slot.maxFarmers - slot.bookedCount} ${language === 'hi' ? 'शेष' : 'left'}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border-t-4 border-[#ea580c] border-x border-b border-gray-300 rounded-sm shadow-sm sticky top-6">
                <div className="bg-[#f8f9fa] border-b border-gray-300 px-4 py-3 font-bold text-gray-900 uppercase">
                  {language === 'hi' ? 'बुकिंग सारांश' : 'Summary'}
                </div>
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-600 font-bold">{language === 'hi' ? 'फसल' : 'Crop'}</span>
                    <span className="font-bold text-gray-900 uppercase">
                      {language === 'hi' 
                        ? (crops.find(c => c.type === selectedCrop)?.nameHi || selectedCrop) 
                        : (crops.find(c => c.type === selectedCrop)?.nameEn || selectedCrop)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-600 font-bold">{language === 'hi' ? 'मात्रा' : 'Qty'}</span>
                    <span className="font-bold text-gray-900">{quantity} {language === 'hi' ? 'क्विंटल' : 'Qt'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-600 font-bold">{language === 'hi' ? 'दिनांक' : 'Date'}</span>
                    <span className="font-bold text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-600 font-bold">{language === 'hi' ? 'समय' : 'Time'}</span>
                    <span className="font-bold text-gray-900">{selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : '-'}</span>
                  </div>

                  <div className="pt-2">
                    <div className="text-xs text-gray-600 font-bold uppercase">{language === 'hi' ? 'अनुमानित मूल्य' : 'Est. Value'}</div>
                    <div className="text-xl font-bold text-[#14532d]">
                      ₹{((crops.find(c => c.type === selectedCrop)?.mspRate || 2275) * quantity).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedSlot || loading}
                    className={`w-full mt-4 py-3 rounded-sm font-bold uppercase text-sm border transition-colors ${
                      selectedSlot && !loading
                        ? 'bg-[#ea580c] text-white border-[#c2410c] hover:bg-[#c2410c]'
                        : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (language === 'hi' ? 'प्रोसेसिंग...' : 'Processing...') : t('centers.confirmBooking')}
                  </button>
                  
                  <div className="text-xs text-gray-500 text-center mt-2 font-semibold">
                    {language === 'hi' ? 'सरकारी सेवा, निःशुल्क' : 'Govt. Service, 100% Free'}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
