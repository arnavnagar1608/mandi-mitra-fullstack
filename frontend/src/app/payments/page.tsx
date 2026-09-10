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
      <div className="bg-white min-h-screen py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532d]/10 text-[#14532d] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डीबीटी प्रत्यक्ष बैंक अंतरण' : 'Direct Benefit Transfer (DBT) Verified'}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-serif">
              {t('payments.title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'hi' 
                ? 'सभी भुगतान सीधे आपके पंजीकृत बैंक खाते में जमा किए जाते हैं।' 
                : 'All payments are settled directly into your linked bank account.'}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-3.5 rounded-2xl flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#14532d]" />
            <div className="text-xs">
              <span className="text-gray-500 block">{currentFarmer.bankName}</span>
              <span className="font-bold text-gray-900">A/C: •••• {currentFarmer.accountLast4}</span>
            </div>
          </div>
        </div>

        {/* 3 FINANCIAL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
              <span>{t('payments.totalEarned')}</span>
              <IndianRupee className="w-4 h-4 text-[#14532d]" />
            </div>
            <div className="text-3xl font-black text-[#14532d] font-serif">
              {formatCurrency(totalEarned)}
            </div>
            <p className="text-[11px] text-gray-600">
              {language === 'hi' ? 'सीज़न 2025-26 कुल भुगतान' : 'Total disbursed in 2025-26'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
              <span>{t('payments.completed')}</span>
              <CheckCircle2 className="w-4 h-4 text-[#14532d]" />
            </div>
            <div className="text-3xl font-black text-gray-900 font-serif">
              {paymentsList.length} {language === 'hi' ? 'भुगतान' : 'Transactions'}
            </div>
            <p className="text-[11px] text-gray-600">
              {language === 'hi' ? '100% समय पर अंतरित' : '100% processed on-time'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
              <span>{t('payments.pending')}</span>
              <Clock className="w-4 h-4 text-[#D4912A]" />
            </div>
            <div className="text-3xl font-black text-[#D4912A] font-serif">
              ₹0
            </div>
            <p className="text-[11px] text-gray-600">
              {language === 'hi' ? 'कोई बकाया राशि नहीं' : 'No pending balances'}
            </p>
          </div>

        </div>

        {/* TRANSACTIONS LEDGER */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 font-serif">
              {language === 'hi' ? 'लेनदेन विवरण' : 'Disbursement Ledger'}
            </h3>
            <span className="text-xs text-gray-600">
              {language === 'hi' ? 'एनईएफटी / आरटीजीएस द्वारा सत्यापित' : 'NEFT / RTGS Authenticated'}
            </span>
          </div>

          <div className="divide-y divide-gray-200">
            {paymentsList.map((p: any) => (
              <div key={p.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#14532d]/10 text-[#14532d] flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        {formatCurrency(p.amount)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {language === 'hi' ? 'जमा हुआ' : 'SUCCESS'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p>UTN: <span className="font-mono text-gray-900">{p.transactionRef}</span></p>
                      <p>{p.bankName} • {formatDate(p.processedAt || '', language)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading payment receipt for ${p.transactionRef}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 hover:bg-gray-100 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'रसीद' : 'Slip'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
