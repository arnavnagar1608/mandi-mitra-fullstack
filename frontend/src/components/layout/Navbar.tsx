'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  Search,
  Bell,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';

export function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setFontSizeClass] = useState<'normal' | 'large' | 'small'>('normal');

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/login', label: 'Farmer Registration' },
    { href: '/centers', label: 'Slot Booking' },
    { href: '/queue', label: 'Track Status' },
    { href: '/centers', label: 'Procurement Centers' },
    { href: '/guidelines', label: 'Guidelines' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/services', label: 'Services ˅' },
  ];

  return (
    <header className="w-full">
      
      {/* 1. TOP BAR */}
      <div className="bg-[#0f4a2b] text-white text-[11px] sm:text-xs py-1 px-4 sm:px-6 lg:px-8 border-b border-[#0a351f] flex flex-wrap justify-between items-center h-auto sm:h-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="font-medium">
            {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
          </span>
          <span className="text-white/40">|</span>
          <span className="font-medium">
            {language === 'hi' ? 'कृषि एवं किसान कल्याण विभाग' : 'Department of Agriculture & Farmers Welfare'}
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 mt-1 sm:mt-0">
          <a href="#main-content" className="hover:underline">
            {language === 'hi' ? 'मुख्य सामग्री' : 'Skip to Main Content'}
          </a>
          <span className="text-white/40">|</span>
          
          <div className="flex items-center space-x-2 font-medium">
            <button type="button" onClick={() => setFontSizeClass('small')} className="hover:text-gray-200">A-</button>
            <button type="button" onClick={() => setFontSizeClass('normal')} className="hover:text-gray-200">A</button>
            <button type="button" onClick={() => setFontSizeClass('large')} className="hover:text-gray-200">A+</button>
          </div>

          <span className="text-white/40">|</span>

          <button
            onClick={toggleLanguage}
            type="button"
            className="flex items-center gap-1 hover:text-gray-200"
          >
            <GlobeIcon />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* 2. MIDDLE BAR */}
      <div className="bg-white py-3 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/emblem-of-india.svg"
              alt="State Emblem of India"
              width={40}
              height={55}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-[#14532d] leading-tight font-sans">
                {language === 'hi' ? 'ई-उपार्जन (E-Uparjan)' : 'ई-उपार्जन (E-Uparjan)'}
              </span>
              <span className="text-sm text-[#14532d] font-medium leading-tight">
                {language === 'hi' ? 'किसान समृद्धि पोर्टल' : 'Kisan Samriddhi Portal'}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#14532d]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2" />
            </div>
            
            <button className="relative p-1 text-[#f97316]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/dashboard" className="flex items-center gap-2 px-4 py-1.5 border border-[#14532d] text-[#14532d] hover:bg-gray-50 rounded-sm text-sm font-medium">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={logout} className="flex items-center gap-2 px-4 py-1.5 bg-[#14532d] text-white hover:bg-[#0f3d21] rounded-sm text-sm font-medium">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-1.5 border border-[#14532d] text-[#14532d] hover:bg-gray-50 rounded-sm text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#14532d] text-white hover:bg-[#0f3d21] rounded-sm text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <nav className="bg-[#115e32] text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center -mx-4">
            {navLinks.map((item) => {
              const isActive = pathname === item.href && item.href !== '/centers' && item.href !== '/queue' && item.href !== '/login';
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-r border-[#1a7841] first:border-l ${
                    isActive ? 'bg-[#0f4a2b]' : 'hover:bg-[#0f4a2b]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 4. MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#115e32] text-white px-4 pt-2 pb-4 shadow-lg border-t border-[#0f4a2b]">
           <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded text-sm font-medium hover:bg-[#0f4a2b]"
              >
                {item.label}
              </Link>
            ))}
           </div>
           
           <div className="mt-4 pt-4 border-t border-[#0f4a2b] flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link href="/dashboard" className="px-3 py-2 bg-white text-[#115e32] rounded text-sm font-bold text-center">Dashboard</Link>
                <button onClick={logout} className="px-3 py-2 bg-red-600 text-white rounded text-sm font-bold text-center">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 bg-white text-[#115e32] rounded text-sm font-bold text-center">Login</Link>
                <Link href="/login" className="px-3 py-2 bg-[#f97316] text-white rounded text-sm font-bold text-center">Register</Link>
              </>
            )}
           </div>
        </div>
      )}

    </header>
  );
}

function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}
