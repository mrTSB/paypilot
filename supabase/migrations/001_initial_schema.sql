-- PayPilot Database Schema
-- AI-Native HR & Payroll Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================
-- IDENTITY & ACCESS CONTEXT
-- ============================================

-- Companies (tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  legal_name TEXT,
  ein TEXT, -- Employer Identification Number
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'active', 'suspended', 'churned')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email CITEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'employee'
    CHECK (role IN ('super_admin', 'company_admin', 'hr_manager', 'manager', 'employee')),
  company_id UUID REFERENCES companies(id),
  status TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'onboarding', 'active', 'suspended', 'terminated')),
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Device Sessions
CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_device_sessions_user ON device_sessions(user_id);

-- ============================================
-- CORE DOMAIN: EMPLOYEES
-- ============================================

-- Employee details (HR-specific data separate from profile)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  employee_number TEXT,
  department TEXT,
  job_title TEXT,
  employment_type TEXT NOT NULL DEFAULT 'full_time'
    CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
  start_date DATE,
  end_date DATE,
  manager_id UUID REFERENCES employees(id),

  -- Compensation
  salary_cents INTEGER, -- Annual salary in cents
  pay_frequency TEXT DEFAULT 'biweekly'
    CHECK (pay_frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),

  -- Tax info
  filing_status TEXT CHECK (filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household')),
  federal_allowances INTEGER DEFAULT 0,
  state_allowances INTEGER DEFAULT 0,
  additional_withholding_cents INTEGER DEFAULT 0,

  -- Banking
  bank_account_last4 TEXT,
  bank_routing_last4 TEXT,
  bank_account_type TEXT CHECK (bank_account_type IN ('checking', 'savings')),

  -- PTO
  pto_balance_hours NUMERIC(10,2) DEFAULT 0,
  sick_balance_hours NUMERIC(10,2) DEFAULT 0,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'active', 'on_leave', 'terminated')),

  -- Metadata
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(company_id, employee_number)
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_profile ON employees(profile_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(status);

-- Employee status history (audit trail)
CREATE TABLE employee_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employee_status_history ON employee_status_history(employee_id, created_at);

-- ============================================
-- CORE DOMAIN: PAYROLL
-- ============================================

-- Pay periods
CREATE TABLE pay_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'current', 'processing', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(company_id, start_date, end_date)
);

CREATE INDEX idx_pay_periods_company ON pay_periods(company_id);

-- Payroll runs
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  pay_period_id UUID NOT NULL REFERENCES pay_periods(id),

  -- Totals
  total_gross_cents INTEGER DEFAULT 0,
  total_taxes_cents INTEGER DEFAULT 0,
  total_deductions_cents INTEGER DEFAULT 0,
  total_net_cents INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'calculating', 'pending_approval', 'approved', 'processing', 'paid', 'completed', 'cancelled')),

  -- Approvals
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_runs_company ON payroll_runs(company_id);
CREATE INDEX idx_payroll_runs_status ON payroll_runs(status);

-- Payroll run status history
CREATE TABLE payroll_run_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pay stubs (individual employee pay records)
CREATE TABLE pay_stubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),

  -- Hours
  regular_hours NUMERIC(10,2) DEFAULT 0,
  overtime_hours NUMERIC(10,2) DEFAULT 0,
  pto_hours NUMERIC(10,2) DEFAULT 0,
  sick_hours NUMERIC(10,2) DEFAULT 0,

  -- Earnings breakdown
  gross_pay_cents INTEGER NOT NULL,
  regular_pay_cents INTEGER NOT NULL,
  overtime_pay_cents INTEGER DEFAULT 0,
  bonus_cents INTEGER DEFAULT 0,
  commission_cents INTEGER DEFAULT 0,

  -- Tax withholdings
  federal_tax_cents INTEGER DEFAULT 0,
  state_tax_cents INTEGER DEFAULT 0,
  social_security_cents INTEGER DEFAULT 0,
  medicare_cents INTEGER DEFAULT 0,

  -- Deductions
  health_insurance_cents INTEGER DEFAULT 0,
  dental_insurance_cents INTEGER DEFAULT 0,
  vision_insurance_cents INTEGER DEFAULT 0,
  retirement_401k_cents INTEGER DEFAULT 0,
  other_deductions_cents INTEGER DEFAULT 0,

  -- Totals
  total_taxes_cents INTEGER NOT NULL,
  total_deductions_cents INTEGER NOT NULL,
  net_pay_cents INTEGER NOT NULL,

  -- YTD totals
  ytd_gross_cents INTEGER DEFAULT 0,
  ytd_taxes_cents INTEGER DEFAULT 0,
  ytd_net_cents INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pay_stubs_payroll_run ON pay_stubs(payroll_run_id);
