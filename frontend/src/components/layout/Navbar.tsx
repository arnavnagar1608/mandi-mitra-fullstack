'use client';

import React from 'react';
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
  UserCheck
} from 'lucide-react';

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    <header className="sticky top-0 z-50 bg-[#FDF8F0]/90 backdrop-blur-md border-b border-[#E8DFD0]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#5B7F3B] to-[#7BA55A] flex items-center justify-center text-white shadow-md shadow-[#5B7F3B]/20 group-hover:scale-105 transition-transform duration-300">
              <Sprout className="w-7 h-7 text-[#FDF8F0]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-[#3D3426] font-serif">
                  {language === 'hi' ? 'मंडी मित्र' : 'Mandi Mitra'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#D4912A]/15 text-[#B87A1F]">
                  2026
                </span>
              </div>
              <span className="text-xs text-[#6B5D4A] font-medium hidden sm:inline-block">
                {language === 'hi' ? 'पारदर्शी किसान खरीद प्रणाली' : 'Fair Crop Procurement Platform'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F5EDE0]/70 p-1.5 rounded-2xl border border-[#E8DFD0]">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#5B7F3B] text-white shadow-sm'
                      : 'text-[#6B5D4A] hover:text-[#3D3426] hover:bg-[#EAE0D0]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5B7F3B]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E8DFD0] bg-[#FFFDF9] text-xs font-semibold text-[#3D3426] hover:bg-[#F5EDE0] hover:border-[#D4C8B5] transition shadow-xs"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-4 h-4 text-[#D4912A]" />
              <span className="tracking-wide">{language === 'en' ? 'हिन्दी (HI)' : 'English (EN)'}</span>
            </button>

            {/* Farmer Authentication Button / Avatar */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#E8DFD0] p-1.5 pr-3 rounded-2xl">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#5B7F3B]">
                  <Image
                    src={user.photo || '/images/farmers/farmer1.jpg'}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left leading-none">
                  <span className="text-xs font-bold text-[#3D3426] block">
                    {language === 'hi' ? user.nameHi : user.name}
                  </span>
                  <span className="text-[10px] text-[#5B7F3B] font-semibold">
                    {language === 'hi' ? 'प्रमाणित किसान' : 'Verified Farmer'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Logout / लॉगआउट"
                  className="ml-1 p-1 text-[#C75B3A] hover:bg-[#F5EDE0] rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#5B7F3B] bg-[#5B7F3B]/10 hover:bg-[#5B7F3B]/20 text-xs font-bold text-[#5B7F3B] transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'hi' ? 'किसान लॉगिन' : 'Farmer Login'}</span>
              </Link>
            )}

            {/* Quick Action / Slot Booking */}
            <Link
              href="/centers"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#D4912A] text-white hover:bg-[#B87A1F] transition shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t('nav.bookSlot')}</span>
            </Link>

            {/* Admin Switch Link */}
            <Link
              href="/admin"
              className={`p-2 rounded-xl border border-[#E8DFD0] transition ${
                isAdmin 
                  ? 'bg-[#3D3426] text-[#FDF8F0]' 
                  : 'bg-[#FFFDF9] text-[#6B5D4A] hover:text-[#3D3426] hover:bg-[#F5EDE0]'
              }`}
              title="Admin Procurement Officer Portal"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl border border-[#E8DFD0] bg-[#FFFDF9] text-xs font-bold text-[#3D3426]"
            >
              {language === 'en' ? 'हिन्दी' : 'EN'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-[#E8DFD0] bg-[#FFFDF9] text-[#3D3426] hover:bg-[#F5EDE0]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E8DFD0] bg-[#FFFDF9] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          
          {/* User state in mobile menu */}
          {isAuthenticated && user ? (
            <div className="p-3 mb-2 bg-[#FAF3E6] rounded-2xl border border-[#E8DFD0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#5B7F3B]">
                  <Image
                    src={user.photo || '/images/farmers/farmer1.jpg'}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#3D3426]">{user.name}</div>
                  <div className="text-xs text-[#5B7F3B] font-medium">Farmer ID: {user.aadhaarLast4}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 rounded-xl bg-[#5B7F3B] text-white font-bold"
            >
              <LogIn className="w-5 h-5" />
              <span>{language === 'hi' ? 'किसान लॉगिन करें' : 'Farmer Login'}</span>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${
                  isActive
                    ? 'bg-[#5B7F3B] text-white font-semibold'
                    : 'text-[#3D3426] hover:bg-[#F5EDE0]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#5B7F3B]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#E8DFD0] flex flex-col gap-2">
            <Link
              href="/centers"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D4912A] text-white font-semibold shadow-xs"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>{t('nav.bookSlot')}</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8DFD0] bg-[#F5EDE0] text-[#3D3426] font-medium"
            >
              <ShieldCheck className="w-5 h-5 text-[#5B7F3B]" />
              <span>{t('nav.admin')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
