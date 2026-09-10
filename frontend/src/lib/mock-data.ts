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
  tehsil: string;
  tehsilHi: string;
  region?: string;
  regionHi?: string;
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
  { type: 'rice', nameEn: 'Rice', nameHi: 'धान', mspRate: 2320, emoji: '🌾', season: 'Kharif', seasonHi: 'खरीफ', color: '#14532d' },
  { type: 'mustard', nameEn: 'Mustard', nameHi: 'सरसों', mspRate: 5650, emoji: '🌻', season: 'Rabi', seasonHi: 'रबी', color: '#E8A94D' },
  { type: 'chana', nameEn: 'Gram (Chana)', nameHi: 'चना', mspRate: 5440, emoji: '🫘', season: 'Rabi', seasonHi: 'रबी', color: '#C4956A' },
  { type: 'maize', nameEn: 'Maize', nameHi: 'मक्का', mspRate: 2090, emoji: '🌽', season: 'Kharif', seasonHi: 'खरीफ', color: '#D4C12A' },
  { type: 'soybean', nameEn: 'Soybean', nameHi: 'सोयाबीन', mspRate: 4892, emoji: '🫛', season: 'Kharif', seasonHi: 'खरीफ', color: '#8BA85B' },
  { type: 'cotton', nameEn: 'Cotton', nameHi: 'कपास', mspRate: 7121, emoji: '☁️', season: 'Kharif', seasonHi: 'खरीफ', color: '#E8E0D0' },
  { type: 'sugarcane', nameEn: 'Sugarcane', nameHi: 'गन्ना', mspRate: 340, emoji: '🎋', season: 'Annual', seasonHi: 'वार्षिक', color: '#0f3d21' },
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
  // ════════════════════════════════════════════════════════════════
  // 1. INDORE REGION (9 Mandis)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'c-indore-1',
    name: 'Laxmibai Nagar Anaj Mandi',
    nameHi: 'लक्ष्मीबाई नगर अनाज मंडी',
    address: 'Laxmibai Nagar Mandi Yard, Indore, MP 452006',
    addressHi: 'लक्ष्मीबाई नगर मंडी यार्ड, इंदौर, म.प्र. 452006',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Indore',
    tehsilHi: 'इंदौर',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.7483,
    longitude: 75.8569,
    dailyCapacity: 350,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'soybean', 'chana', 'maize'],
    status: 'open',
    currentQueue: 28,
    todayProcessed: 182,
    todayArrived: 210,
    avgProcessingTime: 18,
    distance: 4.2,
    crowdLevel: 'moderate',
    contactPhone: '0731-2410211',
  },
  {
    id: 'c-indore-2',
    name: 'Chhawni Anaj Mandi',
    nameHi: 'छावनी अनाज मंडी',
    address: 'Chhawni Main Road, Indore, MP 452001',
    addressHi: 'छावनी मुख्य मार्ग, इंदौर, म.प्र. 452001',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Indore',
    tehsilHi: 'इंदौर',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.7095,
    longitude: 75.8752,
    dailyCapacity: 300,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'chana', 'soybean'],
    status: 'open',
    currentQueue: 22,
    todayProcessed: 165,
    todayArrived: 187,
    avgProcessingTime: 17,
    distance: 3.5,
    crowdLevel: 'moderate',
    contactPhone: '0731-2420315',
  },
  {
    id: 'c-indore-3',
    name: 'Sanwer Mandi',
    nameHi: 'सांवेर मंडी',
    address: 'Ujjain-Indore Road, Sanwer, MP 453551',
    addressHi: 'उज्जैन-इंदौर रोड, सांवेर, म.प्र. 453551',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Sanwer',
    tehsilHi: 'सांवेर',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.9772,
    longitude: 75.8286,
    dailyCapacity: 220,
    operatingHours: '9:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 18,
    todayProcessed: 110,
    todayArrived: 128,
    avgProcessingTime: 16,
    distance: 18.4,
    crowdLevel: 'low',
    contactPhone: '07321-267120',
  },
  {
    id: 'c-indore-4',
    name: 'Mhow / Dr. Ambedkar Nagar Mandi',
    nameHi: 'महू / डॉ. आंबेडकर नगर मंडी',
    address: 'Old AB Road, Dr. Ambedkar Nagar (Mhow), MP 453441',
    addressHi: 'ओल्ड एबी रोड, डॉ. आंबेडकर नगर (महू), म.प्र. 453441',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Mhow',
    tehsilHi: 'महू',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.5539,
    longitude: 75.7648,
    dailyCapacity: 200,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'maize'],
    status: 'open',
    currentQueue: 15,
    todayProcessed: 95,
    todayArrived: 110,
    avgProcessingTime: 15,
    distance: 21.0,
    crowdLevel: 'low',
    contactPhone: '07324-272230',
  },
  {
    id: 'c-indore-5',
    name: 'Manpur Procurement / Warehouse Hub',
    nameHi: 'मानपुर खरीद एवं वेयरहाउस केंद्र',
    address: 'National Highway 52, Manpur, MP 453661',
    addressHi: 'राष्ट्रीय राजमार्ग 52, मानपुर, म.प्र. 453661',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Manpur',
    tehsilHi: 'मानपुर',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.4332,
    longitude: 75.6334,
    dailyCapacity: 180,
    operatingHours: '9:00 AM - 4:00 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:00',
    cropsAccepted: ['wheat', 'rice'],
    status: 'open',
    currentQueue: 12,
    todayProcessed: 84,
    todayArrived: 96,
    avgProcessingTime: 14,
    distance: 35.2,
    crowdLevel: 'low',
    contactPhone: '07324-284110',
  },
  {
    id: 'c-indore-6',
    name: 'Depalpur Mandi',
    nameHi: 'देपालपुर मंडी',
    address: 'Indore-Depalpur Road, Depalpur, MP 453115',
    addressHi: 'इंदौर-देपालपुर मार्ग, देपालपुर, म.प्र. 453115',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Depalpur',
    tehsilHi: 'देपालपुर',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.8528,
    longitude: 75.5492,
    dailyCapacity: 190,
    operatingHours: '9:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 5:00',
    cropsAccepted: ['soybean', 'wheat', 'chana'],
    status: 'open',
    currentQueue: 14,
    todayProcessed: 98,
    todayArrived: 112,
    avgProcessingTime: 16,
    distance: 28.6,
    crowdLevel: 'low',
    contactPhone: '07322-220140',
  },
  {
    id: 'c-indore-7',
    name: 'Gautampura Mandi',
    nameHi: 'गौतमपुरा मंडी',
    address: 'Station Road, Gautampura, MP 453220',
    addressHi: 'स्टेशन रोड, गौतमपुरा, म.प्र. 453220',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Gautampura',
    tehsilHi: 'गौतमपुरा',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.9833,
    longitude: 75.5167,
    dailyCapacity: 160,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['soybean', 'wheat', 'chana'],
    status: 'open',
    currentQueue: 10,
    todayProcessed: 76,
    todayArrived: 86,
    avgProcessingTime: 15,
    distance: 38.0,
    crowdLevel: 'low',
    contactPhone: '07322-241250',
  },
  {
    id: 'c-indore-8',
    name: 'Betma Mandi',
    nameHi: 'बेतमा मंडी',
    address: 'Dhar-Indore Road, Betma, MP 453001',
    addressHi: 'धार-इंदौर मार्ग, बेतमा, म.प्र. 453001',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Betma',
    tehsilHi: 'बेतमा',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.6842,
    longitude: 75.6174,
    dailyCapacity: 170,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 11,
    todayProcessed: 82,
    todayArrived: 93,
    avgProcessingTime: 15,
    distance: 24.5,
    crowdLevel: 'low',
    contactPhone: '07322-261180',
  },
  {
    id: 'c-indore-9',
    name: 'Hatod Mandi',
    nameHi: 'हातोद मंडी',
    address: 'Hatod Center Square, Hatod, MP 453111',
    addressHi: 'हातोद चौराहा, हातोद, म.प्र. 453111',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Hatod',
    tehsilHi: 'हातोद',
    region: 'Indore Region',
    regionHi: 'इंदौर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 22.7936,
    longitude: 75.7289,
    dailyCapacity: 150,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 9,
    todayProcessed: 70,
    todayArrived: 79,
    avgProcessingTime: 14,
    distance: 14.8,
    crowdLevel: 'low',
    contactPhone: '0731-2892100',
  },

  // ════════════════════════════════════════════════════════════════
  // 2. UJJAIN REGION (5 Mandis)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'c-ujjain-1',
    name: 'Ujjain Krishi Upaj Mandi',
    nameHi: 'उज्जैन कृषि उपज मंडी',
    address: 'Agar Road, Ujjain, MP 456006',
    addressHi: 'आगर रोड, उज्जैन, म.प्र. 456006',
    district: 'Ujjain',
    districtHi: 'उज्जैन',
    tehsil: 'Ujjain',
    tehsilHi: 'उज्जैन',
    region: 'Ujjain Region',
    regionHi: 'उज्जैन संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.1878,
    longitude: 75.7892,
    dailyCapacity: 320,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'soybean', 'chana', 'maize'],
    status: 'open',
    currentQueue: 24,
    todayProcessed: 170,
    todayArrived: 194,
    avgProcessingTime: 18,
    distance: 5.2,
    crowdLevel: 'moderate',
    contactPhone: '0734-2551400',
  },
  {
    id: 'c-ujjain-2',
    name: 'Nagda Mandi',
    nameHi: 'नागदा मंडी',
    address: 'Mandi Yard, Nagda Junction, MP 456335',
    addressHi: 'मंडी यार्ड, नागदा जंक्शन, म.प्र. 456335',
    district: 'Ujjain',
    districtHi: 'उज्जैन',
    tehsil: 'Nagda',
    tehsilHi: 'नागदा',
    region: 'Ujjain Region',
    regionHi: 'उज्जैन संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.4567,
    longitude: 75.4132,
    dailyCapacity: 210,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 16,
    todayProcessed: 104,
    todayArrived: 120,
    avgProcessingTime: 16,
    distance: 42.0,
    crowdLevel: 'low',
    contactPhone: '07366-246220',
  },
  {
    id: 'c-ujjain-3',
    name: 'Mahidpur Mandi',
    nameHi: 'महिदपुर मंडी',
    address: 'Kshipra Marg, Mahidpur, MP 456443',
    addressHi: 'क्षिप्रा मार्ग, महिदपुर, म.प्र. 456443',
    district: 'Ujjain',
    districtHi: 'उज्जैन',
    tehsil: 'Mahidpur',
    tehsilHi: 'महिदपुर',
    region: 'Ujjain Region',
    regionHi: 'उज्जैन संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.4862,
    longitude: 75.6568,
    dailyCapacity: 190,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana', 'maize'],
    status: 'open',
    currentQueue: 13,
    todayProcessed: 88,
    todayArrived: 101,
    avgProcessingTime: 15,
    distance: 36.5,
    crowdLevel: 'low',
    contactPhone: '07365-231120',
  },
  {
    id: 'c-ujjain-4',
    name: 'Khachrod Mandi',
    nameHi: 'खाचरौद मंडी',
    address: 'Ratlam Road, Khachrod, MP 456224',
    addressHi: 'रतलाम रोड, खाचरौद, म.प्र. 456224',
    district: 'Ujjain',
    districtHi: 'उज्जैन',
    tehsil: 'Khachrod',
    tehsilHi: 'खाचरौद',
    region: 'Ujjain Region',
    regionHi: 'उज्जैन संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.4262,
    longitude: 75.2858,
    dailyCapacity: 180,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['soybean', 'wheat', 'chana'],
    status: 'open',
    currentQueue: 12,
    todayProcessed: 80,
    todayArrived: 92,
    avgProcessingTime: 15,
    distance: 52.0,
    crowdLevel: 'low',
    contactPhone: '07366-271300',
  },
  {
    id: 'c-ujjain-5',
    name: 'Tarana Mandi',
    nameHi: 'तराना मंडी',
    address: 'Shajapur Road, Tarana, MP 456665',
    addressHi: 'शाजापुर रोड, तराना, म.प्र. 456665',
    district: 'Ujjain',
    districtHi: 'उज्जैन',
    tehsil: 'Tarana',
    tehsilHi: 'तराना',
    region: 'Ujjain Region',
    regionHi: 'उज्जैन संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.1989,
    longitude: 76.0412,
    dailyCapacity: 175,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana', 'maize'],
    status: 'open',
    currentQueue: 11,
    todayProcessed: 78,
    todayArrived: 89,
    avgProcessingTime: 15,
    distance: 31.0,
    crowdLevel: 'low',
    contactPhone: '07369-234210',
  },

  // ════════════════════════════════════════════════════════════════
  // 3. BHOPAL REGION (4 Mandis)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'c1',
    name: 'Bhopal Krishi Upaj Mandi',
    nameHi: 'भोपाल कृषि उपज मंडी',
    address: 'Karond Mandi Yard, Bhopal, MP 462038',
    addressHi: 'करोंद मंडी यार्ड, भोपाल, म.प्र. 462038',
    district: 'Bhopal',
    districtHi: 'भोपाल',
    tehsil: 'Bhopal',
    tehsilHi: 'भोपाल',
    region: 'Bhopal Region',
    regionHi: 'भोपाल संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.2985,
    longitude: 77.4063,
    dailyCapacity: 350,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'soybean', 'chana', 'maize', 'mustard'],
    status: 'open',
    currentQueue: 22,
    todayProcessed: 156,
    todayArrived: 178,
    avgProcessingTime: 18,
    distance: 3.2,
    crowdLevel: 'moderate',
    contactPhone: '0755-2741200',
  },
  {
    id: 'c-bhopal-2',
    name: 'Berasia Mandi',
    nameHi: 'बैरसिया मंडी',
    address: 'Narsinghgarh Road, Berasia, MP 463106',
    addressHi: 'नरसिंहगढ़ रोड, बैरसिया, म.प्र. 463106',
    district: 'Bhopal',
    districtHi: 'भोपाल',
    tehsil: 'Berasia',
    tehsilHi: 'बैरसिया',
    region: 'Bhopal Region',
    regionHi: 'भोपाल संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.6333,
    longitude: 77.4333,
    dailyCapacity: 190,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 14,
    todayProcessed: 92,
    todayArrived: 106,
    avgProcessingTime: 16,
    distance: 38.2,
    crowdLevel: 'low',
    contactPhone: '07563-272150',
  },
  {
    id: 'c2',
    name: 'Obaidullaganj Mandi',
    nameHi: 'ओबेदुल्लागंज मंडी',
    address: 'Hoshangabad Road, Obaidullaganj, MP 464993',
    addressHi: 'होशंगाबाद मार्ग, ओबेदुल्लागंज, म.प्र. 464993',
    district: 'Raisen',
    districtHi: 'रायसेन (भोपाल क्षेत्र)',
    tehsil: 'Obaidullaganj',
    tehsilHi: 'ओबेदुल्लागंज',
    region: 'Bhopal Region',
    regionHi: 'भोपाल संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.0118,
    longitude: 77.6292,
    dailyCapacity: 210,
    operatingHours: '9:00 AM - 4:00 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:00',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 16,
    todayProcessed: 105,
    todayArrived: 121,
    avgProcessingTime: 15,
    distance: 32.5,
    crowdLevel: 'low',
    contactPhone: '07480-224100',
  },
  {
    id: 'c3',
    name: 'Sehore Mandi',
    nameHi: 'सीहोर कृषि मंडी',
    address: 'Mandi Prangan, Sehore, MP 466001',
    addressHi: 'मंडी प्रांगण, सीहोर, म.प्र. 466001',
    district: 'Sehore',
    districtHi: 'सीहोर (भोपाल क्षेत्र)',
    tehsil: 'Sehore',
    tehsilHi: 'सीहोर',
    region: 'Bhopal Region',
    regionHi: 'भोपाल संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.2006,
    longitude: 77.0855,
    dailyCapacity: 240,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 20,
    todayProcessed: 125,
    todayArrived: 145,
    avgProcessingTime: 16,
    distance: 36.0,
    crowdLevel: 'moderate',
    contactPhone: '07562-224400',
  },

  // ════════════════════════════════════════════════════════════════
  // 4. GWALIOR REGION (4 Mandis)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'c-gwalior-1',
    name: 'Gwalior Krishi Upaj Mandi',
    nameHi: 'ग्वालियर कृषि उपज मंडी',
    address: 'Lashkar Mandi Complex, Gwalior, MP 474001',
    addressHi: 'लश्कर मंडी परिसर, ग्वालियर, म.प्र. 474001',
    district: 'Gwalior',
    districtHi: 'ग्वालियर',
    tehsil: 'Gwalior',
    tehsilHi: 'ग्वालियर',
    region: 'Gwalior Region',
    regionHi: 'ग्वालियर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 26.2183,
    longitude: 78.1828,
    dailyCapacity: 300,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'mustard', 'chana'],
    status: 'open',
    currentQueue: 25,
    todayProcessed: 160,
    todayArrived: 185,
    avgProcessingTime: 18,
    distance: 6.0,
    crowdLevel: 'moderate',
    contactPhone: '0751-2422500',
  },
  {
    id: 'c-gwalior-2',
    name: 'Dabra Mandi',
    nameHi: 'डबरा कृषि मंडी',
    address: 'Station Road, Dabra, MP 475110',
    addressHi: 'स्टेशन रोड, डबरा, म.प्र. 475110',
    district: 'Gwalior',
    districtHi: 'ग्वालियर',
    tehsil: 'Dabra',
    tehsilHi: 'डबरा',
    region: 'Gwalior Region',
    regionHi: 'ग्वालियर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 25.8942,
    longitude: 78.3328,
    dailyCapacity: 230,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'mustard', 'chana'],
    status: 'open',
    currentQueue: 19,
    todayProcessed: 115,
    todayArrived: 134,
    avgProcessingTime: 16,
    distance: 42.5,
    crowdLevel: 'low',
    contactPhone: '07525-222300',
  },
  {
    id: 'c-gwalior-3',
    name: 'Bhitarwar Mandi',
    nameHi: 'भितरवार मंडी',
    address: 'Main Mandi Yard, Bhitarwar, MP 475220',
    addressHi: 'मुख्य मंडी यार्ड, भितरवार, म.प्र. 475220',
    district: 'Gwalior',
    districtHi: 'ग्वालियर',
    tehsil: 'Bhitarwar',
    tehsilHi: 'भितरवार',
    region: 'Gwalior Region',
    regionHi: 'ग्वालियर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 25.8012,
    longitude: 78.1215,
    dailyCapacity: 170,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'mustard', 'chana'],
    status: 'open',
    currentQueue: 11,
    todayProcessed: 80,
    todayArrived: 91,
    avgProcessingTime: 15,
    distance: 55.0,
    crowdLevel: 'low',
    contactPhone: '07525-274110',
  },
  {
    id: 'c-gwalior-4',
    name: 'Morar / Gola Ka Mandir Agricultural Market',
    nameHi: 'मुरार / गोला का मंदिर कृषि बाजार',
    address: 'Gola Ka Mandir Square, Morar, Gwalior, MP 474005',
    addressHi: 'गोला का मंदिर चौराहा, मुरार, ग्वालियर, म.प्र. 474005',
    district: 'Gwalior',
    districtHi: 'ग्वालियर',
    tehsil: 'Gwalior',
    tehsilHi: 'ग्वालियर',
    region: 'Gwalior Region',
    regionHi: 'ग्वालियर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 26.2415,
    longitude: 78.2162,
    dailyCapacity: 220,
    operatingHours: '8:30 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 5:00',
    cropsAccepted: ['wheat', 'mustard', 'maize'],
    status: 'open',
    currentQueue: 17,
    todayProcessed: 108,
    todayArrived: 125,
    avgProcessingTime: 16,
    distance: 7.8,
    crowdLevel: 'low',
    contactPhone: '0751-2361400',
  },

  // ════════════════════════════════════════════════════════════════
  // 5. VIDISHA REGION (4 Mandis)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'c4',
    name: 'Vidisha Krishi Upaj Mandi',
    nameHi: 'विदिशा कृषि उपज मंडी',
    address: 'Ahmedpur Road, Vidisha, MP 464001',
    addressHi: 'अहमदपुर मार्ग, विदिशा, म.प्र. 464001',
    district: 'Vidisha',
    districtHi: 'विदिशा',
    tehsil: 'Vidisha',
    tehsilHi: 'विदिशा',
    region: 'Vidisha Region',
    regionHi: 'विदिशा संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.5251,
    longitude: 77.8081,
    dailyCapacity: 280,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'soybean', 'chana', 'maize'],
    status: 'open',
    currentQueue: 21,
    todayProcessed: 140,
    todayArrived: 161,
    avgProcessingTime: 17,
    distance: 54.0,
    crowdLevel: 'moderate',
    contactPhone: '07592-232150',
  },
  {
    id: 'c-vidisha-2',
    name: 'Ganj Basoda Mandi',
    nameHi: 'गंजबासौदा कृषि मंडी',
    address: 'Mandi Gate, Ganj Basoda, MP 464221',
    addressHi: 'मंडी गेट, गंजबासौदा, म.प्र. 464221',
    district: 'Vidisha',
    districtHi: 'विदिशा',
    tehsil: 'Ganj Basoda',
    tehsilHi: 'गंजबासौदा',
    region: 'Vidisha Region',
    regionHi: 'विदिशा संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.8512,
    longitude: 77.9348,
    dailyCapacity: 250,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 19,
    todayProcessed: 122,
    todayArrived: 141,
    avgProcessingTime: 16,
    distance: 92.0,
    crowdLevel: 'low',
    contactPhone: '07594-220100',
  },
  {
    id: 'c-vidisha-3',
    name: 'Lateri Mandi',
    nameHi: 'लटेरी मंडी',
    address: 'Guna Road, Lateri, MP 464114',
    addressHi: 'गुना रोड, लटेरी, म.प्र. 464114',
    district: 'Vidisha',
    districtHi: 'विदिशा',
    tehsil: 'Lateri',
    tehsilHi: 'लटेरी',
    region: 'Vidisha Region',
    regionHi: 'विदिशा संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 24.0622,
    longitude: 77.3821,
    dailyCapacity: 160,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 10,
    todayProcessed: 74,
    todayArrived: 84,
    avgProcessingTime: 15,
    distance: 120.0,
    crowdLevel: 'low',
    contactPhone: '07590-252120',
  },
  {
    id: 'c-vidisha-4',
    name: 'Sironj Mandi',
    nameHi: 'सिरोंज मंडी',
    address: 'Kila Kothi Road, Sironj, MP 464228',
    addressHi: 'किला कोठी रोड, सिरोंज, म.प्र. 464228',
    district: 'Vidisha',
    districtHi: 'विदिशा',
    tehsil: 'Sironj',
    tehsilHi: 'सिरोंज',
    region: 'Vidisha Region',
    regionHi: 'विदिशा संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 24.1011,
    longitude: 77.6978,
    dailyCapacity: 190,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'soybean', 'chana'],
    status: 'open',
    currentQueue: 13,
    todayProcessed: 90,
    todayArrived: 103,
    avgProcessingTime: 16,
    distance: 115.0,
    crowdLevel: 'low',
    contactPhone: '07591-254200',
  },

  // ════════════════════════════════════════════════════════════════
  // 6. JABALPUR REGION (5 Mandis)
  // ════════════════════════════════════════════════════════════════
  {
    id: 'c-jabalpur-1',
    name: 'Jabalpur Krishi Upaj Mandi',
    nameHi: 'जबलपुर कृषि उपज मंडी',
    address: 'Damoh Road, Jabalpur, MP 482002',
    addressHi: 'दमोह रोड, जबलपुर, म.प्र. 482002',
    district: 'Jabalpur',
    districtHi: 'जबलपुर',
    tehsil: 'Jabalpur',
    tehsilHi: 'जबलपुर',
    region: 'Jabalpur Region',
    regionHi: 'जबलपुर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.1815,
    longitude: 79.9864,
    dailyCapacity: 320,
    operatingHours: '8:00 AM - 5:00 PM',
    operatingHoursHi: 'सुबह 8:00 - शाम 5:00',
    cropsAccepted: ['wheat', 'chana', 'maize', 'rice'],
    status: 'open',
    currentQueue: 24,
    todayProcessed: 162,
    todayArrived: 186,
    avgProcessingTime: 18,
    distance: 8.5,
    crowdLevel: 'moderate',
    contactPhone: '0761-2641200',
  },
  {
    id: 'c-jabalpur-2',
    name: 'Patan Mandi',
    nameHi: 'पाटन कृषि मंडी',
    address: 'Mandi Complex, Patan, MP 483113',
    addressHi: 'मंडी परिसर, पाटन, म.प्र. 483113',
    district: 'Jabalpur',
    districtHi: 'जबलपुर',
    tehsil: 'Patan',
    tehsilHi: 'पाटन',
    region: 'Jabalpur Region',
    regionHi: 'जबलपुर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.2842,
    longitude: 79.7088,
    dailyCapacity: 180,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'chana', 'rice'],
    status: 'open',
    currentQueue: 12,
    todayProcessed: 86,
    todayArrived: 98,
    avgProcessingTime: 15,
    distance: 32.0,
    crowdLevel: 'low',
    contactPhone: '07621-233150',
  },
  {
    id: 'c-jabalpur-3',
    name: 'Majholi Mandi',
    nameHi: 'मझौली मंडी',
    address: 'Katni Road, Majholi, MP 483336',
    addressHi: 'कटनी मार्ग, मझौली, म.प्र. 483336',
    district: 'Jabalpur',
    districtHi: 'जबलपुर',
    tehsil: 'Majholi',
    tehsilHi: 'मझौली',
    region: 'Jabalpur Region',
    regionHi: 'जबलपुर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.5186,
    longitude: 79.9142,
    dailyCapacity: 170,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'chana', 'rice'],
    status: 'open',
    currentQueue: 11,
    todayProcessed: 80,
    todayArrived: 91,
    avgProcessingTime: 15,
    distance: 45.0,
    crowdLevel: 'low',
    contactPhone: '07624-276110',
  },
  {
    id: 'c-jabalpur-4',
    name: 'Sihora / Sehora Mandi',
    nameHi: 'सिहोरा मंडी',
    address: 'NH 30, Sihora, MP 483225',
    addressHi: 'एनएच 30, सिहोरा, म.प्र. 483225',
    district: 'Jabalpur',
    districtHi: 'जबलपुर',
    tehsil: 'Sihora',
    tehsilHi: 'सिहोरा',
    region: 'Jabalpur Region',
    regionHi: 'जबलपुर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.4872,
    longitude: 80.1121,
    dailyCapacity: 200,
    operatingHours: '8:30 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 8:30 - शाम 4:30',
    cropsAccepted: ['wheat', 'chana', 'maize'],
    status: 'open',
    currentQueue: 15,
    todayProcessed: 96,
    todayArrived: 111,
    avgProcessingTime: 16,
    distance: 41.5,
    crowdLevel: 'low',
    contactPhone: '07625-230100',
  },
  {
    id: 'c-jabalpur-5',
    name: 'Panagar Mandi',
    nameHi: 'पनागर मंडी',
    address: 'Jabalpur-Katni Highway, Panagar, MP 483220',
    addressHi: 'जबलपुर-कटनी राजमार्ग, पनागर, म.प्र. 483220',
    district: 'Jabalpur',
    districtHi: 'जबलपुर',
    tehsil: 'Panagar',
    tehsilHi: 'पनागर',
    region: 'Jabalpur Region',
    regionHi: 'जबलपुर संभाग',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    latitude: 23.2978,
    longitude: 80.0022,
    dailyCapacity: 190,
    operatingHours: '9:00 AM - 4:30 PM',
    operatingHoursHi: 'सुबह 9:00 - शाम 4:30',
    cropsAccepted: ['wheat', 'rice', 'chana'],
    status: 'open',
    currentQueue: 13,
    todayProcessed: 91,
    todayArrived: 104,
    avgProcessingTime: 15,
    distance: 16.2,
    crowdLevel: 'low',
    contactPhone: '0761-2831250',
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
