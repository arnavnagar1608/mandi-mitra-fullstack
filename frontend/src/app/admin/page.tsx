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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 bg-white p-6 border border-gray-300 shadow-sm rounded-sm">
          <div className="w-8 h-8 border-4 border-[#14532d] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-[#14532d]">
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
      <div className="bg-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto w-full space-y-4">
          
          {/* Government Portal Header */}
          <div className="text-center space-y-2 bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
            <div className="flex justify-center items-center gap-3">
              <Image
                src="/emblem-of-india.svg"
                alt="Emblem of India"
                width={40}
                height={60}
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-gray-800 uppercase block">
                {language === 'hi' 
                  ? 'भारत सरकार • कृषि एवं किसान कल्याण मंत्रालय' 
                  : 'Government of India • Ministry of Agriculture & Farmers Welfare'}
              </span>
              <span className="text-xs text-gray-600 font-bold block mt-1">
                {language === 'hi' 
                  ? 'खाद्य एवं सार्वजनिक वितरण विभाग • राष्ट्रीय ई-उपार्जन प्रणाली' 
                  : 'Department of Food & Public Distribution • National E-Procurement'}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 mt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14532d] text-white text-xs font-bold shadow-sm rounded-sm mt-2">
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>{language === 'hi' ? 'अधिकारी नियंत्रण कक्ष • सुरक्षित पोर्टल' : 'Official Officer Portal • Restricted Access'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#14532d] mt-3">
                {language === 'hi' ? 'मंडी अधिकारी / केंद्र प्रभारी लॉगिन' : "Officer's Desk & Admin Login"}
              </h1>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white p-6 sm:p-8 border border-gray-300 shadow-sm rounded-sm space-y-6">
            <div className="border-b border-gray-300 pb-2 mb-4">
              <h2 className="text-lg font-bold text-gray-800 uppercase">
                {language === 'hi' ? 'प्राधिकृत लॉगिन' : 'Authorized Login'}
              </h2>
            </div>
            
            {/* Error Notification */}
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs sm:text-sm flex items-start gap-3 rounded-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">{language === 'hi' ? 'प्रवेश अस्वीकृत (Access Denied)' : 'Authentication Failed'}</div>
                  <div className="text-red-700">{loginError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleOfficerLogin} className="space-y-5">
              
              {/* Officer ID */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                  {language === 'hi' ? 'अधिकारी पहचान पत्र / लॉगिन आईडी' : 'Officer ID / Official Login ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <UserCheck className="w-4 h-4 text-[#14532d]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    placeholder={language === 'hi' ? 'उदा. OFFICER-MP-001' : 'e.g. OFFICER-MP-001'}
                    className="w-full pl-9 pr-3 py-2 border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#14532d] focus:border-[#14532d] rounded-sm text-gray-800"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-800 uppercase">
                    {language === 'hi' ? 'सुरक्षा पासवर्ड / एक्सेस की' : 'Official Password / Access Key'}
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <KeyRound className="w-4 h-4 text-[#14532d]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#14532d] focus:border-[#14532d] rounded-sm text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mandi Center Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                  {language === 'hi' ? 'संबंधित खरीद केंद्र (Assigned Mandi Center)' : 'Procurement Center Assignment'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Building2 className="w-4 h-4 text-[#14532d]" />
                  </div>
                  <select
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#14532d] focus:border-[#14532d] rounded-sm text-gray-800 bg-white"
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
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">
                  {language === 'hi' ? 'सुरक्षा सत्यापन (Captcha)' : 'Security Verification Code'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-gray-200 border border-gray-400 font-mono text-lg font-bold tracking-widest text-gray-800 select-none line-through decoration-gray-500 rounded-sm">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 border border-gray-400 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm"
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
                    placeholder={language === 'hi' ? 'कोड दर्ज करें' : 'Enter code'}
                    className="flex-1 py-2 px-3 border border-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-[#14532d] font-mono font-bold rounded-sm"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 px-4 bg-[#14532d] hover:bg-[#115e32] text-white font-bold text-sm border border-[#0f3d21] shadow-sm rounded-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span className="uppercase tracking-wide">{language === 'hi' ? 'अधिकारी डेस्क में प्रवेश करें' : 'Sign In to Officer’s Desk'}</span>
                  </>
                )}
              </button>

            </form>

            {/* Quick Demo Credentials Helper */}
            <div className="pt-4 border-t border-gray-300 mt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 mb-3 bg-gray-100 p-2 border border-gray-300 rounded-sm">
                <Sparkles className="w-4 h-4 text-[#f97316]" />
                <span>{language === 'hi' ? 'परीक्षण क्रेडेंशियल्स (One-Click Demo Login)' : 'Authorized Evaluation Credentials'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAutofill('officer1')}
                  className="text-left p-3 bg-white border border-gray-400 hover:bg-gray-50 text-xs space-y-1 rounded-sm shadow-sm"
                >
                  <div className="font-bold text-[#14532d] flex items-center justify-between">
                    <span>{language === 'hi' ? 'अधिकारी (भोपाल मंडी)' : 'Officer (Bhopal Mandi)'}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-800 border border-gray-300 px-1.5 py-0.5 rounded-sm">{language === 'hi' ? 'प्रभारी' : 'In-Charge'}</span>
                  </div>
                  <div className="text-[11px] text-gray-700 font-mono">ID: OFFICER-MP-001</div>
                  <div className="text-[11px] text-gray-700 font-mono">Pass: Mandi@Officer2026</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutofill('superadmin')}
                  className="text-left p-3 bg-white border border-gray-400 hover:bg-gray-50 text-xs space-y-1 rounded-sm shadow-sm"
                >
                  <div className="font-bold text-[#14532d] flex items-center justify-between">
                    <span>{language === 'hi' ? 'सुपर एडमिनिस्ट्रेटर' : 'Super Administrator'}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-800 border border-gray-300 px-1.5 py-0.5 rounded-sm">{language === 'hi' ? 'मुख्यालय' : 'HQ'}</span>
                  </div>
                  <div className="text-[11px] text-gray-700 font-mono">ID: SUPER-ADMIN-01</div>
                  <div className="text-[11px] text-gray-700 font-mono">Pass: Super@Admin2026</div>
                </button>
              </div>
            </div>

            {/* Official Security Disclaimer */}
            <div className="bg-red-50 border border-red-200 p-3 text-[11px] text-red-800 font-semibold flex items-start gap-2 rounded-sm mt-4">
              <ShieldCheck className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>
                {language === 'hi'
                  ? 'सुरक्षा सूचना: यह एक आधिकारिक सरकारी खरीद प्रबंधन प्रणाली है। अनधिकृत प्रवेश का प्रयास आईटी अधिनियम के तहत दंडनीय है।'
                  : 'Security Notice: This is an official agricultural procurement console. Unauthorized access is punishable under the IT Act.'}
              </span>
            </div>

          </div>

          <div className="text-center mt-4 pb-8">
            <Link href="/" className="text-xs font-bold text-[#14532d] hover:underline flex items-center justify-center gap-1">
              <span>←</span>
              <span>{language === 'hi' ? 'नागरिक मुख्य पृष्ठ पर लौटें' : 'Return to Citizen Public Portal'}</span>
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
    <div className="bg-gray-100 min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Active Officer Clearance Banner */}
        <div className="bg-white border border-gray-400 shadow-sm p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#f97316]">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0 bg-gray-100 p-2 border border-gray-300 rounded-sm">
              <Image
                src="/emblem-of-india.svg"
                alt="Emblem of India"
                width={28}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 border border-[#14532d] bg-[#14532d] text-white text-[10px] font-bold uppercase rounded-sm">
                  {language === 'hi' ? 'सक्रिय सत्र' : 'ACTIVE SESSION'}
                </span>
                <span className="text-xs font-bold text-gray-700">
                  ID: <span className="font-mono text-[#14532d]">{officer.officerId}</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 uppercase">
                {language === 'hi' ? (officer.nameHi || officer.name) : officer.name}
              </h2>
              <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 uppercase tracking-wide">
                <span>{language === 'hi' ? (officer.designationHi || officer.designation) : officer.designation}</span>
                <span>•</span>
                <span className="text-[#f97316] font-bold">{language === 'hi' ? (officer.centerNameHi || officer.centerName || 'भोपाल सेंट्रल मंडी') : (officer.centerName || 'Bhopal Central Mandi')}</span>
              </div>
            </div>
          </div>

          {/* Quick Desk Action: Call Next & Secure Logout */}
          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={handleCallNext}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold border border-[#c2410c] rounded-sm shadow-sm transition uppercase"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t('admin.callNext')} (#{currentServing + 1})</span>
            </button>

            <button
              onClick={handleOfficerLogout}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-red-700 text-xs font-bold border border-red-300 rounded-sm shadow-sm transition uppercase"
              title="Lock Officer Desk & Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'hi' ? 'लॉगआउट' : 'LOGOUT'}</span>
            </button>
          </div>
        </div>

        {/* Section Sub-heading */}
        <div className="bg-[#14532d] text-white p-3 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-[#0f3d21]">
          <div>
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
              {t('admin.title')}
            </h1>
          </div>
          <div className="text-xs font-bold bg-white text-[#14532d] px-2 py-1 rounded-sm shadow-sm border border-gray-300">
            {language === 'hi' ? 'स्थिति: ऑनलाइन (गेट वेब्रिज सक्रिय)' : 'STATUS: ONLINE (Gate Weighbridge Active)'}
          </div>
        </div>

        {/* 5 KEY DAILY COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
            <span className="text-[10px] text-gray-500 uppercase font-bold block border-b border-gray-200 pb-1 mb-2">{t('admin.totalSlots')}</span>
            <span className="text-2xl font-bold text-gray-900 block">200</span>
            <span className="text-[10px] text-[#14532d] font-bold">{language === 'hi' ? '100% क्षमता तैयार' : '100% CAPACITY READY'}</span>
          </div>

          <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
            <span className="text-[10px] text-gray-500 uppercase font-bold block border-b border-gray-200 pb-1 mb-2">{t('admin.farmersArrived')}</span>
            <span className="text-2xl font-bold text-gray-900 block">178</span>
            <span className="text-[10px] text-[#14532d] font-bold">{language === 'hi' ? 'क्यूआर द्वारा गेट सत्यापित' : 'GATE VERIFIED VIA QR'}</span>
          </div>

          <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
            <span className="text-[10px] text-gray-500 uppercase font-bold block border-b border-gray-200 pb-1 mb-2">{t('admin.processed')}</span>
            <span className="text-2xl font-bold text-[#14532d] block">156</span>
            <span className="text-[10px] text-[#14532d] font-bold">{language === 'hi' ? 'पर्ची जनरेट की गई' : 'PARCHI GENERATED'}</span>
          </div>

          <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm">
            <span className="text-[10px] text-gray-500 uppercase font-bold block border-b border-gray-200 pb-1 mb-2">{t('admin.inQueue')}</span>
            <span className="text-2xl font-bold text-[#f97316] block">22</span>
            <span className="text-[10px] text-[#f97316] font-bold">{language === 'hi' ? 'संभावित प्रतीक्षा ~25 मिनट' : 'EXPECTED WAIT ~25M'}</span>
          </div>

          <div className="bg-white p-4 border border-gray-300 shadow-sm rounded-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold block border-b border-gray-200 pb-1 mb-2">{t('admin.avgProcessTime')}</span>
            <span className="text-2xl font-bold text-gray-900 block">18 MIN</span>
            <span className="text-[10px] text-[#14532d] font-bold">{language === 'hi' ? 'सामान्य से 4 मिनट तेज' : '4M FASTER THAN NORM'}</span>
          </div>

        </div>

        {/* AI CROWD PREDICTION NOTICE */}
        <div className="bg-[#fff7ed] border border-[#fbd38d] p-4 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] text-white flex items-center justify-center shrink-0 rounded-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#9a3412] uppercase tracking-wide">
                {language === 'hi' ? 'एआई भीड़ पूर्वानुमान प्रणाली (AI Crowd Forecast)' : 'AI-Driven Arrival Surge Prediction'}
              </h4>
              <p className="text-xs text-[#9a3412] font-medium mt-0.5">
                {language === 'hi' 
                  ? 'कल सुबह 9:00 - 11:30 बजे भारी भीड़ (92% क्षमता) संभावित है। किसानों को 2:00 PM स्लॉट की स्वचालित सलाह भेजी गई।' 
                  : 'Surge anticipated tomorrow 9:00 - 11:30 AM (92% load). Automated SMS advice sent encouraging afternoon slots.'}
              </p>
            </div>
          </div>
          <span className="px-2 py-1 bg-[#f97316] text-white text-[10px] font-bold uppercase rounded-sm whitespace-nowrap shadow-sm">
            {language === 'hi' ? 'मॉडल सटीकता: 94.2%' : 'MODEL ACCURACY: 94.2%'}
          </span>
        </div>

        {/* ADMIN INTERACTION TABS */}
        <div className="flex items-center gap-1 border-b-2 border-[#14532d]">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'queue'
                ? 'bg-[#14532d] text-white'
                : 'bg-white text-gray-600 border border-gray-300 border-b-0 hover:bg-gray-50'
            }`}
          >
            {t('admin.liveQueue')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'analytics'
                ? 'bg-[#14532d] text-white'
                : 'bg-white text-gray-600 border border-gray-300 border-b-0 hover:bg-gray-50'
            }`}
          >
            {language === 'hi' ? 'आवक विश्लेषण' : 'Hourly Arrivals & Crops'}
          </button>
        </div>

        {/* TAB 1: LIVE QUEUE SEQUENCING */}
        {activeTab === 'queue' && (
          <div className="bg-white border border-gray-300 shadow-sm rounded-sm overflow-hidden">
            <div className="p-4 bg-gray-100 border-b border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-md font-bold text-gray-800 uppercase">
                  {language === 'hi' ? 'आज की किसान कतार अनुक्रम' : "Today's Active Token Roster"}
                </h3>
                <span className="text-[11px] font-bold text-gray-500 uppercase">
                  {language === 'hi' ? 'कुल' : 'Total'}: {queue.length} {language === 'hi' ? 'रिकॉर्ड्स' : 'Records'} • {language === 'hi' ? 'केंद्र' : 'Center'}: {language === 'hi' ? (officer.centerNameHi || officer.centerName) : officer.centerName || 'Bhopal Central Mandi'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fetchRoster()} 
                  className="px-3 py-1.5 bg-white border border-gray-400 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 rounded-sm shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="uppercase">{language === 'hi' ? 'कतार रीफ्रेश करें' : 'Refresh Queue'}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#14532d] text-white uppercase font-bold tracking-wide">
                  <tr>
                    <th className="py-2.5 px-4 border border-gray-300">{t('admin.tokenNo')}</th>
                    <th className="py-2.5 px-4 border border-gray-300">{t('admin.farmerName')}</th>
                    <th className="py-2.5 px-4 border border-gray-300">{t('admin.cropType')}</th>
                    <th className="py-2.5 px-4 border border-gray-300">{t('admin.weight')}</th>
                    <th className="py-2.5 px-4 border border-gray-300">{t('payments.status')}</th>
                    <th className="py-2.5 px-4 border border-gray-300 text-center">{t('admin.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {queue.map((farmer) => {
                    const c = crops.find(crop => crop.type === farmer.cropType);
                    const isInProgress = farmer.status === 'in-progress';
                    const isDone = farmer.status === 'completed';

                    return (
                      <tr 
                        key={farmer.tokenNumber} 
                        className={`hover:bg-gray-50 transition ${
                          isInProgress ? 'bg-amber-50 font-bold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 border border-gray-300 font-mono font-bold text-sm text-gray-800">
                          #{farmer.tokenNumber}
                        </td>
                        <td className="py-2.5 px-4 border border-gray-300">
                          <span className="font-bold text-gray-900 block uppercase">
                            {language === 'hi' ? farmer.farmerNameHi : farmer.farmerName}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500">{farmer.phone}</span>
                        </td>
                        <td className="py-2.5 px-4 border border-gray-300">
                          <span className="inline-flex items-center gap-1 font-bold text-gray-800 uppercase">
                            <span>{c?.emoji}</span>
                            <span>{language === 'hi' ? c?.nameHi : c?.nameEn}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-4 border border-gray-300 font-bold text-gray-800 uppercase">
                          {farmer.quantity} {language === 'hi' ? 'क्विंटल' : 'Quintals'}
                        </td>
                        <td className="py-2.5 px-4 border border-gray-300">
                          <span className={`px-2 py-1 border text-[10px] font-bold uppercase rounded-sm ${
                            isInProgress 
                              ? 'bg-amber-100 text-amber-800 border-amber-300' 
                              : isDone 
                              ? 'bg-emerald-100 text-[#14532d] border-[#14532d]' 
                              : 'bg-gray-200 text-gray-700 border-gray-400'
                          }`}>
                            {farmer.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 border border-gray-300 text-center">
                          {farmer.status === 'waiting' && (
                            <button
                              onClick={() => handleStatusChange(farmer.tokenNumber, 'in-progress')}
                              className="px-3 py-1 bg-[#14532d] hover:bg-[#115e32] text-white font-bold uppercase border border-[#0f3d21] rounded-sm shadow-sm transition text-[10px]"
                            >
                              {language === 'hi' ? 'अंदर बुलाएं' : 'Call In'}
                            </button>
                          )}
                          {farmer.status === 'in-progress' && (
                            <button
                              onClick={() => handleStatusChange(farmer.tokenNumber, 'completed')}
                              className="px-3 py-1 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold uppercase border border-[#c2410c] rounded-sm shadow-sm transition text-[10px]"
                            >
                              {language === 'hi' ? 'पर्ची स्वीकृत करें' : 'Approve Parchi'}
                            </button>
                          )}
                          {farmer.status === 'completed' && (
                            <span className="text-[#14532d] font-bold text-[10px] uppercase inline-flex items-center gap-1 justify-center w-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{language === 'hi' ? 'पूर्ण' : 'Complete'}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Hourly Distribution Visual */}
            <div className="lg:col-span-7 bg-white p-5 border border-gray-300 shadow-sm rounded-sm space-y-4">
              <div className="border-b border-gray-300 pb-2">
                <h3 className="text-md font-bold text-gray-800 uppercase">
                  {t('admin.hourlyArrivals')}
                </h3>
              </div>
              
              <div className="space-y-3">
                {hourlyArrivalsData.map((item) => (
                  <div key={item.hour} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700 uppercase">
                      <span>{item.hour}</span>
                      <span>{item.arrivals} {language === 'hi' ? 'किसान' : 'farmers'}</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden">
                      <div
                        className={`h-full ${
                          item.arrivals > 35 
                            ? 'bg-[#c2410c]' 
                            : item.arrivals > 20 
                            ? 'bg-[#f97316]' 
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
            <div className="lg:col-span-5 bg-white p-5 border border-gray-300 shadow-sm rounded-sm space-y-4">
              <div className="border-b border-gray-300 pb-2">
                <h3 className="text-md font-bold text-gray-800 uppercase">
                  {t('admin.cropDistribution')}
                </h3>
              </div>

              <div className="space-y-3">
                {cropDistributionData.map((crop) => (
                  <div key={crop.name} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-sm">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-sm border border-gray-400" 
                        style={{ backgroundColor: crop.color }} 
                      />
                      <span className="text-xs font-bold text-gray-800 uppercase">
                        {language === 'hi' ? crop.nameHi : crop.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#14532d]">
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
