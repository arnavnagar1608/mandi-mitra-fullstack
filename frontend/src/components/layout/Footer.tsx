'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Sprout, PhoneCall, Heart, Shield, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#113820] text-gray-200 pt-14 pb-8 border-t-4 border-[#f97316]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#1b5230]">
          
          {/* Brand Info */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#14532d] flex items-center justify-center text-amber-300 shadow-sm border border-green-600/40">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold font-serif text-white tracking-wide">
                {language === 'hi' ? 'मंडी मित्र' : 'Mandi Mitra'}
              </span>
            </div>
            <p className="text-xs text-green-100/80 leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-[#0d2c19] px-3 py-1.5 rounded border border-[#1a5531] w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture & Farmers Welfare'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 pb-1 border-b border-[#f97316] inline-block">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-green-100/80">
              <li>
                <Link href="/" className="hover:text-amber-300 transition">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/centers" className="hover:text-amber-300 transition">
                  {t('nav.centers')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-300 transition">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/queue" className="hover:text-amber-300 transition">
                  {t('nav.queue')}
                </Link>
              </li>
              <li>
                <Link href="/payments" className="hover:text-amber-300 transition">
                  {t('nav.payments')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-300 transition">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmer Helpline & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 pb-1 border-b border-[#f97316] inline-block">
              {t('footer.helpline')}
            </h4>
            <div className="bg-[#0d2c19] p-3.5 rounded-lg border border-[#1a5531] space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#f97316] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-green-200/80">{language === 'hi' ? 'टोल-फ्री किसान नंबर' : 'Toll-Free Kisan Line'}</div>
                  <div className="text-base font-bold text-white tracking-wide">1800-180-1551</div>
                </div>
              </div>
              <p className="text-[11px] text-green-100/70 leading-normal">
                {language === 'hi' 
                  ? 'सुबह 6:00 बजे से रात 10:00 बजे तक मुफ्त किसान सहायता उपलब्ध है।' 
                  : 'Daily free farmer assistance available from 6:00 AM to 10:00 PM.'}
              </p>
            </div>
          </div>

          {/* Trust & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 pb-1 border-b border-[#f97316] inline-block">
              {language === 'hi' ? 'विश्वसनीयता व सुरक्षा' : 'Trust & Security'}
            </h4>
            <ul className="space-y-2.5 text-xs text-green-100/80">
              <li className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span>{language === 'hi' ? 'सीधे बैंक खाते में डीबीटी (DBT) भुगतान' : 'Direct DBT transfer into bank account'}</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span>{language === 'hi' ? 'डिजिटल मंडी पर्ची व क्यूआर सत्यापन' : 'Digital mandi receipt with QR code verification'}</span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span>{language === 'hi' ? 'बिना इंटरनेट के भी एसएमएस से अपडेट' : 'SMS status updates for low connectivity zones'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-green-200/70">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-3">
            <span>{language === 'hi' ? 'डिजिटल ई-उपार्जन नवाचार' : 'Digital E-Procurement Innovation'}</span>
            <span>•</span>
            <span>{language === 'hi' ? 'भारत सरकार' : 'Govt. of India'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