CREATE INDEX idx_pay_stubs_employee ON pay_stubs(employee_id);

-- ============================================
-- CORE DOMAIN: TIME & ATTENDANCE
-- ============================================

-- Time entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER DEFAULT 0,
  total_hours NUMERIC(10,2),
  entry_type TEXT NOT NULL DEFAULT 'regular'
    CHECK (entry_type IN ('regular', 'overtime', 'pto', 'sick', 'holiday', 'unpaid')),
  notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);

-- PTO Requests
CREATE TABLE pto_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('pto', 'sick', 'unpaid', 'bereavement', 'jury_duty', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_requested NUMERIC(10,2) NOT NULL,
  reason TEXT,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'denied', 'cancelled', 'taken')),

  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pto_requests_employee ON pto_requests(employee_id);
CREATE INDEX idx_pto_requests_status ON pto_requests(status);

-- ============================================
-- CORE DOMAIN: BENEFITS
-- ============================================

-- Benefit plans
CREATE TABLE benefit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL
    CHECK (plan_type IN ('health', 'dental', 'vision', 'life', '401k', 'hsa', 'fsa', 'other')),
  provider TEXT,
  description TEXT,

  -- Costs (monthly, in cents)
  employee_cost_cents INTEGER DEFAULT 0,
  employer_cost_cents INTEGER DEFAULT 0,

  -- Plan details stored as JSON
  plan_details JSONB DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_benefit_plans_company ON benefit_plans(company_id);

-- Employee benefit enrollments
CREATE TABLE benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  benefit_plan_id UUID NOT NULL REFERENCES benefit_plans(id),

  coverage_level TEXT DEFAULT 'employee_only'
    CHECK (coverage_level IN ('employee_only', 'employee_spouse', 'employee_children', 'family')),

  -- Dependents covered
  dependents JSONB DEFAULT '[]',

  effective_date DATE NOT NULL,
  termination_date DATE,

  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending', 'active', 'terminated')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(employee_id, benefit_plan_id, effective_date)
);

CREATE INDEX idx_benefit_enrollments_employee ON benefit_enrollments(employee_id);

-- ============================================
-- AI & COMMUNICATION
-- ============================================

-- AI Chat conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);

-- AI Chat messages
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id);

-- Company documents (for AI to reference)
CREATE TABLE company_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL
    CHECK (doc_type IN ('policy', 'handbook', 'benefit_summary', 'tax_form', 'other')),
  content TEXT,
  file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_company_documents_company ON company_documents(company_id);

-- ============================================
-- AUDIT & COMPLIANCE
-- ============================================

-- Audit log (append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  company_id UUID REFERENCES companies(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Outbox events for event-driven architecture
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  company_id UUID REFERENCES companies(id),
  payload JSONB NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_outbox_unpublished ON outbox_events(created_at) WHERE published_at IS NULL;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payroll_runs_updated_at BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_pto_requests_updated_at BEFORE UPDATE ON pto_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_benefit_plans_updated_at BEFORE UPDATE ON benefit_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_benefit_enrollments_updated_at BEFORE UPDATE ON benefit_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_stubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Company members can view company profiles
CREATE POLICY "Company members can view colleagues" ON profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Employees: Company members can view
CREATE POLICY "Company members can view employees" ON employees
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Time entries: Employees can manage their own
CREATE POLICY "Employees can manage own time entries" ON time_entries
  FOR ALL USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- PTO requests: Employees can manage their own
CREATE POLICY "Employees can manage own PTO" ON pto_requests
  FOR ALL USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- AI conversations: Users can manage their own
CREATE POLICY "Users can manage own AI conversations" ON ai_conversations
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage own AI messages" ON ai_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );
