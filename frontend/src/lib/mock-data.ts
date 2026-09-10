// Mock data for Mandi Mitra — realistic Indian agricultural procurement data

export interface Farmer {
  id: string;
  name: string;
  nameHi: string;
  phone: string;
  village: string;
  villageHi: string;
  district: string;
  districtHi: string;
  state: string;
  stateHi: string;
  aadhaarLast4: string;
  bankName: string;
  accountLast4: string;
  photo: string;
  registeredAt: string;
}

export interface ProcurementCenter {
  id: string;
  name: string;
  nameHi: string;
  address: string;
  addressHi: string;
  district: string;
  districtHi: string;
  state: string;
  stateHi: string;
  latitude: number;
  longitude: number;
  dailyCapacity: number;
  operatingHours: string;
  operatingHoursHi: string;
  cropsAccepted: CropType[];
  status: 'open' | 'closed';
  currentQueue: number;
  todayProcessed: number;
  todayArrived: number;
  avgProcessingTime: number; // minutes
  distance?: number; // km from user
  crowdLevel: 'low' | 'moderate' | 'high';
  contactPhone: string;
}

export type CropType = 'wheat' | 'rice' | 'mustard' | 'chana' | 'maize' | 'soybean' | 'cotton' | 'sugarcane';

export interface CropInfo {
  type: CropType;
  nameEn: string;
  nameHi: string;
  mspRate: number; // ₹ per quintal
  emoji: string;
  season: string;
  seasonHi: string;
  color: string;
}

export interface Slot {
  id: string;
  centerId: string;
  date: string;
  startTime: string;
  endTime: string;
  period: 'morning' | 'afternoon' | 'evening';
  maxFarmers: number;
  bookedCount: number;
  status: 'available' | 'full' | 'closed';
}

export interface Booking {
  id: string;
  farmerId: string;
  centerId: string;
  slotId: string;
  tokenNumber: number;
  qrCode: string;
  cropType: CropType;
  estimatedQuantity: number; // quintals
  status: 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
  bookedAt: string;
  date: string;
  slotTime: string;
}

export interface ProcurementRecord {
  id: string;
  bookingId: string;
  farmerId: string;
  centerId: string;
  cropType: CropType;
  quantityQuintals: number;
  qualityGrade: 'A' | 'B' | 'C';
  mspRate: number;
  totalAmount: number;
  status: 'registered' | 'slot-confirmed' | 'arrived' | 'quality-check' | 'weighing' | 'accepted' | 'rejected' | 'payment-processing' | 'payment-completed';
  createdAt: string;
  completedAt?: string;
  rejectionReason?: string;
}

export interface Payment {
  id: string;
  procurementId: string;
  farmerId: string;
  amount: number;
  paymentMode: string;
  transactionRef: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: string;
  bankName: string;
}

export interface Notification {
  id: string;
  farmerId: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  read: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  farmerName: string;
  farmerNameHi: string;
  village: string;
  villageHi: string;
  photo: string;
  quote: string;
  quoteHi: string;
  rating: number;
}

// --- CROP DATA ---

export const crops: CropInfo[] = [
  { type: 'wheat', nameEn: 'Wheat', nameHi: 'गेहूं', mspRate: 2275, emoji: '🌾', season: 'Rabi', seasonHi: 'रबी', color: '#D4912A' },
  { type: 'rice', nameEn: 'Rice', nameHi: 'धान', mspRate: 2320, emoji: '🌾', season: 'Kharif', seasonHi: 'खरीफ', color: '#6B9F5B' },
  { type: 'mustard', nameEn: 'Mustard', nameHi: 'सरसों', mspRate: 5650, emoji: '🌻', season: 'Rabi', seasonHi: 'रबी', color: '#E8A94D' },
  { type: 'chana', nameEn: 'Gram (Chana)', nameHi: 'चना', mspRate: 5440, emoji: '🫘', season: 'Rabi', seasonHi: 'रबी', color: '#C4956A' },
  { type: 'maize', nameEn: 'Maize', nameHi: 'मक्का', mspRate: 2090, emoji: '🌽', season: 'Kharif', seasonHi: 'खरीफ', color: '#D4C12A' },
  { type: 'soybean', nameEn: 'Soybean', nameHi: 'सोयाबीन', mspRate: 4892, emoji: '🫛', season: 'Kharif', seasonHi: 'खरीफ', color: '#8BA85B' },
  { type: 'cotton', nameEn: 'Cotton', nameHi: 'कपास', mspRate: 7121, emoji: '☁️', season: 'Kharif', seasonHi: 'खरीफ', color: '#E8E0D0' },
  { type: 'sugarcane', nameEn: 'Sugarcane', nameHi: 'गन्ना', mspRate: 340, emoji: '🎋', season: 'Annual', seasonHi: 'वार्षिक', color: '#5B9F3B' },
];

