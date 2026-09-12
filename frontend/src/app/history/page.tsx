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
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Header */}
          <div className="bg-white border border-gray-300 shadow-sm p-4 rounded-sm flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 border border-gray-300 text-gray-800 text-[10px] font-bold uppercase rounded-sm">
                <History className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डिजिटल मंडी पर्ची रिकॉर्ड' : 'Procurement Records'}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase border-b-2 border-[#14532d] pb-1 inline-block">
                {t('history.title')}
              </h1>
              <p className="text-xs text-gray-700 uppercase">
                {language === 'hi' 
                  ? 'आपकी सभी स्वीकृत फसलें, धर्मकांटा तौल व आधिकारिक डिजिटल रसीदें।' 
                  : 'Accepted harvest submissions and official Mandi Parchis.'}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-3 rounded-sm text-center min-w-[120px]">
              <span className="text-[10px] text-gray-600 font-bold uppercase block">{t('history.totalQuantity')}</span>
              <span className="text-xl font-bold text-[#14532d]">{totalQuantity} Qtl</span>
            </div>
          </div>

          {/* RECORDS LIST */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm p-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 bg-gray-50 px-2 py-1">
              {language === 'hi' ? 'खरीद रजिस्टर' : 'Procurement Register'}
            </h3>

            <div className="space-y-4">
              {recordsToDisplay.map((rec) => {
                const crop = crops.find(c => c.type === rec.cropType);
                return (
                  <div
                    key={rec.id}
                    className="border border-gray-400 bg-white"
                  >
                    {/* Header of Record */}
                    <div className="bg-gray-100 border-b border-gray-400 p-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 uppercase">
                          {language === 'hi' ? crop?.nameHi : crop?.nameEn}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase text-gray-700">
                        <span>{language === 'hi' ? 'पर्ची संख्या:' : 'Parchi No:'} <span className="text-black bg-gray-200 px-1 border border-gray-400 font-mono">MP-{rec.id.toUpperCase()}-26</span></span>
                        <span className="text-[#14532d] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'hi' ? 'प्रमाणित' : 'CERTIFIED'}</span>
                      </div>
                    </div>

                    {/* Details Table */}
                    <table className="w-full text-left text-xs text-gray-700 border-collapse">
                      <thead className="bg-gray-50 uppercase border-b border-gray-400">
                        <tr>
                          <th className="px-4 py-2 border-r border-gray-400 w-1/4">{language === 'hi' ? 'कुल वजन' : 'Net Weight'}</th>
                          <th className="px-4 py-2 border-r border-gray-400 w-1/4">{language === 'hi' ? 'गुणवत्ता ग्रेड' : 'Quality Grade'}</th>
                          <th className="px-4 py-2 border-r border-gray-400 w-1/4">{language === 'hi' ? 'एमएसपी दर' : 'MSP Rate'}</th>
                          <th className="px-4 py-2 w-1/4 text-right">{language === 'hi' ? 'कुल राशि' : 'Total Amount'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3 border-r border-gray-400 font-bold text-gray-900">{rec.quantityQuintals} {language === 'hi' ? 'क्विंटल' : 'Quintals'}</td>
                          <td className="px-4 py-3 border-r border-gray-400 font-bold text-[#14532d]">{language === 'hi' ? 'ग्रेड' : 'Grade'} {rec.qualityGrade} ({language === 'hi' ? '<12% नमी' : '<12% Moist'})</td>
                          <td className="px-4 py-3 border-r border-gray-400 font-bold text-gray-900">₹{rec.mspRate} / {language === 'hi' ? 'क्विंटल' : 'Q'}</td>
                          <td className="px-4 py-3 font-bold text-right text-gray-900">{formatCurrency(rec.totalAmount)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Bottom Action */}
                    <div className="bg-gray-50 border-t border-gray-400 p-2 flex justify-between items-center text-xs">
                      <span className="text-gray-700 font-bold uppercase">
                        {language === 'hi' ? 'दिनांक:' : 'Date:'} {formatDate(rec.createdAt, language)}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Downloading Mandi Parchi MP-${rec.id.toUpperCase()}`)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-400 text-[10px] font-bold text-gray-900 hover:bg-gray-200 uppercase"
                      >
                        <Download className="w-3 h-3" />
                        <span>{t('history.downloadReceipt')} {language === 'hi' ? '(पीडीएफ)' : '(PDF)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
