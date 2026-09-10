'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

const translations: Translations = {
  // App
  'app.name': { en: 'Mandi Mitra', hi: 'मंडी मित्र' },
  'app.tagline': { en: 'Your Smart Procurement Partner', hi: 'आपका स्मार्ट खरीद साथी' },
  'app.description': { en: 'Simplifying crop procurement for every farmer', hi: 'हर किसान के लिए फसल खरीद को आसान बनाना' },

  // Navigation
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.centers': { en: 'Procurement Centers', hi: 'खरीद केंद्र' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.queue': { en: 'Queue Status', hi: 'कतार स्थिति' },
  'nav.payments': { en: 'Payments', hi: 'भुगतान' },
  'nav.history': { en: 'History', hi: 'इतिहास' },
  'nav.login': { en: 'Login', hi: 'लॉगिन' },
  'nav.register': { en: 'Register', hi: 'रजिस्टर' },
  'nav.admin': { en: 'Admin Panel', hi: 'एडमिन पैनल' },
  'nav.logout': { en: 'Logout', hi: 'लॉगआउट' },
  'nav.profile': { en: 'My Profile', hi: 'मेरी प्रोफ़ाइल' },
  'nav.bookSlot': { en: 'Book a Slot', hi: 'स्लॉट बुक करें' },

  // Landing Page
  'landing.hero.title': { en: 'Sell Your Crop, Stress-Free', hi: 'अपनी फसल बेचना अब आसान' },
  'landing.hero.subtitle': { en: 'No more long queues. No more uncertainty. Book your procurement slot, track your status, and get paid — all from one platform.', hi: 'अब लंबी कतारें नहीं। अब अनिश्चितता नहीं। अपना खरीद स्लॉट बुक करें, स्थिति ट्रैक करें, और भुगतान पाएं — सब एक ही प्लेटफॉर्म से।' },
  'landing.hero.cta': { en: 'Get Started', hi: 'शुरू करें' },
  'landing.hero.learnMore': { en: 'Learn More', hi: 'और जानें' },

  'landing.problem.title': { en: 'The Problem Farmers Face Today', hi: 'आज किसानों की समस्या' },
  'landing.problem.waiting': { en: 'Long Waiting Times', hi: 'लंबा इंतज़ार' },
  'landing.problem.waitingDesc': { en: 'Farmers wait 4-8 hours at procurement centers, sometimes returning empty-handed', hi: 'किसान खरीद केंद्रों पर 4-8 घंटे इंतज़ार करते हैं, कभी-कभी खाली हाथ लौटते हैं' },
  'landing.problem.info': { en: 'No Schedule Information', hi: 'कोई शेड्यूल जानकारी नहीं' },
  'landing.problem.infoDesc': { en: 'Farmers rely on word-of-mouth and don\'t know exact dates, timings, or center capacity', hi: 'किसान अफ़वाहों पर निर्भर रहते हैं और सही तारीख, समय या केंद्र की क्षमता नहीं जानते' },
  'landing.problem.status': { en: 'Uncertain Procurement Status', hi: 'अनिश्चित खरीद स्थिति' },
  'landing.problem.statusDesc': { en: 'After submitting crops, farmers have no way to track quality checks, weighing, or payment', hi: 'फसल जमा करने के बाद, किसानों को गुणवत्ता जांच, तौल, या भुगतान की जानकारी नहीं मिलती' },

  'landing.solution.title': { en: 'How Mandi Mitra Helps', hi: 'मंडी मित्र कैसे मदद करता है' },
  'landing.solution.step1': { en: 'Find Nearby Centers', hi: 'नज़दीकी केंद्र खोजें' },
  'landing.solution.step1Desc': { en: 'Browse procurement centers near you with real-time availability and crowd information', hi: 'अपने पास के खरीद केंद्र देखें — उपलब्धता और भीड़ की जानकारी के साथ' },
  'landing.solution.step2': { en: 'Book Your Slot', hi: 'अपना स्लॉट बुक करें' },
  'landing.solution.step2Desc': { en: 'Choose a convenient date and time slot. No more arriving at dawn and waiting all day', hi: 'सुविधाजनक तारीख और समय चुनें। अब सुबह-सुबह आकर पूरा दिन इंतज़ार नहीं' },
  'landing.solution.step3': { en: 'Track Live Queue', hi: 'लाइव कतार देखें' },
  'landing.solution.step3Desc': { en: 'Monitor your queue position in real-time. Get notified when your turn approaches', hi: 'अपनी कतार में स्थिति लाइव देखें। बारी आने पर सूचना पाएं' },
  'landing.solution.step4': { en: 'Track & Get Paid', hi: 'ट्रैक करें और भुगतान पाएं' },
  'landing.solution.step4Desc': { en: 'Follow your procurement from quality check to payment — like tracking a delivery', hi: 'गुणवत्ता जांच से भुगतान तक हर कदम ट्रैक करें — जैसे डिलीवरी ट्रैक करते हैं' },

  'landing.stats.farmersServed': { en: 'Farmers Served', hi: 'किसानों की सेवा' },
  'landing.stats.centersActive': { en: 'Centers Active', hi: 'सक्रिय केंद्र' },
  'landing.stats.croresDisbursed': { en: 'Crores Disbursed', hi: 'करोड़ वितरित' },
  'landing.stats.avgWaitReduced': { en: 'Avg Wait Reduced', hi: 'औसत प्रतीक्षा कम' },

  'landing.testimonials.title': { en: 'What Farmers Say', hi: 'किसान क्या कहते हैं' },

  // Auth
  'auth.login.title': { en: 'Welcome Back', hi: 'वापस स्वागत है' },
  'auth.login.subtitle': { en: 'Login to manage your procurement', hi: 'अपनी खरीद प्रबंधित करने के लिए लॉगिन करें' },
  'auth.login.phone': { en: 'Mobile Number', hi: 'मोबाइल नंबर' },
  'auth.login.phonePlaceholder': { en: 'Enter 10-digit mobile number', hi: '10 अंकों का मोबाइल नंबर दर्ज करें' },
  'auth.login.sendOtp': { en: 'Send OTP', hi: 'OTP भेजें' },
  'auth.login.otp': { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  'auth.login.verifyOtp': { en: 'Verify & Login', hi: 'सत्यापित करें और लॉगिन करें' },
  'auth.login.noAccount': { en: 'Don\'t have an account?', hi: 'खाता नहीं है?' },
  'auth.login.asAdmin': { en: 'Login as Admin', hi: 'एडमिन के रूप में लॉगिन करें' },

  'auth.register.title': { en: 'Create Your Account', hi: 'अपना खाता बनाएं' },
  'auth.register.subtitle': { en: 'Join Mandi Mitra in 3 simple steps', hi: 'मंडी मित्र से 3 आसान चरणों में जुड़ें' },
  'auth.register.step1': { en: 'Personal Details', hi: 'व्यक्तिगत विवरण' },
  'auth.register.step2': { en: 'Location', hi: 'स्थान' },
  'auth.register.step3': { en: 'Bank Details', hi: 'बैंक विवरण' },
  'auth.register.name': { en: 'Full Name', hi: 'पूरा नाम' },
  'auth.register.aadhaar': { en: 'Aadhaar Number', hi: 'आधार नंबर' },
  'auth.register.state': { en: 'State', hi: 'राज्य' },
  'auth.register.district': { en: 'District', hi: 'जिला' },
  'auth.register.village': { en: 'Village', hi: 'गाँव' },
  'auth.register.bankName': { en: 'Bank Name', hi: 'बैंक का नाम' },
  'auth.register.accountNo': { en: 'Account Number', hi: 'खाता संख्या' },
  'auth.register.ifsc': { en: 'IFSC Code', hi: 'IFSC कोड' },
  'auth.register.next': { en: 'Next', hi: 'आगे' },
  'auth.register.prev': { en: 'Previous', hi: 'पीछे' },
  'auth.register.submit': { en: 'Create Account', hi: 'खाता बनाएं' },
  'auth.register.hasAccount': { en: 'Already have an account?', hi: 'पहले से खाता है?' },

  // Dashboard
  'dashboard.welcome': { en: 'Welcome', hi: 'नमस्ते' },
  'dashboard.welcomeSuffix': { en: '', hi: 'जी' },
  'dashboard.quickActions': { en: 'Quick Actions', hi: 'त्वरित कार्य' },
  'dashboard.bookSlot': { en: 'Book a Slot', hi: 'स्लॉट बुक करें' },
  'dashboard.bookSlotDesc': { en: 'Find a center and book your procurement appointment', hi: 'केंद्र खोजें और अपनी खरीद अपॉइंटमेंट बुक करें' },
  'dashboard.findCenters': { en: 'Find Centers', hi: 'केंद्र खोजें' },
  'dashboard.findCentersDesc': { en: 'Browse nearby procurement centers and their schedules', hi: 'नज़दीकी खरीद केंद्र और उनकी अनुसूची देखें' },
  'dashboard.trackStatus': { en: 'Track Procurement', hi: 'खरीद ट्रैक करें' },
  'dashboard.trackStatusDesc': { en: 'Check the status of your current crop procurement', hi: 'अपनी वर्तमान फसल खरीद की स्थिति जांचें' },
  'dashboard.payments': { en: 'Payment History', hi: 'भुगतान इतिहास' },
  'dashboard.paymentsDesc': { en: 'View all your procurement payments and receipts', hi: 'अपने सभी खरीद भुगतान और रसीदें देखें' },
  'dashboard.activeBooking': { en: 'Active Booking', hi: 'सक्रिय बुकिंग' },
  'dashboard.noActiveBooking': { en: 'No active booking. Book a slot to get started!', hi: 'कोई सक्रिय बुकिंग नहीं। शुरू करने के लिए स्लॉट बुक करें!' },
  'dashboard.recentActivity': { en: 'Recent Activity', hi: 'हालिया गतिविधि' },
  'dashboard.tokenNumber': { en: 'Token Number', hi: 'टोकन नंबर' },
  'dashboard.queuePosition': { en: 'Queue Position', hi: 'कतार में स्थिति' },
  'dashboard.estimatedWait': { en: 'Estimated Wait', hi: 'अनुमानित प्रतीक्षा' },
  'dashboard.minutes': { en: 'minutes', hi: 'मिनट' },

  // Centers
  'centers.title': { en: 'Procurement Centers', hi: 'खरीद केंद्र' },
  'centers.subtitle': { en: 'Find and book procurement slots at centers near you', hi: 'अपने पास के केंद्रों पर खरीद स्लॉट खोजें और बुक करें' },
  'centers.search': { en: 'Search by name or location...', hi: 'नाम या स्थान से खोजें...' },
  'centers.filterCrop': { en: 'Filter by Crop', hi: 'फसल से फ़िल्टर करें' },
  'centers.allCrops': { en: 'All Crops', hi: 'सभी फसलें' },
  'centers.distance': { en: 'Distance', hi: 'दूरी' },
  'centers.km': { en: 'km', hi: 'कि.मी.' },
  'centers.capacity': { en: 'Daily Capacity', hi: 'दैनिक क्षमता' },
  'centers.availableSlots': { en: 'Available Slots', hi: 'उपलब्ध स्लॉट' },
  'centers.waitTime': { en: 'Current Wait', hi: 'वर्तमान प्रतीक्षा' },
  'centers.open': { en: 'Open', hi: 'खुला' },
  'centers.closed': { en: 'Closed', hi: 'बंद' },
  'centers.bookNow': { en: 'Book Slot', hi: 'स्लॉट बुक करें' },
  'centers.viewDetails': { en: 'View Details', hi: 'विवरण देखें' },
  'centers.crowdLevel': { en: 'Crowd Level', hi: 'भीड़ स्तर' },
  'centers.low': { en: 'Low', hi: 'कम' },
  'centers.moderate': { en: 'Moderate', hi: 'मध्यम' },
  'centers.high': { en: 'High', hi: 'अधिक' },
  'centers.cropsAccepted': { en: 'Crops Accepted', hi: 'स्वीकृत फसलें' },
  'centers.timing': { en: 'Timing', hi: 'समय' },
  'centers.selectDate': { en: 'Select Date', hi: 'तारीख चुनें' },
  'centers.selectSlot': { en: 'Select Time Slot', hi: 'समय स्लॉट चुनें' },
  'centers.morning': { en: 'Morning', hi: 'सुबह' },
  'centers.afternoon': { en: 'Afternoon', hi: 'दोपहर' },
  'centers.evening': { en: 'Evening', hi: 'शाम' },
  'centers.full': { en: 'Full', hi: 'भरा हुआ' },
  'centers.available': { en: 'Available', hi: 'उपलब्ध' },
  'centers.confirmBooking': { en: 'Confirm Booking', hi: 'बुकिंग की पुष्टि करें' },
  'centers.bookingSuccess': { en: 'Booking Confirmed!', hi: 'बुकिंग की पुष्टि हो गई!' },
  'centers.yourToken': { en: 'Your Token Number', hi: 'आपका टोकन नंबर' },
  'centers.arrivalTime': { en: 'Arrival Time', hi: 'आगमन समय' },
  'centers.recommended': { en: 'Recommended', hi: 'अनुशंसित' },
  'centers.lessCrowded': { en: 'Less Crowded', hi: 'कम भीड़' },
  'centers.selectCrop': { en: 'Select Crop', hi: 'फसल चुनें' },
  'centers.estimatedQuantity': { en: 'Estimated Quantity (Quintals)', hi: 'अनुमानित मात्रा (क्विंटल)' },

  // Queue
  'queue.title': { en: 'Live Queue Status', hi: 'लाइव कतार स्थिति' },
  'queue.yourToken': { en: 'Your Token', hi: 'आपका टोकन' },
  'queue.currentlyServing': { en: 'Currently Serving', hi: 'अभी सेवा में' },
  'queue.yourPosition': { en: 'Your Position', hi: 'आपकी स्थिति' },
  'queue.estimatedTime': { en: 'Estimated Time', hi: 'अनुमानित समय' },
  'queue.turnApproaching': { en: 'Your turn is approaching! Please head to the center.', hi: 'आपकी बारी आ रही है! कृपया केंद्र पर आएं।' },
  'queue.status.registered': { en: 'Registered', hi: 'पंजीकृत' },
  'queue.status.slotConfirmed': { en: 'Slot Confirmed', hi: 'स्लॉट पुष्ट' },
  'queue.status.arrived': { en: 'Arrived at Center', hi: 'केंद्र पर पहुंचे' },
  'queue.status.qualityCheck': { en: 'Quality Inspection', hi: 'गुणवत्ता जांच' },
  'queue.status.weighing': { en: 'Weighing', hi: 'तौल' },
  'queue.status.accepted': { en: 'Crop Accepted', hi: 'फसल स्वीकृत' },
  'queue.status.paymentProcessing': { en: 'Payment Processing', hi: 'भुगतान प्रक्रिया में' },
  'queue.status.paymentComplete': { en: 'Payment Completed', hi: 'भुगतान पूर्ण' },
  'queue.status.rejected': { en: 'Crop Rejected', hi: 'फसल अस्वीकृत' },

  // Payments
  'payments.title': { en: 'Payment History', hi: 'भुगतान इतिहास' },
  'payments.totalEarned': { en: 'Total Earned', hi: 'कुल कमाई' },
  'payments.pending': { en: 'Pending', hi: 'लंबित' },
  'payments.completed': { en: 'Completed', hi: 'पूर्ण' },
  'payments.recent': { en: 'Recent Payment', hi: 'हालिया भुगतान' },
  'payments.amount': { en: 'Amount', hi: 'राशि' },
  'payments.date': { en: 'Date', hi: 'तारीख' },
  'payments.status': { en: 'Status', hi: 'स्थिति' },
  'payments.crop': { en: 'Crop', hi: 'फसल' },
  'payments.center': { en: 'Center', hi: 'केंद्र' },
  'payments.transactionId': { en: 'Transaction ID', hi: 'लेनदेन आईडी' },
  'payments.credited': { en: 'Credited', hi: 'जमा' },
  'payments.processing': { en: 'Processing', hi: 'प्रक्रिया में' },

  // History
  'history.title': { en: 'Procurement History', hi: 'खरीद इतिहास' },
  'history.season': { en: 'Season', hi: 'सीज़न' },
  'history.totalProcurements': { en: 'Total Procurements', hi: 'कुल खरीद' },
  'history.totalQuantity': { en: 'Total Quantity', hi: 'कुल मात्रा' },
  'history.quintals': { en: 'Quintals', hi: 'क्विंटल' },
  'history.downloadReceipt': { en: 'Download Receipt', hi: 'रसीद डाउनलोड करें' },
  'history.viewDetails': { en: 'View Details', hi: 'विवरण देखें' },

  // Admin
  'admin.title': { en: 'Admin Dashboard', hi: 'एडमिन डैशबोर्ड' },
  'admin.todayOverview': { en: "Today's Overview", hi: 'आज का अवलोकन' },
  'admin.totalSlots': { en: 'Total Slots', hi: 'कुल स्लॉट' },
  'admin.farmersArrived': { en: 'Farmers Arrived', hi: 'किसान पहुंचे' },
  'admin.processed': { en: 'Processed', hi: 'प्रोसेस किया गया' },
  'admin.inQueue': { en: 'In Queue', hi: 'कतार में' },
  'admin.avgProcessTime': { en: 'Avg. Process Time', hi: 'औसत प्रक्रिया समय' },
  'admin.liveQueue': { en: 'Live Queue', hi: 'लाइव कतार' },
  'admin.callNext': { en: 'Call Next', hi: 'अगला बुलाएं' },
  'admin.updateStatus': { en: 'Update Status', hi: 'स्थिति अपडेट करें' },
  'admin.scheduleManagement': { en: 'Schedule Management', hi: 'शेड्यूल प्रबंधन' },
  'admin.addSchedule': { en: 'Add Schedule', hi: 'शेड्यूल जोड़ें' },
  'admin.centerSettings': { en: 'Center Settings', hi: 'केंद्र सेटिंग' },
  'admin.procurementActions': { en: 'Procurement Actions', hi: 'खरीद कार्रवाई' },
  'admin.accept': { en: 'Accept', hi: 'स्वीकार' },
  'admin.reject': { en: 'Reject', hi: 'अस्वीकार' },
  'admin.weight': { en: 'Weight', hi: 'वज़न' },
  'admin.qualityGrade': { en: 'Quality Grade', hi: 'गुणवत्ता ग्रेड' },
  'admin.farmerName': { en: 'Farmer Name', hi: 'किसान का नाम' },
  'admin.tokenNo': { en: 'Token No.', hi: 'टोकन नं.' },
  'admin.cropType': { en: 'Crop Type', hi: 'फसल प्रकार' },
  'admin.action': { en: 'Action', hi: 'कार्रवाई' },
  'admin.hourlyArrivals': { en: 'Hourly Arrivals', hi: 'प्रति घंटा आगमन' },
  'admin.cropDistribution': { en: 'Crop Distribution', hi: 'फसल वितरण' },

  // Crops
  'crop.wheat': { en: 'Wheat', hi: 'गेहूं' },
  'crop.rice': { en: 'Rice', hi: 'धान' },
  'crop.mustard': { en: 'Mustard', hi: 'सरसों' },
  'crop.chana': { en: 'Gram (Chana)', hi: 'चना' },
  'crop.maize': { en: 'Maize', hi: 'मक्का' },
  'crop.soybean': { en: 'Soybean', hi: 'सोयाबीन' },
  'crop.cotton': { en: 'Cotton', hi: 'कपास' },
  'crop.sugarcane': { en: 'Sugarcane', hi: 'गन्ना' },

  // Common
  'common.farmers': { en: 'farmers', hi: 'किसान' },
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'common.save': { en: 'Save', hi: 'सहेजें' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.back': { en: 'Back', hi: 'वापस' },
  'common.viewAll': { en: 'View All', hi: 'सभी देखें' },
  'common.today': { en: 'Today', hi: 'आज' },
  'common.tomorrow': { en: 'Tomorrow', hi: 'कल' },
  'common.per': { en: 'per', hi: 'प्रति' },
  'common.quintal': { en: 'quintal', hi: 'क्विंटल' },
  'common.rs': { en: '₹', hi: '₹' },
  'common.min': { en: 'min', hi: 'मिनट' },
  'common.hrs': { en: 'hrs', hi: 'घंटे' },
  'common.of': { en: 'of', hi: 'में से' },
  'common.no': { en: 'No.', hi: 'नं.' },
  'common.search': { en: 'Search', hi: 'खोजें' },
  'common.filter': { en: 'Filter', hi: 'फ़िल्टर' },
  'common.or': { en: 'or', hi: 'या' },
  'common.and': { en: 'and', hi: 'और' },

  // Footer
  'footer.about': { en: 'About Mandi Mitra', hi: 'मंडी मित्र के बारे में' },
  'footer.aboutDesc': { en: 'A smart digital platform transforming agricultural procurement for Indian farmers. No more long queues, no more uncertainty.', hi: 'भारतीय किसानों के लिए कृषि खरीद को बदलने वाला एक स्मार्ट डिजिटल प्लेटफ़ॉर्म। अब लंबी कतारें नहीं, अनिश्चितता नहीं।' },
  'footer.quickLinks': { en: 'Quick Links', hi: 'त्वरित लिंक' },
  'footer.helpline': { en: 'Farmer Helpline', hi: 'किसान हेल्पलाइन' },
  'footer.support': { en: 'Support', hi: 'सहायता' },
  'footer.privacy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  'footer.terms': { en: 'Terms of Service', hi: 'सेवा की शर्तें' },
  'footer.contact': { en: 'Contact Us', hi: 'संपर्क करें' },
  'footer.copyright': { en: '© 2026 Mandi Mitra. All rights reserved.', hi: '© 2026 मंडी मित्र। सर्वाधिकार सुरक्षित।' },
  'footer.madeWith': { en: 'Made with ❤️ for Indian Farmers', hi: 'भारतीय किसानों के लिए ❤️ से बनाया गया' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation: ${key}`);
      return key;
    }
    return translation[language];
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export type { Language };