// --- FARMERS ---

export const farmers: Farmer[] = [
  {
    id: 'f1',
    name: 'Ramesh Kumar',
    nameHi: 'रमेश कुमार',
    phone: '9876543210',
    village: 'Jatpura',
    villageHi: 'जाटपुरा',
    district: 'Bhopal',
    districtHi: 'भोपाल',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    aadhaarLast4: '4521',
    bankName: 'State Bank of India',
    accountLast4: '7890',
    photo: '/images/farmers/farmer1.jpg',
    registeredAt: '2025-03-15',
  },
  {
    id: 'f2',
    name: 'Sunita Devi',
    nameHi: 'सुनीता देवी',
    phone: '9812345678',
    village: 'Raisen',
    villageHi: 'रायसेन',
    district: 'Raisen',
    districtHi: 'रायसेन',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    aadhaarLast4: '8834',
    bankName: 'Punjab National Bank',
    accountLast4: '3456',
    photo: '/images/farmers/farmer2.jpg',
    registeredAt: '2025-06-20',
  },
  {
    id: 'f3',
    name: 'Harbhajan Singh',
    nameHi: 'हरभजन सिंह',
    phone: '9898765432',
    village: 'Khanna',
    villageHi: 'खन्ना',
    district: 'Ludhiana',
    districtHi: 'लुधियाना',
    state: 'Punjab',
    stateHi: 'पंजाब',
    aadhaarLast4: '1234',
    bankName: 'Bank of Baroda',
    accountLast4: '5678',
    photo: '/images/farmers/farmer3.jpg',
    registeredAt: '2025-01-10',
  },
  {
    id: 'f4',
    name: 'Mohan Lal',
    nameHi: 'मोहन लाल',
    phone: '9845612378',
    village: 'Sehore',
    villageHi: 'सीहोर',
    district: 'Sehore',
    districtHi: 'सीहोर',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    aadhaarLast4: '6789',
    bankName: 'Central Bank of India',
    accountLast4: '2345',
    photo: '/images/farmers/farmer1.jpg',
    registeredAt: '2025-04-22',
  },
  {
    id: 'f5',
    name: 'Geeta Bai',
    nameHi: 'गीता बाई',
    phone: '9823456789',
    village: 'Vidisha',
    villageHi: 'विदिशा',
    district: 'Vidisha',
    districtHi: 'विदिशा',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    aadhaarLast4: '5432',
    bankName: 'Bank of India',
    accountLast4: '8901',
    photo: '/images/farmers/farmer2.jpg',
    registeredAt: '2025-07-05',
  },
];

// --- PROCUREMENT CENTERS ---

