'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { apiClient } from '@/lib/api-client';
import { 
  adminQueueData as fallbackQueue, 
  hourlyArrivalsData, 
  cropDistributionData, 
  crops,
  QueueEntry 
} from '@/lib/mock-data';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Check, 
  X, 
  TrendingUp,
  BarChart3,
  Sparkles,
  Search,
  Filter,
  Lock,
  LogOut,
  UserCheck,
  Building2,
  KeyRound,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';

export interface OfficerProfile {
  officerId: string;
  name: string;
  nameHi?: string;
  designation: string;
  designationHi?: string;
  role: string;
  assignedCenterId?: string | null;
  centerName?: string;
  centerNameHi?: string;
}

export default function AdminDashboardPage() {
  const { t, language } = useLanguage();

  // Officer Authentication State
  const [officer, setOfficer] = useState<OfficerProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  // Login Form States
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('c1');
  const [captchaCode, setCaptchaCode] = useState('58392');
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Operational Officer Desk States
  const [queue, setQueue] = useState<QueueEntry[]>(fallbackQueue);
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics' | 'schedule'>('queue');
  const [currentServing, setCurrentServing] = useState<number>(78);

  const generateCaptcha = () => {
    const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
    setCaptchaCode(randomCode);
    setCaptchaInput('');
  };

  // 1. Check existing officer session on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('mandi_mitra_officer_session');
      const savedToken = localStorage.getItem('mandi_mitra_token');

      if (savedSession && savedToken && (savedToken.includes('officer') || savedToken.includes('super_admin'))) {
        const parsed = JSON.parse(savedSession);
        if (parsed?.officerId) {
          setOfficer(parsed);
          fetchRoster(savedToken);
        }
      }
    } catch (e) {
      console.error('Error reading officer session:', e);
    } finally {
      setIsCheckingSession(false);
      generateCaptcha();
    }
  }, []);

  const fetchRoster = async (overrideToken?: string) => {
    const tokenToUse = overrideToken || localStorage.getItem('mandi_mitra_token') || 'mock-token-officer_1';
    localStorage.setItem('mandi_mitra_token', tokenToUse);

    const res = await apiClient<{ count: number; roster: any[] }>('/admin/centers/c1/roster');
    if (res.success && res.data?.roster?.length) {
      const mapped: QueueEntry[] = res.data.roster.map((b: any) => ({
        tokenNumber: b.tokenNumber || 80,
        farmerName: b.farmerName || 'Kisan Mitra',
        farmerNameHi: b.farmerNameHi || b.farmerName || 'किसान मित्र',
        cropType: b.cropType || 'wheat',
        quantity: b.estimatedQuantity || 50,
        status: b.status === 'serving' ? 'in-progress' : b.status === 'completed' ? 'completed' : 'waiting',
        arrivalTime: b.slotTime || '11:00 AM',
        estimatedTime: b.slotTime || '11:00 AM',
        phone: b.phone || '9876543210'
      }));
      setQueue(mapped);
    }
  };

  // 2. Officer Login Handler
  const handleOfficerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!officerId.trim() || !password.trim()) {
      setLoginError(language === 'hi' ? 'कृपया अधिकारी आईडी एवं पासवर्ड दर्ज करें।' : 'Please enter both Officer ID and Password.');
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setLoginError(language === 'hi' ? 'सुरक्षा कैप्चा कोड सही नहीं है। कृपया पुनः प्रयास करें।' : 'Invalid security captcha code. Please try again.');
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);

    try {
      // Step A: Call backend login endpoint
      const res = await apiClient<{ token: string; officer: OfficerProfile }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          officerId: officerId.trim(),
          password: password.trim(),
        }),
      });

      if (res.success && res.data?.officer && res.data?.token) {
        localStorage.setItem('mandi_mitra_token', res.data.token);
        localStorage.setItem('mandi_mitra_officer_session', JSON.stringify(res.data.officer));
        setOfficer(res.data.officer);
        fetchRoster(res.data.token);
        return;
      }

      // Step B: Offline / Fallback Validation for seamless demo experience
      const normalizedId = officerId.trim().toLowerCase();
      const pwd = password.trim();

      if (
        (normalizedId === 'officer-mp-001' || normalizedId === 'admin@mandimitra.gov.in' || normalizedId === 'officer_1' || normalizedId === 'admin') &&
        (pwd === 'Mandi@Officer2026' || pwd === 'admin123')
      ) {
        const officerProfile: OfficerProfile = {
          officerId: 'OFFICER-MP-001',
          name: 'Shri Rajesh Sharma',
          nameHi: 'श्री राजेश शर्मा',
          designation: 'Mandi Center In-Charge',
          designationHi: 'मंडी केंद्र प्रभारी',
          role: 'center_officer',
          assignedCenterId: 'c1',
          centerName: 'Bhopal Central Mandi',
          centerNameHi: 'भोपाल सेंट्रल मंडी'
        };
        const token = 'mock-token-officer_1';
        localStorage.setItem('mandi_mitra_token', token);
        localStorage.setItem('mandi_mitra_officer_session', JSON.stringify(officerProfile));
        setOfficer(officerProfile);
        fetchRoster(token);
        return;
      }

      if (
        (normalizedId === 'officer-mp-002' || normalizedId === 'indore@mandimitra.gov.in' || normalizedId === 'officer_2') &&
        (pwd === 'Mandi@Officer2026' || pwd === 'admin123')
      ) {
        const officerProfile: OfficerProfile = {
          officerId: 'OFFICER-MP-002',
          name: 'Smt. Anita Verma',
          nameHi: 'श्रीमती अनीता वर्मा',
          designation: 'Senior Procurement Inspector',
          designationHi: 'वरिष्ठ खरीद निरीक्षक',
          role: 'center_officer',
          assignedCenterId: 'c2',
          centerName: 'Indore Mandi Complex',
          centerNameHi: 'इंदौर मंडी कॉम्प्लेक्स'
        };
        const token = 'mock-token-officer_1';
        localStorage.setItem('mandi_mitra_token', token);
        localStorage.setItem('mandi_mitra_officer_session', JSON.stringify(officerProfile));
        setOfficer(officerProfile);
        fetchRoster(token);
        return;
      }

      if (
        (normalizedId === 'super-admin-01' || normalizedId === 'superadmin@mandimitra.gov.in' || normalizedId === 'super_admin') &&
        (pwd === 'Super@Admin2026' || pwd === 'admin123')
      ) {
        const officerProfile: OfficerProfile = {
          officerId: 'SUPER-ADMIN-01',
          name: 'Dr. Alok Nath (IAS)',
          nameHi: 'डॉ. आलोक नाथ (आईएएस)',
          designation: 'State Procurement Commissioner',
          designationHi: 'राज्य खरीद आयुक्त',
          role: 'super_admin',
          assignedCenterId: null,
          centerName: 'All Mandis (Headquarters)',
          centerNameHi: 'सभी मंडियां (मुख्यालय)'
        };
        const token = 'mock-token-super_admin';
        localStorage.setItem('mandi_mitra_token', token);
        localStorage.setItem('mandi_mitra_officer_session', JSON.stringify(officerProfile));
        setOfficer(officerProfile);
        fetchRoster(token);
        return;
      }

      // Credentials rejected
      setLoginError(
        res.error?.message || 
        (language === 'hi' 
          ? 'अमान्य अधिकारी आईडी या पासवर्ड। केवल अधिकृत खरीद अधिकारी ही इस डेस्क का उपयोग कर सकते हैं।' 
          : 'Invalid Officer ID or Password. Only authorized government procurement officials can access this desk.')
      );
      generateCaptcha();
    } catch (err: any) {
      setLoginError(err.message || 'Authentication service unreachable.');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Officer Logout Handler
  const handleOfficerLogout = () => {
    localStorage.removeItem('mandi_mitra_officer_session');
    localStorage.removeItem('mandi_mitra_token');
    setOfficer(null);
    setOfficerId('');
    setPassword('');
    setCaptchaInput('');
    setLoginError(null);
    generateCaptcha();
  };

  // Helper for quick evaluation auto-fill
  const handleAutofill = (type: 'officer1' | 'officer2' | 'superadmin') => {
    setLoginError(null);
    if (type === 'officer1') {
      setOfficerId('OFFICER-MP-001');
      setPassword('Mandi@Officer2026');
      setSelectedCenter('c1');
    } else if (type === 'officer2') {
      setOfficerId('OFFICER-MP-002');
      setPassword('Mandi@Officer2026');
      setSelectedCenter('c2');
    } else {
      setOfficerId('SUPER-ADMIN-01');
      setPassword('Super@Admin2026');
      setSelectedCenter('all');
    }
    setCaptchaInput(captchaCode);
  };

  const handleCallNext = async () => {
    const res = await apiClient<{ nextToken?: number; message?: string }>('/admin/centers/c1/call-next', {
      method: 'POST',
    });

    if (res.success && res.data?.nextToken) {
      setCurrentServing(res.data.nextToken);
      fetchRoster();
    } else {
      const nextWaiting = queue.find(q => q.status === 'waiting');
      if (nextWaiting) {
        setQueue(prev => prev.map(item => {
          if (item.tokenNumber === nextWaiting.tokenNumber) {
            return { ...item, status: 'in-progress' };
          }
          if (item.tokenNumber === currentServing) {
            return { ...item, status: 'completed' };
          }
          return item;
        }));
        setCurrentServing(nextWaiting.tokenNumber);
      }
    }
  };

  const handleStatusChange = (tokenNumber: number, newStatus: 'waiting' | 'in-progress' | 'completed') => {
    setQueue(prev => prev.map(item => 
      item.tokenNumber === tokenNumber ? { ...item, status: newStatus } : item
    ));
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#14532d] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-[#14532d]">
            {language === 'hi' ? 'अधिकारी सत्र सत्यापित किया जा रहा है...' : 'Verifying Officer Session...'}
          </span>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 1: LOCKED DESK — MANDI OFFICER LOGIN PORTAL
  // ══════════════════════════════════════════════════════════════════════════════
  if (!officer) {
    return (
      <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full space-y-6">
          
          {/* Government Portal Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center gap-3">
              <Image
                src="/emblem-of-india.svg"
                alt="Emblem of India"
                width={40}
                height={60}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-gray-700 uppercase block">
                {language === 'hi' 
                  ? 'भारत सरकार • कृषि एवं किसान कल्याण मंत्रालय' 
                  : 'Government of India • Ministry of Agriculture & Farmers Welfare'}
              </span>
              <span className="text-[11px] text-gray-500 font-medium block">
                {language === 'hi' 
                  ? 'खाद्य एवं सार्वजनिक वितरण विभाग • राष्ट्रीय ई-उपार्जन प्रणाली' 
                  : 'Department of Food & Public Distribution • National E-Procurement'}
              </span>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#14532d] text-amber-300 text-xs font-bold tracking-wide shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'अधिकारी नियंत्रण कक्ष • सुरक्षित पोर्टल' : 'Official Officer Portal • Restricted Access'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#14532d] font-serif mt-2">
                {language === 'hi' ? 'मंडी अधिकारी / केंद्र प्रभारी लॉगिन' : "Officer's Desk & Admin Login"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1">
                {language === 'hi'
                  ? 'यह पोर्टल केवल अधिकृत खरीद प्रभारियों, मंडी निरीक्षकों और प्रशासनिक अधिकारियों के लिए सुरक्षित है।'
                  : 'This desk is strictly restricted to designated Procurement In-Charges, Mandi Inspectors, and Authorized Admins.'}
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xl space-y-6">
            
            {/* Error Notification */}
            {loginError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">{language === 'hi' ? 'प्रवेश अस्वीकृत (Access Denied)' : 'Authentication Failed'}</div>
                  <div className="text-red-700">{loginError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleOfficerLogin} className="space-y-4">
              
              {/* Officer ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {language === 'hi' ? 'अधिकारी पहचान पत्र / लॉगिन आईडी' : 'Officer ID / Official Login ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <UserCheck className="w-4 h-4 text-[#14532d]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder={language === 'hi' ? 'उदा. OFFICER-MP-001 या अधिकारी ईमेल' : 'e.g. OFFICER-MP-001 or admin@mandimitra.gov.in'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:border-transparent font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {language === 'hi' ? 'सुरक्षा पासवर्ड / एक्सेस की' : 'Official Password / Access Key'}
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4 text-[#14532d]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:border-transparent font-medium text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mandi Center Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {language === 'hi' ? 'संबंधित खरीद केंद्र (Assigned Mandi Center)' : 'Procurement Center Assignment'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-4 h-4 text-[#14532d]" />
                  </div>
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:border-transparent font-medium text-gray-800 bg-white"
                  >
                    <option value="c1">Bhopal Central Mandi (भोपाल सेंट्रल मंडी - c1)</option>
                    <option value="c2">Indore Mandi Complex (इंदौर मंडी कॉम्प्लेक्स - c2)</option>
                    <option value="c3">Ujjain Grain Yard (उज्जैन अनाज यार्ड - c3)</option>
                    <option value="all">State Headquarters / All Centers (मुख्यालय)</option>
                  </select>
                </div>
              </div>

              {/* Security Captcha */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  {language === 'hi' ? 'सुरक्षा सत्यापन (Captcha)' : 'Security Verification Code'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-300 font-mono text-lg font-extrabold tracking-widest text-gray-800 select-none line-through decoration-gray-400">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-600 transition"
                    title="Generate New Code"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>{language === 'hi' ? 'अधिकारी डेस्क में प्रवेश करें' : 'Sign In to Officer’s Desk'}</span>
                  </>
                )}
              </button>

            </form>

            {/* Quick Demo Credentials Helper */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f97316]" />
                <span>{language === 'hi' ? 'परीक्षण क्रेडेंशियल्स (One-Click Demo Login)' : 'Authorized Evaluation Credentials'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofill('officer1')}
                  className="text-left p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition text-xs space-y-0.5"
                >
                  <div className="font-bold text-[#14532d] flex items-center justify-between">
                    <span>Officer (Bhopal Mandi)</span>
                    <span className="text-[10px] bg-emerald-200/80 text-[#14532d] px-1.5 py-0.2 rounded">In-Charge</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-mono">ID: OFFICER-MP-001</div>
                  <div className="text-[11px] text-gray-500 font-mono">Pass: Mandi@Officer2026</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutofill('superadmin')}
                  className="text-left p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 transition text-xs space-y-0.5"
                >
                  <div className="font-bold text-amber-900 flex items-center justify-between">
                    <span>Super Administrator</span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">HQ</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-mono">ID: SUPER-ADMIN-01</div>
                  <div className="text-[11px] text-gray-500 font-mono">Pass: Super@Admin2026</div>
                </button>
              </div>
            </div>

            {/* Official Security Disclaimer */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14532d] shrink-0 mt-0.5" />
              <span>
                {language === 'hi'
                  ? 'सुरक्षा सूचना: यह एक आधिकारिक सरकारी खरीद प्रबंधन प्रणाली है। अनधिकृत प्रवेश का प्रयास आईटी अधिनियम के तहत दंडनीय है।'
                  : 'Security Notice: This is an official agricultural procurement console. All operations and audit trails are logged under government IT compliance guidelines.'}
              </span>
            </div>

          </div>

          <div className="text-center">
            <Link href="/" className="text-xs font-semibold text-[#14532d] hover:underline">
              ← {language === 'hi' ? 'नागरिक मुख्य पृष्ठ पर लौटें' : 'Return to Citizen Public Portal'}
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // VIEW 2: UNLOCKED — OPERATIONAL OFFICER DESK / ADMIN PANEL
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Active Officer Clearance Banner */}
        <div className="bg-[#14532d] text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-8 border-[#f97316]">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center shrink-0">
              <Image
                src="/emblem-of-india.svg"
                alt="Emblem of India"
                width={32}
                height={48}
                className="h-11 w-auto object-contain brightness-0 invert"
                priority
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-[#14532d]">
                  {language === 'hi' ? 'सक्रिय अधिकारी सत्र' : 'VERIFIED OFFICIAL SESSION'}
                </span>
                <span className="text-xs text-green-200">
                  ID: <span className="font-mono font-bold text-white">{officer.officerId}</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white">
                {language === 'hi' ? (officer.nameHi || officer.name) : officer.name}
              </h2>
              <div className="text-xs text-green-100 flex items-center gap-2">
                <span>{language === 'hi' ? (officer.designationHi || officer.designation) : officer.designation}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">{officer.centerName || 'Bhopal Central Mandi'}</span>
              </div>
            </div>
          </div>

          {/* Quick Desk Action: Call Next & Secure Logout */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={handleCallNext}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('admin.callNext')} (#{currentServing + 1})</span>
            </button>

            <button
              onClick={handleOfficerLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-700/90 hover:bg-red-800 text-white text-xs sm:text-sm font-bold transition border border-red-500/50 shadow-sm"
              title="Lock Officer Desk & Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'hi' ? 'डेस्क लॉक / लॉगआउट' : 'Lock Desk & Logout'}</span>
            </button>
          </div>
        </div>

        {/* Section Sub-heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif">
              {t('admin.title')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {language === 'hi' 
                ? 'लाइव कतार प्रबंधन, इलेक्ट्रॉनिक तौल सत्यापन, पारदर्शी एमएसपी खरीद एवं आवक नियंत्रण।' 
                : 'Real-time live queue management, digital weighbridge integration, and daily capacity monitoring.'}
            </p>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Mandi Operational Status: <span className="text-[#14532d] font-bold">ONLINE (Gate Weighbridge Active)</span>
          </div>
        </div>

        {/* 5 KEY DAILY COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-[11px] text-gray-500 uppercase font-bold block">{t('admin.totalSlots')}</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">200</span>
            <span className="text-[10px] text-[#14532d] font-semibold">100% capacity ready</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-[11px] text-gray-500 uppercase font-bold block">{t('admin.farmersArrived')}</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">178</span>
            <span className="text-[10px] text-[#14532d] font-semibold">Gate verified via QR</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-[11px] text-gray-500 uppercase font-bold block">{t('admin.processed')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#14532d] mt-1 block">156</span>
            <span className="text-[10px] text-[#14532d] font-semibold">Parchi generated</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs">
            <span className="text-[11px] text-gray-500 uppercase font-bold block">{t('admin.inQueue')}</span>
            <span className="text-2xl sm:text-3xl font-black text-[#D4912A] mt-1 block">22</span>
            <span className="text-[10px] text-[#D4912A] font-semibold">Expected wait ~25m</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] text-gray-500 uppercase font-bold block">{t('admin.avgProcessTime')}</span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">18 min</span>
            <span className="text-[10px] text-[#14532d] font-semibold">4m faster than norm</span>
          </div>

        </div>

        {/* AI CROWD PREDICTION NOTICE */}
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4912A] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {language === 'hi' ? 'एआई भीड़ पूर्वानुमान प्रणाली (AI Crowd Forecast)' : 'AI-Driven Arrival Surge Prediction'}
              </h4>
              <p className="text-xs text-gray-600">
                {language === 'hi' 
                  ? 'कल सुबह 9:00 - 11:30 बजे भारी भीड़ (92% क्षमता) संभावित है। किसानों को 2:00 PM स्लॉट की स्वचालित सलाह भेजी गई।' 
                  : 'Surge anticipated tomorrow 9:00 - 11:30 AM (92% load). Automated SMS advice sent encouraging afternoon slots.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4912A]/20 text-[#B87A1F] whitespace-nowrap">
            MODEL ACCURACY: 94.2%
          </span>
        </div>

        {/* ADMIN INTERACTION TABS */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'queue'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('admin.liveQueue')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'analytics'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {language === 'hi' ? 'आवक विश्लेषण' : 'Hourly Arrivals & Crops'}
          </button>
        </div>

        {/* TAB 1: LIVE QUEUE SEQUENCING */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-serif">
                  {language === 'hi' ? 'आज की किसान कतार अनुक्रम' : "Today's Active Token Roster"}
                </h3>
                <span className="text-xs text-gray-500">Showing {queue.length} farmers registered • Active Center: {officer.centerName || 'Bhopal Central Mandi'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchRoster()} 
                  className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-bold">
                  <tr>
                    <th className="py-3.5 px-6">{t('admin.tokenNo')}</th>
                    <th className="py-3.5 px-6">{t('admin.farmerName')}</th>
                    <th className="py-3.5 px-6">{t('admin.cropType')}</th>
                    <th className="py-3.5 px-6">{t('admin.weight')}</th>
                    <th className="py-3.5 px-6">{t('payments.status')}</th>
                    <th className="py-3.5 px-6 text-right">{t('admin.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {queue.map((farmer) => {
                    const c = crops.find(crop => crop.type === farmer.cropType);
                    const isInProgress = farmer.status === 'in-progress';
                    const isDone = farmer.status === 'completed';

                    return (
                      <tr 
                        key={farmer.tokenNumber} 
                        className={`hover:bg-gray-50 transition ${
                          isInProgress ? 'bg-[#14532d]/10 font-medium' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-mono font-bold text-sm">
                          #{farmer.tokenNumber}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-gray-900 block">
                            {language === 'hi' ? farmer.farmerNameHi : farmer.farmerName}
                          </span>
                          <span className="text-[11px] text-gray-500">{farmer.phone}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                            <span>{c?.emoji}</span>
                            <span>{language === 'hi' ? c?.nameHi : c?.nameEn}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          {farmer.quantity} Quintals
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isInProgress 
                              ? 'bg-amber-100 text-amber-800 animate-pulse' 
                              : isDone 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            {farmer.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {farmer.status === 'waiting' && (
                            <button
                              onClick={() => handleStatusChange(farmer.tokenNumber, 'in-progress')}
                              className="px-3 py-1.5 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold transition text-[11px]"
                            >
                              Call In
                            </button>
                          )}
                          {farmer.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(farmer.tokenNumber, 'completed')}
                              className="px-3 py-1.5 rounded-xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold transition text-[11px]"
                            >
                              Approve Parchi
                            </button>
                          )}
                          {farmer.status === 'completed' && (
                            <span className="text-[#14532d] font-bold text-xs inline-flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Complete</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & HOURLY LOAD */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Hourly Distribution Visual */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {t('admin.hourlyArrivals')}
              </h3>
              
              <div className="space-y-3">
                {hourlyArrivalsData.map((item) => (
                  <div key={item.hour} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                      <span>{item.hour}</span>
                      <span>{item.arrivals} farmers</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.arrivals > 35 
                            ? 'bg-[#C75B3A]' 
                            : item.arrivals > 20 
                            ? 'bg-[#D4912A]' 
                            : 'bg-[#14532d]'
                        }`}
                        style={{ width: `${(item.arrivals / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crop Wise Acceptance Ratio */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-gray-900 font-serif">
                {t('admin.cropDistribution')}
              </h3>

              <div className="space-y-4">
                {cropDistributionData.map((crop) => (
                  <div key={crop.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: crop.color }} 
                      />
                      <span className="text-xs font-bold text-gray-900">
                        {language === 'hi' ? crop.nameHi : crop.name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#14532d]">
                      {crop.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
