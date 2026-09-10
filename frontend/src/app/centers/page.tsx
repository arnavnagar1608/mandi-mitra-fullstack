'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { procurementCenters as fallbackCenters, crops, CropType, ProcurementCenter } from '@/lib/mock-data';
import { apiClient } from '@/lib/api-client';
import { 
  MapPin, 
  Clock, 
  Search, 
  Phone, 
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
    <div className="bg-[#f4f5f7] min-h-screen py-6 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header Section */}
        <div className="bg-white border-t-4 border-[#ea580c] border-x border-b border-gray-300 p-5 rounded-sm shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-[#14532d] uppercase tracking-wide border-b-2 border-[#14532d] pb-1 inline-block">
              {language === 'hi' ? 'कृषि उपज मंडी निर्देशिका' : 'Procurement Centre Directory'}
            </h1>
            <p className="text-sm text-gray-700 max-w-3xl leading-relaxed">
              {language === 'hi' 
                ? 'मध्य प्रदेश की आधिकारिक कृषि उपज मंडियों की सूची। अपने क्षेत्र के अनुसार केंद्र खोजें और स्लॉट बुक करें।'
                : 'Official directory of Krishi Upaj Mandis (Procurement Centers) in Madhya Pradesh. Search by region and book slots.'}
            </p>
          </div>
          <div className="bg-[#f8f9fa] border border-gray-300 p-3 rounded-sm flex items-center gap-3">
            <div className="text-sm">
              <span className="font-bold text-[#14532d] block uppercase tracking-wide">
                {language === 'hi' ? 'ई-उपार्जन प्रणाली' : 'E-Uparjan System'}
              </span>
              <span className="text-gray-600 font-medium">
                {language === 'hi' ? 'कुल 31 सक्रिय केंद्र' : '31 Active Centers'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-2">
            <h2 className="text-base font-bold text-[#14532d] uppercase flex items-center gap-2">
              <Search className="w-4 h-4" />
              {language === 'hi' ? 'केंद्र खोजें' : 'Search Centers'}
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-[#ea580c] hover:text-[#c2410c] uppercase flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {language === 'hi' ? 'रीसेट' : 'Reset'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 1. District */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {language === 'hi' ? 'जिला (District)' : 'District'}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full p-2 border border-gray-400 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#14532d] rounded-sm"
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{language === 'hi' ? r.nameHi : r.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Tehsil */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {language === 'hi' ? 'तहसील (Tehsil)' : 'Tehsil'}
              </label>
              <select
                value={selectedTehsil}
                onChange={(e) => setSelectedTehsil(e.target.value)}
                className="w-full p-2 border border-gray-400 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#14532d] rounded-sm"
              >
                <option value="all">{language === 'hi' ? 'सभी' : 'All Tehsils'}</option>
                {availableTehsils.map((tehsil) => (
                  <option key={tehsil} value={tehsil}>{tehsil}</option>
                ))}
              </select>
            </div>

            {/* 3. Text Search */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {language === 'hi' ? 'खोज (Search)' : 'Search keyword'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'नाम या पता...' : 'Name or address...'}
                className="w-full p-2 border border-gray-400 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#14532d] rounded-sm"
              />
            </div>

            {/* 4. Crop Filter */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {language === 'hi' ? 'फसल (Crop)' : 'Crop'}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full p-2 border border-gray-400 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#14532d] rounded-sm"
              >
                <option value="all">{language === 'hi' ? 'सभी फसलें' : 'All Crops'}</option>
                {crops.map((c) => (
                  <option key={c.type} value={c.type}>
                    {language === 'hi' ? c.nameHi : c.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-[#e2e8f0] border border-gray-300 px-4 py-2 flex items-center justify-between text-sm rounded-sm">
          <span className="font-bold text-[#14532d]">
            {language === 'hi' ? `परिणाम: ${filteredCenters.length} केंद्र मिले` : `Results: ${filteredCenters.length} centers found`}
          </span>
          <div className="flex items-center gap-2 text-xs font-bold uppercase">
            <span className="text-gray-700">{language === 'hi' ? 'स्थिति:' : 'Status:'}</span>
            <select
              value={crowdFilter}
              onChange={(e) => setCrowdFilter(e.target.value)}
              className="p-1 border border-gray-400 bg-white text-gray-900 focus:outline-none rounded-sm"
            >
              <option value="all">{language === 'hi' ? 'सभी' : 'ALL'}</option>
              <option value="low">{language === 'hi' ? 'कम' : 'LOW'}</option>
              <option value="moderate">{language === 'hi' ? 'मध्यम' : 'MODERATE'}</option>
              <option value="high">{language === 'hi' ? 'अधिक' : 'HIGH'}</option>
            </select>
          </div>
        </div>

        {/* Data Grid / Table view simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCenters.map((center) => {
            const isClosed = center.status === 'closed';

            return (
              <div key={center.id} className="bg-white border border-gray-300 rounded-sm shadow-sm flex flex-col">
                {/* Card Header */}
                <div className="bg-[#14532d] text-white px-4 py-2 flex justify-between items-center rounded-t-sm">
                  <div className="text-sm font-bold uppercase truncate pr-2">
                    {language === 'hi' ? center.nameHi : center.name}
                  </div>
                  <div className="text-xs font-bold px-2 py-0.5 bg-white text-[#14532d] rounded-sm uppercase shrink-0">
                    {center.district}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-800">
                    <MapPin className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
                    <span className="leading-tight">{language === 'hi' ? center.addressHi : center.address}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-b border-gray-200 py-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{language === 'hi' ? 'तहसील:' : 'Tehsil:'}</span>
                      <span className="font-bold text-gray-900">{center.tehsil || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{language === 'hi' ? 'क्षमता:' : 'Capacity:'}</span>
                      <span className="font-bold text-gray-900">{center.dailyCapacity}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{language === 'hi' ? 'कतार:' : 'Queue:'}</span>
                      <span className="font-bold text-[#ea580c]">{center.currentQueue || 15}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">{language === 'hi' ? 'प्रतीक्षा समय:' : 'Wait Time:'}</span>
                      <span className="font-bold text-[#14532d]">~{center.avgProcessingTime || 16}m</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600 font-semibold block mb-1">
                      {language === 'hi' ? 'स्वीकृत फसलें:' : 'Accepted Crops:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {center.cropsAccepted?.map((cropKey) => {
                        const cropData = crops.find(c => c.type === cropKey);
                        return (
                          <span key={cropKey} className="px-2 py-0.5 bg-gray-100 border border-gray-300 text-xs font-bold text-gray-800 uppercase rounded-sm">
                            {language === 'hi' ? cropData?.nameHi : cropData?.nameEn || cropKey}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 p-2 border border-gray-200">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      {language === 'hi' ? center.operatingHoursHi : center.operatingHours}
                    </span>
                    {center.contactPhone && (
                      <span className="flex items-center gap-1 font-semibold">
                        <Phone className="w-3.5 h-3.5" />
                        {center.contactPhone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="px-4 pb-4">
                  <Link
                    href={`/centers/${center.id}`}
                    className="block w-full py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-sm font-bold uppercase text-center rounded-sm border border-[#9a3412] transition-colors"
                  >
                    {language === 'hi' ? 'प्रोसीड टू बुकिंग' : 'Proceed to Booking'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCenters.length === 0 && (
          <div className="bg-white border border-gray-300 p-8 text-center rounded-sm shadow-sm space-y-3">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-[#14532d] uppercase">
              {language === 'hi' ? 'कोई डेटा नहीं मिला' : 'No Data Found'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'hi' ? 'कृपया अपनी खोज बदलें।' : 'Please adjust your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