export const procurementCenters: ProcurementCenter[] = [
  {
    id: 'c1',
    name: 'Bhopal Central Mandi',
    nameHi: 'भोपाल सेंट्रल मंडी',
    address: 'Near Bus Stand, Bhopal, MP 462001',
    addressHi: 'बस स्टैंड के पास, भोपाल, म.प्र. 462001',
    district: 'Bhopal',
    districtHi: 'भोपाल',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.2599,
    longitude: 77.4126,
    dailyCapacity: 200,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'chana', 'mustard', 'soybean'],
    status: 'open',
    currentQueue: 22,
    todayProcessed: 156,
    todayArrived: 178,
    avgProcessingTime: 18,
    distance: 3.2,
    crowdLevel: 'moderate',
    contactPhone: '0755-2550100',
  },
  {
    id: 'c2',
    name: 'Raisen Krishi Mandi',
    nameHi: 'रायसेन कृषि मंडी',
    address: 'Station Road, Raisen, MP 464551',
    addressHi: 'स्टेशन रोड, रायसेन, म.प्र. 464551',
    district: 'Raisen',
    districtHi: 'रायसेन',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.3315,
    longitude: 77.7868,
    dailyCapacity: 150,
    operatingHours: '9:00 AM - 4:00 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:00',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 8,
    todayProcessed: 67,
    todayArrived: 75,
    avgProcessingTime: 15,
    distance: 7.5,
    crowdLevel: 'low',
    contactPhone: '07482-222100',
  },
  {
    id: 'c3',
    name: 'Sehore Procurement Center',
    nameHi: 'सीहोर खरीद केंद्र',
    address: 'Mandi Road, Sehore, MP 466001',
    addressHi: 'मंडी रोड, सीहोर, म.प्र. 466001',
    district: 'Sehore',
    districtHi: 'सीहोर',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.2006,
    longitude: 77.0855,
    dailyCapacity: 180,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'rice', 'mustard', 'maize'],
    status: 'open',
    currentQueue: 45,
    todayProcessed: 120,
    todayArrived: 165,
    avgProcessingTime: 22,
    distance: 12.3,
    crowdLevel: 'high',
    contactPhone: '07562-234500',
  },
  {
    id: 'c4',
    name: 'Vidisha Agricultural Market',
    nameHi: 'विदिशा कृषि मार्केट',
    address: 'Ganj Basoda Road, Vidisha, MP 464001',
    addressHi: 'गंज बासोदा रोड, विदिशा, म.प्र. 464001',
    district: 'Vidisha',
    districtHi: 'विदिशा',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.5252,
    longitude: 77.8081,
    dailyCapacity: 120,
    operatingHours: '9:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'chana', 'mustard'],
    status: 'open',
    currentQueue: 12,
    todayProcessed: 45,
    todayArrived: 57,
    avgProcessingTime: 20,
    distance: 18.6,
    crowdLevel: 'low',
    contactPhone: '07592-234100',
  },
  {
    id: 'c5',
    name: 'Hoshangabad Narmada Mandi',
    nameHi: 'होशंगाबाद नर्मदा मंडी',
    address: 'NH-69, Hoshangabad, MP 461001',
    addressHi: 'एनएच-69, होशंगाबाद, म.प्र. 461001',
    district: 'Hoshangabad',
    districtHi: 'होशंगाबाद',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.7467,
    longitude: 77.7307,
    dailyCapacity: 160,
    operatingHours: '8:00 AM - 4:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 4:00',
    cropsAccepted: ['wheat', 'soybean', 'cotton', 'sugarcane'],
    status: 'closed',
    currentQueue: 0,
    todayProcessed: 0,
    todayArrived: 0,
    avgProcessingTime: 0,
    distance: 25.1,
    crowdLevel: 'low',
    contactPhone: '07574-252100',
  },
  {
    id: 'c6',
    name: 'Ludhiana Grain Market',
    nameHi: 'लुधियाना अनाज मार्केट',
    address: 'GT Road, Ludhiana, Punjab 141001',
    addressHi: 'जीटी रोड, लुधियाना, पंजाब 141001',
    district: 'Ludhiana',
    districtHi: 'लुधियाना',
    state: 'Punjab',
    stateHi: 'पंजाब',
    latitude: 30.9010,
    longitude: 75.8573,
    dailyCapacity: 300,
    operatingHours: '7:00 AM - 6:00 PM',
    operatingHoursHi: 'सुबह 7:00 - शाम 6:00',
    cropsAccepted: ['wheat', 'rice', 'maize', 'cotton'],
    status: 'open',
    currentQueue: 35,
    todayProcessed: 210,
    todayArrived: 245,
    avgProcessingTime: 16,
    distance: 5.8,
    crowdLevel: 'moderate',
    contactPhone: '0161-2741100',
  },
];

// --- SLOTS ---

function generateSlots(centerId: string, dateStr: string): Slot[] {
  const slots: Slot[] = [];
  const timeSlots = [
    { start: '08:00', end: '09:30', period: 'morning' as const },
    { start: '09:30', end: '11:00', period: 'morning' as const },
    { start: '11:00', end: '12:30', period: 'morning' as const },
    { start: '12:30', end: '14:00', period: 'afternoon' as const },
    { start: '14:00', end: '15:30', period: 'afternoon' as const },
    { start: '15:30', end: '17:00', period: 'evening' as const },
  ];

  timeSlots.forEach((ts, idx) => {
    const maxFarmers = 30 + Math.floor(Math.random() * 10);
    const bookedCount = Math.floor(Math.random() * maxFarmers);
    slots.push({
      id: `${centerId}-${dateStr}-${idx}`,
      centerId,
      date: dateStr,
      startTime: ts.start,
      endTime: ts.end,
      period: ts.period,
      maxFarmers,
      bookedCount,
      status: bookedCount >= maxFarmers ? 'full' : 'available',
    });
  });

  // Make some slots full for realism
  if (slots.length > 0) {
    slots[0].bookedCount = slots[0].maxFarmers;
    slots[0].status = 'full';
  }
  if (slots.length > 1) {
    slots[1].bookedCount = slots[1].maxFarmers;
    slots[1].status = 'full';
  }

  return slots;
}

