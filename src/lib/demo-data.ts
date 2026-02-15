// Demo data for PayPilot
// This provides realistic data for the demo without requiring a database connection

export const demoCompany = {
  id: 'c0000000-0000-0000-0000-000000000001',
  name: 'Acme Technologies',
  legal_name: 'Acme Technologies Inc.',
  ein: '12-3456789',
  address_line1: '123 Innovation Drive',
  city: 'San Francisco',
  state: 'CA',
  zip_code: '94105',
  industry: 'Technology',
  company_size: '11-50',
  status: 'active' as const,
}

export const demoUser = {
  id: 'u0000000-0000-0000-0000-000000000001',
  email: 'john.doe@acme.com',
  full_name: 'John Doe',
  role: 'company_admin' as const,
  company_id: demoCompany.id,
  status: 'active' as const,
}

export const demoEmployees = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.com',
    avatar: 'SC',
    department: 'Engineering',
    jobTitle: 'Senior Software Engineer',
    employmentType: 'full_time',
    startDate: '2023-03-15',
    salary: 145000,
    status: 'active',
    manager: 'John Doe',
    ptoBalance: 96,
    sickBalance: 32,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    name: 'Mike Johnson',
    email: 'mike.johnson@acme.com',
    avatar: 'MJ',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    employmentType: 'full_time',
    startDate: '2026-01-08',
    salary: 95000,
    status: 'onboarding',
    manager: 'Sarah Chen',
    ptoBalance: 120,
    sickBalance: 40,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    name: 'Emily Davis',
    email: 'emily.davis@acme.com',
    avatar: 'ED',
    department: 'Design',
    jobTitle: 'Product Designer',
    employmentType: 'full_time',
    startDate: '2024-06-01',
    salary: 110000,
    status: 'active',
    manager: 'John Doe',
    ptoBalance: 88,
    sickBalance: 32,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    name: 'Tom Wilson',
    email: 'tom.wilson@acme.com',
    avatar: 'TW',
    department: 'Sales',
    jobTitle: 'Account Executive',
    employmentType: 'full_time',
    startDate: '2024-09-15',
    salary: 85000,
    status: 'active',
    manager: 'Lisa Park',
    ptoBalance: 72,
    sickBalance: 24,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000005',
    name: 'Lisa Park',
    email: 'lisa.park@acme.com',
    avatar: 'LP',
    department: 'Sales',
    jobTitle: 'Sales Manager',
    employmentType: 'full_time',
    startDate: '2022-11-01',
    salary: 130000,
    status: 'active',
    manager: 'John Doe',
    ptoBalance: 80,
    sickBalance: 40,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000006',
    name: 'Alex Wong',
    email: 'alex.wong@acme.com',
    avatar: 'AW',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    employmentType: 'full_time',
    startDate: '2025-02-01',
    salary: 75000,
    status: 'active',
    manager: 'John Doe',
    ptoBalance: 112,
    sickBalance: 40,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000007',
    name: 'Jordan Lee',
    email: 'jordan.lee@acme.com',
    avatar: 'JL',
    department: 'Engineering',
    jobTitle: 'DevOps Engineer',
    employmentType: 'contractor',
    startDate: '2025-06-01',
    salary: 120000,
    status: 'active',
    manager: 'Sarah Chen',
    ptoBalance: 0,
    sickBalance: 0,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000008',
    name: 'Rachel Kim',
    email: 'rachel.kim@acme.com',
    avatar: 'RK',
    department: 'HR',
    jobTitle: 'HR Coordinator',
    employmentType: 'full_time',
    startDate: '2024-01-15',
    salary: 65000,
    status: 'on_leave',
    manager: 'John Doe',
    ptoBalance: 64,
    sickBalance: 32,
  },
]

export const demoPayrollRuns = [
  {
    id: 'pr0000000-0000-0000-0000-000000000001',
    payPeriod: 'Feb 2-15, 2026',
    payDate: 'Feb 20, 2026',
    employees: 47,
    grossPay: 124850,
    taxes: 31212,
    deductions: 18727,
    netPay: 74911,
    status: 'pending_approval',
  },
  {
    id: 'pr0000000-0000-0000-0000-000000000002',
    payPeriod: 'Jan 19 - Feb 1, 2026',
    payDate: 'Feb 6, 2026',
    employees: 46,
    grossPay: 121500,
    taxes: 30375,
    deductions: 18225,
    netPay: 72900,
    status: 'completed',
  },
  {
    id: 'pr0000000-0000-0000-0000-000000000003',
    payPeriod: 'Jan 5-18, 2026',
    payDate: 'Jan 23, 2026',
    employees: 45,
    grossPay: 118200,
    taxes: 29550,
    deductions: 17730,
    netPay: 70920,
    status: 'completed',
  },
]

