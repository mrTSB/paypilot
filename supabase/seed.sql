-- PayPilot Seed Data
-- Realistic demo data for showcase

-- Demo Company
INSERT INTO companies (id, name, legal_name, ein, address_line1, city, state, zip_code, industry, company_size, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Acme Technologies', 'Acme Technologies Inc.', '12-3456789', '123 Innovation Drive', 'San Francisco', 'CA', '94105', 'Technology', '11-50', 'active');

-- Benefit Plans for Acme
INSERT INTO benefit_plans (id, company_id, name, plan_type, provider, employee_cost_cents, employer_cost_cents, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Premium Health Plan', 'health', 'Blue Cross', 15000, 45000, 'Comprehensive health coverage with low deductibles'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Basic Dental', 'dental', 'Delta Dental', 2500, 2500, 'Preventive and basic dental care'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Vision Plus', 'vision', 'VSP', 1000, 1000, 'Annual eye exams and glasses allowance'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '401(k) Retirement', '401k', 'Fidelity', 0, 0, '4% company match on contributions');

-- Pay Periods (biweekly for 2026)
INSERT INTO pay_periods (id, company_id, start_date, end_date, pay_date, status) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '2026-01-05', '2026-01-18', '2026-01-23', 'completed'),
  ('p0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '2026-01-19', '2026-02-01', '2026-02-06', 'completed'),
  ('p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '2026-02-02', '2026-02-15', '2026-02-20', 'current'),
  ('p0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', '2026-02-16', '2026-03-01', '2026-03-06', 'upcoming');

-- Company Policies/Documents
INSERT INTO company_documents (id, company_id, title, doc_type, content) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'PTO Policy', 'policy',
   'Acme Technologies PTO Policy:
   - Full-time employees accrue 15 days (120 hours) of PTO per year
   - PTO accrues at 4.62 hours per biweekly pay period
   - Maximum PTO balance: 240 hours (unused PTO rolls over)
   - PTO requests require 2 weeks advance notice for 3+ consecutive days
   - Sick time: 5 days (40 hours) per year, does not roll over
   - Bereavement: 3 days for immediate family, 1 day for extended family'),

  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Remote Work Policy', 'policy',
   'Acme Technologies Remote Work Policy:
   - Hybrid model: 3 days in office (Tue, Wed, Thu), 2 days remote
   - Core hours: 10am - 4pm PT
   - Home office stipend: $500 one-time, $50/month ongoing
   - VPN required for accessing company systems remotely
   - Video on encouraged for meetings'),

  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Benefits Summary', 'benefit_summary',
   'Acme Technologies Benefits:
   - Health Insurance: Blue Cross Premium Plan (company pays 75%)
   - Dental: Delta Dental (company pays 50%)
   - Vision: VSP Vision Plus (company pays 50%)
   - 401(k): 4% company match, immediate vesting
   - Life Insurance: 1x salary, company paid
   - Commuter Benefits: $100/month pre-tax
   - Gym Membership: $50/month reimbursement
   - Professional Development: $1,500/year');
