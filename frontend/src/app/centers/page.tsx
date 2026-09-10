'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { procurementCenters as fallbackCenters, crops, CropType, ProcurementCenter } from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';
import { 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Filter, 
  Search, 
  ChevronRight, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

export default function CentersPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [crowdFilter, setCrowdFilter] = useState<string>('all');
  const [centersList, setCentersList] = useState<ProcurementCenter[]>(fallbackCenters);

  useEffect(() => {
    async function loadCenters() {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCrop !== 'all') params.append('crop', selectedCrop);
      if (crowdFilter !== 'all') params.append('crowd', crowdFilter);

      const res = await apiClient<{ centers: ProcurementCenter[] }>(`/centers?${params.toString()}`);
      if (res.success && res.data?.centers) {
        setCentersList(res.data.centers);
      }
    }
    loadCenters();
  }, [searchQuery, selectedCrop, crowdFilter]);

  // Filter centers locally as fallback
  const filteredCenters = centersList.filter((center) => {
    const matchesSearch = 
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.nameHi?.includes(searchQuery) ||
      center.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.districtHi?.includes(searchQuery);

    const matchesCrop = 
      selectedCrop === 'all' || 
      (typeof center.cropsAccepted === 'string'
        ? (center.cropsAccepted as string).includes(selectedCrop)
        : center.cropsAccepted?.includes(selectedCrop as CropType));

    const matchesCrowd = 
      crowdFilter === 'all' || 
      center.crowdLevel === crowdFilter;

    return matchesSearch && matchesCrop && matchesCrowd;
  });

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8DFD0] pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B7F3B]/10 text-[#5B7F3B] text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सक्रिय सरकारी खरीद केंद्र' : 'Official Government Mandis'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3D3426] font-serif">
              {t('centers.title')}
            </h1>
            <p className="text-sm sm:text-base text-[#6B5D4A] max-w-2xl">
              {t('centers.subtitle')}
            </p>
          </div>

          {/* Crowd Recommendation Banner */}
          <div className="bg-[#FAF3E6] border border-[#E8DFD0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#6B9F5B]/20 text-[#5B7F3B] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#3D3426] block">
                {language === 'hi' ? 'स्मार्ट सिफारिश' : 'Smart Recommendation'}
              </span>
              <span className="text-[#6B5D4A]">
                {language === 'hi' ? 'रायसेन केंद्र में आज सबसे कम प्रतीक्षा समय (15 मिनट) है।' : 'Raisen Center currently has the lowest wait time (~15 min).'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-6 border border-[#E8DFD0] shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-5 h-5 text-[#A89878] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('centers.search')}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E8DFD0] bg-[#FDF8F0]/60 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5B7F3B] transition"
              />
            </div>

            {/* Crop Type Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8DFD0] bg-[#FDF8F0]/60 text-sm text-[#3D3426] focus:outline-hidden focus:ring-2 focus:ring-[#5B7F3B] transition"
              >
                <option value="all">{t('centers.allCrops')}</option>
                {crops.map((c) => (
                  <option key={c.type} value={c.type}>
                    {c.emoji} {language === 'hi' ? c.nameHi : c.nameEn} (MSP: ₹{c.mspRate})
                  </option>
                ))}
              </select>
            </div>

            {/* Crowd Level Filter */}
            <div className="md:col-span-3">
              <select
                value={crowdFilter}
                onChange={(e) => setCrowdFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E8DFD0] bg-[#FDF8F0]/60 text-sm text-[#3D3426] focus:outline-hidden focus:ring-2 focus:ring-[#5B7F3B] transition"
              >
                <option value="all">
                  {language === 'hi' ? 'सभी भीड़ स्तर' : 'All Crowd Levels'}
                </option>
                <option value="low">{t('centers.low')} 🟢</option>
                <option value="moderate">{t('centers.moderate')} 🟡</option>
                <option value="high">{t('centers.high')} 🔴</option>
              </select>
            </div>

          </div>
        </div>

        {/* Center Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => {
            const isClosed = center.status === 'closed';

            return (
              <div
                key={center.id}
                className="bg-[#FFFDF9] rounded-3xl border border-[#E8DFD0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar Status */}
                  <div className="p-5 pb-4 border-b border-[#E8DFD0]/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isClosed 
                            ? 'bg-red-500' 
                            : center.crowdLevel === 'low' 
                            ? 'bg-emerald-500' 
                            : center.crowdLevel === 'moderate' 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-xs font-bold text-[#6B5D4A] uppercase tracking-wide">
                        {isClosed 
                          ? t('centers.closed') 
                          : `${center.crowdLevel.toUpperCase()} CROWD`}
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5EDE0] text-[#6B5D4A]">
                      {center.distance} {t('centers.km')}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#3D3426] leading-snug">
                        {language === 'hi' ? center.nameHi : center.name}
                      </h3>
                      <p className="text-xs text-[#6B5D4A] flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#A89878] shrink-0" />
                        <span>{language === 'hi' ? center.addressHi : center.address}</span>
                      </p>
                    </div>

                    {/* Operational Details */}
                    <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-2xl bg-[#FDF8F0] border border-[#E8DFD0]/70 text-xs">
                      <div>
                        <span className="text-[#A89878] block">{t('centers.capacity')}</span>
                        <span className="font-bold text-[#3D3426]">{center.dailyCapacity} / day</span>
                      </div>
                      <div>
                        <span className="text-[#A89878] block">{t('centers.waitTime')}</span>
                        <span className={`font-bold ${center.avgProcessingTime > 20 ? 'text-[#C75B3A]' : 'text-[#5B7F3B]'}`}>
                          ~{center.avgProcessingTime} {t('dashboard.minutes')}
                        </span>
                      </div>
                    </div>

                    {/* Crops Accepted Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-[#A89878] uppercase tracking-wide">
                        {t('centers.cropsAccepted')}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {center.cropsAccepted.map((cropKey) => {
                          const cropData = crops.find(c => c.type === cropKey);
                          return (
                            <span
                              key={cropKey}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FAF3E6] border border-[#E8DFD0] text-xs font-medium text-[#3D3426]"
                            >
                              <span>{cropData?.emoji}</span>
                              <span>{language === 'hi' ? cropData?.nameHi : cropData?.nameEn}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="p-5 pt-0">
                  {isClosed ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-[#E8DFD0] text-[#A89878] text-sm font-semibold cursor-not-allowed text-center"
                    >
                      {t('centers.closed')}
                    </button>
                  ) : (
                    <Link
                      href={`/centers/${center.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5B7F3B] hover:bg-[#466B2A] text-white text-sm font-bold shadow-xs hover:shadow-md transition"
                    >
                      <span>{t('centers.bookNow')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCenters.length === 0 && (
          <div className="text-center py-16 bg-[#FFFDF9] rounded-3xl border border-[#E8DFD0] p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E6] text-[#A89878] flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#3D3426]">
              {language === 'hi' ? 'कोई खरीद केंद्र नहीं मिला' : 'No Procurement Centers Found'}
            </h3>
            <p className="text-xs text-[#6B5D4A] max-w-sm mx-auto">
              {language === 'hi' 
                ? 'कृपया अपने खोज शब्द बदलें या अन्य फसल/भीड़ विकल्प चुनें।' 
                : 'Please adjust your search terms or filter criteria to view available centers.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
