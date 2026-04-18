-- ============================================
-- SynthWork — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- Project: https://zbjmszryzlyymcspszfy.supabase.co
-- ============================================

-- 1. Create bookings table
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service VARCHAR(255) NOT NULL,
  message TEXT,
  booked_date DATE NOT NULL,
  booked_time VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create contact_submissions table
DROP TABLE IF EXISTS contact_submissions CASCADE;
CREATE TABLE contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Allow anyone to INSERT (public forms)
DROP POLICY IF EXISTS "Allow public insert on bookings" ON bookings;
CREATE POLICY "Allow public insert on bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert on contact_submissions" ON contact_submissions;
CREATE POLICY "Allow public insert on contact_submissions"
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. RLS Policies - Allow anyone to read (for admin dashboard with anon key)
DROP POLICY IF EXISTS "Allow public read on bookings" ON bookings;
CREATE POLICY "Allow public read on bookings"
  ON bookings FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public read on contact_submissions" ON contact_submissions;
CREATE POLICY "Allow public read on contact_submissions"
  ON contact_submissions FOR SELECT
  TO anon
  USING (true);

-- 6. RLS Policies - Allow updates on bookings (for approve/decline)
DROP POLICY IF EXISTS "Allow public update on bookings" ON bookings;
CREATE POLICY "Allow public update on bookings"
  ON bookings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 7. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- NOTE: The code below enables email sending inside the database
-- If changing "pg_net" throws an error, you can just manually 
-- enable the "pg_net" extension in Supabase settings -> Extensions!
-- ============================================

-- 8. Enable required extensions for emails
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 9. Create email sending function via pg_net + Resend API
CREATE OR REPLACE FUNCTION send_email(
  to_email TEXT,
  subject TEXT,
  html_body TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resend_api_key TEXT := 're_d9j4qZHF_J2BDMS8iL5rnwPffVmziynnn';
  request_body JSONB;
BEGIN
  request_body := jsonb_build_object(
    'from', 'SynthWork <onboarding@resend.dev>',
    'to', ARRAY[to_email],
    'subject', subject,
    'html', html_body
  );

  PERFORM net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || resend_api_key,
      'Content-Type', 'application/json'
    ),
    body := request_body
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Email send failed: %', SQLERRM;
END;
$$;
