-- ═══════════════════════════════════════════════════════════════
-- Security hardening migration
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Input validation check constraints ──

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_name_max_length
  CHECK (char_length(name) <= 100);

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_email_max_length
  CHECK (char_length(email) <= 200);

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_message_max_length
  CHECK (char_length(message) <= 5000);

-- ── 2. Email format validation (basic check) ──

ALTER TABLE contact_submissions
  ADD CONSTRAINT contact_email_format
  CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- ── 3. Rate limit: max 5 submissions per email per hour ──

CREATE OR REPLACE FUNCTION check_contact_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM contact_submissions
    WHERE email = NEW.email
      AND created_at > now() - interval '1 hour'
  ) >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 5 submissions per email per hour';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contact_rate_limit
  BEFORE INSERT ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION check_contact_rate_limit();