// Generate slots for the next 7 days
export function getSlotsForCenter(centerId: string): Slot[] {
  const allSlots: Slot[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    // Skip Sundays
    if (date.getDay() === 0) continue;
    const dateStr = date.toISOString().split('T')[0];
    allSlots.push(...generateSlots(centerId, dateStr));
  }

  return allSlots;
}

// --- BOOKINGS ---

export const activeBooking: Booking = {
  id: 'b1',
  farmerId: 'f1',
  centerId: 'c1',
  slotId: 'c1-2026-09-08-2',
  tokenNumber: 83,
  qrCode: 'MM-B1-TKN83-C1',
  cropType: 'wheat',
  estimatedQuantity: 52,
  status: 'confirmed',
  bookedAt: '2026-09-06T08:30:00',
  date: '2026-09-08',
  slotTime: '11:00 - 12:30',
};

export const bookings: Booking[] = [
  activeBooking,
  {
    id: 'b2',
    farmerId: 'f1',
    centerId: 'c2',
    slotId: 'c2-2026-08-20-1',
    tokenNumber: 45,
    qrCode: 'MM-B2-TKN45-C2',
    cropType: 'soybean',
    estimatedQuantity: 30,
    status: 'completed',
    bookedAt: '2026-08-18T10:00:00',
    date: '2026-08-20',
    slotTime: '09:30 - 11:00',
  },
  {
    id: 'b3',
    farmerId: 'f1',
    centerId: 'c1',
    slotId: 'c1-2026-07-15-3',
    tokenNumber: 112,
    qrCode: 'MM-B3-TKN112-C1',
    cropType: 'chana',
    estimatedQuantity: 25,
    status: 'completed',
    bookedAt: '2026-07-14T14:00:00',
    date: '2026-07-15',
    slotTime: '12:30 - 14:00',
  },
];

// --- PROCUREMENT RECORDS ---

export const procurementRecords: ProcurementRecord[] = [
  {
    id: 'p1',
    bookingId: 'b1',
    farmerId: 'f1',
    centerId: 'c1',
    cropType: 'wheat',
    quantityQuintals: 52,
    qualityGrade: 'A',
    mspRate: 2275,
    totalAmount: 118300,
    status: 'slot-confirmed',
    createdAt: '2026-09-06T08:30:00',
  },
  {
    id: 'p2',
    bookingId: 'b2',
    farmerId: 'f1',
    centerId: 'c2',
    cropType: 'soybean',
    quantityQuintals: 28.5,
    qualityGrade: 'A',
    mspRate: 4892,
    totalAmount: 139422,
    status: 'payment-completed',
    createdAt: '2026-08-20T09:30:00',
    completedAt: '2026-08-25T16:00:00',
  },
  {
    id: 'p3',
    bookingId: 'b3',
    farmerId: 'f1',
    centerId: 'c1',
    cropType: 'chana',
    quantityQuintals: 24,
    qualityGrade: 'B',
    mspRate: 5440,
    totalAmount: 130560,
    status: 'payment-completed',
    createdAt: '2026-07-15T12:30:00',
    completedAt: '2026-07-22T11:00:00',
  },
];

// --- PAYMENTS ---

export const payments: Payment[] = [
  {
    id: 'pay1',
    procurementId: 'p2',
    farmerId: 'f1',
    amount: 139422,
    paymentMode: 'NEFT',
    transactionRef: 'NEFT20260825SBI7890',
    status: 'completed',
    processedAt: '2026-08-25T16:00:00',
    bankName: 'State Bank of India',
  },
  {
    id: 'pay2',
    procurementId: 'p3',
    farmerId: 'f1',
    amount: 130560,
    paymentMode: 'NEFT',
    transactionRef: 'NEFT20260722SBI7890',
    status: 'completed',
    processedAt: '2026-07-22T11:00:00',
    bankName: 'State Bank of India',
  },
];

