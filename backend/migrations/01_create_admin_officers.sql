-- ==============================================================================
-- Mandi Mitra (मंडी मित्र) — Supabase Schema Migration: admin_officers
-- Description: Creates the admin_officers table with initial seed officers.
-- Can be pasted & executed directly in the Supabase Dashboard SQL Editor.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.admin_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    name_hi VARCHAR(150),
    designation VARCHAR(150) DEFAULT 'Mandi Procurement Officer',
    designation_hi VARCHAR(150) DEFAULT 'मंडी खरीद अधिकारी',
    role VARCHAR(50) DEFAULT 'center_officer', -- 'center_officer' or 'super_admin'
    assigned_center_id VARCHAR(50) DEFAULT 'c1',
    center_name VARCHAR(150) DEFAULT 'Bhopal Central Mandi',
    center_name_hi VARCHAR(150) DEFAULT 'भोपाल सेंट्रल मंडी',
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for speedy lookups on login
CREATE INDEX IF NOT EXISTS idx_admin_officers_officer_id ON public.admin_officers (officer_id);
CREATE INDEX IF NOT EXISTS idx_admin_officers_assigned_center ON public.admin_officers (assigned_center_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_officers ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service role key
DROP POLICY IF EXISTS "Service role has full access on admin_officers" ON public.admin_officers;
CREATE POLICY "Service role has full access on admin_officers" 
ON public.admin_officers FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Insert Default Seed Officers
INSERT INTO public.admin_officers (
    officer_id, 
    password, 
    name, 
    name_hi, 
    designation, 
    designation_hi, 
    role, 
    assigned_center_id, 
    center_name, 
    center_name_hi, 
    email
)
VALUES 
(
    'OFFICER-MP-001', 
    'Mandi@Officer2026', 
    'Shri Rajesh Sharma', 
    'श्री राजेश शर्मा', 
    'Mandi Center In-Charge', 
    'मंडी केंद्र प्रभारी', 
    'center_officer', 
    'c1', 
    'Bhopal Central Mandi', 
    'भोपाल सेंट्रल मंडी', 
    'bhopal@mandimitra.gov.in'
),
(
    'OFFICER-MP-002', 
    'Mandi@Officer2026', 
    'Smt. Anita Verma', 
    'श्रीमती अनीता वर्मा', 
    'Senior Procurement Inspector', 
    'वरिष्ठ खरीद निरीक्षक', 
    'center_officer', 
    'c2', 
    'Indore Mandi Complex', 
    'इंदौर मंडी कॉम्प्लेक्स', 
    'indore@mandimitra.gov.in'
),
(
    'SUPER-ADMIN-01', 
    'Super@Admin2026', 
    'Dr. Alok Nath (IAS)', 
    'डॉ. आलोक नाथ (आईएएस)', 
    'State Procurement Commissioner', 
    'राज्य खरीद आयुक्त', 
    'super_admin', 
    NULL, 
    'All Mandis (Headquarters)', 
    'सभी मंडियां (मुख्यालय)', 
    'superadmin@mandimitra.gov.in'
)
ON CONFLICT (officer_id) DO UPDATE 
SET 
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    name_hi = EXCLUDED.name_hi,
    designation = EXCLUDED.designation,
    center_name = EXCLUDED.center_name;
