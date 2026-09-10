'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Building2,
  Navigation,
  ShieldCheck,
  X,
  RotateCcw
} from 'lucide-react';

const REGIONS = [
  { id: 'all', name: 'All MP Mandis (31)', nameHi: 'सभी मंडियां (31)' },
  { id: 'Indore', name: 'Indore (9)', nameHi: 'इंदौर (9)' },
  { id: 'Ujjain', name: 'Ujjain (5)', nameHi: 'उज्जैन (5)' },
  { id: 'Bhopal', name: 'Bhopal (4)', nameHi: 'भोपाल (4)' },
  { id: 'Gwalior', name: 'Gwalior (4)', nameHi: 'ग्वालियर (4)' },
  { id: 'Vidisha', name: 'Vidisha (4)', nameHi: 'विदिशा (4)' },
  { id: 'Jabalpur', name: 'Jabalpur (5)', nameHi: 'जबलपुर (5)' },
];

export default function CentersPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedTehsil, setSelectedTehsil] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [crowdFilter, setCrowdFilter] = useState<string>('all');
  const [centersList, setCentersList] = useState<ProcurementCenter[]>(fallbackCenters);

  useEffect(() => {
    async function loadCenters() {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedDistrict !== 'all') params.append('district', selectedDistrict);
      if (selectedTehsil !== 'all') params.append('tehsil', selectedTehsil);
      if (selectedCrop !== 'all') params.append('crop', selectedCrop);
      if (crowdFilter !== 'all') params.append('crowd', crowdFilter);

      const res = await apiClient<{ centers: ProcurementCenter[] }>(`/centers?${params.toString()}`);
      if (res.success && res.data?.centers?.length) {
        setCentersList(res.data.centers);
      }
    }
    loadCenters();
  }, [searchQuery, selectedDistrict, selectedTehsil, selectedCrop, crowdFilter]);

  // Compute tehsils available under selected district
  const availableTehsils = useMemo(() => {
    let source = centersList.length ? centersList : fallbackCenters;
    if (selectedDistrict !== 'all') {
      const dLower = selectedDistrict.toLowerCase();
      source = source.filter(c => 
        (c.district && c.district.toLowerCase() === dLower) ||
        (c.region && c.region.toLowerCase().includes(dLower))
      );
    }
    const set = new Set<string>();
    source.forEach(c => {
      if (c.tehsil) set.add(c.tehsil);
    });
    return Array.from(set).sort();
  }, [centersList, selectedDistrict]);

  // Reset tehsil selection if user switches city and current tehsil doesn't belong to it
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedTehsil('all');
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('all');
    setSelectedTehsil('all');
    setSelectedCrop('all');
    setCrowdFilter('all');
  };

  // Filter centers locally as fallback
  const filteredCenters = useMemo(() => {
    const source = centersList.length ? centersList : fallbackCenters;

    return source.filter((center) => {
      // 1. District / City Match
      const matchesDistrict = 
        selectedDistrict === 'all' ||
        (center.district && center.district.toLowerCase() === selectedDistrict.toLowerCase()) ||
        (center.region && center.region.toLowerCase().includes(selectedDistrict.toLowerCase()));

      // 2. Tehsil / Area Match
      const matchesTehsil =
        selectedTehsil === 'all' ||
        (center.tehsil && center.tehsil.toLowerCase() === selectedTehsil.toLowerCase());

      // 3. Text Search
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !q ||
        center.name.toLowerCase().includes(q) ||
        (center.nameHi && center.nameHi.includes(q)) ||
        (center.district && center.district.toLowerCase().includes(q)) ||
        (center.districtHi && center.districtHi.includes(q)) ||
        (center.tehsil && center.tehsil.toLowerCase().includes(q)) ||
        (center.tehsilHi && center.tehsilHi.includes(q)) ||
        (center.address && center.address.toLowerCase().includes(q));

      // 4. Crop Match
      const matchesCrop = 
        selectedCrop === 'all' || 
        (typeof center.cropsAccepted === 'string'
          ? (center.cropsAccepted as string).includes(selectedCrop)
          : center.cropsAccepted?.includes(selectedCrop as CropType));

      // 5. Crowd Match
      const matchesCrowd = 
        crowdFilter === 'all' || 
        center.crowdLevel === crowdFilter;

      return matchesDistrict && matchesTehsil && matchesSearch && matchesCrop && matchesCrowd;
    });
  }, [centersList, selectedDistrict, selectedTehsil, searchQuery, selectedCrop, crowdFilter]);

  const hasActiveFilters = 
    selectedDistrict !== 'all' || 
    selectedTehsil !== 'all' || 
    selectedCrop !== 'all' || 
    crowdFilter !== 'all' || 
    searchQuery.trim().length > 0;

  return (
    <div className="bg-[#FDF8F0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8DFD0] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#166534]/10 text-[#166534] text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
              <span>{language === 'hi' ? 'मध्य प्रदेश सरकारी कृषि ई-उपार्जन मंडियां' : 'Official MP Government Procurement Mandis'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14532d] font-serif tracking-tight">
              {language === 'hi' ? 'खरीद केंद्र व मंडी खोज' : 'Mandi Procurement Centers'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              {language === 'hi' 
                ? 'इंदौर, उज्जैन, भोपाल, ग्वालियर, विदिशा एवं जबलपुर संभागों की सभी 31 आधिकारिक कृषि उपज मंडियों में से अपने शहर व तहसील अनुसार केंद्र चुनें।'
                : 'Locate certified MSP procurement hubs and Krishi Upaj Mandis across Indore, Ujjain, Bhopal, Gwalior, Vidisha, and Jabalpur regions by city and area/tehsil.'}
            </p>
          </div>

          {/* Crowd Recommendation Banner */}
          <div className="bg-[#FAF3E6] border border-[#E8DFD0] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#6B9F5B]/20 text-[#166534] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#f97316]" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-[#14532d] block">
                {language === 'hi' ? 'स्मार्ट ई-उपार्जन नेटवर्क' : 'Official Project Mandis'}
              </span>
              <span className="text-gray-600">
                {language === 'hi' 
                  ? '31 केंद्र सक्रिय • औसत प्रतीक्षा समय ~16 मिनट' 
                  : '31 MP Mandis Active • Average Queue Time ~16 min'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Region Selector Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#166534]" />
              <span>{language === 'hi' ? 'संभाग अनुसार त्वरित चयन' : 'Quick City / Region Selector'}</span>
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सभी फिल्टर हटाएं' : 'Reset Filters'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {REGIONS.map((r) => {
              const isActive = selectedDistrict === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleDistrictChange(r.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-[#166534] text-white shadow-xs scale-102'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-2xs'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-gray-400'}`} />
                  <span>{language === 'hi' ? r.nameHi : r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Systematic City & Area Dropdown Filter Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-sm space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
            
            {/* 1. City / District Dropdown Menu */}
            <div className="lg:col-span-3 space-y-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {language === 'hi' ? '1. शहर / जिला (City / District)' : '1. City / District'}
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#166534] transition appearance-none cursor-pointer"
                >
                  <option value="all">{language === 'hi' ? 'सभी जिले / संभाग (All Cities)' : 'All Cities / Districts (MP)'}</option>
                  <option value="Indore">Indore (इंदौर) — 9 Mandis</option>
                  <option value="Ujjain">Ujjain (उज्जैन) — 5 Mandis</option>
                  <option value="Bhopal">Bhopal (भोपाल / संभाग) — 4 Mandis</option>
                  <option value="Gwalior">Gwalior (ग्वालियर) — 4 Mandis</option>
                  <option value="Vidisha">Vidisha (विदिशा) — 4 Mandis</option>
                  <option value="Jabalpur">Jabalpur (जबलपुर) — 5 Mandis</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* 2. Area / Tehsil Dropdown Menu (Locate area wise) */}
            <div className="lg:col-span-3 space-y-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {language === 'hi' ? '2. क्षेत्र / तहसील (Area / Tehsil)' : '2. Area / Tehsil'}
              </label>
              <div className="relative">
                <select
                  value={selectedTehsil}
                  onChange={(e) => setSelectedTehsil(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#166534] transition appearance-none cursor-pointer"
                >
                  <option value="all">
                    {selectedDistrict === 'all'
                      ? (language === 'hi' ? 'सभी क्षेत्र / तहसील (All Areas)' : 'All Areas / Tehsils')
                      : (language === 'hi' ? `सभी क्षेत्र (${selectedDistrict})` : `All Areas in ${selectedDistrict}`)}
                  </option>
                  {availableTehsils.map((tehsil) => (
                    <option key={tehsil} value={tehsil}>
                      {tehsil} Tehsil
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* 3. Search Bar */}
            <div className="lg:col-span-3 space-y-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {language === 'hi' ? '3. नाम द्वारा खोजें' : '3. Search Mandi / Area'}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. Laxmibai, Sanwer, Mahidpur...' : 'e.g. Laxmibai, Sanwer, Mahidpur...'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#166534] transition"
                />
              </div>
            </div>

            {/* 4. Crop Filter */}
            <div className="lg:col-span-3 space-y-1">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                {language === 'hi' ? '4. फसल (Major Crop)' : '4. Crop Filter'}
              </label>
              <div className="relative">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#166534] transition appearance-none cursor-pointer"
                >
                  <option value="all">{language === 'hi' ? 'सभी फसलें (All Crops)' : 'All Major Crops'}</option>
                  {crops.map((c) => (
                    <option key={c.type} value={c.type}>
                      {c.emoji} {language === 'hi' ? c.nameHi : c.nameEn}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-500 text-xs">
                  ▼
                </div>
              </div>
            </div>

          </div>

          {/* Results Summary Bar */}
          <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#14532d]">
                {language === 'hi' ? `उपलब्ध मंडियां: ${filteredCenters.length}` : `Showing ${filteredCenters.length} Procurement Mandis`}
              </span>
              {selectedDistrict !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-[#14532d] text-[11px] font-bold">
                  {selectedDistrict} Region
                </span>
              )}
              {selectedTehsil !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold">
                  {selectedTehsil} Tehsil
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-medium">
                {language === 'hi' ? 'भीड़ स्तर:' : 'Crowd Filter:'}
              </span>
              <div className="inline-flex gap-1">
                {(['all', 'low', 'moderate', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setCrowdFilter(level)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      crowdFilter === level
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'all' ? 'All' : level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Center Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredCenters.map((center) => {
            const isClosed = center.status === 'closed';

            return (
              <div
                key={center.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Bar Status with City & Area Badges */}
                  <div className="p-4 pb-3 bg-[#fafaf9] border-b border-gray-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* District Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#14532d] text-white">
                        {center.district}
                      </span>

                      {/* Area/Tehsil Badge */}
                      {center.tehsil && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Tehsil: {center.tehsil}
                        </span>
                      )}
                    </div>

                    {/* Live Crowd Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isClosed 
                            ? 'bg-red-500' 
                            : center.crowdLevel === 'low' 
                            ? 'bg-emerald-500' 
                            : center.crowdLevel === 'moderate' 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                        }`}
                      />
                      <span className="text-[10px] font-bold text-gray-600 uppercase">
                        {center.crowdLevel}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#14532d] group-hover:text-[#166534] transition-colors leading-snug">
                        {language === 'hi' ? center.nameHi : center.name}
                      </h3>
                      <p className="text-xs text-gray-600 flex items-start gap-1.5 mt-1.5 leading-tight">
                        <MapPin className="w-3.5 h-3.5 text-[#f97316] shrink-0 mt-0.5" />
                        <span>{language === 'hi' ? center.addressHi : center.address}</span>
                      </p>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Capacity</span>
                        <span className="font-bold text-xs text-gray-800">{center.dailyCapacity}/day</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">In Queue</span>
                        <span className="font-bold text-xs text-[#f97316]">{center.currentQueue || 15}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">Avg Wait</span>
                        <span className="font-bold text-xs text-emerald-700">~{center.avgProcessingTime || 16}m</span>
                      </div>
                    </div>

                    {/* Crops Accepted Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        {language === 'hi' ? 'स्वीकृत मुख्य फसलें' : 'Major Crops Accepted'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {center.cropsAccepted?.map((cropKey) => {
                          const cropData = crops.find(c => c.type === cropKey);
                          return (
                            <span
                              key={cropKey}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF3E6] border border-[#E8DFD0] text-[11px] font-medium text-gray-800"
                            >
                              <span>{cropData?.emoji || '🌾'}</span>
                              <span>{language === 'hi' ? cropData?.nameHi : cropData?.nameEn || cropKey}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contact & Hours */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{language === 'hi' ? center.operatingHoursHi : center.operatingHours}</span>
                      </span>
                      {center.contactPhone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{center.contactPhone}</span>
                        </span>
                      )}
                    </div>

                  </div>
                </div>

                {/* Bottom Action CTA: Book Slot */}
                <div className="p-5 pt-0">
                  <Link
                    href={`/centers/${center.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition"
                  >
                    <span>{language === 'hi' ? 'स्लॉट बुक करें (Book Delivery Slot)' : 'Select Mandi & Book Slot'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCenters.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-serif">
              {language === 'hi' ? 'चयनित फिल्टर के अनुसार कोई केंद्र नहीं मिला' : 'No Procurement Mandis Match Your Criteria'}
            </h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              {language === 'hi' 
                ? 'कृपया शहर या तहसील ड्रॉपडाउन बदलें, या सभी फिल्टर हटाने के लिए रीसेट करें।' 
                : 'Please select a different City / Tehsil from the dropdown menu, or click Reset Filters.'}
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-5 py-2.5 rounded-xl bg-[#166534] text-white text-xs font-bold shadow-xs hover:bg-[#14532d] transition"
            >
              {language === 'hi' ? 'सभी 31 मंडियां देखें' : 'View All 31 Mandis'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
