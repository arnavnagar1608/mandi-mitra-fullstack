'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Sprout, PhoneCall, Heart, Shield, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-[#2B2318] text-[#E8DFD0] pt-16 pb-12 border-t-4 border-[#5B7F3B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#4A3E2D]">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5B7F3B] flex items-center justify-center text-white">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-serif text-[#FDF8F0]">
                {language === 'hi' ? 'मंडी मित्र' : 'Mandi Mitra'}
              </span>
            </div>
            <p className="text-sm text-[#C4B69C] leading-relaxed">
              {t('footer.aboutDesc')}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E8A94D] bg-[#3D3426] px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'स्मार्ट इंडिया हैकाथॉन 2026' : 'Smart India Hackathon 2026'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FDF8F0] mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#C4B69C]">
              <li>
                <Link href="/" className="hover:text-[#E8A94D] transition">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/centers" className="hover:text-[#E8A94D] transition">
                  {t('nav.centers')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#E8A94D] transition">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/queue" className="hover:text-[#E8A94D] transition">
                  {t('nav.queue')}
                </Link>
              </li>
              <li>
                <Link href="/payments" className="hover:text-[#E8A94D] transition">
                  {t('nav.payments')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#E8A94D] transition">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmer Helpline & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FDF8F0] mb-4">
              {t('footer.helpline')}
            </h4>
            <div className="bg-[#3D3426] p-4 rounded-2xl border border-[#4A3E2D] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4912A] text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[#C4B69C]">{language === 'hi' ? 'टोल-फ्री किसान नंबर' : 'Toll-Free Kisan Line'}</div>
                  <div className="text-lg font-bold text-[#FDF8F0] tracking-wide">1800-180-1551</div>
                </div>
              </div>
              <p className="text-xs text-[#C4B69C] leading-normal">
                {language === 'hi' 
                  ? 'सुबह 6:00 बजे से रात 10:00 बजे तक मुफ्त सहायता उपलब्ध है।' 
                  : 'Free support available daily from 6:00 AM to 10:00 PM.'}
              </p>
            </div>
          </div>

          {/* Trust & Transparency */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FDF8F0] mb-4">
              {language === 'hi' ? 'विश्वसनीयता व सुरक्षा' : 'Trust & Security'}
            </h4>
            <ul className="space-y-3 text-xs text-[#C4B69C]">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#7BA55A] shrink-0 mt-0.5" />
                <span>{language === 'hi' ? 'सीधे बैंक खाते में डीबीटी (DBT) भुगतान' : 'Direct DBT transfer into bank account'}</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#7BA55A] shrink-0 mt-0.5" />
                <span>{language === 'hi' ? 'डिजिटल मंडी पर्ची व क्यूआर सत्यापन' : 'Digital mandi receipt with QR code verification'}</span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#7BA55A] shrink-0 mt-0.5" />
                <span>{language === 'hi' ? 'बिना इंटरनेट के भी एसएमएस से अपडेट' : 'SMS status updates for low connectivity zones'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A89878]">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-1">
            <span>{t('footer.madeWith')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
