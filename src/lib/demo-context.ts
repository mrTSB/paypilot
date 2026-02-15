// Demo mode context for when real Supabase auth is not available
// This provides consistent demo data for local development and demos

export const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002'

export interface DemoContext {
  userId: string
  companyId: string
  role: 'owner' | 'admin' | 'hr_manager' | 'manager' | 'employee'
  email: string
  fullName: string
  companyName: string
}

export const DEMO_CONTEXT: DemoContext = {
  userId: DEMO_USER_ID,
  companyId: DEMO_COMPANY_ID,
  role: 'owner',
  email: 'demo@paypilot.com',
  fullName: 'Demo User',
  companyName: 'Acme Technologies',
}

// Demo employees for the employee picker
export const DEMO_EMPLOYEES = [
  { id: '00000000-0000-0000-0000-000000000010', full_name: 'Sarah Chen', email: 'sarah.chen@acme.com', department: 'Engineering', job_title: 'Senior Engineer' },
  { id: '00000000-0000-0000-0000-000000000011', full_name: 'Mike Johnson', email: 'mike.johnson@acme.com', department: 'Engineering', job_title: 'Tech Lead' },
  { id: '00000000-0000-0000-0000-000000000012', full_name: 'Emily Davis', email: 'emily.davis@acme.com', department: 'Product', job_title: 'Product Manager' },
  { id: '00000000-0000-0000-0000-000000000013', full_name: 'Tom Wilson', email: 'tom.wilson@acme.com', department: 'Sales', job_title: 'Account Executive' },
  { id: '00000000-0000-0000-0000-000000000014', full_name: 'Lisa Park', email: 'lisa.park@acme.com', department: 'Finance', job_title: 'Financial Analyst' },
  { id: '00000000-0000-0000-0000-000000000015', full_name: 'Alex Wong', email: 'alex.wong@acme.com', department: 'Engineering', job_title: 'Backend Developer' },
  { id: '00000000-0000-0000-0000-000000000016', full_name: 'Jennifer Lee', email: 'jennifer.lee@acme.com', department: 'HR', job_title: 'HR Manager' },
  { id: '00000000-0000-0000-0000-000000000017', full_name: 'David Brown', email: 'david.brown@acme.com', department: 'Marketing', job_title: 'Marketing Manager' },
  { id: '00000000-0000-0000-0000-000000000018', full_name: 'Rachel Green', email: 'rachel.green@acme.com', department: 'Customer Success', job_title: 'CS Lead' },
  { id: '00000000-0000-0000-0000-000000000019', full_name: 'Chris Martin', email: 'chris.martin@acme.com', department: 'Engineering', job_title: 'Frontend Developer' },
  { id: '00000000-0000-0000-0000-000000000020', full_name: 'Amanda White', email: 'amanda.white@acme.com', department: 'Legal', job_title: 'General Counsel' },
  { id: '00000000-0000-0000-0000-000000000021', full_name: 'Kevin Taylor', email: 'kevin.taylor@acme.com', department: 'Operations', job_title: 'Ops Manager' },
  { id: '00000000-0000-0000-0000-000000000022', full_name: 'Michelle Garcia', email: 'michelle.garcia@acme.com', department: 'Design', job_title: 'UX Designer' },
  { id: '00000000-0000-0000-0000-000000000023', full_name: 'James Wilson', email: 'james.wilson@acme.com', department: 'Sales', job_title: 'Sales Director' },
  { id: '00000000-0000-0000-0000-000000000024', full_name: 'Nicole Anderson', email: 'nicole.anderson@acme.com', department: 'Engineering', job_title: 'QA Engineer' },
]

// Search employees with relevance ranking
export function searchDemoEmployees(query: string, limit: number = 15): typeof DEMO_EMPLOYEES {
  if (!query || query.length < 2) {
    return []
  }

  const q = query.toLowerCase()

  // Score employees by relevance
  const scored = DEMO_EMPLOYEES.map(emp => {
    const name = emp.full_name.toLowerCase()
    const email = emp.email.toLowerCase()

    let score = 0

    // Prefix match on name = highest score
    if (name.startsWith(q)) {
      score = 100
    }
    // First name prefix match
    else if (name.split(' ').some(part => part.startsWith(q))) {
      score = 80
    }
    // Substring match on name
    else if (name.includes(q)) {
      score = 60
    }
    // Email prefix match
    else if (email.startsWith(q)) {
      score = 40
    }
    // Email substring match
    else if (email.includes(q)) {
      score = 20
    }

    return { ...emp, score }
  })

  // Filter out non-matches and sort by score desc, then by name
  return scored
    .filter(emp => emp.score > 0)
    .sort((a, b) => b.score - a.score || a.full_name.localeCompare(b.full_name))
    .slice(0, limit)
    .map(({ score, ...emp }) => emp)
}
