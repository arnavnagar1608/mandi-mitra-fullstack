'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';

export function NoticeTicker() {
  const { language } = useLanguage();

  return (
    <div className="bg-white border-b border-gray-200 overflow-hidden whitespace-nowrap relative h-10 flex items-center shadow-xs">
      <div className="absolute left-0 top-0 bottom-0 bg-[#e01a1a] text-white text-xs font-bold px-4 sm:px-6 flex items-center z-20">
        <span>{language === 'hi' ? 'ताज़ा अपडेट' : 'LATEST UPDATES'}</span>
      </div>

      <div className="animate-marquee inline-block z-10 pl-32 text-sm font-medium text-[#d91f1f]">
        <span>
          {language === 'hi'
            ? 'महत्वपूर्ण सूचना: खरीफ 2026-27 खरीद सत्र के लिए ऑनलाइन पंजीकरण अब खुला है। सुनिश्चित करें कि आपका आधार बैंक खाते से जुड़ा है...'
            : 'Important Notice: Online registration for Kharif 2026-27 procurement season is now OPEN. Ensure your Aadhaar is linked to your bank account for uninterrupted DBT...'}
        </span>
      </div>
    </div>
  );
}
