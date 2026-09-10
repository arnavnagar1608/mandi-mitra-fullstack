'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { apiClient } from '@/lib/api-client';
import { payments as fallbackPayments, currentFarmer as defaultFarmer, formatCurrency, formatDate, Payment } from '@/lib/mock-data';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowDownRight, 
  Building2, 
  Download, 
  ShieldCheck,
  IndianRupee,
  FileSpreadsheet
} from 'lucide-react';

export default function PaymentsPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const currentFarmer = user || defaultFarmer;

  const [paymentsList, setPaymentsList] = useState<Payment[]>(fallbackPayments);
  const [totalEarned, setTotalEarned] = useState<number>(
    fallbackPayments.reduce((acc, p) => acc + p.amount, 0)
  );

  useEffect(() => {
    async function loadPayments() {
      const res = await apiClient<{ totalEarned: number; payments: Payment[] }>('/payments/my');
      if (res.success && res.data?.payments) {
        setPaymentsList(res.data.payments);
        if (typeof res.data.totalEarned === 'number') {
          setTotalEarned(res.data.totalEarned);
        }
      }
    }
    loadPayments();
  }, []);

  return (
    <AuthGuard
      pageTitle={{ en: 'Payment Ledger & DBT Records', hi: 'भुगतान रिकॉर्ड व डीबीटी विवरण' }}
      pageDescription={{ en: 'your verified DBT payments and bank transfer slips', hi: 'अपने बैंक खाते में जमा सरकारी भुगतान और रसीदें' }}
    >
      <div className="bg-gray-100 min-h-screen py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Top Header */}
          <div className="bg-white border border-gray-300 shadow-sm p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 border border-gray-300 text-gray-800 text-[10px] font-bold uppercase rounded-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'डीबीटी प्रत्यक्ष बैंक अंतरण' : 'Direct Benefit Transfer (DBT)'}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 uppercase border-b-2 border-[#14532d] pb-1 inline-block">
                {t('payments.title')}
              </h1>
              <p className="text-xs text-gray-700 uppercase">
                {language === 'hi' 
                  ? 'सभी भुगतान सीधे आपके पंजीकृत बैंक खाते में जमा किए जाते हैं।' 
                  : 'Payments settled directly into linked bank account.'}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-300 p-3 rounded-sm flex items-center gap-3">
              <Building2 className="w-6 h-6 text-gray-700" />
              <div className="text-xs uppercase">
                <span className="text-gray-600 block">{currentFarmer.bankName}</span>
                <span className="font-bold text-gray-900">{language === 'hi' ? 'खाता:' : 'A/C:'} **** {currentFarmer.accountLast4}</span>
              </div>
            </div>
          </div>

          {/* 3 FINANCIAL METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
              <div className="text-xs text-gray-600 font-bold uppercase mb-1">{t('payments.totalEarned')}</div>
              <div className="text-2xl font-bold text-[#14532d]">{formatCurrency(totalEarned)}</div>
              <div className="text-[10px] text-gray-500 uppercase mt-1">{language === 'hi' ? 'कुल वितरित 2025-26' : 'Total disbursed 2025-26'}</div>
            </div>
            <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
              <div className="text-xs text-gray-600 font-bold uppercase mb-1">{t('payments.completed')}</div>
              <div className="text-2xl font-bold text-gray-900">{paymentsList.length} {language === 'hi' ? 'लेन-देन' : 'TXN'}</div>
              <div className="text-[10px] text-gray-500 uppercase mt-1">{language === 'hi' ? '100% समय पर संसाधित' : '100% processed on-time'}</div>
            </div>
            <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
              <div className="text-xs text-gray-600 font-bold uppercase mb-1">{t('payments.pending')}</div>
              <div className="text-2xl font-bold text-[#ea580c]">₹0</div>
              <div className="text-[10px] text-gray-500 uppercase mt-1">{language === 'hi' ? 'कोई बकाया नहीं' : 'No pending balances'}</div>
            </div>
          </div>

          {/* TRANSACTIONS LEDGER */}
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm p-4">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4 bg-gray-50 px-2 py-1">
              <h3 className="text-sm font-bold text-gray-900 uppercase">
                {language === 'hi' ? 'लेनदेन विवरण' : 'Disbursement Ledger (J-Form)'}
              </h3>
              <span className="text-[10px] font-bold text-gray-600 uppercase bg-gray-200 px-2 py-1 border border-gray-300">
                {language === 'hi' ? 'एनईएफटी / आरटीजीएस' : 'NEFT / RTGS Auth'}
              </span>
            </div>

            <div className="overflow-x-auto border border-gray-300">
              <table className="w-full text-left text-sm text-gray-700 border-collapse">
                <thead className="text-xs uppercase bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-2 border-r border-gray-300">{language === 'hi' ? 'दिनांक' : 'Date'}</th>
                    <th className="px-4 py-2 border-r border-gray-300">{language === 'hi' ? 'यूटीएन / संदर्भ संख्या' : 'UTN / Ref Number'}</th>
                    <th className="px-4 py-2 border-r border-gray-300">{language === 'hi' ? 'बैंक विवरण' : 'Bank Details'}</th>
                    <th className="px-4 py-2 border-r border-gray-300">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                    <th className="px-4 py-2 border-r border-gray-300 text-right">{language === 'hi' ? 'राशि (₹)' : 'Amount (₹)'}</th>
                    <th className="px-4 py-2 text-center">{language === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {paymentsList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-r border-gray-300 whitespace-nowrap">
                        {formatDate(p.processedAt || '', language)}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-300 font-mono text-xs font-bold text-gray-900">
                        {p.transactionRef}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-300 text-xs">
                        {p.bankName}
                      </td>
                      <td className="px-4 py-2 border-r border-gray-300 text-xs font-bold">
                        <span className="text-[#14532d]">{language === 'hi' ? 'सफल' : 'SUCCESS'}</span>
                      </td>
                      <td className="px-4 py-2 border-r border-gray-300 text-right font-bold text-gray-900">
                        {formatCurrency(p.amount).replace('₹', '')}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading payment receipt for ${p.transactionRef}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 text-[10px] font-bold text-gray-800 hover:bg-gray-200 rounded-sm uppercase"
                        >
                          <Download className="w-3 h-3" />
                          <span>{language === 'hi' ? 'रसीद' : 'Slip'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
