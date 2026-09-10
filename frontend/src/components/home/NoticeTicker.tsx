'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Bell } from 'lucide-react';

export function NoticeTicker() {
  const { language } = useLanguage();

  return (
    <div className="bg-red-50 border-b border-red-200 overflow-hidden whitespace-nowrap relative h-9 flex items-center shadow-xs">
      <div className="absolute left-0 top-0 bottom-0 bg-red-700 text-white text-[11px] font-extrabold px-3 sm:px-5 flex items-center gap-1.5 z-20 shadow-md uppercase tracking-wider">
        <Bell className="w-3.5 h-3.5 animate-pulse" />
        <span>{language === 'hi' ? 'ताज़ा सूचना' : 'Updates'}</span>
      </div>

      <div className="animate-marquee inline-block z-10 pl-24">
        <span className="text-xs font-semibold text-red-900 mx-4">
          {language === 'hi'
            ? 'खरीद सत्र 2026-27: समर्थन मूल्य (MSP) स्लॉट बुकिंग व डिजिटल टोकन जारी करने की सुविधा सक्रिय है।'
            : 'Procurement Season 2026-27: Digital slot booking and token generation are currently active.'}
        </span>
        <span className="text-xs font-semibold text-[#14532d] mx-4">
          | {language === 'hi'
            ? 'सीधे बैंक खाते में सुरक्षित भुगतान हेतु अपना आधार लिंक्ड बैंक खाता विवरण सत्यापित रखें।'
            : 'Verify your Aadhaar-linked bank account for assured Direct Benefit Transfers (DBT).'}
        </span>
        <span className="text-xs font-semibold text-red-900 mx-4">
          | {language === 'hi'
            ? 'मंडी में वास्तविक समय कतार व टोकन स्थिति देखने हेतु "लाइव कतार" पेज देखें।'
            : 'Track real-time waiting tokens and weighbridge stages on the "Live Queue" page.'}
        </span>
        <span className="text-xs font-semibold text-[#14532d] mx-4">
          | {language === 'hi'
            ? 'किसान सहायता हेल्पलाइन: 1800-180-1551 (मुफ्त सेवा, प्रातः 6:00 से रात्रि 10:00 बजे तक)।'
            : 'Farmer Helpline: 1800-180-1551 (Toll-Free, 6:00 AM to 10:00 PM).'}
        </span>
      </div>
    </div>
  );
}
