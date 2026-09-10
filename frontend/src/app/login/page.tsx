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
      setError(res.message || (language === 'hi' ? 'OTP भेजने में विफल' : 'Failed to send OTP'));
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
      setError(res.message || (language === 'hi' ? 'OTP सत्यापन विफल रहा। सुनिश्चित करें कि बैकएंड चल रहा है।' : 'OTP verification failed. Ensure the backend is running.'));
      return;
    }
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white border-t-4 border-t-[#f97316] border border-gray-300 shadow-sm">
        
        {/* Header */}
        <div className="bg-[#14532d] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="w-6 h-6 text-[#f97316]" />
            <div>
              <h1 className="text-lg font-bold uppercase tracking-wide">
                {language === 'hi' ? 'मंडी मित्र किसान पोर्टल' : 'Mandi Mitra Farmer Portal'}
              </h1>
              <p className="text-xs">
                {language === 'hi' ? 'पहचान सत्यापन प्रणाली' : 'Identity Verification System'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* Sign In vs New Registration Toggle */}
          <div className="flex border-b border-gray-300 pb-0 mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setOtpSent(false); setError(''); }}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                authMode === 'signin'
                  ? 'border-[#14532d] text-[#14532d]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'hi' ? 'लॉगिन करें' : 'Existing Farmer Login'}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setOtpSent(false); setError(''); }}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition ${
                authMode === 'register'
                  ? 'border-[#14532d] text-[#14532d]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              {language === 'hi' ? 'नया पंजीकरण' : 'New Farmer Registration'}
            </button>
          </div>

          <div className="mb-6 border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            <strong>{language === 'hi' ? 'निर्देश:' : 'Instructions:'}</strong> {authMode === 'signin'
              ? (language === 'hi' ? 'अपने मोबाइल, आधार या किसान आईडी से लॉगिन करें।' : 'Choose your identifier to receive a quick verification OTP.')
              : (language === 'hi' ? 'अपनी जानकारी दर्ज करें, आपका व्यक्तिगत खाता तुरंत बन जाएगा।' : 'Enter your basic details to create your digital procurement account.')}
          </div>

          {/* Identification Mode Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setMethod('mobile'); setOtpSent(false); setError(''); }}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-sm border text-xs font-bold transition ${
                method === 'mobile'
                  ? 'bg-[#14532d] text-white border-[#14532d]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{language === 'hi' ? 'मोबाइल' : 'Mobile'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('aadhaar'); setOtpSent(false); setError(''); }}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-sm border text-xs font-bold transition ${
                method === 'aadhaar'
                  ? 'bg-[#14532d] text-white border-[#14532d]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{language === 'hi' ? 'आधार' : 'Aadhaar'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('farmerId'); setOtpSent(false); setError(''); }}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-sm border text-xs font-bold transition ${
                method === 'farmerId'
                  ? 'bg-[#14532d] text-white border-[#14532d]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BadgeCheck className="w-4 h-4" />
              <span>{language === 'hi' ? 'किसान आईडी' : 'Farmer ID'}</span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-50 border border-red-300 text-sm font-semibold text-red-800">
              {error}
            </div>
          )}

          {/* Form Step 1 */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              
              {/* If Registering, ask for Full Name, Village and District */}
              {authMode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 border border-gray-200">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-gray-800 block mb-1">
                      {language === 'hi' ? 'किसान का पूरा नाम *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-hidden focus:border-[#14532d]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-800 block mb-1">
                      {language === 'hi' ? 'गाँव' : 'Village'}
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-hidden focus:border-[#14532d]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-800 block mb-1">
                      {language === 'hi' ? 'जिला' : 'District'}
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 bg-white text-sm focus:outline-hidden focus:border-[#14532d]"
                    />
                  </div>
                </div>
              )}

              {/* Identifier input */}
              <div className="bg-gray-50 p-4 border border-gray-200">
                <label className="text-sm font-semibold text-gray-800 block mb-1">
                  {method === 'mobile' && (language === 'hi' ? '10 अंकों का मोबाइल नंबर *' : '10-Digit Mobile Number *')}
                  {method === 'aadhaar' && (language === 'hi' ? '12 अंकों का आधार नंबर *' : '12-Digit Aadhaar Card Number *')}
                  {method === 'farmerId' && (language === 'hi' ? 'किसान पंजीकरण संख्या (ID) *' : 'Farmer Registration ID *')}
                </label>
                
                <input
                  type={method === 'farmerId' ? 'text' : 'tel'}
                  maxLength={method === 'mobile' ? 10 : method === 'aadhaar' ? 12 : 20}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-sm font-semibold focus:outline-hidden focus:border-[#14532d]"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#14532d] hover:bg-[#0f3d21] text-white font-bold text-sm shadow-sm transition flex items-center gap-2 rounded-sm"
                >
                  <span>
                    {loading 
                      ? (language === 'hi' ? 'भेजा जा रहा है...' : 'Sending OTP...') 
                      : (language === 'hi' ? 'OTP प्राप्त करें' : 'Get Verification Code')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Form Step 2: OTP Verification */
            <form onSubmit={handleVerifyAndLogin} className="space-y-5">
              
              <div className="p-4 bg-gray-50 border border-gray-200 flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600 mr-2">{language === 'hi' ? 'OTP भेजा गया:' : 'OTP Sent to:'}</span>
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

              <div className="bg-gray-50 p-4 border border-gray-200">
                <label className="text-sm font-semibold text-gray-800 block mb-2">
                  {language === 'hi' ? '4 अंकों का OTP दर्ज करें' : 'Enter 4-Digit Verification Code'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-center tracking-widest text-lg font-bold focus:outline-hidden focus:border-[#14532d]"
                  required
                />
                <span className="text-xs text-[#14532d] font-semibold block mt-2">
                  💡 {language === 'hi' ? `डेमो कोड: ${simulatedOtp}` : `Demo auto-code: ${simulatedOtp}`}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-sm shadow-sm transition flex items-center gap-2 rounded-sm"
                >
                  <span>
                    {loading 
                      ? (language === 'hi' ? 'सत्यापन जारी...' : 'Verifying...') 
                      : (language === 'hi' ? 'सत्यापित करें और डैशबोर्ड खोलें' : 'Verify & Login')}
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Pre-fills */}
          {authMode === 'signin' && (
            <div className="mt-8 pt-4 border-t border-gray-300 bg-gray-50 p-3 border">
              <span className="text-xs text-gray-600 block mb-2 font-bold uppercase">
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
                  className="px-3 py-1.5 border border-gray-300 bg-white text-xs font-semibold text-gray-800 hover:bg-gray-100"
                >
                  {language === 'hi' ? 'रमेश (भोपाल)' : 'Ramesh (Bhopal)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('mobile');
                    setIdentifier('9812345678');
                    setFarmerName('Sunita Devi');
                    setOtpSent(false);
                  }}
                  className="px-3 py-1.5 border border-gray-300 bg-white text-xs font-semibold text-gray-800 hover:bg-gray-100"
                >
                  {language === 'hi' ? 'सुनीता (रायसेन)' : 'Sunita (Raisen)'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t border-gray-300 p-3 text-center text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 inline-block mr-1 text-[#14532d]" />
          {language === 'hi' ? 'मंडी मित्र - भारत सरकार का सुरक्षित पोर्टल' : 'Mandi Mitra - Secure Government of India Portal'}
        </div>

      </div>
    </div>
  );
}