// --- NOTIFICATIONS ---

export const notifications: Notification[] = [
  {
    id: 'n1',
    farmerId: 'f1',
    title: 'Booking Confirmed',
    titleHi: 'बुकिंग की पुष्टि',
    message: 'Your slot for Wheat procurement at Bhopal Central Mandi on Sep 8, 11:00 AM is confirmed. Token: 83',
    messageHi: 'भोपाल सेंट्रल मंडी में 8 सितंबर, 11:00 बजे गेहूं खरीद के लिए आपका स्लॉट पुष्ट है। टोकन: 83',
    type: 'success',
    read: false,
    createdAt: '2026-09-06T08:30:00',
  },
  {
    id: 'n2',
    farmerId: 'f1',
    title: 'Payment Received',
    titleHi: 'भुगतान प्राप्त',
    message: '₹1,39,422 credited to your SBI account for Soybean procurement. Ref: NEFT20260825SBI7890',
    messageHi: 'सोयाबीन खरीद के लिए ₹1,39,422 आपके SBI खाते में जमा। रेफ: NEFT20260825SBI7890',
    type: 'success',
    read: true,
    createdAt: '2026-08-25T16:00:00',
  },
  {
    id: 'n3',
    farmerId: 'f1',
    title: 'Procurement Season Open',
    titleHi: 'खरीद सीज़न शुरू',
    message: 'Wheat procurement (Rabi 2026) has started in Bhopal district. Book your slot now!',
    messageHi: 'भोपाल जिले में गेहूं खरीद (रबी 2026) शुरू हो गई है। अभी अपना स्लॉट बुक करें!',
    type: 'info',
    read: true,
    createdAt: '2026-09-01T09:00:00',
  },
  {
    id: 'n4',
    farmerId: 'f1',
    title: 'Reminder',
    titleHi: 'रिमाइंडर',
    message: 'Your procurement appointment is tomorrow at 11:00 AM at Bhopal Central Mandi. Please carry your Aadhaar and Farmer ID.',
    messageHi: 'आपकी खरीद अपॉइंटमेंट कल सुबह 11:00 बजे भोपाल सेंट्रल मंडी में है। कृपया अपना आधार और किसान आईडी लेकर आएं।',
    type: 'warning',
    read: false,
    createdAt: '2026-09-07T18:00:00',
  },
];

// --- TESTIMONIALS ---

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    farmerName: 'Ramesh Kumar',
    farmerNameHi: 'रमेश कुमार',
    village: 'Jatpura, Bhopal',
    villageHi: 'जाटपुरा, भोपाल',
    photo: '/images/farmers/farmer1.jpg',
    quote: 'Earlier I used to wait 6-7 hours at the mandi. Now I book my slot from home and reach on time. Life has become so much easier!',
    quoteHi: 'पहले मैं मंडी में 6-7 घंटे इंतज़ार करता था। अब घर से स्लॉट बुक करता हूं और समय पर पहुंचता हूं। ज़िंदगी बहुत आसान हो गई है!',
    rating: 5,
  },
  {
    id: 't2',
    farmerName: 'Sunita Devi',
    farmerNameHi: 'सुनीता देवी',
    village: 'Raisen',
    villageHi: 'रायसेन',
    photo: '/images/farmers/farmer2.jpg',
    quote: 'As a woman farmer, waiting at the mandi was very difficult. Mandi Mitra lets me plan my visit perfectly. I can track my payment too!',
    quoteHi: 'एक महिला किसान के रूप में, मंडी में इंतज़ार करना बहुत मुश्किल था। मंडी मित्र से मैं अपनी विज़िट की योजना बना सकती हूं। भुगतान भी ट्रैक कर सकती हूं!',
    rating: 5,
  },
  {
    id: 't3',
    farmerName: 'Harbhajan Singh',
    farmerNameHi: 'हरभजन सिंह',
    village: 'Khanna, Ludhiana',
    villageHi: 'खन्ना, लुधियाना',
    photo: '/images/farmers/farmer3.jpg',
    quote: 'I\'ve been farming for 40 years. This is the first time I feel like the system respects our time. Very good initiative by the government.',
    quoteHi: '40 साल से खेती कर रहा हूं। पहली बार लगा कि सिस्टम हमारे समय की कदर करता है। सरकार की बहुत अच्छी पहल है।',
    rating: 5,
  },
];

// --- ADMIN: Queue data for live queue management ---

