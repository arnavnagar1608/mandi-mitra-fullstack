-- ============================================================================
-- MANDI MITRA — COMPLETE SUPABASE DATABASE SETUP & SCHEMA
-- ============================================================================
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/nkpbmmriyuslpwdcnptk
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "+ New Query"
-- 4. Paste ALL contents of this file and click "Run" (or Ctrl+Enter)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. TABLE: farmers (Farmer Profiles & Identification)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    name_hi VARCHAR(150),
    phone VARCHAR(20) UNIQUE NOT NULL,
    village VARCHAR(150) DEFAULT 'Gram Panchayat',
    village_hi VARCHAR(150) DEFAULT 'ग्राम पंचायत',
    district VARCHAR(100) DEFAULT 'Bhopal',
    district_hi VARCHAR(100) DEFAULT 'भोपाल',
    state VARCHAR(100) DEFAULT 'Madhya Pradesh',
    state_hi VARCHAR(100) DEFAULT 'मध्य प्रदेश',
    aadhaar_last4 VARCHAR(4) DEFAULT '1234',
    farmer_id VARCHAR(50) UNIQUE,
    bank_name VARCHAR(150) DEFAULT 'State Bank of India',
    account_last4 VARCHAR(10) DEFAULT '7890',
    photo TEXT DEFAULT '/images/farmers/farmer1.jpg',
    language_pref VARCHAR(10) DEFAULT 'hi',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: admin_officers (Mandi Secretaries, Quality Checkers & Officers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100),
    designation VARCHAR(100) NOT NULL DEFAULT 'Procurement Officer',
    designation_hi VARCHAR(100) DEFAULT 'खरीद अधिकारी',
    role VARCHAR(50) NOT NULL DEFAULT 'officer',
    assigned_center_id VARCHAR(50) NOT NULL DEFAULT 'center-001',
    center_name VARCHAR(100) DEFAULT 'Indore APMC Main Yard',
    center_name_hi VARCHAR(100) DEFAULT 'इंदौर मंडी मुख्य यार्ड',
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: notifications (Alerts, Token Calls & Payment Notifications)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id VARCHAR(100) REFERENCES public.farmers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255),
    message TEXT NOT NULL,
    message_hi TEXT,
    type VARCHAR(50) DEFAULT 'info',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: crops (Government MSP Crop Catalog)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crops (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NOT NULL,
    msp_rate NUMERIC(10, 2) NOT NULL,
    season VARCHAR(50) NOT NULL,
    season_hi VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#14532d',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: procurement_centers (APMC Mandis & Procurement Depots)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.procurement_centers (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_hi VARCHAR(255),
    district VARCHAR(100) NOT NULL,
    district_hi VARCHAR(100),
    tehsil VARCHAR(100),
    tehsil_hi VARCHAR(100),
    state VARCHAR(100) NOT NULL DEFAULT 'Madhya Pradesh',
    state_hi VARCHAR(100) DEFAULT 'मध्य प्रदेश',
    address TEXT,
    address_hi TEXT,
    phone VARCHAR(20),
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 06:00 PM',
    daily_capacity INTEGER DEFAULT 120,
    current_queue INTEGER DEFAULT 0,
    crowd_level VARCHAR(20) DEFAULT 'low',
    crops_accepted JSONB DEFAULT '["wheat", "chana", "mustard", "soybean"]'::jsonb,
    latitude DOUBLE PRECISION DEFAULT 22.7533,
    longitude DOUBLE PRECISION DEFAULT 75.8711,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: slots (Time Windows & Slot Capacities)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slots (
    id VARCHAR(100) PRIMARY KEY,
    center_id VARCHAR(100) REFERENCES public.procurement_centers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_range VARCHAR(50) NOT NULL,
    max_farmers INTEGER DEFAULT 20,
    booked_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. TABLE: bookings (Farmer Appointments & Digital Tokens)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id VARCHAR(100) PRIMARY KEY,
    farmer_id VARCHAR(100) REFERENCES public.farmers(id) ON DELETE CASCADE,
    center_id VARCHAR(100) REFERENCES public.procurement_centers(id) ON DELETE RESTRICT,
    crop_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    token_number INTEGER NOT NULL,
    estimated_quantity NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    status VARCHAR(50) DEFAULT 'confirmed',
    qr_code_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. TABLE: procurements (Physical Weighment, Quality Check & Parchi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.procurements (
    id VARCHAR(100) PRIMARY KEY,
    booking_id VARCHAR(100) REFERENCES public.bookings(id) ON DELETE SET NULL,
    farmer_id VARCHAR(100) REFERENCES public.farmers(id) ON DELETE CASCADE,
    center_id VARCHAR(100) REFERENCES public.procurement_centers(id) ON DELETE RESTRICT,
    crop_type VARCHAR(50) NOT NULL,
    token_number INTEGER,
    actual_weight NUMERIC(10, 2) NOT NULL,
    moisture_percent NUMERIC(5, 2) DEFAULT 11.5,
    grade VARCHAR(20) DEFAULT 'Grade A',
    status VARCHAR(50) DEFAULT 'completed',
    parchi_number VARCHAR(100) UNIQUE,
    parchi_issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. TABLE: payments (Direct Benefit Transfer (DBT) Records)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id VARCHAR(100) PRIMARY KEY,
    procurement_id VARCHAR(100) REFERENCES public.procurements(id) ON DELETE SET NULL,
    booking_id VARCHAR(100) REFERENCES public.bookings(id) ON DELETE SET NULL,
    farmer_id VARCHAR(100) REFERENCES public.farmers(id) ON DELETE CASCADE,
    crop_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    msp_rate NUMERIC(10, 2) NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL,
    deductions NUMERIC(10, 2) DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'disbursed',
    payment_mode VARCHAR(50) DEFAULT 'DBT / PFMS',
    bank_name VARCHAR(150) DEFAULT 'State Bank of India',
    bank_account_last4 VARCHAR(10) DEFAULT '7890',
    utr_number VARCHAR(100),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('farmers', 'admin_officers', 'notifications', 'crops', 'procurement_centers', 'slots', 'bookings', 'procurements', 'payments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_service_all_%I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_service_all_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================================
-- 12. INITIAL SEED DATA
-- ============================================================================

-- A. Seed Crops Catalog (Govt MSP 2025-26)
INSERT INTO public.crops (id, name_en, name_hi, msp_rate, season, season_hi, color)
VALUES
    ('wheat', 'Wheat', 'गेहूं', 2275.00, 'Rabi', 'रबी', '#D4912A'),
    ('rice', 'Rice', 'धान', 2320.00, 'Kharif', 'खरीफ', '#14532d'),
    ('mustard', 'Mustard', 'सरसों', 5650.00, 'Rabi', 'रबी', '#E8A94D'),
    ('chana', 'Gram (Chana)', 'चना', 5440.00, 'Rabi', 'रबी', '#C4956A'),
    ('maize', 'Maize', 'मक्का', 2090.00, 'Kharif', 'खरीफ', '#D4C12A'),
    ('soybean', 'Soybean', 'सोयाबीन', 4892.00, 'Kharif', 'खरीफ', '#8BA85B'),
    ('cotton', 'Cotton', 'कपास', 7121.00, 'Kharif', 'खरीफ', '#E8E0D0'),
    ('sugarcane', 'Sugarcane', 'गन्ना', 340.00, 'Annual', 'वार्षिक', '#0f3d21')
ON CONFLICT (id) DO UPDATE 
SET msp_rate = EXCLUDED.msp_rate, name_en = EXCLUDED.name_en, name_hi = EXCLUDED.name_hi;

-- B. Seed Procurement Centers (APMC Mandis)
INSERT INTO public.procurement_centers (id, name, name_hi, district, district_hi, tehsil, tehsil_hi, state, address, phone, daily_capacity, current_queue, crowd_level, crops_accepted, latitude, longitude)
VALUES
    ('center-001', 'Indore APMC Main Yard', 'इंदौर मंडी मुख्य यार्ड', 'Indore', 'इंदौर', 'Sanwer Road', 'सांवेer Road', 'Madhya Pradesh', 'Sector A, Sanwer Road Industrial Area, Indore, MP 452015', '+91 731 245 8890', 150, 8, 'low', '["wheat", "chana", "mustard", "soybean"]'::jsonb, 22.7533, 75.8711),
    ('center-002', 'Bhopal Krishi Upaj Mandi', 'भोपाल कृषि उपज मंडी', 'Bhopal', 'भोपाल', 'Karond', 'करोंद', 'Madhya Pradesh', 'Karond Bypass Road, Bhopal, MP 462038', '+91 755 273 1122', 120, 14, 'moderate', '["wheat", "chana", "mustard", "soybean", "maize"]'::jsonb, 23.2989, 77.4107),
    ('center-003', 'Ujjain Grain Terminal Depot', 'उज्जैन अनाज टर्मिनल डिपो', 'Ujjain', 'उज्जैन', 'Maksi Road', 'मक्सी रोड', 'Madhya Pradesh', 'Maksi Road Warehouse Complex, Ujjain, MP 456006', '+91 734 251 3344', 100, 3, 'low', '["wheat", "chana", "soybean"]'::jsonb, 23.1824, 75.7952),
    ('center-004', 'Jabalpur Agri Hub', 'जबलपुर कृषि हब', 'Jabalpur', 'जबलपुर', 'Vijay Nagar', 'विजय नगर', 'Madhya Pradesh', 'Krishi Upaj Mandi, Vijay Nagar, Jabalpur, MP 482002', '+91 761 268 4400', 80, 22, 'high', '["wheat", "rice", "chana"]'::jsonb, 23.1686, 79.9339)
ON CONFLICT (id) DO NOTHING;

-- C. Seed Admin Officers
INSERT INTO public.admin_officers (officer_id, password, name, name_hi, designation, designation_hi, role, assigned_center_id, center_name, center_name_hi, phone, email)
VALUES
    ('OFFICER-MP-001', 'mandi123', 'Rajesh Sharma', 'राजेश शर्मा', 'Senior Procurement Officer', 'वरिष्ठ खरीद अधिकारी', 'officer', 'center-001', 'Indore APMC Main Yard', 'इंदौर मंडी मुख्य यार्ड', '+91 98260 11223', 'rajesh.sharma@mandi.gov.in'),
    ('OFFICER-MP-002', 'mandi123', 'Anita Verma', 'अनिता वर्मा', 'Quality Inspector', 'गुणवत्ता निरीक्षक', 'quality_checker', 'center-002', 'Bhopal Krishi Upaj Mandi', 'भोपाल कृषि उपज मंडी', '+91 98260 44556', 'anita.verma@mandi.gov.in'),
    ('SUPER-ADMIN-01', 'adminpass', 'Head Administrator', 'मुख्य प्रशासक', 'System Administrator', 'सिस्टम प्रशासक', 'super_admin', 'ALL', 'HQ Bhopal', 'मुख्यालय भोपाल', '+91 98260 99999', 'admin@mandi.gov.in')
ON CONFLICT (officer_id) DO NOTHING;

-- D. Seed Sample Farmer
INSERT INTO public.farmers (id, name, name_hi, phone, village, village_hi, district, district_hi, state, state_hi, aadhaar_last4, farmer_id, bank_name, account_last4)
VALUES
    ('f1', 'Ramesh Patel', 'रमेश पटेल', '9876543210', 'Pipariya', 'पिपरिया', 'Indore', 'इंदौर', 'Madhya Pradesh', 'मध्य प्रदेश', '4321', 'MP-KISAN-4321', 'State Bank of India', '7890')
ON CONFLICT (id) DO NOTHING;

-- E. Seed Sample Booking
INSERT INTO public.bookings (id, farmer_id, center_id, crop_type, date, time_slot, token_number, estimated_quantity, status, qr_code_payload)
VALUES
    ('b_101', 'f1', 'center-001', 'wheat', CURRENT_DATE, '09:00 AM - 10:30 AM', 101, 65.00, 'in-progress', 'MANDI:BK-101:f1:center-001:wheat:65')
ON CONFLICT (id) DO NOTHING;

-- F. Seed Sample Procurement
INSERT INTO public.procurements (id, booking_id, farmer_id, center_id, crop_type, token_number, actual_weight, moisture_percent, grade, status, parchi_number)
VALUES
    ('p_201', 'b_101', 'f1', 'center-001', 'wheat', 101, 65.00, 11.2, 'Grade A', 'completed', 'MP-IND-2026-00892')
ON CONFLICT (id) DO NOTHING;

-- G. Seed Sample Payment
INSERT INTO public.payments (id, procurement_id, booking_id, farmer_id, crop_type, quantity, msp_rate, gross_amount, deductions, net_amount, status, payment_mode, bank_name, bank_account_last4, utr_number)
VALUES
    ('pay_301', 'p_201', 'b_101', 'f1', 'wheat', 65.00, 2275.00, 147875.00, 0.00, 147875.00, 'disbursed', 'DBT / PFMS', 'State Bank of India', '7890', 'DBT2026091100984')
ON CONFLICT (id) DO NOTHING;
