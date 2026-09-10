'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { apiClient } from '@/lib/api-client';
import { procurementRecords as fallbackRecords, crops, formatCurrency, formatDate, ProcurementRecord } from '@/lib/mock-data';
import { 
  History, 
  Download, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  Scale, 
  Award, 
  ChevronRight, 
  TrendingUp 
} from 'lucide-react';

export default function HistoryPage() {
  const { t, language } = useLanguage();

  const [recordsList, setRecordsList] = useState<ProcurementRecord[]>(fallbackRecords);

  useEffect(() => {
    async function loadProcurements() {
      const res = await apiClient<{ procurements: ProcurementRecord[] }>('/procurements/my');
      if (res.success && res.data?.procurements) {
        setRecordsList(res.data.procurements);
      }
    }
    loadProcurements();
  }, []);

  const recordsToDisplay = recordsList.length > 0 ? recordsList : fallbackRecords;
  const totalQuantity = recordsToDisplay.reduce((acc, r) => acc + (r.quantityQuintals || 0), 0);

  return (
    <AuthGuard
      pageTitle={{ en: 'Procurement Records & Mandi Parchis', hi: 'खरीद रिकॉर्ड व डिजिटल मंडी पर्ची' }}
      pageDescription={{ en: 'your accepted crop history, weight slips, and certificates', hi: 'अपनी स्वीकृत फसलें, तौल पर्चियां और डिजिटल प्रमाण पत्र' }}
    >
      <div className="bg-white min-h-screen py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532d]/10 text-[#14532d] text-xs font-bold">
              <History className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डिजिटल मंडी पर्ची रिकॉर्ड' : 'Certified Procurement Records'}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif">
              {t('history.title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'hi' 
                ? 'आपकी सभी स्वीकृत फसलें, धर्मकांटा तौल व आधिकारिक डिजिटल रसीदें।' 
                : 'All your accepted harvest submissions, weight slips, and official Mandi Parchis.'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl">
              <span className="text-gray-500 block font-semibold">{t('history.totalQuantity')}</span>
              <span className="text-base font-black text-[#14532d]">{totalQuantity} {t('history.quintals')}</span>
            </div>
          </div>
        </div>

        {/* RECORDS LIST */}
        <div className="space-y-6">
          {recordsToDisplay.map((rec) => {
            const crop = crops.find(c => c.type === rec.cropType);

            return (
              <div
                key={rec.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm hover:shadow-md transition space-y-6"
              >
                {/* Header of Record */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="text-3xl">{crop?.emoji}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {language === 'hi' ? crop?.nameHi : crop?.nameEn}
                      </h3>
                      <span className="text-xs text-gray-500">
                        Mandi Parchi: <span className="font-mono font-bold text-gray-900">MP-{rec.id.toUpperCase()}-2026</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सफलतापूर्वक स्वीकृत' : 'Procured & Certified'}</span>
                    </span>
                  </div>
                </div>

                {/* Details 4-Column Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <span className="text-gray-500 block font-semibold">{language === 'hi' ? 'तौल मात्रा' : 'Net Weight'}</span>
                    <span className="text-base font-black text-gray-900 mt-0.5 block">
                      {rec.quantityQuintals} Quintals
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <span className="text-gray-500 block font-semibold">{language === 'hi' ? 'गुणवत्ता ग्रेड' : 'Quality Grade'}</span>
                    <span className="text-base font-black text-[#14532d] mt-0.5 block">
                      Grade {rec.qualityGrade} (Moisture &lt; 12%)
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <span className="text-gray-500 block font-semibold">{language === 'hi' ? 'एमएसपी दर' : 'MSP Rate'}</span>
                    <span className="text-base font-black text-gray-900 mt-0.5 block">
                      ₹{rec.mspRate} / Q
                    </span>
                  </div>

                  <div className="bg-[#14532d]/10 p-4 rounded-2xl border border-[#14532d]/20">
                    <span className="text-[#14532d] block font-semibold">{language === 'hi' ? 'कुल राशि' : 'Total Amount'}</span>
                    <span className="text-base font-black text-[#14532d] mt-0.5 block">
                      {formatCurrency(rec.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <span className="text-xs text-gray-600">
                    {language === 'hi' ? 'स्वीकृति दिनांक:' : 'Date of acceptance:'} {formatDate(rec.createdAt, language)}
                  </span>

                  <button
                    type="button"
                    onClick={() => alert(`Downloading Mandi Parchi MP-${rec.id.toUpperCase()}`)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-900 transition shadow-xs"
                  >
                    <Download className="w-4 h-4 text-[#14532d]" />
                    <span>{t('history.downloadReceipt')} (PDF)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
