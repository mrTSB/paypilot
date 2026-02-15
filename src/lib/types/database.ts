// PayPilot Database Types

export type UserRole = 'super_admin' | 'company_admin' | 'hr_manager' | 'manager' | 'employee'
export type UserStatus = 'invited' | 'onboarding' | 'active' | 'suspended' | 'terminated'
export type EmployeeStatus = 'onboarding' | 'active' | 'on_leave' | 'terminated'
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern'
export type PayFrequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
export type PayrollRunStatus = 'draft' | 'calculating' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'completed' | 'cancelled'
export type PTORequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled' | 'taken'
export type PTORequestType = 'pto' | 'sick' | 'unpaid' | 'bereavement' | 'jury_duty' | 'other'
export type TimeEntryType = 'regular' | 'overtime' | 'pto' | 'sick' | 'holiday' | 'unpaid'
export type BenefitPlanType = 'health' | 'dental' | 'vision' | 'life' | '401k' | 'hsa' | 'fsa' | 'other'
export type CoverageLevel = 'employee_only' | 'employee_spouse' | 'employee_children' | 'family'

export interface Company {
  id: string
  name: string
  legal_name: string | null
  ein: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  industry: string | null
  company_size: string | null
  logo_url: string | null
  status: 'onboarding' | 'active' | 'suspended' | 'churned'
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  role: UserRole
  company_id: string | null
  status: UserStatus
  last_sign_in_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Employee {
  id: string
  profile_id: string
  company_id: string
  employee_number: string | null
  department: string | null
  job_title: string | null
  employment_type: EmploymentType
  start_date: string | null
  end_date: string | null
  manager_id: string | null
  salary_cents: number | null
  pay_frequency: PayFrequency
  filing_status: string | null
  federal_allowances: number
  state_allowances: number
  additional_withholding_cents: number
  bank_account_last4: string | null
  bank_routing_last4: string | null
  bank_account_type: 'checking' | 'savings' | null
  pto_balance_hours: number
  sick_balance_hours: number
  status: EmployeeStatus
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  profile?: Profile
  manager?: Employee
}

export interface PayPeriod {
  id: string
  company_id: string
  start_date: string
  end_date: string
  pay_date: string
  status: 'upcoming' | 'current' | 'processing' | 'completed'
  created_at: string
}

export interface PayrollRun {
  id: string
  company_id: string
  pay_period_id: string
  total_gross_cents: number
  total_taxes_cents: number
  total_deductions_cents: number
  total_net_cents: number
  employee_count: number
  status: PayrollRunStatus
  submitted_by: string | null
  submitted_at: string | null
  approved_by: string | null
  approved_at: string | null
  paid_at: string | null
  notes: string | null
  version: number
  created_at: string
  updated_at: string
  // Joined fields
  pay_period?: PayPeriod
}

export interface PayStub {
  id: string
  payroll_run_id: string
  employee_id: string
  regular_hours: number
  overtime_hours: number
  pto_hours: number
  sick_hours: number
  gross_pay_cents: number
  regular_pay_cents: number
  overtime_pay_cents: number
  bonus_cents: number
  commission_cents: number
  federal_tax_cents: number
  state_tax_cents: number
  social_security_cents: number
  medicare_cents: number
  health_insurance_cents: number
  dental_insurance_cents: number
  vision_insurance_cents: number
  retirement_401k_cents: number
  other_deductions_cents: number
  total_taxes_cents: number
  total_deductions_cents: number
  net_pay_cents: number
  ytd_gross_cents: number
  ytd_taxes_cents: number
  ytd_net_cents: number
  created_at: string
  // Joined fields
  employee?: Employee
}

export interface TimeEntry {
  id: string
  employee_id: string
  date: string
  clock_in: string | null
  clock_out: string | null
  break_minutes: number
  total_hours: number | null
  entry_type: TimeEntryType
  notes: string | null
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface PTORequest {
  id: string
  employee_id: string
  request_type: PTORequestType
  start_date: string
  end_date: string
  hours_requested: number
  reason: string | null
  status: PTORequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  employee?: Employee
}

export interface BenefitPlan {
  id: string
  company_id: string
  name: string
  plan_type: BenefitPlanType
  provider: string | null
  description: string | null
  employee_cost_cents: number
  employer_cost_cents: number
  plan_details: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BenefitEnrollment {
  id: string
  employee_id: string
  benefit_plan_id: string
  coverage_level: CoverageLevel
  dependents: Array<{ name: string; relationship: string; dob: string }>
  effective_date: string
  termination_date: string | null
  status: 'pending' | 'active' | 'terminated'
  created_at: string
  updated_at: string
  // Joined fields
  benefit_plan?: BenefitPlan
}

export interface AIConversation {
  id: string
  user_id: string
  company_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface CompanyDocument {
  id: string
  company_id: string
  title: string
  doc_type: 'policy' | 'handbook' | 'benefit_summary' | 'tax_form' | 'other'
  content: string | null
  file_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Utility types
export interface EmployeeWithProfile extends Employee {
  profile: Profile
}

export interface PayrollRunWithPeriod extends PayrollRun {
  pay_period: PayPeriod
}
