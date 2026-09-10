'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { 
  Sprout, 
  MapPin, 
  Clock, 
  CreditCard, 
  History, 
  LayoutDashboard, 
  ShieldCheck, 
  Globe, 
  Menu, 
  X, 
  CalendarCheck, 
  LogIn, 
  LogOut,
  Sparkles
} from 'lucide-react';

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState<'normal' | 'large' | 'small'>('normal');

  const navLinks = [
    { href: '/', label: t('nav.home'), icon: Sprout },
    { href: '/centers', label: t('nav.centers'), icon: MapPin },
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/queue', label: t('nav.queue'), icon: Clock },
    { href: '/payments', label: t('nav.payments'), icon: CreditCard },
    { href: '/history', label: t('nav.history'), icon: History },
  ];

  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      
      {/* 1. TOP OFFICIAL UTILITY BAR (e-Uparjan Government Visual Language) */}
      <div className="bg-[#14532d] text-white text-xs py-1 px-4 sm:px-6 lg:px-8 border-b border-[#0f3e23] flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="font-semibold tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>{language === 'hi' ? 'भारत सरकार' : 'Government of India'}</span>
          </span>
          <span className="text-green-300/60">|</span>
          <span className="hidden sm:inline text-green-100 font-medium">
            {language === 'hi' ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture & Farmers Welfare'}
          </span>
          <span className="hidden md:inline text-green-300/60">|</span>
          <span className="hidden md:inline text-green-200/90 font-light">
            {language === 'hi' ? 'पारदर्शी एमएसपी एवं डिजिटल कतार प्रबंधन' : 'Fair MSP Assurance & Live Queue Management'}
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <a href="#main-content" className="hidden lg:inline hover:underline text-green-200">
            {language === 'hi' ? 'मुख्य सामग्री' : 'Skip to Content'}
          </a>
          <span className="hidden lg:inline text-green-300/60">|</span>
          
          {/* Accessibility text zoom indicator */}
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            <button 
              type="button"
              onClick={() => setFontSizeClass('small')}
              className={`px-1.5 py-0.5 rounded transition ${fontSizeClass === 'small' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              title="Standard Font Size"
            >
              A-
            </button>
            <button 
              type="button"
              onClick={() => setFontSizeClass('normal')}
              className={`px-1.5 py-0.5 rounded transition ${fontSizeClass === 'normal' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              title="Normal Font Size"
            >
              A
            </button>
            <button 
              type="button"
              onClick={() => setFontSizeClass('large')}
              className={`px-1.5 py-0.5 rounded transition ${fontSizeClass === 'large' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              title="Large Font Size"
            >
              A+
            </button>
          </div>

          <span className="text-green-300/60">|</span>

          {/* Bilingual Language Switcher */}
          <button
            onClick={toggleLanguage}
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 text-white font-medium transition"
            title="भाषा बदलें / Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#f97316]" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR (Brand Emblem, Portal Title, Profile & Quick CTA) */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Government-style Portal Heading */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
            {/* National Ashoka Lion Capital Emblem */}
            <div className="relative flex items-center justify-center shrink-0">
              <Image
                src="/emblem-of-india.svg"
                alt="State Emblem of India"
                width={42}
                height={62}
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-xs"
                priority
              />
            </div>

            {/* Vertical divider */}
            <div className="h-10 w-[1.5px] bg-gray-300 hidden sm:block" />

            {/* Mandi Mitra Emblem Icon */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#14532d] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
            </div>

            {/* Project Name and Responsible Ministry */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#14532d] font-serif leading-none">
                  {language === 'hi' ? 'मंडी मित्र' : 'Mandi Mitra'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-100 text-[#ea580c] border border-amber-200">
                  {language === 'hi' ? 'ई-उपार्जन 2.0' : 'E-Procurement Portal'}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-gray-800 font-semibold leading-snug mt-1">
                {language === 'hi' 
                  ? 'कृषि एवं किसान कल्याण मंत्रालय • भारत सरकार' 
                  : 'Ministry of Agriculture & Farmers Welfare • Government of India'}
              </span>
              <span className="text-[10px] text-gray-500 font-medium hidden md:inline-block leading-tight">
                {language === 'hi'
                  ? 'खाद्य एवं सार्वजनिक वितरण विभाग • पारदर्शी एमएसपी खरीद व कतार प्रणाली'
                  : 'Department of Food & Public Distribution • Fair MSP & Live Mandi Queue'}
              </span>
            </div>
          </Link>

          {/* Right Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Authenticated Farmer Badge or Login CTA */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 bg-[#f8fafc] border border-gray-200 p-1.5 pr-3 rounded-xl shadow-xs">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#14532d]">
                  <Image
                    src={user.photo || '/images/farmers/farmer1.jpg'}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-xs font-bold text-gray-900 block truncate max-w-[130px]">
                    {language === 'hi' ? user.nameHi : user.name}
                  </span>
                  <span className="text-[10px] text-[#14532d] font-semibold">
                    {language === 'hi' ? 'प्रमाणित किसान' : 'Verified Farmer'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout / लॉगआउट"
                  className="ml-1 p-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm border border-[#14532d] bg-white text-[#14532d] hover:bg-emerald-50 text-xs font-bold transition shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'hi' ? 'किसान लॉगिन' : 'Farmer Login'}</span>
              </Link>
            )}

            {/* Quick Saffron Slot Booking CTA */}
            <Link
              href="/centers"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs sm:text-sm font-bold bg-[#f97316] hover:bg-[#ea580c] text-white transition shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t('nav.bookSlot')}</span>
            </Link>

            {/* Admin Desk Switch Link */}
            <Link
              href="/admin"
              className={`p-2 rounded-sm border transition ${
                isAdmin 
                  ? 'bg-[#14532d] text-white border-[#14532d]' 
                  : 'bg-white text-gray-600 border-gray-300 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Admin Procurement Officer Portal"
            >
              <ShieldCheck className="w-4 h-4 text-[#14532d]" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#14532d]" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. TABULAR GOVERNMENT NAVIGATION BAR (Deep Forest Green with Saffron Highlights) */}
      <nav className="bg-[#14532d] text-white shadow-inner hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-colors border-l border-[#0f3d21] last:border-r ${
                    isActive
                      ? 'bg-[#0f3d21] text-[#f97316] border-b-2 border-[#f97316]'
                      : 'text-white hover:bg-[#0f3d21] hover:text-amber-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f97316]' : 'text-green-300'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Administrative Portal Indicator Tab */}
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition ${
              isAdmin
                ? 'bg-amber-500 text-white'
                : 'text-amber-300 hover:bg-[#0f3d21]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'अधिकारी पोर्टल' : 'Officer Desk'}</span>
          </Link>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14532d] text-white px-4 pt-3 pb-6 space-y-2 shadow-xl border-t border-[#0f3e23]">
          
          {/* User state in mobile menu */}
          {isAuthenticated && user ? (
            <div className="p-3 mb-2 bg-white/10 rounded-lg border border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-300">
                  <Image
                    src={user.photo || '/images/farmers/farmer1.jpg'}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{user.name}</div>
                  <div className="text-xs text-green-300">Farmer ID: {user.aadhaarLast4}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-2.5 py-1 rounded bg-red-600/90 text-white text-xs font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-2 rounded bg-[#f97316] text-white font-bold text-sm shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'hi' ? 'किसान लॉगिन / पंजीकरण' : 'Farmer Login / Register'}</span>
            </Link>
          )}

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/20 text-[#f97316] font-bold border-l-4 border-[#f97316]'
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#f97316]' : 'text-green-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
            <Link
              href="/centers"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#f97316] text-white font-bold text-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t('nav.bookSlot')}</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-white/10 text-green-100 font-semibold text-xs border border-white/15"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{t('nav.admin')}</span>
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}
