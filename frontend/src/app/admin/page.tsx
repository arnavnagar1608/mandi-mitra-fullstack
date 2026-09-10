'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { apiClient } from '@/lib/api-client';
import { 
  adminQueueData as fallbackQueue, 
  hourlyArrivalsData, 
  cropDistributionData, 
  crops,
  QueueEntry 
} from '@/lib/mock-data';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Check, 
  X, 
  TrendingUp,
  BarChart3,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();

  const [queue, setQueue] = useState<QueueEntry[]>(fallbackQueue);
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics' | 'schedule'>('queue');
  const [currentServing, setCurrentServing] = useState<number>(78);

  const fetchRoster = async () => {
    // Admin uses mock token for center officer
    const adminToken = 'mock-token-super_admin';
    localStorage.setItem('mandi_mitra_token', adminToken);

    const res = await apiClient<{ count: number; roster: any[] }>('/admin/centers/c1/roster');
    if (res.success && res.data?.roster?.length) {
      const mapped: QueueEntry[] = res.data.roster.map((b: any) => ({
        tokenNumber: b.tokenNumber || 80,
        farmerName: b.farmerName || 'Kisan Mitra',
        farmerNameHi: b.farmerNameHi || b.farmerName || 'किसान मित्र',
        cropType: b.cropType || 'wheat',
        quantity: b.estimatedQuantity || 50,
        status: b.status === 'serving' ? 'in-progress' : b.status === 'completed' ? 'completed' : 'waiting',
        arrivalTime: b.slotTime || '11:00 AM',
        estimatedTime: b.slotTime || '11:00 AM',
        phone: b.phone || '9876543210'
      }));
      setQueue(mapped);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const handleCallNext = async () => {
    const res = await apiClient<{ nextToken?: number; message?: string }>('/admin/centers/c1/call-next', {
      method: 'POST',
    });

    if (res.success && res.data?.nextToken) {
      setCurrentServing(res.data.nextToken);
      fetchRoster();
    } else {
      // Fallback state update
      const nextWaiting = queue.find(q => q.status === 'waiting');
      if (nextWaiting) {
        setQueue(prev => prev.map(item => {
          if (item.tokenNumber === nextWaiting.tokenNumber) {
            return { ...item, status: 'in-progress' };
          }
          if (item.tokenNumber === currentServing) {
            return { ...item, status: 'completed' };
          }
          return item;
        }));
        setCurrentServing(nextWaiting.tokenNumber);
      }
    }
  };

  const handleStatusChange = (tokenNumber: number, newStatus: 'waiting' | 'in-progress' | 'completed') => {
    setQueue(prev => prev.map(item => 
      item.tokenNumber === tokenNumber ? { ...item, status: newStatus } : item
    ));
  };

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8DFD0] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D3426] text-[#FDF8F0] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E8A94D]" />
              <span>{language === 'hi' ? 'खरीद अधिकारी कंसोल • भोपाल सेंट्रल मंडी' : 'Procurement Officer Console • Bhopal Central Mandi'}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#3D3426] font-serif">
              {t('admin.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5D4A]">
              {language === 'hi' 
                ? 'कतार प्रबंधन, इलेक्ट्रॉनिक तौल सत्यापन एवं दैनिक आवक नियंत्रण।' 
                : 'Real-time queue sequencing, electronic weighbridge verification, and capacity balancing.'}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleCallNext}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#5B7F3B] hover:bg-[#466B2A] text-white text-xs sm:text-sm font-bold shadow-md transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('admin.callNext')} (Token #{currentServing + 1})</span>
            </button>
          </div>
        </div>

        {/* 5 KEY DAILY COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#E8DFD0] shadow-xs">
            <span className="text-[11px] text-[#A89878] uppercase font-bold block">{t('admin.totalSlots')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#3D3426] mt-1 block">200</span>
            <span className="text-[10px] text-[#5B7F3B] font-semibold">100% capacity ready</span>
          </div>

          <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#E8DFD0] shadow-xs">
            <span className="text-[11px] text-[#A89878] uppercase font-bold block">{t('admin.farmersArrived')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#3D3426] mt-1 block">178</span>
            <span className="text-[10px] text-[#5B7F3B] font-semibold">Gate verified via QR</span>
          </div>

          <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#E8DFD0] shadow-xs">
            <span className="text-[11px] text-[#A89878] uppercase font-bold block">{t('admin.processed')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#5B7F3B] mt-1 block">156</span>
            <span className="text-[10px] text-[#5B7F3B] font-semibold">Parchi generated</span>
          </div>

          <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#E8DFD0] shadow-xs">
            <span className="text-[11px] text-[#A89878] uppercase font-bold block">{t('admin.inQueue')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#D4912A] mt-1 block">22</span>
            <span className="text-[10px] text-[#D4912A] font-semibold">Expected wait ~25m</span>
          </div>

          <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#E8DFD0] shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-[#A89878] uppercase font-bold block">{t('admin.avgProcessTime')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#3D3426] mt-1 block">18 min</span>
            <span className="text-[10px] text-[#5B7F3B] font-semibold">4m faster than norm</span>
          </div>

        </div>

        {/* AI CROWD PREDICTION NOTICE (HACKATHON INNOVATION HIGHLIGHT) */}
        <div className="bg-[#FAF3E6] border border-[#D4C8B5] p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4912A] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#3D3426]">
                {language === 'hi' ? 'एआई भीड़ पूर्वानुमान प्रणाली (AI Crowd Forecast)' : 'AI-Driven Arrival Surge Prediction'}
              </h4>
              <p className="text-xs text-[#6B5D4A]">
                {language === 'hi' 
                  ? 'कल सुबह 9:00 - 11:30 बजे भारी भीड़ (92% क्षमता) संभावित है। किसानों को 2:00 PM स्लॉट की स्वचालित सलाह भेजी गई।' 
                  : 'Surge anticipated tomorrow 9:00 - 11:30 AM (92% load). Automated SMS advice sent encouraging afternoon slots.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4912A]/20 text-[#B87A1F] whitespace-nowrap">
            MODEL ACCURACY: 94.2%
          </span>
        </div>

        {/* ADMIN INTERACTION TABS */}
        <div className="flex items-center gap-2 border-b border-[#E8DFD0] pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'queue'
                ? 'bg-[#5B7F3B] text-white shadow-xs'
                : 'text-[#6B5D4A] hover:bg-[#F5EDE0]'
            }`}
          >
            {t('admin.liveQueue')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-[#5B7F3B] text-white shadow-xs'
                : 'text-[#6B5D4A] hover:bg-[#F5EDE0]'
            }`}
          >
            {language === 'hi' ? 'आवक विश्लेषण' : 'Hourly Arrivals & Crops'}
          </button>
        </div>

        {/* TAB 1: LIVE QUEUE SEQUENCING */}
        {activeTab === 'queue' && (
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD0] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E8DFD0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-[#3D3426] font-serif">
                {language === 'hi' ? 'आज की किसान कतार अनुक्रम' : "Today's Active Token Roster"}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A89878]">Showing {queue.length} farmers registered</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF3E6] border-b border-[#E8DFD0] text-[#6B5D4A] uppercase font-bold">
                  <tr>
                    <th className="py-3.5 px-6">{t('admin.tokenNo')}</th>
                    <th className="py-3.5 px-6">{t('admin.farmerName')}</th>
                    <th className="py-3.5 px-6">{t('admin.cropType')}</th>
                    <th className="py-3.5 px-6">{t('admin.weight')}</th>
                    <th className="py-3.5 px-6">{t('payments.status')}</th>
                    <th className="py-3.5 px-6 text-right">{t('admin.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD0]">
                  {queue.map((farmer) => {
                    const c = crops.find(crop => crop.type === farmer.cropType);
                    const isInProgress = farmer.status === 'in-progress';
                    const isDone = farmer.status === 'completed';

                    return (
                      <tr 
                        key={farmer.tokenNumber} 
                        className={`hover:bg-[#FDF8F0] transition ${
                          isInProgress ? 'bg-[#5B7F3B]/10 font-medium' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-mono font-bold text-sm">
                          #{farmer.tokenNumber}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-[#3D3426] block">
                            {language === 'hi' ? farmer.farmerNameHi : farmer.farmerName}
                          </span>
                          <span className="text-[11px] text-[#A89878]">{farmer.phone}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#3D3426]">
                            <span>{c?.emoji}</span>
                            <span>{language === 'hi' ? c?.nameHi : c?.nameEn}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-[#3D3426]">
                          {farmer.quantity} Quintals
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isInProgress 
                              ? 'bg-amber-100 text-amber-800 animate-pulse' 
                              : isDone 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            {farmer.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {farmer.status === 'waiting' && (
                            <button
                              onClick={() => handleStatusChange(farmer.tokenNumber, 'in-progress')}
                              className="px-3 py-1.5 rounded-xl bg-[#5B7F3B] hover:bg-[#466B2A] text-white font-bold transition text-[11px]"
                            >
                              Call In
                            </button>
                          )}
                          {farmer.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(farmer.tokenNumber, 'completed')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-[11px]"
                            >
                              Approve Parchi
                            </button>
                          )}
                          {farmer.status === 'completed' && (
                            <span className="text-[#5B7F3B] font-bold text-xs inline-flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Complete</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & HOURLY LOAD */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Hourly Distribution Visual */}
            <div className="lg:col-span-7 bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD0] shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-[#3D3426] font-serif">
                {t('admin.hourlyArrivals')}
              </h3>
              
              <div className="space-y-3">
                {hourlyArrivalsData.map((item) => (
                  <div key={item.hour} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[#6B5D4A]">
                      <span>{item.hour}</span>
                      <span>{item.arrivals} farmers</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#FAF3E6] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.arrivals > 35 
                            ? 'bg-[#C75B3A]' 
                            : item.arrivals > 20 
                            ? 'bg-[#D4912A]' 
                            : 'bg-[#5B7F3B]'
                        }`}
                        style={{ width: `${(item.arrivals / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Wise Acceptance Ratio */}
            <div className="lg:col-span-5 bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border border-[#E8DFD0] shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-[#3D3426] font-serif">
                {t('admin.cropDistribution')}
              </h3>

              <div className="space-y-4">
                {cropDistributionData.map((crop) => (
                  <div key={crop.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF3E6] border border-[#E8DFD0]">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: crop.color }} 
                      />
                      <span className="text-xs font-bold text-[#3D3426]">
                        {language === 'hi' ? crop.nameHi : crop.name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#5B7F3B]">
                      {crop.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
