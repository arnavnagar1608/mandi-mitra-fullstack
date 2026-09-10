'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { 
  UserPlus, 
  MapPin, 
  CalendarCheck, 
  Clock, 
  CreditCard, 
  History,
  ChevronRight
} from 'lucide-react';

export function CitizenServices() {
  const { language } = useLanguage();

  const services = [
    {
      title: language === 'hi' ? 'किसान पंजीकरण / लॉगिन' : 'Farmer Registration',
      subtitle: language === 'hi' ? 'मोबाइल OTP से त्वरित सत्यापन' : 'Instant mobile OTP verification',
      href: '/login',
      icon: UserPlus,
      color: 'text-[#166534]',
      bg: 'bg-green-50',
      border: 'hover:border-t-[#166534]'
    },
    {
      title: language === 'hi' ? 'खरीद केंद्र व एमएसपी' : 'Procurement Centers',
      subtitle: language === 'hi' ? 'सक्रिय मंडियां व फसल दरें' : 'Active mandis & official MSP rates',
      href: '/centers',
      icon: MapPin,
      color: 'text-[#f97316]',
      bg: 'bg-orange-50',
      border: 'hover:border-t-[#f97316]'
    },
    {
      title: language === 'hi' ? 'स्लॉट बुकिंग' : 'Book Delivery Slot',
      subtitle: language === 'hi' ? 'सुविधाजनक तारीख व समय चुनें' : 'Reserve your mandi arrival time',
      href: '/centers',
      icon: CalendarCheck,
      color: 'text-[#166534]',
      bg: 'bg-green-50',
      border: 'hover:border-t-[#166534]'
    },
    {
      title: language === 'hi' ? 'लाइव कतार व टोकन' : 'Live Queue & Token',
      subtitle: language === 'hi' ? 'वास्तविक समय प्रतीक्षा स्थिति' : 'Track your turn & QR gate pass',
      href: '/queue',
      icon: Clock,
      color: 'text-[#f97316]',
      bg: 'bg-orange-50',
      border: 'hover:border-t-[#f97316]'
    },
    {
      title: language === 'hi' ? 'भुगतान स्थिति (DBT)' : 'Payment Status (DBT)',
      subtitle: language === 'hi' ? 'सीधे बैंक खाते में राशि की स्थिति' : 'Verify bank credit & PFMS transfer',
      href: '/payments',
      icon: CreditCard,
      color: 'text-[#166534]',
      bg: 'bg-green-50',
      border: 'hover:border-t-[#166534]'
    },
    {
      title: language === 'hi' ? 'खरीद पावती व रिकॉर्ड' : 'Procurement History',
      subtitle: language === 'hi' ? 'डिजिटल मंडी रसीदें देखें' : 'View past deliveries & receipts',
      href: '/history',
      icon: History,
      color: 'text-[#f97316]',
      bg: 'bg-orange-50',
      border: 'hover:border-t-[#f97316]'
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#f97316] rounded-full" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#14532d] font-serif">
            {language === 'hi' ? 'किसान नागरिक सेवाएं' : 'Citizen Farmer Services'}
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
          {language === 'hi' ? 'पारदर्शी व डिजिटल ई-उपार्जन प्रणाली' : 'Digital E-Procurement Services'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className={`bg-white gov-border p-4 flex flex-col items-center text-center group border-t-4 border-t-transparent ${item.border} hover:shadow-md transition-all rounded-xs`}
            >
              <div className={`w-12 h-12 rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-[#166534] transition-colors leading-snug mb-1">
                {item.title}
              </h3>
              <p className="text-[11px] text-gray-500 line-clamp-2 hidden sm:block">
                {item.subtitle}
              </p>
              <span className="mt-2 text-[10px] font-bold text-[#f97316] inline-flex items-center gap-0.5 group-hover:underline sm:hidden">
                <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
                <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