export const demoPtoRequests = [
  {
    id: 'pto0000000-0000-0000-0000-000000000001',
    employee: 'Sarah Chen',
    avatar: 'SC',
    type: 'pto',
    startDate: 'Feb 24, 2026',
    endDate: 'Feb 26, 2026',
    hours: 24,
    reason: 'Family vacation',
    status: 'pending',
  },
  {
    id: 'pto0000000-0000-0000-0000-000000000002',
    employee: 'Tom Wilson',
    avatar: 'TW',
    type: 'pto',
    startDate: 'Mar 3, 2026',
    endDate: 'Mar 7, 2026',
    hours: 40,
    reason: 'Spring break trip',
    status: 'pending',
  },
  {
    id: 'pto0000000-0000-0000-0000-000000000003',
    employee: 'Emily Davis',
    avatar: 'ED',
    type: 'sick',
    startDate: 'Feb 10, 2026',
    endDate: 'Feb 10, 2026',
    hours: 8,
    reason: 'Doctor appointment',
    status: 'approved',
  },
]

export const demoBenefitPlans = [
  {
    id: 'bp0000000-0000-0000-0000-000000000001',
    name: 'Premium Health Plan',
    type: 'health',
    provider: 'Blue Cross',
    employeeCost: 15000,
    employerCost: 45000,
    description: 'Comprehensive health coverage with low deductibles',
  },
  {
    id: 'bp0000000-0000-0000-0000-000000000002',
    name: 'Basic Dental',
    type: 'dental',
    provider: 'Delta Dental',
    employeeCost: 2500,
    employerCost: 2500,
    description: 'Preventive and basic dental care',
  },
  {
    id: 'bp0000000-0000-0000-0000-000000000003',
    name: 'Vision Plus',
    type: 'vision',
    provider: 'VSP',
    employeeCost: 1000,
    employerCost: 1000,
    description: 'Annual eye exams and glasses allowance',
  },
  {
    id: 'bp0000000-0000-0000-0000-000000000004',
    name: '401(k) Retirement',
    type: '401k',
    provider: 'Fidelity',
    employeeCost: 0,
    employerCost: 0,
    description: '4% company match on contributions',
  },
]

export const companyPolicies = {
  pto: `Acme Technologies PTO Policy:
- Full-time employees accrue 15 days (120 hours) of PTO per year
- PTO accrues at 4.62 hours per biweekly pay period
- Maximum PTO balance: 240 hours (unused PTO rolls over)
- PTO requests require 2 weeks advance notice for 3+ consecutive days
- Sick time: 5 days (40 hours) per year, does not roll over
- Bereavement: 3 days for immediate family, 1 day for extended family`,

  remoteWork: `Acme Technologies Remote Work Policy:
- Hybrid model: 3 days in office (Tue, Wed, Thu), 2 days remote
- Core hours: 10am - 4pm PT
- Home office stipend: $500 one-time, $50/month ongoing
- VPN required for accessing company systems remotely
- Video on encouraged for meetings`,

  benefits: `Acme Technologies Benefits:
- Health Insurance: Blue Cross Premium Plan (company pays 75%)
- Dental: Delta Dental (company pays 50%)
- Vision: VSP Vision Plus (company pays 50%)
- 401(k): 4% company match, immediate vesting
- Life Insurance: 1x salary, company paid
- Commuter Benefits: $100/month pre-tax
- Gym Membership: $50/month reimbursement
- Professional Development: $1,500/year`,
}

// Dashboard stats
export const dashboardStats = {
  totalEmployees: 47,
  newHiresThisMonth: 3,
  nextPayroll: {
    amount: 124850,
    date: 'Feb 20, 2026',
    employees: 47,
  },
  pendingPto: 5,
  avgHoursPerWeek: 41.2,
  retentionRate: 94.2,
  ytdPayroll: 487000,
}