export interface QueueEntry {
  tokenNumber: number;
  farmerName: string;
  farmerNameHi: string;
  cropType: CropType;
  quantity: number;
  status: 'waiting' | 'in-progress' | 'completed';
  arrivalTime: string;
  phone: string;
}

export const adminQueueData: QueueEntry[] = [
  { tokenNumber: 78, farmerName: 'Suresh Patel', farmerNameHi: 'सुरेश पटेल', cropType: 'wheat', quantity: 45, status: 'in-progress', arrivalTime: '09:15', phone: '9876123450' },
  { tokenNumber: 79, farmerName: 'Kamal Singh', farmerNameHi: 'कमल सिंह', cropType: 'wheat', quantity: 32, status: 'waiting', arrivalTime: '09:30', phone: '9876123451' },
  { tokenNumber: 80, farmerName: 'Priya Sharma', farmerNameHi: 'प्रिया शर्मा', cropType: 'chana', quantity: 18, status: 'waiting', arrivalTime: '09:45', phone: '9876123452' },
  { tokenNumber: 81, farmerName: 'Devendra Yadav', farmerNameHi: 'देवेंद्र यादव', cropType: 'mustard', quantity: 22, status: 'waiting', arrivalTime: '10:00', phone: '9876123453' },
  { tokenNumber: 82, farmerName: 'Lakshmi Bai', farmerNameHi: 'लक्ष्मी बाई', cropType: 'wheat', quantity: 38, status: 'waiting', arrivalTime: '10:15', phone: '9876123454' },
  { tokenNumber: 83, farmerName: 'Ramesh Kumar', farmerNameHi: 'रमेश कुमार', cropType: 'wheat', quantity: 52, status: 'waiting', arrivalTime: '11:00', phone: '9876543210' },
  { tokenNumber: 84, farmerName: 'Anil Verma', farmerNameHi: 'अनिल वर्मा', cropType: 'soybean', quantity: 28, status: 'waiting', arrivalTime: '11:15', phone: '9876123456' },
  { tokenNumber: 85, farmerName: 'Meena Kumari', farmerNameHi: 'मीना कुमारी', cropType: 'wheat', quantity: 35, status: 'waiting', arrivalTime: '11:30', phone: '9876123457' },
];

// --- ADMIN: Chart data ---

export const hourlyArrivalsData = [
  { hour: '7AM', arrivals: 12 },
  { hour: '8AM', arrivals: 28 },
  { hour: '9AM', arrivals: 45 },
  { hour: '10AM', arrivals: 38 },
  { hour: '11AM', arrivals: 32 },
  { hour: '12PM', arrivals: 18 },
  { hour: '1PM', arrivals: 8 },
  { hour: '2PM', arrivals: 22 },
  { hour: '3PM', arrivals: 15 },
  { hour: '4PM', arrivals: 8 },
];

export const cropDistributionData = [
  { name: 'Wheat', nameHi: 'गेहूं', value: 45, color: '#D4912A' },
  { name: 'Chana', nameHi: 'चना', value: 20, color: '#C4956A' },
  { name: 'Soybean', nameHi: 'सोयाबीन', value: 18, color: '#8BA85B' },
  { name: 'Mustard', nameHi: 'सरसों', value: 12, color: '#E8A94D' },
  { name: 'Others', nameHi: 'अन्य', value: 5, color: '#A89878' },
];

// --- HELPER FUNCTIONS ---

export function getCropInfo(type: CropType): CropInfo {
  return crops.find(c => c.type === type) || crops[0];
}

export function getCenterById(id: string): ProcurementCenter | undefined {
  return procurementCenters.find(c => c.id === id);
}

export function getFarmerById(id: string): Farmer | undefined {
  return farmers.find(f => f.id === id);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, lang: 'en' | 'hi' = 'en'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getRelativeTime(dateStr: string, lang: 'en' | 'hi' = 'en'): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (lang === 'hi') {
    if (diffMins < 1) return 'अभी';
    if (diffMins < 60) return `${diffMins} मिनट पहले`;
    if (diffHours < 24) return `${diffHours} घंटे पहले`;
    if (diffDays < 7) return `${diffDays} दिन पहले`;
    return formatDate(dateStr, 'hi');
  }

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hrs ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr, 'en');
}

// Current logged-in farmer (for demo)
export const currentFarmer = farmers[0]; // Ramesh Kumar
