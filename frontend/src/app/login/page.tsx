'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useAuth, LoginMethod } from '@/context/AuthContext';
import { 
  Sprout, 
  Smartphone, 
  CreditCard, 
  BadgeCheck, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  KeyRound, 
  User, 
  MapPin,
  Building,
  UserPlus,
  LogIn
} from 'lucide-react';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { login, sendOtp, verifyOtp } = useAuth();
  const router = useRouter();

  // Mode: Sign In vs First-Time Farmer Registration
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [method, setMethod] = useState<LoginMethod>('mobile');
  
  // Registration & Login fields
  const [identifier, setIdentifier] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Bhopal');
  
  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authMode === 'register' && (!farmerName || farmerName.trim().length < 2)) {
      setError(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }

    if (method === 'mobile' && (!identifier || identifier.length < 10)) {
      setError(language === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (method === 'aadhaar' && (!identifier || identifier.length < 12)) {
      setError(language === 'hi' ? 'कृपया 12 अंकों का आधार नंबर दर्ज करें।' : 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    if (method === 'farmerId' && (!identifier || identifier.trim().length < 3)) {
      setError(language === 'hi' ? 'कृपया अपनी किसान पंजीकरण संख्या दर्ज करें।' : 'Please enter your Farmer ID.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(identifier, method);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      if (res.simulatedOtp) {
        setSimulatedOtp(res.simulatedOtp);
        setOtp(res.simulatedOtp);
      }
    } else {
      setError(res.message || 'Failed to send OTP');
    }
  };

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError(language === 'hi' ? 'कृपया OTP दर्ज करें।' : 'Please enter the OTP.');
      return;
    }

    setLoading(true);
    const regData = authMode === 'register' ? {
      name: farmerName,
      village,
      district
    } : undefined;

    const res = await verifyOtp(identifier, method, otp, regData);
    setLoading(false);
    
    if (!res.success) {
      setError(res.message || 'OTP verification failed. Ensure the backend is running.');
      return;
    }
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-white flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Farmer Artwork & Benefits */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#14532d] to-[#0f3d21] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4912A]/30 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-white">
              <Sprout className="w-4 h-4 text-[#E8A94D]" />
              <span>{language === 'hi' ? 'मंडी मित्र किसान पोर्टल' : 'Mandi Mitra Farmer Portal'}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold font-serif text-white">
                {language === 'hi' ? 'पहचान सत्यापित करें' : 'Verify Farmer Identity'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {language === 'hi'
                  ? 'लॉगिन करने के बाद आपका निजी डैशबोर्ड, टोकन ट्रैकिंग और बैंक भुगतान विवरण सक्रिय हो जाएंगे।'
                  : 'Your personal dashboard, live token tracking, and bank DBT details will unlock after login.'}
              </p>
            </div>
          </div>

          {/* Farmer Photo Showcase */}
          <div className="relative z-10 pt-6 pb-4">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#E8A94D] shrink-0">
                  <Image
                    src="/images/farmers/farmer1.jpg"
                    alt="Farmer"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">Ramesh Kumar</div>
                  <div className="text-gray-200">Bhopal, Madhya Pradesh</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-200 italic">
                &quot;{language === 'hi' ? 'न पासवर्ड की झंझट, सिर्फ फोन नंबर से तुरंत लॉगिन।' : 'No passwords, instant login via mobile OTP.'}&quot;
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-gray-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E8A94D]" />
              {language === 'hi' ? '100% सरकारी सुरक्षित' : 'Government Secured'}
            </span>
            <Link href="/" className="underline text-white font-semibold">
              {language === 'hi' ? 'वेबसाइट देखें' : 'Home'}
            </Link>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          
          {/* Sign In vs New Registration Toggle */}
          <div className="flex border-b border-gray-200 pb-3 justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setOtpSent(false); setError(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                  authMode === 'signin'
                    ? 'bg-[#14532d] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'hi' ? 'लॉगिन करें' : 'Existing Farmer'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('register'); setOtpSent(false); setError(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                  authMode === 'register'
                    ? 'bg-[#14532d] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'hi' ? 'नया पंजीकरण' : 'First-Time Register'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-serif">
              {authMode === 'signin'
                ? (language === 'hi' ? 'किसान लॉगिन' : 'Farmer Login')
                : (language === 'hi' ? 'नया किसान पंजीकरण' : 'Register New Farmer Profile')}
            </h3>
            <p className="text-xs text-gray-600">
              {authMode === 'signin'
                ? (language === 'hi' ? 'अपने मोबाइल, आधार या किसान आईडी से लॉगिन करें:' : 'Choose your identifier to receive a quick verification OTP:')
                : (language === 'hi' ? 'अपनी जानकारी दर्ज करें, आपका व्यक्तिगत खाता तुरंत बन जाएगा:' : 'Enter your basic details to create your digital procurement account:')}
            </p>
          </div>

          {/* Identification Mode Selector */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => { setMethod('mobile'); setOtpSent(false); setError(''); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                method === 'mobile'
                  ? 'bg-[#14532d] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मोबाइल' : 'Mobile'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('aadhaar'); setOtpSent(false); setError(''); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                method === 'aadhaar'
                  ? 'bg-[#14532d] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'आधार' : 'Aadhaar'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('farmerId'); setOtpSent(false); setError(''); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition ${
                method === 'farmerId'
                  ? 'bg-[#14532d] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'किसान आईडी' : 'Farmer ID'}</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Form Step 1 */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {/* If Registering, ask for Full Name, Village and District */}
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      {language === 'hi' ? 'किसान का पूरा नाम *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={farmerName}
                        onChange={(e) => setFarmerName(e.target.value)}
                        placeholder={language === 'hi' ? 'उदा. कमल सिंह' : 'e.g. Kamal Singh'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#14532d]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        {language === 'hi' ? 'गाँव' : 'Village'}
                      </label>
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder={language === 'hi' ? 'गाँव का नाम' : 'Village name'}
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#14532d]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        {language === 'hi' ? 'जिला' : 'District'}
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Bhopal / Raisen"
                        className="w-full px-3.5 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#14532d]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Identifier input */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  {method === 'mobile' && (language === 'hi' ? '10 अंकों का मोबाइल नंबर *' : '10-Digit Mobile Number *')}
                  {method === 'aadhaar' && (language === 'hi' ? '12 अंकों का आधार नंबर *' : '12-Digit Aadhaar Card Number *')}
                  {method === 'farmerId' && (language === 'hi' ? 'किसान पंजीकरण संख्या (ID) *' : 'Farmer Registration ID *')}
                </label>
                
                <div className="relative">
                  {method === 'mobile' && <Smartphone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                  {method === 'aadhaar' && <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                  {method === 'farmerId' && <BadgeCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                  
                  <input
                    type={method === 'farmerId' ? 'text' : 'tel'}
                    maxLength={method === 'mobile' ? 10 : method === 'aadhaar' ? 12 : 20}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      method === 'mobile' 
                        ? '9876543210' 
                        : method === 'aadhaar' 
                        ? '1234 5678 9012' 
                        : 'MP-KISAN-4521'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold tracking-wide focus:outline-hidden focus:ring-2 focus:ring-[#14532d]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
              >
                <span>
                  {loading 
                    ? (language === 'hi' ? 'भेजा जा रहा है...' : 'Sending OTP...') 
                    : (language === 'hi' ? 'OTP प्राप्त करें' : 'Get Verification Code')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Form Step 2: OTP Verification */
            <form onSubmit={handleVerifyAndLogin} className="space-y-4 animate-in fade-in duration-300">
              
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 block">{language === 'hi' ? 'OTP भेजा गया:' : 'OTP Sent to:'}</span>
                  <span className="font-bold text-gray-900">{identifier}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-[#14532d] font-bold underline"
                >
                  {language === 'hi' ? 'बदलें' : 'Change'}
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  {language === 'hi' ? '4 अंकों का OTP दर्ज करें' : 'Enter 4-Digit Verification Code'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-center tracking-widest text-lg font-black text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#14532d]"
                    required
                  />
                </div>
                <span className="text-[11px] text-[#14532d] font-semibold block mt-1">
                  💡 {language === 'hi' ? `डेमो कोड: ${simulatedOtp}` : `Demo auto-code: ${simulatedOtp}`}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#D4912A] hover:bg-[#B87A1F] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>
                  {loading 
                    ? (language === 'hi' ? 'सत्यापन जारी...' : 'Verifying...') 
                    : (language === 'hi' ? 'सत्यापित करें और डैशबोर्ड खोलें' : 'Verify & Open My Dashboard')}
                </span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Pre-fills */}
          {authMode === 'signin' && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-[11px] text-gray-500 block mb-2 font-medium">
                {language === 'hi' ? 'त्वरित डेमो किसान चुनें:' : 'Quick Demo Farmer Sign-in:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('mobile');
                    setIdentifier('9876543210');
                    setFarmerName('Ramesh Kumar');
                    setOtpSent(false);
                  }}
                  className="px-3 py-1 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 hover:bg-gray-100"
                >
                  🌾 Ramesh (Bhopal)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('mobile');
                    setIdentifier('9812345678');
                    setFarmerName('Sunita Devi');
                    setOtpSent(false);
                  }}
                  className="px-3 py-1 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 hover:bg-gray-100"
                >
                  🌾 Sunita (Raisen)
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
